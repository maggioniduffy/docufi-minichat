import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import db from "../db.js";

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

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileBuffer = fs.readFileSync(req.file.path);
  const filehash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  const existing = db
    .prepare("SELECT id FROM documents WHERE filehash = ?")
    .get(filehash);

  if (existing) {
    fs.unlinkSync(req.file.path); // Remove temp file
    console.log("File already exists in DB:", existing.id);
    return res.json({ docId: existing.id });
  }

  const docId = uuidv4();
  const ext = path.extname(req.file.originalname);
  const newPath = path.join("uploads", `${docId}${ext}`);
  fs.renameSync(req.file.path, newPath);

  db.prepare(
    "INSERT INTO documents (id, filename, filehash, file) VALUES (?, ?, ?, ?)"
  ).run(docId, req.file.originalname, filehash, fileBuffer);

  fs.unlinkSync(req.file.path); // Remove temp file after saving to DB

  // TODO: Extract facts here and store them with docId
  res.json({ docId });
});

router.get("/", (req, res) => {
  res.send("UPLOAD ENDPOINT");
});

export default router;
