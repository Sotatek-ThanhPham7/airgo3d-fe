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

export interface GetPanoramasParams {
  page?: number;
  limit?: number;
  isBookmarked?: boolean;
  search?: string;
  tags?: string[];
}

export interface GetTagSuggestionsParams {
  q?: string;
  page?: number;
  limit?: number;
}

export const panoramaApi = {
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
          tags: params?.tags,
        },
      }
    );
    return response.data;
  },

  getTagSuggestions: async (
    params?: GetTagSuggestionsParams
  ): Promise<PaginatedApiResponse<PanoramaTag>> => {
    const response = await apiClient.get<PaginatedApiResponse<PanoramaTag>>(
      "/tags/suggest",
      {
        params: {
          q: params?.q ?? "",
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }
    );
    return response.data;
  },
};
