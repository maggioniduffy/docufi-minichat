import { Worker } from "bullmq";
import { extractText, extractFactsWithLLMChunked } from "./chat.js";
import db from "../db.js"

const worker = new Worker("factExtraction", async job => {
  console.log("Processing job:", job.id);
  const { docId, filePath, mimetype, filename, filehash } = job.data;
  const text = await extractText(filePath, mimetype);
  console.log(`Extracted text from ${filename}:`, text.slice(0, 100) + "...");
  const facts = await extractFactsWithLLMChunked(text);

  console.log(`Extracted ${facts.length} facts from document ${docId}`);
  
  const insertFact = db.prepare(
    "INSERT INTO facts (docId, key, value) VALUES (?, ?, ?)"
  );

  if (facts.length === 0) {
    console.log("No facts extracted, skipping database insert.");
    insertFact.run(docId, "amount of facts", "0");
    return;
  }
  
  for (const fact of facts) {
    insertFact.run(docId, fact.key, fact.value);
  }
  console.log(`Facts inserted for docId: ${docId}`);
}, {
  connection: { host: "redis", port: 6379 }
});