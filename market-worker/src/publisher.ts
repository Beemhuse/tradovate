import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on("error", (err) => {
  console.error("❌ Redis error", err);
});

async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
    console.log("✓ Redis connected (worker)");
  }
}

connectRedis();

export async function publishPrice(data: any) {
  if (!redis.isOpen) return;
  await redis.publish("priceUpdate", JSON.stringify(data));
}
