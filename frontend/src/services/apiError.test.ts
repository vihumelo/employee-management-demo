import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { ApiError, getApiErrorMessage, toApiError } from "./apiError";

const createResponseError = (status: number, data: unknown) => {
  const error = new AxiosError("Request failed");
  error.response = {
    data,
    status,
    statusText: "",
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
  };
  return error;
};

describe("API error mapping", () => {
  it("maps not-found responses to a useful message", () => {
    expect(toApiError(createResponseError(404, { detail: "Missing" }))).toMatchObject({
      message: "Employee not found.",
      status: 404,
    });
  });

  it("maps CPF conflicts to a useful message", () => {
    expect(toApiError(createResponseError(409, { detail: "Duplicate" }))).toMatchObject({
      message: "An employee with this CPF is already registered.",
      status: 409,
    });
  });

  it("extracts validation messages from FastAPI's 422 response", () => {
    expect(
      toApiError(
        createResponseError(422, {
          detail: [
            { loc: ["body", "name"], msg: "Field required", type: "missing" },
            { loc: ["body", "cpf"], msg: "Invalid CPF", type: "value_error" },
          ],
        }),
      ).message,
    ).toBe("Field required Invalid CPF");
  });

  it("uses a fallback when a 422 response has no recognized messages", () => {
    expect(toApiError(createResponseError(422, { detail: [] })).message).toBe(
      "Please check the submitted information.",
    );
  });

  it("preserves a string detail for other server errors", () => {
    expect(toApiError(createResponseError(500, { detail: "Service unavailable" }))).toMatchObject({
      message: "Service unavailable",
      status: 500,
    });
  });

  it("handles network and unexpected errors", () => {
    const networkError = new AxiosError("Network Error");
    expect(toApiError(networkError).message).toBe(
      "Unable to connect to the server. Please try again.",
    );
    expect(getApiErrorMessage(new Error("unexpected"))).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });

  it("preserves an existing ApiError", () => {
    const error = new ApiError("Already mapped", 409);
    expect(toApiError(error)).toBe(error);
    expect(getApiErrorMessage(error)).toBe("Already mapped");
  });
});
