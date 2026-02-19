import { createInterface } from "node:readline/promises";
import { createClient } from "redis";
import crypto from "node:crypto";

const { stdin: input, stdout: output } = process;

/**
 * Generates a hash of the provided string to be used as a cache key.
 *
 * @param {string} question - The string to be hashed.
 * @returns {string} The hash of the input string.
 */
const getCacheKey = (question) => {
  const hash = crypto.createHash("sha256").update(question).digest("hex");
  return `aishe:question:${hash}`;
};

/**
 * Retrieves a value from the cache using the provided hash key.
 *
 * @param {Object} redisClient - The Redis client instance.
 * @param {string} hash - The cache key.
 * @returns {Promise<string|null>} A promise that resolves to the cached value, or null if not found.
 */
const getFromCache = async (redisClient, question) => {
  const hash = getCacheKey(question);
  return redisClient.get(hash);
};

/**
 * Stores a value in the cache under a hash generated from the provided question.
 *
 * @param {Object} redisClient - The Redis client instance.
 * @param {string} question - The string used to generate the cache key.
 * @param {any} responseData - The data to store in the cache.
 * @returns {Promise<void>} A promise that resolves once the data is stored.
 */
const setToCache = async (redisClient, question, responseData) => {
  const hash = getCacheKey(question);
  await redisClient.set(hash, JSON.stringify(responseData));
};

const rl = createInterface({
  input,
  output,
});

let startTime = 0;

const redisClient = await createClient({
  socket: {
    host: process.env["REDIS_HOST"] ?? "localhost",
    port: Number.parseInt(process.env["REDIS_PORT"] ?? "6379"),
  },
  username: process.env["REDIS_USER"],
  password: process.env["REDIS_PASS"],
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

async function main() {
  const answer = await rl.question("Please enter your question: ");

  startTime = performance.now();

  const question = answer.trim();
  if (!question) {
    console.log("Error: You must provide a question.");
    process.exit(1);
  }

  console.log(`Asking: ${question}`);
  console.log("Waiting for response...\n");

  let data;

  const cached = await getFromCache(redisClient, question);

  if (cached) {
    data = JSON.parse(cached);
  } else {
    const response = await fetch(`${process.env["AISHE_API_URL"]}/api/v1/ask`, {
      body: JSON.stringify({
        question,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    data = await response.json();
    await setToCache(redisClient, question, data);
  }

  // Print answer
  console.log("=".repeat(70));
  console.log("ANSWER:");
  console.log("=".repeat(70));
  console.log(data.answer);

  // Print sources if available
  if (data.sources?.length) {
    console.log("\n" + "=".repeat(70));
    console.log("SOURCES:");
    console.log("=".repeat(70));
    for (const source of data.sources) {
      console.log(`[${source.number}] ${source.title}`);
      console.log(`    ${source.url}`);
    }
  }

  // Print processing time
  console.log("\n" + "=".repeat(70));
  console.log(`Processing time: ${data.processing_time.toFixed(2)} seconds`);
  console.log("=".repeat(70));
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  rl.close();
  redisClient.destroy();
  console.log(`Total time:  ${(performance.now() - startTime).toFixed(2)} ms`);
  console.log("=".repeat(70));
}
