import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import db from "../db.js";
import { factExtractionQueue } from "../utils/queue.js"; // Assuming you have a queue setup for background processing

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

  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const filehash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");

    const existing = db
      .prepare("SELECT id FROM documents WHERE filehash = ?")
      .get(filehash);

    if (existing) {
      fs.unlinkSync(req.file.path);
      return res
        .status(200)
        .json({ docId: existing.id, filename: req.file.originalname, status: "existing" });
    }

    const docId = uuidv4();
    const ext = path.extname(req.file.originalname);
    const newPath = path.join("uploads", `${docId}${ext}`);
    fs.renameSync(req.file.path, newPath);

    // Insert document metadata only (no facts yet)
    db.prepare(
      "INSERT INTO documents (id, filename, filehash, file) VALUES (?, ?, ?, ?)"
    ).run(docId, req.file.originalname, filehash, fileBuffer);

    // Add job to queue for background processing
    await factExtractionQueue.add("extractFacts", {
      docId,
      filePath: newPath,
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
      filehash,
    });

    return res.status(201).json({ docId, filename: req.file.originalname, status: "processing" });
  } catch (error) {
    console.error("Upload error:", error);
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

router.get("/status", (req, res) => {
  const { docId } = req.query;
  if (!docId) {
    return res.status(400).json({ error: "Missing docId" });
  }
  try {
    const count = db.prepare("SELECT COUNT(*) as cnt FROM facts WHERE docId = ?").get(docId);
    // If at least one fact exists, consider it ready
    console.log(`Checking status for docId ${docId}:`, count.cnt);
    res.json({ ready: count.cnt > 0 });
  } catch (error) {
    console.error("Error checking status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
