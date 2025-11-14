import { apiClient } from './api-client';
import type { UserDTO, ApiResponse } from '../types';

export const userService = {
  async getAll(): Promise<ApiResponse<UserDTO[]>> {
    return apiClient.get<UserDTO[]>('/users');
  },

  async getById(id: string): Promise<ApiResponse<UserDTO>> {
    return apiClient.get<UserDTO>(`/users/${id}`);
  },

  async create(user: Omit<UserDTO, 'id'>): Promise<ApiResponse<UserDTO>> {
    return apiClient.post<UserDTO>('/users', user);
  },

  async update(id: string, user: Omit<UserDTO, 'id'>): Promise<ApiResponse<UserDTO>> {
    return apiClient.put<UserDTO>(`/users/${id}`, user);
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/users/${id}`);
  },
};
