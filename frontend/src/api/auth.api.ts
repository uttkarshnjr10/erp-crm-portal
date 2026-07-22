import api from './axios';
import { ApiResponse } from '../types/api.types';
import { LoginRequest, LoginResponse, User } from '../types/auth.types';

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  me: () =>
    api.post<ApiResponse<User>>('/auth/me'),
};
