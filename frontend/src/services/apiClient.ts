import axios from "axios";
import { toApiError } from "./apiError";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    return Promise.reject(toApiError(error));
  }
);
