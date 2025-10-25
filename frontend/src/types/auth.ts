export enum UserRole {
  ADMIN = 'ADMIN',
  JEFE_LAB = 'JEFE_LAB',
  LABORATORISTA = 'LABORATORISTA',
  BODEGA = 'BODEGA',
  INVESTIGADOR = 'INVESTIGADOR',
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: UserRole;
  plantaId?: string;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}
