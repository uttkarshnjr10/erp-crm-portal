import api from './axios';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import {
  Customer,
  CustomerDetail,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerQueryParams,
  FollowUp,
  CustomerStatus,
} from '../types/customer.types';

export const customersApi = {
  list: (params?: CustomerQueryParams) =>
    api.get<PaginatedResponse<Customer>>('/customers', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<CustomerDetail>>(`/customers/${id}`),

  create: (data: CreateCustomerRequest) =>
    api.post<ApiResponse<Customer>>('/customers', data),

  update: (id: string, data: UpdateCustomerRequest) =>
    api.patch<ApiResponse<Customer>>(`/customers/${id}`, data),

  updateStatus: (id: string, status: CustomerStatus) =>
    api.patch<ApiResponse<Customer>>(`/customers/${id}/status`, { status }),

  addFollowUp: (id: string, note: string) =>
    api.post<ApiResponse<FollowUp>>(`/customers/${id}/follow-ups`, { note }),

  getFollowUps: (id: string) =>
    api.get<ApiResponse<FollowUp[]>>(`/customers/${id}/follow-ups`),
};
