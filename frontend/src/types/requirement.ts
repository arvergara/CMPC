export enum RequirementStatus {
  DRAFT = 'DRAFT',
  ENVIADO = 'ENVIADO',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
}

export interface Requirement {
  id: string;
  codigo: string;
  tipoAnalisisId: string;
  plantaId: string;
  investigadorId: string;
  cantidadMuestras: number;
  fechaSolicitud: string;
  fechaLimite?: string;
  estado: RequirementStatus;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  tipoAnalisis?: {
    id: string;
    nombre: string;
    descripcion?: string;
    metodo?: string;
  };
  planta?: {
    id: string;
    nombre: string;
    codigo: string;
  };
  investigador?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface CreateRequirementDto {
  investigadorId: string;
  tipoMuestra: string;
  cantidadEsperada: number;
  descripcion?: string;
  documentosAdjuntos?: string[];
  plantaId?: string;
  laboratorioAsignadoId?: string;
}

export interface UpdateRequirementDto {
  investigadorId?: string;
  tipoMuestra?: string;
  cantidadEsperada?: number;
  descripcion?: string;
  documentosAdjuntos?: string[];
  plantaId?: string;
  laboratorioAsignadoId?: string;
  estado?: RequirementStatus;
}

export interface AnalysisType {
  id: string;
  nombre: string;
  descripcion?: string;
  metodo?: string;
  tiempoEstimadoHoras?: number;
}

export interface Plant {
  id: string;
  nombre: string;
  codigo: string;
  ubicacion?: string;
}
