import IORedis from "ioredis";
import { config } from "@chatbot/config";

export const redis = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});
