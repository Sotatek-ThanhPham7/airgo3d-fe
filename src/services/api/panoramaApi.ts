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
  /**
   * Optional path to a lightweight thumbnail image.
   * When present, the UI should prefer this over filePath for grid views.
   */
  thumbnailPath?: string;
  fileSize: number;
  mimeType: string;
  isBookmarked: boolean;
  description?: string;
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

export interface CreatePanoramaPayload {
  key: string;
  name: string;
  fileSize: number;
  mimeType: string;
  thumbnailPath?: string;
  description?: string;
  tags?: string[];
}

export interface UpdateBookmarkPayload {
  isBookmarked: boolean;
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

  createPanorama: async (
    payload: CreatePanoramaPayload
  ): Promise<Panorama> => {
    const response = await apiClient.post<Panorama>("/panorama", payload);
    return response.data;
  },

  updateBookmark: async (
    id: string,
    payload: UpdateBookmarkPayload
  ): Promise<Panorama> => {
    const response = await apiClient.patch<Panorama>(
      `/panorama/${id}/bookmark`,
      payload
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
