export const KafkaTopics = {
  ActivityLogs: "activity-logs",
  UserEvents: "user-events",
  Notifications: "notifications",
} as const;

export type KafkaTopic = (typeof KafkaTopics)[keyof typeof KafkaTopics];

export function isKafkaTopic(input: string): input is KafkaTopic {
  return Object.values(KafkaTopics).includes(input as KafkaTopic);
}
