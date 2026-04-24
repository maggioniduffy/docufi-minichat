//import { ChatGroq } from "@langchain/groq";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import dotenv from "dotenv";
import { chunkText } from "./text.js"; // Assuming you have a chunking utility

dotenv.config();

export async function extractFactsWithLLM(text) {
  // const model = new ChatGroq({
  //   apiKey: process.env.GROQ_API_KEY,
  //   model: "llama3-70b-8192",
  //   temperature: 0,
  // });

  const prompt = `Extract the most important verbatim financial fact from a text.

      Each fact should be returned as a JSON object with:
      - "key": the name of the attribute (e.g., "Operating Income", "Net Revenue")
      - "value": the verbatim value from the text (e.g., "$5.4B", "12%", "$1.42")

      Only include facts if both key and value are explicitly mentioned in the text.
      Do NOT guess, calculate, or infer values.
      Omit boilerplate, narrative, and footnotes.

      Return the result as a JSON array: [ { "key": "...", "value": "..." }, ... ]
      
      Text provided: ${text}`;

  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
    });
    console.log("LLM response:", result.text);
    console.log("LLM response JSON:", JSON.parse(result.text));

    return result.text; // Assuming the LLM returns a JSON string
  } catch (err) {
    console.error("⚠️ Failed to parse LLM response as JSON:", err);
    return [];
  }
}

export async function extractFactsWithLLMChunked(text) {
  console.log("Chunking text for fact extraction...");
  const chunks = chunkText(text);
  const uniqueFacts = [];
  const seen = new Set();

  for (const chunk of chunks) {
    const facts = await extractFactsWithLLM(chunk);
    let jsonStr = facts;
    if (typeof facts === "string") {
      const start = facts.indexOf("[");
      const end = facts.lastIndexOf("]");
      if (start !== -1 && end !== -1) {
        jsonStr = facts.slice(start, end + 1);
      }
    }
    try {
      const parsed =
        typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
      if (Array.isArray(parsed)) {
        for (const fact of parsed) {
          const id = `${fact.key}|${fact.value}`;
          if (!seen.has(id)) {
            seen.add(id);
            uniqueFacts.push(fact);
          }
        }
      }
    } catch (err) {
      console.error("Chunk parse error:", err, facts);
    }
  }
  return uniqueFacts;
}

export async function chatWithContext(userQuery, facts) {
  // const model = new ChatGroq({
  //   apiKey: process.env.GROQ_API_KEY,
  //   model: "llama3-70b-8192",
  // });

  const prompt = `Use these verified facts when relevant:
  ${JSON.stringify(facts, null, 2)}

  User Question: ${userQuery}

  Answer concisely and cite facts when applicable.
  
  Chat with the user as if you were a financial analyst, providing clear and concise answers based on the facts provided. If the user asks for information not covered by the facts, politely inform them that you cannot provide that information.
  
  If no facts are relevant, say what you consider best based on your knowledge. Friendly chat.

  Dont tell the source of the facts, just use them to answer the question.
  `;

  // const response = await model.invoke(prompt);
  const result = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt,
  });
  return result.text;
  //return response.content;
}

export async function getOutline(topic, facts) {
  // const model = new ChatGroq({
  //   apiKey: process.env.GROQ_API_KEY,
  //   model: "llama3-70b-8192",
  // });

  const prompt = `Use these verified facts when relevant:
  ${JSON.stringify(facts, null, 2)}

  Based on the facts provided, create a structured outline for a presentation slide on the topic "${topic}".
  - Use bullet points and subpoints.
  - Reference these facts if relevant.
  - Be concise and clear.
  Output the outline as Markdown with headings and bullet points.

  Dont tell the source of the facts, just use them to answer the question.
  `;

  // const response = await model.invoke(prompt);
  const result = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt,
  });
  return result.text;
  //return response.content;
}
