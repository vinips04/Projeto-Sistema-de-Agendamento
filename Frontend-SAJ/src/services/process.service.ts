import { apiClient } from './api-client';
import type { ProcessDTO, ApiResponse } from '../types';

export const processService = {
  async getAll(): Promise<ApiResponse<ProcessDTO[]>> {
    return apiClient.get<ProcessDTO[]>('/processes');
  },

  async getById(id: string): Promise<ApiResponse<ProcessDTO>> {
    return apiClient.get<ProcessDTO>(`/processes/${id}`);
  },

  async create(process: Omit<ProcessDTO, 'id'>): Promise<ApiResponse<ProcessDTO>> {
    return apiClient.post<ProcessDTO>('/processes', process);
  },

  async update(id: string, process: Omit<ProcessDTO, 'id'>): Promise<ApiResponse<ProcessDTO>> {
    return apiClient.put<ProcessDTO>(`/processes/${id}`, process);
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/processes/${id}`);
  },
};
