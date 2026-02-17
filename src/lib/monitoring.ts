/**
 * Centralized Observability & Logging
 *
 * Provides a structured logger for server-side code. In production this can
 * be swapped for Sentry, Logflare, Axiom, etc. by updating the `capture`
 * implementation. In development it simply logs to the console.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error | unknown;
  timestamp: string;
}

function formatEntry(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const ctx = entry.context ? ` [${entry.context}]` : "";
  const data = entry.data ? ` ${JSON.stringify(entry.data)}` : "";
  return `${prefix}${ctx} ${entry.message}${data}`;
}

function capture(entry: LogEntry) {
  // In the future, send to Sentry / Logflare / Axiom here.
  // For now, structured console output.
  const formatted = formatEntry(entry);

  switch (entry.level) {
    case "error":
      console.error(formatted, entry.error ?? "");
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      if (process.env.NODE_ENV === "development") {
        console.debug(formatted);
      }
      break;
    default:
      console.log(formatted);
  }
}

function log(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>, error?: unknown) {
  capture({
    level,
    message,
    context,
    data,
    error,
    timestamp: new Date().toISOString(),
  });
}

export const logger = {
  debug: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("debug", message, context, data),
  info: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("info", message, context, data),
  warn: (message: string, context?: string, data?: Record<string, unknown>) =>
    log("warn", message, context, data),
  error: (message: string, context?: string, data?: Record<string, unknown>, error?: unknown) =>
    log("error", message, context, data, error),
};
