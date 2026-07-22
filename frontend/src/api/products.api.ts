import api from './axios';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import {
  Product,
  ProductDetail,
  CreateProductRequest,
  UpdateProductRequest,
  AdjustStockRequest,
  ProductQueryParams,
  StockMovement,
  Category,
} from '../types/product.types';

export const productsApi = {
  list: (params?: ProductQueryParams) =>
    api.get<PaginatedResponse<Product>>('/products', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<ProductDetail>>(`/products/${id}`),

  create: (data: CreateProductRequest) =>
    api.post<ApiResponse<Product>>('/products', data),

  update: (id: string, data: UpdateProductRequest) =>
    api.patch<ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete<ApiResponse<{ message: string }>>(`/products/${id}`),

  adjustStock: (id: string, data: AdjustStockRequest) =>
    api.post<ApiResponse<{ product: Product; movement: StockMovement }>>(
      `/products/${id}/stock-adjust`,
      data,
    ),

  getStockMovements: (id: string, params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<StockMovement>>(
      `/products/${id}/stock-movements`,
      { params },
    ),
};

export const categoriesApi = {
  list: () =>
    api.get<ApiResponse<Category[]>>('/categories'),

  create: (name: string) =>
    api.post<ApiResponse<Category>>('/categories', { name }),
};
