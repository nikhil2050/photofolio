import type { AppErrorCode } from "@/lib/errors/app-error";

type LogContext = {
  errorCode?: AppErrorCode | "UNEXPECTED";
  method?: string;
  operation?: string;
  requestId?: string;
  route?: string;
  status?: number;
  providerCode?: string;
  failureStage?: string;
};

type LogLevel = "error" | "info" | "warn";

function write(level: LogLevel, event: string, context: LogContext = {}) {
  // Keep this allowlist narrow: do not add request bodies, cookies, tokens,
  // private paths, email addresses, or raw provider errors to application logs.
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  });

  if (level === "error") console.error(entry);
  else if (level === "warn") console.warn(entry);
  else console.info(entry);
}

export const logger = {
  error(event: string, context?: LogContext) {
    write("error", event, context);
  },
  info(event: string, context?: LogContext) {
    write("info", event, context);
  },
  warn(event: string, context?: LogContext) {
    write("warn", event, context);
  },
};

export function createRequestId() {
  return crypto.randomUUID();
}
