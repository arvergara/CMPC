// User types
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
  createdAt: string;
  updatedAt: string;

  // Relations
  planta?: Plant;
}

export interface CreateUserDto {
  email: string;
  password: string;
  nombre: string;
  rol: UserRole;
  plantaId?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  nombre?: string;
  rol?: UserRole;
  plantaId?: string;
  isActive?: boolean;
}

// Plant types
export interface Plant {
  id: string;
  nombre: string;
  codigo: string;
  ubicacion: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  users?: User[];
}

export interface CreatePlantDto {
  nombre: string;
  codigo: string;
  ubicacion: string;
}

export interface UpdatePlantDto {
  nombre?: string;
  codigo?: string;
  ubicacion?: string;
  isActive?: boolean;
}

// AnalysisType types
export interface AnalysisType {
  id: string;
  nombre: string;
  descripcion?: string;
  metodo?: string;
  tiempoEstimadoHoras: number;
  laboratoryId?: string;
  equiposRequeridos: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnalysisTypeDto {
  nombre: string;
  descripcion?: string;
  metodo?: string;
  tiempoEstimadoHoras?: number;
  isActive?: boolean;
}

export interface UpdateAnalysisTypeDto {
  nombre?: string;
  descripcion?: string;
  metodo?: string;
  tiempoEstimadoHoras?: number;
  isActive?: boolean;
}
