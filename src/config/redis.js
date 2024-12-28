import Redis from "redis";
import dotenv from "dotenv";
dotenv.config();

const redisUrl = process.env.REDIS_HOST || "redis://localhost:6379";

const client = Redis.createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries >= 10) {
        return new Error("Retry attempts exhausted");
      }
      return Math.min(retries * 50, 500); // Retry delay
    },
  },
});

client.on("error", function (error) {
  console.error("redis client error", error);
});

const connectRedis = async () => {
  try {
    await client.connect();
    console.log("redis connected");
  } catch (err) {
    console.log("failed to connect redis", err);
  }
};

export { client, connectRedis };
