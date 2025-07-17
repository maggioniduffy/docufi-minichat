import { ChatOpenAI } from "langchain/chat_models/openai";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import fs from "fs";

// Extract text from file
async function extractText(filePath, mimetype) {
  if (mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
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
  return "";
}

// Use LLM to extract verbatim facts as key-value pairs
async function extractFactsWithLLM(text) {
  const model = new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY });
  const prompt = `
Extract all important verbatim facts from the following text. Such as: Revenue, EBITDA, and YoY growth.
Return only facts that are explicitly stated (no calculations or assumptions).
Format your response as a JSON array of objects, each with "key" and "value" fields.
Key being the fact identifier and value being the fact itself.
Text:
${text}
`;

  const response = await model.call(prompt);
  try {
    return JSON.parse(response); // Should be [{key: "...", value: "..."}]
  } catch {
    return [];
  }
}
