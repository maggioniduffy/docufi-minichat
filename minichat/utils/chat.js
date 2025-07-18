import { ChatGroq } from "@langchain/groq";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import dotenv from "dotenv";
// import Tesseract from "tesseract.js";
// import path from "path";
// import pdf from "pdf-poppler";

dotenv.config();

export async function extractText(filePath, mimetype) {
  try {
    console.log("Extracting text from file:", filePath, "MIME type:", mimetype);
  if (mimetype === "application/pdf") {
    console.log("Processing PDF file:", filePath);
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    const text = data.text?.trim() || "";
    // if (!text) {
    //   console.log("No text found in PDF, attempting OCR...");
    //   // Convert PDF to images (PNG)
    //   const outputDir = "/tmp/pdf_images";
    //   if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    //   const opts = {
    //     format: "png",
    //     out_dir: outputDir,
    //     out_prefix: path.basename(filePath, path.extname(filePath)),
    //     page: null,
    //   };
    //   await pdf.convert(filePath, opts);

    //   // OCR each image and concatenate results
    //   const images = fs
    //     .readdirSync(outputDir)
    //     .filter((f) => f.endsWith(".png"));
    //   for (const img of images) {
    //     const imgPath = path.join(outputDir, img);
    //     const ocrResult = await Tesseract.recognize(imgPath, "eng");
    //     text += "\n" + (ocrResult.data.text?.trim() || "");
    //   }
    //   if (!text.trim()) {
    //     console.error("No text found in PDF or OCR result.");
    //     return "";
    //   }
    //   console.log("OCR text extracted:", text);
    // }
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

export async function extractFactsWithLLM(text) {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-70b-8192",
    temperature: 0,
  });

  const prompt = [
    {
      role: "system",
      content: `Extract important verbatim financial facts from a text.

Each fact should be returned as a JSON object with:
- "key": the name of the attribute (e.g., "Operating Income", "Net Revenue")
- "value": the verbatim value from the text (e.g., "$5.4B", "12%", "$1.42")

Only include facts if both key and value are explicitly mentioned in the text.
Do NOT guess, calculate, or infer values.
Omit boilerplate, narrative, and footnotes.

Return the result as a JSON array: [ { "key": "...", "value": "..." }, ... ]`,
    },
    {
      role: "user",
      content: `Extract facts from this text:\n\n${text}`,
    },
  ];

  try {
    const response = (await model.invoke(prompt)).content;
    console.log("LLM response:", response);
    return response;
  } catch (err) {
    console.error("⚠️ Failed to parse LLM response as JSON:", err);
    return [];
  }
}

function chunkText(text, chunkSize = 6000) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize;
  }
  return chunks;
}

// Extract facts from large text by chunking
export async function extractFactsWithLLMChunked(text) {
  console.log("Chunking text for fact extraction...");
  const chunks = chunkText(text);
  const uniqueFacts = [];
  const seen = new Set();

  for (const chunk of chunks) {
    const facts = await extractFactsWithLLM(chunk);
    let jsonStr = facts;
    if (typeof facts === "string") {
      const start = facts.indexOf("[");
      const end = facts.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        jsonStr = facts.slice(start, end + 1);
      }
    }
    try {
      const parsed =
        typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
      if (Array.isArray(parsed)) {
        for (const fact of parsed) {
          const id = `${fact.key}|${fact.value}`;
          if (!seen.has(id)) {
            seen.add(id);
            uniqueFacts.push(fact);
          }
        }
      }
    } catch (err) {
      console.error("Chunk parse error:", err, facts);
    }
  }
  return uniqueFacts;
}

export async function chatWithContext(userQuery, facts) {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-70b-8192",
  });

  const prompt = `Use these verified facts when relevant:
  ${JSON.stringify(facts, null, 2)}

  User Question: ${userQuery}

  Answer concisely and cite facts when applicable.
  
  Chat with the user as if you were a financial analyst, providing clear and concise answers based on the facts provided. If the user asks for information not covered by the facts, politely inform them that you cannot provide that information.
  
  If no facts are relevant, say what you consider best based on your knowledge. Friendly chat.

  Dont tell the source of the facts, just use them to answer the question.
  `;

  const response = await model.invoke(prompt);
  return response.content;
}
