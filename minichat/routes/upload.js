import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import db from "../db.js";
import { extractFactsWithLLM, extractText } from "../utils/chat.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    console.log("File received:", file);
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else cb(new Error("Only PDF, DOCX, or TXT files allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileBuffer = fs.readFileSync(req.file.path);
  const filehash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  const existing = db
    .prepare("SELECT id FROM documents WHERE filehash = ?")
    .get(filehash);

  if (existing) {
    fs.unlinkSync(req.file.path);
    return res.status(200).json({ docId: existing.id });
  }

  const docId = uuidv4();
  const ext = path.extname(req.file.originalname);
  const newPath = path.join("uploads", `${docId}${ext}`);

  // Transaction for document and facts
  const uploadTx = db.transaction(
    (docId, fileBuffer, filehash, filename, facts) => {
      db.prepare(
        "INSERT INTO documents (id, filename, filehash, file) VALUES (?, ?, ?, ?)"
      ).run(docId, filename, filehash, fileBuffer);

      const insertFact = db.prepare(
        "INSERT INTO facts (docId, key, value) VALUES (?, ?, ?)"
      );
      for (const fact of facts) {
        insertFact.run(docId, fact.key, fact.value);
      }
    }
  );

  try {
    fs.renameSync(req.file.path, newPath);
    const text = await extractText(newPath, req.file.mimetype);
    const facts = await extractFactsWithLLM(text);

    uploadTx(docId, fileBuffer, filehash, req.file.originalname, facts);

    return res.status(201).json({ docId });
  } catch (error) {
    // Rollback is automatic if an error is thrown inside the transaction
    console.error("Upload error:", error);
    // Clean up file if it was renamed
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    else if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", (req, res) => {
  res.send("UPLOAD ENDPOINT");
});

router.get("/all", (req, res) => {
  const documents = db.prepare("SELECT * FROM documents").all();
  const facts = db.prepare("SELECT * FROM facts").all();
  console.log("Documents:", documents);
  console.log("Facts:", facts);
  res.json({ documents, facts });
});

router.get("/documents", (req, res) => {
  try {
    const documents = db.prepare("SELECT * FROM documents").all();
    console.log("Documents:", documents);
    res.status(200).json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/facts/:docId", (req, res) => {
  try {
    const { docId } = req.params;
    const facts = db.prepare("SELECT * FROM facts WHERE docId = ?").all(docId);
    console.log("Facts:", facts);
    res.status(200).json({ facts });
  } catch (error) {
    console.error("Error fetching facts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/clear", (req, res) => {
  console.log("Clearing documents table...");
  try {
    db.prepare("DELETE FROM documents").run();
    res.status(200).json({ message: "All documents deleted" });
  } catch (error) {
    console.error("Error clearing documents table:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
