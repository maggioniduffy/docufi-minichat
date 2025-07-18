import express from "express";
import { chatWithContext } from "../utils/llm.js";
import db from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { docId, topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Missing topic" });

  let facts = [];
  if (docId) {
    facts = db.prepare("SELECT * FROM facts WHERE docId = ?").all(docId);
  }

  const outlinePrompt = `
You are an expert financial analyst. Create a structured outline for a presentation slide on the topic: "${topic}".
- Use bullet points and subpoints.
- Reference these facts if relevant: ${JSON.stringify(facts, null, 2)}
- Be concise and clear.
Output the outline as Markdown with headings and bullet points.
`;

  try {
    const outline = await chatWithContext(outlinePrompt, facts);
    res.json({ outline });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate outline" });
  }
});

export default router;