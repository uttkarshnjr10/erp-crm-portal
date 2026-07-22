import api from './axios';
import { ApiResponse } from '../types/api.types';
import { DashboardStats } from '../types/challan.types';

export const dashboardApi = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),
};
