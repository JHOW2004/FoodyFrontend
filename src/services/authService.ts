import type { AuthResponse } from '../types';
import { api } from './api';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

export const authService = {
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', params);
    return response.data;
  },

  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', params);
    return response.data;
  },
};
