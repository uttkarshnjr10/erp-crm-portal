export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: PaginatedData<T>;
  message: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}
