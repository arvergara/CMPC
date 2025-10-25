export interface Sample {
  id: string;
  codigoQR: string;
  requirementId: string;
  tipoMuestra: string;
  estado: string;
  fechaRecepcion?: string;
  ubicacionActual?: string;
  requirement?: {
    id: string;
    codigo: string;
    tipoAnalisis?: {
      nombre: string;
    };
  };
}

export interface QREvent {
  id: string;
  sampleId: string;
  usuarioId: string;
  tipoEvento: string;
  timestamp: string;
  ubicacion?: string;
  observaciones?: string;
  sample?: Sample;
  usuario?: {
    nombre: string;
    email: string;
  };
}

export interface CreateQREventDto {
  sampleId: string;
  tipoEvento: string;
  ubicacion?: string;
  observaciones?: string;
}

export interface SampleTimeline {
  sample: Sample;
  events: QREvent[];
}
