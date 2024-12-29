import Redis from "redis";
import dotenv from "dotenv";
dotenv.config();

const getRedisUrl = () => {
  // If REDIS_URL is provided as an environment variable, use it directly
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  // For local development, construct URL from host and port
  return `redis://${process.env.REDIS_HOST || "localhost"}:${
    process.env.REDIS_PORT || 6379
  }`;
};

const client = Redis.createClient({
  url: getRedisUrl(),
  socket: {
    reconnectStrategy: (retries) => {
      // Maximum retry delay of 3 seconds
      return Math.min(retries * 50, 3000);
    },
  },
});

client.on("error", function (error) {
  console.error("Redis client error", error);
});

client.on("connect", function () {
  console.log("Redis client connected");
});

const connectRedis = async () => {
  try {
    await client.connect();
    console.log("Redis connected successfully");
  } catch (err) {
    console.log("Failed to connect to Redis:", err);
    // Don't exit the process, let it retry
  }
};

export { client, connectRedis };
