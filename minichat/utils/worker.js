import { Worker } from "bullmq";
import { extractText } from "./text.js";
import { extractFactsWithLLMChunked } from "./llm.js";
import db from "../db.js";

const worker = new Worker(
  "factExtraction",
  async (job) => {
    try {
      const { docId, filePath, mimetype } = job.data;
      const text = await extractText(filePath, mimetype);
      const facts = await extractFactsWithLLMChunked(text);

      const insertFact = db.prepare(
        "INSERT INTO facts (docId, key, value) VALUES (?, ?, ?)"
      );

      if (facts.length === 0) {
        insertFact.run(docId, "amount of facts", "0");
        return;
      }

      for (const fact of facts) {
        insertFact.run(docId, fact.key, fact.value);
      }
    } catch (error) {
      console.error("Error processing job:", error);
      const insertFact = db.prepare(
        "INSERT INTO facts (docId, key, value) VALUES (?, ?, ?)"
      );
      insertFact.run(docId, "error", null);
      //throw new Error(`Failed to extract facts for docId ${docId}: ${error}`);
    }
  },
  {
    connection: { host: "redis", port: 6379 },
  }
);
