export type AppErrorCode =
  | "CONFIGURATION_INVALID"
  | "PROFILE_UNAVAILABLE"
  | "GALLERY_COUNT_UNAVAILABLE"
  | "GALLERIES_UNAVAILABLE"
  | "GALLERY_UNAVAILABLE"
  | "GALLERY_CREATE_FAILED"
  | "STORAGE_UNAVAILABLE";

/**
 * An expected failure with a safe message that can cross an application
 * boundary. The original provider error deliberately stays out of this type.
 */
export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    public readonly publicMessage: string,
  ) {
    super(publicMessage);
    this.name = "AppError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
