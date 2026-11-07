import axios from "axios";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getValidationMessage(detail: unknown): string | null {
  if (!Array.isArray(detail)) {
    return null;
  }

  const messages = detail.flatMap((item: unknown) =>
    isRecord(item) && typeof item.msg === "string" ? [item.msg] : []
  );

  return messages.length > 0 ? messages.join(" ") : null;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (!axios.isAxiosError<unknown>(error)) {
    return new ApiError("An unexpected error occurred. Please try again.", null);
  }

  const status = error.response?.status ?? null;
  const data: unknown = error.response?.data;
  const detail = isRecord(data) ? data.detail : undefined;

  if (status === null) {
    return new ApiError("Unable to connect to the server. Please try again.", null);
  }

  if (status === 404) {
    return new ApiError("Employee not found.", status);
  }

  if (status === 409) {
    return new ApiError(
      "An employee with this CPF is already registered.",
      status
    );
  }

  if (status === 422) {
    return new ApiError(
      getValidationMessage(detail) ?? "Please check the submitted information.",
      status
    );
  }

  if (typeof detail === "string") {
    return new ApiError(detail, status);
  }

  return new ApiError("The request failed. Please try again.", status);
}

export function getApiErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "An unexpected error occurred. Please try again.";
}
