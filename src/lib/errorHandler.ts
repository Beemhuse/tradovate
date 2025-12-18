import { AxiosError } from "axios";

/**
 * Handles API and network errors gracefully.
 * Returns a human-readable message.
 */
export const handleGenericError = (error: AxiosError | unknown): string => {
  if (!error) return "An unknown error occurred.";

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      "Something went wrong.";

    switch (status) {
      case 400:
        return `Bad Request: ${message}`;
      case 401:
        return "Unauthorized. Please log in again.";
      case 403:
        return "Access denied. You don’t have permission to perform this action.";
      case 404:
        return "Requested resource not found.";
      case 409:
        return "Conflict detected. Please check your data.";
      case 500:
        return "Internal server error. Please try again later.";
      case 502:
      case 503:
        return "Service unavailable. Try again in a few moments.";
      default:
        return message;
    }
  }

  // Non-Axios errors (e.g., JS exceptions)
  if (error instanceof Error) return error.message;

  return "An unexpected error occurred. Please try again.";
};
