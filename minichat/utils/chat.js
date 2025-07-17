import { ChatGroq } from "@langchain/groq";
import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import dotenv from "dotenv";

dotenv.config();

export async function extractText(filePath, mimetype) {
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

export async function chatWithContext(userQuery, facts) {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama3-70b-8192",
  });

  const prompt = `Use these verified facts when relevant:
  ${JSON.stringify(facts, null, 2)}

  User Question: ${userQuery}

  Answer concisely and cite facts when applicable.`;

  const response = await model.invoke(prompt);
  return response.content;
}
