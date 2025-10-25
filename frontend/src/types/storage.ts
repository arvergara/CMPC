import { Sample } from './sample';

export enum StorageStatus {
  DISPONIBLE = 'DISPONIBLE',
  OCUPADA = 'OCUPADA',
  RESERVADA = 'RESERVADA',
  VENCIDA = 'VENCIDA',
}

export interface Storage {
  id: string;
  sampleId: string;
  ubicacionFisica: string;
  estanteria: string;
  caja?: string;
  posicion?: string;
  fechaIngreso: string;
  fechaVencimientoEstimada?: string;
  estado: StorageStatus;
  solicitudEliminacion: boolean;
  aprobadaEliminacion: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  sample?: Sample;
}

export interface CreateStorageDto {
  sampleId: string;
  ubicacionFisica: string;
  estanteria: string;
  caja?: string;
  posicion?: string;
  fechaVencimientoEstimada?: string;
}

export interface UpdateStorageDto {
  ubicacionFisica?: string;
  estanteria?: string;
  caja?: string;
  posicion?: string;
  fechaVencimientoEstimada?: string;
  estado?: StorageStatus;
}

export interface StorageStatistics {
  total: number;
  disponibles: number;
  ocupadas: number;
  reservadas: number;
  vencidas: number;
  proximasAVencer: number;
  solicitudesPendientes: number;
}

export interface StorageFilters {
  estado?: StorageStatus;
  ubicacionFisica?: string;
  estanteria?: string;
}
