import { apiClient } from './api-client';
import type { AppointmentDTO, ApiResponse } from '../types';

export const appointmentService = {
  async getByLawyer(lawyerId: string): Promise<ApiResponse<AppointmentDTO[]>> {
    return apiClient.get<AppointmentDTO[]>(`/appointments/lawyer/${lawyerId}`);
  },

  async getById(id: string): Promise<ApiResponse<AppointmentDTO>> {
    return apiClient.get<AppointmentDTO>(`/appointments/${id}`);
  },

  async create(appointment: Omit<AppointmentDTO, 'id'>): Promise<ApiResponse<AppointmentDTO>> {
    return apiClient.post<AppointmentDTO>('/appointments', appointment);
  },

  async update(
    id: string,
    appointment: Omit<AppointmentDTO, 'id'>
  ): Promise<ApiResponse<AppointmentDTO>> {
    return apiClient.put<AppointmentDTO>(`/appointments/${id}`, appointment);
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    return apiClient.delete<null>(`/appointments/${id}`);
  },
};
