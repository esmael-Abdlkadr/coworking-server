import Redis from "redis";
import dotenv from "dotenv";
dotenv.config();
const client = Redis.createClient({
  url: `redis://${process.env.REDIS_HOST || "redis"}:${
    process.env.REDIS_PORT || 6379
  }`,
  // "redis://127.0.0.1:6379",
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
