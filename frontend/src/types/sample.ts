export enum SampleStatus {
  ESPERADA = 'ESPERADA',
  RECIBIDA = 'RECIBIDA',
  EN_ANALISIS = 'EN_ANALISIS',
  ANALISIS_COMPLETO = 'ANALISIS_COMPLETO',
  ALMACENADA = 'ALMACENADA',
  ELIMINADA = 'ELIMINADA',
}

export interface Sample {
  id: string;
  codigoQR: string;
  requirementId: string;
  tipo: string;
  formato?: string;
  cantidad?: string;
  estado: SampleStatus;
  fechaRecepcion?: string;
  observaciones?: string;
  esContramuestra: boolean;
  parentSampleId?: string;
  createdAt: string;
  updatedAt: string;
  requirement?: {
    id: string;
    codigo: string;
    investigador?: {
      nombre: string;
      email: string;
    };
  };
  parentSample?: {
    id: string;
    codigoQR: string;
  };
  derivedSamples?: Sample[];
  analysis?: Array<{
    id: string;
    estado: string;
    tipoAnalisis: {
      nombre: string;
    };
  }>;
}

export interface CreateSampleDto {
  requirementId: string;
  tipo: string;
  formato?: string;
  cantidad?: string;
  observaciones?: string;
  esContramuestra?: boolean;
  parentSampleId?: string;
}

export interface UpdateSampleDto {
  tipo?: string;
  formato?: string;
  cantidad?: string;
  observaciones?: string;
  estado?: SampleStatus;
}

export interface SampleHistory {
  sample: Sample;
  events: Array<{
    id: string;
    tipoEvento: string;
    timestamp: string;
    ubicacion?: string;
    observaciones?: string;
    usuario?: {
      nombre: string;
    };
  }>;
  analysis: Array<{
    id: string;
    estado: string;
    fechaInicio?: string;
    fechaFin?: string;
    tipoAnalisis: {
      nombre: string;
    };
    responsable?: {
      nombre: string;
    };
  }>;
}
