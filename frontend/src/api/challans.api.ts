import api from './axios';
import { ApiResponse, PaginatedResponse } from '../types/api.types';
import {
  Challan,
  ChallanDetail,
  CreateChallanRequest,
  ChallanQueryParams,
  ChallanStatus,
} from '../types/challan.types';

export const challansApi = {
  list: (params?: ChallanQueryParams) =>
    api.get<PaginatedResponse<Challan>>('/challans', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<ChallanDetail>>(`/challans/${id}`),

  create: (data: CreateChallanRequest) =>
    api.post<ApiResponse<ChallanDetail>>('/challans', data),

  updateStatus: (id: string, status: ChallanStatus) =>
    api.patch<ApiResponse<ChallanDetail>>(`/challans/${id}/status`, { status }),
};
