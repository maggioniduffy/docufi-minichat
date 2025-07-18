import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export function chunkText(text, chunkSize = 6000) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}

export async function extractText(filePath, mimetype) {
  try {
    console.log("Extracting text from file:", filePath, "MIME type:", mimetype);
  if (mimetype === "application/pdf") {
    console.log("Processing PDF file:", filePath);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text?.trim() || "";
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

    return "";
  }

}