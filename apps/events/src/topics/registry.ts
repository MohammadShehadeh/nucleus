import type { EachMessagePayload, KafkaClient } from "@lms/kafka";
import type { KafkaTopic } from "@lms/kafka/topics";

export interface TopicHandler {
  topic: KafkaTopic;
  handler: (payload: EachMessagePayload) => Promise<void> | void;
  fromBeginning?: boolean;
}

export async function subscribeAll(
  client: KafkaClient,
  groupId: string,
  handlers: TopicHandler[],
) {
  const consumer = await client.createConsumer(groupId);
  for (const h of handlers) {
    await client.subscribe(
      consumer,
      h.topic,
      h.handler,
      h.fromBeginning ?? false,
    );
  }
}
