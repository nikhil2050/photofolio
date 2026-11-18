import type { Instrumentation } from "next";
import { validatePublicEnv } from "@/lib/supabase/env";
import { isAppError } from "@/lib/errors/app-error";
import { logger } from "@/lib/logging/logger";

/** Fails server startup clearly when browser-safe Supabase config is invalid. */
export function register() {
  validatePublicEnv();
}

/** Logs only safe request metadata; error values may contain private data. */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  logger.error("request.failed", {
    errorCode: isAppError(error) ? error.code : "UNEXPECTED",
    method: request.method,
    operation: context.routeType,
    route: context.routePath,
  });
};
