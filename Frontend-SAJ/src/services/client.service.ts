import { apiClient } from './api-client';
import type { ClientDTO, ApiResponse } from '../types';

export const clientService = {
  async getAll(): Promise<ApiResponse<ClientDTO[]>> {
    return apiClient.get<ClientDTO[]>('/clients');
  },

  async getById(id: string): Promise<ApiResponse<ClientDTO>> {
    return apiClient.get<ClientDTO>(`/clients/${id}`);
  },

  async create(client: Omit<ClientDTO, 'id'>): Promise<ApiResponse<ClientDTO>> {
    return apiClient.post<ClientDTO>('/clients', client);
  },

  async update(id: string, client: Omit<ClientDTO, 'id'>): Promise<ApiResponse<ClientDTO>> {
    return apiClient.put<ClientDTO>(`/clients/${id}`, client);
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/clients/${id}`);
  },
};
