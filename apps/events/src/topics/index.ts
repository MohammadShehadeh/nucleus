import type { TopicHandler } from "./registry";
import { activityLogsHandler } from "./activity-logs";

export const topicHandlers: TopicHandler[] = [activityLogsHandler];
