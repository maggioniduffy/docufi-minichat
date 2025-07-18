import express from "express";
import db from "../db.js";
import { chatWithContext } from "../utils/chat.js";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Received request to chat with context");
  const { docId, query } = req.body;

  if (!docId || !query) {
    return res.status(400).json({
      error: "Both docId and query must be provided in the request body",
    });
  }
  console.log("docId:", docId, "query:", query);

  try {
    const facts = db.prepare("SELECT * FROM facts WHERE docId = ?").all(docId);
    console.log("Retrieved facts for docId:", docId, facts);
    const answer = await chatWithContext(query, facts);
    console.log("Chat response:", answer);
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
