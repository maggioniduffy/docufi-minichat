import { Queue } from "bullmq";

const redisHost = process.env.REDIS_HOST || "localhost"; // "redis" for Docker, "localhost" for local

export const factExtractionQueue = new Queue("factExtraction", {
  connection: { host: redisHost, port: 6379 }
});