// API Response wrapper
export interface ApiResponse<T> {
  message: string;
  data: T | null;
}

// Auth
export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  fullName: string;
  username: string;
  role: string;
}

// User
export interface UserDTO {
  id?: string;
  username: string;
  password?: string; // WRITE_ONLY - apenas para envio
  fullName: string;
}

// Client
export interface ClientDTO {
  id?: string;
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
}

// Process
export interface ProcessDTO {
  id?: string;
  number: string;
  clientId: string;
  description?: string;
  status: string;
}

// Appointment
export interface AppointmentDTO {
  id?: string;
  dateTime: string; // ISO 8601
  durationMinutes: number; // Mínimo 15
  lawyerId: string;
  clientId: string;
  processId?: string;
  description?: string;
}

// Error response
export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// Dashboard
export interface DashboardStats {
  totalClients: number;
  activeProcesses: number;
  todayAppointments: number;
  weekAppointments: number;
}

export interface AppointmentWithDetails extends AppointmentDTO {
  clientName: string;
  processNumber?: string;
}
