import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.connect();

export function publishPrice(data: any) {
  redis.publish("priceUpdate", JSON.stringify(data));
}
