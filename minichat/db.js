import Database from "better-sqlite3";
import path from "path";

// Use a persistent path (Docker volume: /app/db)
const dbPath = path.join(process.cwd(), "db", "docufi.sqlite");
const db = new Database(dbPath);

// Example: Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT,
    filehash TEXT UNIQUE,
    facts TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;
