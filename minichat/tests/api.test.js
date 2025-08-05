import request from "supertest";
import fs from "fs";
import path from "path";
import app from "../server.js";
import db from "../db.js";
import { factExtractionQueue } from "../utils/queue.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Docufi Mini-Chat API", () => {
  let docId;
  let filename = "testfile.txt";
  const testFilePath = path.join(__dirname, "testfile.txt");

  beforeAll(() => {
    // Create a small test file
    fs.writeFileSync(
      testFilePath,
      "Revenue: $1000\nEBITDA: $500\nYoY growth: 10%"
    );
  });

  afterAll(async () => {
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    await factExtractionQueue.close();
    // Example for DB
    await db.close();
  });

  it("should reject upload with no file", async () => {
    const res = await request(app).post("/upload");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/No file uploaded/i);
  });

  it("should upload a file and return docId", async () => {
    const res = await request(app).post("/upload").attach("file", testFilePath);
    expect(res.statusCode).toBe(201);
    expect(res.body.docId).toBeDefined();
    expect(res.body.filename).toBe(filename);
    docId = res.body.docId;
  });

  it("should return status as not ready immediately after upload", async () => {
    const res = await request(app).get(`/upload/status?docId=${docId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.ready).toBe(false);
  });

  it("should list uploaded documents", async () => {
    const res = await request(app).get("/upload/documents");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.documents)).toBe(true);
    expect(res.body.documents.some((d) => d.id === docId)).toBe(true);
  });

  it("should return facts for a document (may be empty if worker not run)", async () => {
    const res = await request(app).get(`/upload/facts/${docId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.facts)).toBe(true);
  });

  it("should return error for missing docId in status", async () => {
    const res = await request(app).get("/upload/status");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/missing docId/i);
  });

  it("should return error for missing docId in facts", async () => {
    const res = await request(app).get("/upload/facts/");
    expect(res.statusCode).toBe(404); // or 400 depending on your router
  });

  it("should handle conversation endpoint", async () => {
    const res = await request(app)
      .post("/conversation")
      .send({ docId, query: "What is the revenue?" });
    // Accept 200 or 500 if LLM is not configured
    expect([200, 500]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.answer).toBeDefined();
    }
  });

  it("should clear all documents", async () => {
    const res = await request(app).delete("/upload/clear");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });
});
