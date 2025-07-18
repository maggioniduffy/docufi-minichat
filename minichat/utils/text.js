import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";

export function chunkText(text, chunkSize = 6000) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}

async function extractTextWithOCR(pdfPath) {
  const { exec } = await import("child_process");
  const { promisify } = await import("util");
  const execAsync = promisify(exec);
  const outputPrefix = "/tmp/page";

  // Convert each page of the PDF to a JPEG image
  await execAsync(`pdftoppm -jpeg "${pdfPath}" ${outputPrefix}`);

  // OCR each image
  const worker = await createWorker("eng");
  const ocrTexts = [];

  const imageFiles = fs
    .readdirSync("/tmp")
    .filter((f) => f.startsWith("page") && f.endsWith(".jpg"));
  for (const file of imageFiles) {
    const {
      data: { text },
    } = await worker.recognize(`/tmp/${file}`);
    ocrTexts.push(text);
  }

  await worker.terminate();

  return ocrTexts.join("\n\n");
}

export async function extractText(filePath, mimetype) {
  try {
    console.log("Extracting text from file:", filePath, "MIME type:", mimetype);
    if (mimetype === "application/pdf") {
      console.log("Processing PDF file:", filePath);
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      let text = data.text?.trim() || "";

      if (!text) {
        text = await extractTextWithOCR(filePath);
      }
      return text;
    }

    if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const data = await mammoth.extractRawText({ path: filePath });
      return data.value;
    }

    if (mimetype === "text/plain") {
      return fs.readFileSync(filePath, "utf8");
    }
  } catch (error) {
    console.error("Error extracting text:", error);
    throw new Error("Failed to extract text from file");
  }
}
