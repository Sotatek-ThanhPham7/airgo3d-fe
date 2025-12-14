// Common API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface ApiError {
  status: number;
  message: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
}

// API response with pagination (data + pagination structure)
export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
