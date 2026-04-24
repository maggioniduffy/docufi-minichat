import express from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import db from "../db.js";
import { upload, getHashAndBuffer } from "../utils/files.js"; // Assuming you have multer setup for file uploads
import { factExtractionQueue } from "../utils/queue.js"; // Assuming you have a queue setup for background processing

const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const { filehash, fileBuffer } = getHashAndBuffer(req.file.path);

    const existing = db
      .prepare("SELECT id FROM documents WHERE filehash = ?")
      .get(filehash);

    if (existing) {
      fs.unlinkSync(req.file.path);
      return res.status(200).json({
        docId: existing.id,
        filename: req.file.originalname,
        status: "existing",
      });
    }

    const docId = uuidv4();
    const ext = path.extname(req.file.originalname);
    const newPath = path.join("uploads", `${docId}${ext}`);
    fs.renameSync(req.file.path, newPath);

    db.prepare(
      "INSERT INTO documents (id, filename, filehash, file) VALUES (?, ?, ?, ?)"
    ).run(docId, req.file.originalname, filehash, fileBuffer);

    await factExtractionQueue.add("extractFacts", {
      docId,
      filePath: newPath,
      mimetype: req.file.mimetype,
      filename: req.file.originalname,
      filehash,
    });

    return res
      .status(201)
      .json({ docId, filename: req.file.originalname, status: "processing" });
  } catch (error) {
    console.error("Upload error:", error);
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    else if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/documents", (req, res) => {
  try {
    const documents = db.prepare("SELECT id, filename, uploaded_at FROM documents").all();
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
    res.status(200).json({ facts });
  } catch (error) {
    console.error("Error fetching facts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/clear", (req, res) => {
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
    const firstFact = db
      .prepare("SELECT * FROM facts WHERE docId = ? ORDER BY id LIMIT 1")
      .get(docId);
    if (firstFact && firstFact.key === "error") {
      return res
        .status(500)
        .json({ error: "Couldn't extract facts from this file" });
    }

    const count = db
      .prepare("SELECT COUNT(*) as cnt FROM facts WHERE docId = ?")
      .get(docId);
    console.log(`Checking status for docId ${docId}:`, count.cnt);
    res.json({ ready: count.cnt > 0 });
  } catch (error) {
    console.error("Error checking status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
