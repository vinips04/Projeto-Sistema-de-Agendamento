import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import type { AuthRequest, AuthResponse } from '../types';

interface AuthContextType {
  userId: string | null;
  fullName: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const USER_ID_KEY = 'saj_user_id';
const USER_FULLNAME_KEY = 'saj_user_fullname';
const USER_USERNAME_KEY = 'saj_user_username';
const USER_ROLE_KEY = 'saj_user_role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do localStorage ao iniciar
  useEffect(() => {
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    const storedFullName = localStorage.getItem(USER_FULLNAME_KEY);
    const storedUsername = localStorage.getItem(USER_USERNAME_KEY);
    const storedRole = localStorage.getItem(USER_ROLE_KEY);

    if (storedUserId) {
      setUserId(storedUserId);
      setFullName(storedFullName);
      setUsername(storedUsername);
      setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  const login = async (usernameInput: string, password: string): Promise<void> => {
    try {
      const requestData: AuthRequest = { username: usernameInput, password };

      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Permite receber cookies HTTP-only
        }
      );

      const { userId: newUserId, fullName: newFullName, username: newUsername, role: newRole } = response.data;

      // Armazenar dados do usuário (token vem via cookie)
      localStorage.setItem(USER_ID_KEY, newUserId);
      localStorage.setItem(USER_FULLNAME_KEY, newFullName);
      localStorage.setItem(USER_USERNAME_KEY, newUsername);
      localStorage.setItem(USER_ROLE_KEY, newRole);

      setUserId(newUserId);
      setFullName(newFullName);
      setUsername(newUsername);
      setRole(newRole);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Usuário ou senha inválidos');
        }
        throw new Error(error.response?.data?.message || 'Erro ao fazer login');
      }
      throw new Error('Erro inesperado durante a autenticação');
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Chamar endpoint de logout para remover cookie
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }

    // Limpar localStorage e estado
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_FULLNAME_KEY);
    localStorage.removeItem(USER_USERNAME_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    setUserId(null);
    setFullName(null);
    setUsername(null);
    setRole(null);
  };

  const value: AuthContextType = {
    userId,
    fullName,
    username,
    role,
    isAuthenticated: !!userId,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
