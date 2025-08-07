type Level = "debug" | "info" | "warn" | "error";

function log(level: Level, message: string, ...args: unknown[]) {
  const ts = new Date().toISOString();
  const prefix = `[events ${level.toUpperCase()} ${ts}]`;
  console[level === "debug" ? "log" : level](prefix, message, ...args);
}

export const logger = {
  debug: (msg: string, ...args: unknown[]) => log("debug", msg, ...args),
  info: (msg: string, ...args: unknown[]) => log("info", msg, ...args),
  warn: (msg: string, ...args: unknown[]) => log("warn", msg, ...args),
  error: (msg: string, ...args: unknown[]) => log("error", msg, ...args),
};
