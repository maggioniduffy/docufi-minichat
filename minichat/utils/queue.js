import { Queue } from "bullmq";

export const factExtractionQueue = new Queue("factExtraction", {
  connection: { host: "redis", port: 6379 }
});