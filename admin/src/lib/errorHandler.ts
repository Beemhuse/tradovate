/**
 * Generic error handler for API errors
 * Handles both native Error objects and unknown error types
 */
export const handleGenericError = (error: unknown): string => {
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle objects with error or message properties
  if (typeof error === "object" && error !== null) {
    if ("error" in error && typeof error.error === "string") {
      return error.error;
    }
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Fallback for unknown error types
  return "An unexpected error occurred";
};
