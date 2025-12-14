import axios, { AxiosInstance, AxiosResponse } from "axios";

// Base API URL - can be configured via environment variables
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Logging, etc.
apiClient.interceptors.request.use(
  (config) => {
    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error("[API Error] Unauthorized:", data);
          break;
        case 403:
          console.error("[API Error] Forbidden:", data);
          break;
        case 404:
          console.error("[API Error] Not Found:", error.config.url);
          break;
        case 500:
          console.error("[API Error] Server Error:", data);
          break;
        default:
          console.error(`[API Error] ${status}:`, data);
      }

      // Return a structured error
      return Promise.reject({
        status,
        message: data?.message || error.message,
        data: data,
      });
    } else if (error.request) {
      // Request made but no response received
      console.error("[API Error] No response received:", error.request);
      return Promise.reject({
        status: 0,
        message: "Network error. Please check your connection.",
      });
    } else {
      // Something else happened
      console.error("[API Error]", error.message);
      return Promise.reject({
        status: 0,
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

export default apiClient;

