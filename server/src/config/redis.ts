import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

redisClient.on("error", (err) => {
    console.error("Redis error:", err);
});

redisClient.on("connect", () => {
    console.log("🚀 Redis connected successfully");
});

export default redisClient;
