export enum AnalysisStatus {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
}

export interface Analysis {
  id: string;
  sampleId: string;
  tipoAnalisisId: string;
  responsableId?: string;
  estado: AnalysisStatus;
  fechaInicio?: string;
  fechaFin?: string;
  resultados?: any;
  resultadosUrl?: string;
  observaciones?: string;
  motivoCancelacion?: string;
  createdAt: string;
  updatedAt: string;
  sample?: {
    id: string;
    codigoQR: string;
    tipo: string;
    requirement?: {
      codigo: string;
      investigador?: {
        nombre: string;
      };
    };
  };
  tipoAnalisis?: {
    id: string;
    nombre: string;
    descripcion?: string;
    metodo?: string;
    tiempoEstimadoHoras?: number;
  };
  responsable?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface CreateAnalysisDto {
  sampleId: string;
  tipoAnalisisId: string;
  responsableId?: string;
  observaciones?: string;
}

export interface UpdateAnalysisDto {
  responsableId?: string;
  observaciones?: string;
  resultados?: any;
  resultadosUrl?: string;
}

export interface UploadResultsDto {
  resultados?: any;
  resultadosUrl?: string;
  observaciones?: string;
}

export interface AnalysisType {
  id: string;
  nombre: string;
  descripcion?: string;
  metodo?: string;
  tiempoEstimadoHoras?: number;
  equiposRequeridos?: string[];
  isActive: boolean;
}

export interface AnalysisStatistics {
  total: number;
  byStatus: {
    [key: string]: number;
  };
  averageCompletionTime?: number;
  topAnalysisTypes: Array<{
    tipoAnalisisId: string;
    tipoAnalisisNombre: string;
    count: number;
  }>;
}
