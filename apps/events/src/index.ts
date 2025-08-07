import "dotenv/config";

import { createKafkaClient } from "@lms/kafka";
import { KafkaTopics } from "@lms/kafka/topics";

import { eventsEnv } from "./env";
import { logger } from "./logger";
import { topicHandlers } from "./topics";
import { subscribeAll } from "./topics/registry";

const env = eventsEnv();
const kafka = createKafkaClient(env);

async function start() {
  const groupId = env.KAFKA_GROUP_ID;

  await subscribeAll(kafka, groupId, topicHandlers);

  // ... existing code ...
  const intervalMs = env.PRODUCER_INTERVAL_MS;
  setInterval(() => {
    const event = {
      type: "activity",
      timestamp: new Date().toISOString(),
      message: "Heartbeat from events service",
    };

    kafka
      .produce(KafkaTopics.ActivityLogs, event, "heartbeat")
      .then(() => logger.info("[Producer] Sent activity-logs event"))
      .catch((err) => logger.error("[Producer] Failed to send event:", err));
  }, intervalMs);
}

async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down...`);
  await kafka.disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

start().catch(async (err) => {
  logger.error("Failed to start events service:", err);
  await kafka.disconnect();
  process.exit(1);
});
