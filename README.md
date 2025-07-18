### **Take-Home Exercise — *“Docufi Mini-Chat”***

---

#### **Material**

**💭**Use /documents EA’s material to work and test.

---

## 🚀 How to Run This App

### **Tech Stack**
- **Backend:** Node.js, Express, SQLite, BullMQ (Redis), LangChain, pdf-parse, mammoth
- **Frontend:** Next.js (React, TypeScript, TailwindCSS)
- **Queue/Worker:** BullMQ (with Redis) for background fact extraction
- **Database:** SQLite (persisted via Docker volume)
- **Containerization:** Docker & Docker Compose

---

### **Prerequisites**
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- (Optional for local dev) [Node.js](https://nodejs.org/) v20+ and [npm](https://www.npmjs.com/)

---

### **Quick Start (Recommended: Docker Compose)**

1. **Clone the repository:**
   ```sh
   git clone <this-repo-url>
   cd docufi
   ```

2. **Copy or create your `.env` file for backend (minichat):**
   ```
   cp minichat/.env.example minichat/.env
   # Edit minichat/.env and add your GROQ_API_KEY and other secrets
   ```

3. **Build and start all services:**
   ```sh
   docker-compose up --build
   ```

4. **Access the app:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)
   - Redis: [localhost:6379](http://localhost:6379) (internal use)

---

### **How It Works**

#### **1. Upload**
- Upload a PDF, DOCX, or TXT file via the UI or `POST /upload` endpoint.
- The backend stores the file and metadata in SQLite.
- A background worker (BullMQ + Redis) extracts verbatim financial facts using an LLM and saves them to the database.

#### **2. Fact Extraction**
- Facts like **Revenue**, **EBITDA**, and **YoY growth** are extracted only if they appear verbatim (no calculations).
- Extraction is done asynchronously; the UI polls `/upload/status?docId=...` to notify when facts are ready.

#### **3. Chat**
- Use the chat interface or `POST /conversation` endpoint with a `docId` and a question.
- The backend answers, referencing extracted facts when relevant.

---

### **Endpoints**

| \# | Endpoint | Method & Path | Purpose | Payload ↔︎ Response |
|-----|---------|---------------|---------|---------------------|
| 1 | **Upload** | `POST /upload` | Store one PDF / DOCX / TXT file. Extract *verbatim* facts if present: **Revenue**, **EBITDA**, **YoY growth**. | **Request:** `multipart/form-data` (`file`) <br> **Response:** `{ "docId": "<uuid>" }` or `{ status: "existing", filename: "..." }` |
| 2 | **Status** | `GET /upload/status?docId=...` | Check if fact extraction is complete for a document. | **Response:** `{ ready: true/false }` |
| 3 | **Documents** | `GET /upload/documents` | List all uploaded documents. | **Response:** `{ documents: [...] }` |
| 4 | **Facts** | `GET /upload/facts/:docId` | Get extracted facts for a document. | **Response:** `{ facts: [...] }` |
| 5 | **Conversation** | `POST /conversation` | Chat tied to a `docId`. Answers reference extracted facts. | **Request:** `{ "docId": "<uuid>", "query": "string" }` <br> **Response:** `{ "answer": "string" }` |

---

### **Development**

- To run backend or frontend locally (without Docker), install dependencies in each folder and run with `npm start` or `npm run dev`.
- Make sure Redis is running if you use BullMQ locally.

---

### **Troubleshooting**

- If fact extraction never completes, ensure both backend and worker share the same `/app/db` and `/app/uploads` Docker volumes.
- Check `.env` for correct API keys.
- Use `docker-compose logs` to debug services.

---

### **Extra**

- You can clear all uploaded documents with `DELETE /upload/clear`.
- The UI supports multiple uploads and notifies when each document is ready.

---

**Enjoy using Minichat!**

<div align="center">

Made by **Faustino Maggioni Duffy**  
[LinkedIn](https://www.linkedin.com/in/maggioniduffy) • [@maggioniduffy](https://maggioniduffy.vercel.app/)

</div>