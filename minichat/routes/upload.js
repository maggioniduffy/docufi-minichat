import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

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
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, DOCX, or TXT files allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("File uploaded:", req.file);
  const docId = uuidv4();
  const ext = path.extname(req.file.originalname);
  const newPath = path.join("uploads", `${docId}${ext}`);
  fs.renameSync(req.file.path, newPath);

  // TODO: Extract facts here and store them with docId

  res.json({ docId });
});

router.get("/", (req, res) => {
  res.send("UPLOAD ENDPOIUNT");
});

export default router;
