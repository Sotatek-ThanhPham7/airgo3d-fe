import axios, { AxiosInstance, AxiosResponse } from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

export const S3_BASE_URL =
  process.env.REACT_APP_S3_BASE_URL ||
  "https://airgo3d.s3.ap-southeast-1.amazonaws.com";

export const getImageUrl = (filePath: string): string => {
  if (!filePath) return "";
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `${S3_BASE_URL}/${cleanPath}`;
};

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        {
          data: config.data,
          params: config.params,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }

    return response;
  },
  (error) => {
    if (error.response) {
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

      return Promise.reject({
        status,
        message: data?.message || error.message,
        data: data,
      });
    } else if (error.request) {
      console.error("[API Error] No response received:", error.request);
      return Promise.reject({
        status: 0,
        message: "Network error. Please check your connection.",
      });
    } else {
      console.error("[API Error]", error.message);
      return Promise.reject({
        status: 0,
        message: error.message || "An unexpected error occurred",
      });
    }
  }
);

export default apiClient;
