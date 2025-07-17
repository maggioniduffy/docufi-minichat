import express from "express";
import db from "../db.js";
import { chatWithContext } from "../utils/chat.js";

const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
  const { docId, query } = req.body;

  if (!docId || !query) {
    return res.status(400).json({
      error: "Both docId and query must be provided in the request body",
    });
  }

  try {
    const facts = db.prepare("SELECT * FROM facts WHERE docId = ?").get(docId);
    const answer = await chatWithContext(query, facts);

    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
