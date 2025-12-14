import apiClient from "./config";
import { PaginatedApiResponse } from "./types";

// Panorama types
export interface PanoramaTag {
  _id: string;
  name: string;
}

export interface Panorama {
  _id: string;
  name: string;
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  tags: PanoramaTag[];
}

// Query parameters for getPanoramas
export interface GetPanoramasParams {
  page?: number;
  limit?: number;
  isBookmarked?: boolean;
  search?: string;
  tags?: string[]; // Array of tag names
}

// Panorama API service
export const panoramaApi = {
  /**
   * Get panoramas with pagination and filters
   * @param params Query parameters
   * @returns Promise with panoramas and pagination info
   */
  getPanoramas: async (
    params?: GetPanoramasParams
  ): Promise<PaginatedApiResponse<Panorama>> => {
    const response = await apiClient.get<PaginatedApiResponse<Panorama>>(
      "/panorama",
      {
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          isBookmarked: params?.isBookmarked,
          search: params?.search,
          // Handle tags array - axios will serialize it as tags=value1&tags=value2
          tags: params?.tags,
        },
      }
    );
    return response.data;
  },
};
