
import multer from "multer";
import crypto from "crypto";
import fs from "fs";

export const upload = multer({
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

export const getHashAndBuffer = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath);
    const filehash = crypto
      .createHash("sha256")
      .update(fileBuffer)
      .digest("hex");
    return {filehash, fileBuffer};
}