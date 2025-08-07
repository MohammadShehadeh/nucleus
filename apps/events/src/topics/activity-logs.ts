import { KafkaTopics } from "@lms/kafka/topics";

import type { TopicHandler } from "./registry";
import { logger } from "../logger";

export const activityLogsHandler: TopicHandler = {
  topic: KafkaTopics.ActivityLogs,
  handler: ({ message, topic, partition }) => {
    const value = message.value?.toString();
    if (!value) return;

    try {
      const payload = JSON.parse(value) as unknown;
      logger.info(`${topic}[${partition}]`, payload);
    } catch {
      logger.warn(`Non-JSON message on ${topic}[${partition}]: ${value}`);
    }
  },
};
