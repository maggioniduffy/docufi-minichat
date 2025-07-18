import express from "express";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload.js";
import conversationRouter from "./routes/conversation.js";
import outlineRouter from "./routes/outline.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/upload", uploadRouter);
app.use("/conversation", conversationRouter);
app.use("/outline", outlineRouter); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Docufi Mini‑Chat listening on ${PORT}`));

app.get("/", (req, res) => {
  res.send("Welcome to Docufi Mini‑Chat!");
});

export default app;
