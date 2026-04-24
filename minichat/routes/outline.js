import express from "express";
import { getOutline } from "../utils/llm.js";
import db from "../db.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { docId, topic } = req.body;
  if (!topic) return res.status(400).json({ error: "Missing topic" });

  let facts = [];
  if (docId) {
    facts = db.prepare("SELECT * FROM facts WHERE docId = ?").all(docId);
  }

  try {
    const outline = await getOutline(topic, facts);
    res.json({ outline });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate outline" });
  }
});

export default router;
