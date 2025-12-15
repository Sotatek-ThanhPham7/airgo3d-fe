import apiClient from "./config";
import { ApiResponse } from "./types";

export interface PresignedUrlRequest {
  fileName: string;
  contentType: string;
  prefix: string;
}

export interface PresignedUrlResponse {
  url: string;
  key: string;
  expiresIn: number;
}

export const s3Api = {
  getPresignedUrl: async (
    payload: PresignedUrlRequest
  ): Promise<PresignedUrlResponse> => {
    const response = await apiClient.post<
      ApiResponse<PresignedUrlResponse> | PresignedUrlResponse
    >("/s3/presigned-url", payload);

    // Support both wrapped and unwrapped API response formats
    const data = (response.data as any).data ?? response.data;
    return data as PresignedUrlResponse;
  },
};

