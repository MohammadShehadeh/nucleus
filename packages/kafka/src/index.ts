import type {
  Consumer,
  EachMessagePayload,
  KafkaConfig,
  Producer,
} from "kafkajs";
import { Kafka, logLevel, Partitioners } from "kafkajs";

import type { KafkaTopic } from "./topics";

type KafkaLogLevel = keyof typeof logLevel;

export interface KafkaClientOptions {
  clientId: string;
  brokers: string[];
  logLevel?: KafkaLogLevel;
}

export class KafkaClient {
  private kafka: Kafka;
  private producer?: Producer;
  private consumers: Consumer[] = [];

  constructor(options: KafkaClientOptions) {
    const { clientId, brokers, logLevel: level } = options;

    const config: KafkaConfig = {
      clientId,
      brokers,
      logLevel: level ? logLevel[level] : logLevel.INFO,
    };

    this.kafka = new Kafka(config);
  }

  async connectProducer(): Promise<Producer> {
    if (this.producer) {
      return this.producer;
    }

    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
      allowAutoTopicCreation: true,
    });

    await this.producer.connect();

    return this.producer;
  }

  async produce<TPayload>(
    topic: KafkaTopic,
    message: TPayload,
    key?: string,
  ): Promise<void> {
    const producer = await this.connectProducer();
    await producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(message),
          headers: { "content-type": "application/json" },
        },
      ],
    });
  }

  async createConsumer(groupId: string): Promise<Consumer> {
    const consumer = this.kafka.consumer({
      groupId,
      allowAutoTopicCreation: true,
    });

    await consumer.connect();
    this.consumers.push(consumer);

    return consumer;
  }

  async subscribe(
    consumer: Consumer,
    topic: KafkaTopic,
    handler: (payload: EachMessagePayload) => Promise<void> | void,
    fromBeginning = false,
  ): Promise<void> {
    await consumer.subscribe({ topic, fromBeginning });
    await consumer.run({
      eachMessage: async (payload) => {
        try {
          await handler(payload);
        } catch (error) {
          console.error(
            `[Kafka] Consumer handler error for topic ${topic}:`,
            error,
          );
        }
      },
    });
  }

  async disconnect(): Promise<void> {
    const tasks: Promise<unknown>[] = [];

    if (this.producer) {
      tasks.push(
        this.producer
          .disconnect()
          .catch((err) =>
            console.error("[Kafka] Error disconnecting producer:", err),
          ),
      );
    }

    for (const consumer of this.consumers) {
      tasks.push(
        consumer
          .disconnect()
          .catch((err) =>
            console.error("[Kafka] Error disconnecting consumer:", err),
          ),
      );
    }

    await Promise.all(tasks);
  }
}

export function createKafkaClient(env: {
  KAFKA_BROKERS: string;
  KAFKA_CLIENT_ID: string;
  KAFKA_LOG_LEVEL: KafkaLogLevel;
}): KafkaClient {
  const brokers = env.KAFKA_BROKERS.split(",").map((b) => b.trim());
  const clientId = env.KAFKA_CLIENT_ID;
  const level = env.KAFKA_LOG_LEVEL;

  return new KafkaClient({ clientId, brokers, logLevel: level });
}

export type { Consumer, Producer, EachMessagePayload } from "kafkajs";
