import { api } from './api';
import { Sample, CreateSampleDto, UpdateSampleDto, SampleStatus, SampleHistory } from '../types/sample';

export interface SampleFilters {
  requirementId?: string;
  estado?: SampleStatus;
  tipo?: string;
  esContramuestra?: boolean;
}

export const samplesService = {
  /**
   * Crear una nueva muestra
   */
  async create(data: CreateSampleDto): Promise<Sample> {
    const response = await api.post<Sample>('/samples', data);
    return response.data;
  },

  /**
   * Obtener todas las muestras con filtros opcionales
   */
  async getAll(filters?: SampleFilters): Promise<Sample[]> {
    const params = new URLSearchParams();
    if (filters?.requirementId) params.append('requirementId', filters.requirementId);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.esContramuestra !== undefined) {
      params.append('esContramuestra', filters.esContramuestra.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/samples?${queryString}` : '/samples';
    const response = await api.get<Sample[]>(url);
    return response.data;
  },

  /**
   * Obtener una muestra por ID
   */
  async getById(id: string): Promise<Sample> {
    const response = await api.get<Sample>(`/samples/${id}`);
    return response.data;
  },

  /**
   * Buscar muestra por código QR
   */
  async getByQRCode(codigoQR: string): Promise<Sample> {
    const response = await api.get<Sample>(`/samples/qr/${codigoQR}`);
    return response.data;
  },

  /**
   * Obtener historial de una muestra
   */
  async getHistory(id: string): Promise<SampleHistory> {
    const response = await api.get<SampleHistory>(`/samples/${id}/history`);
    return response.data;
  },

  /**
   * Actualizar una muestra
   */
  async update(id: string, data: UpdateSampleDto): Promise<Sample> {
    const response = await api.patch<Sample>(`/samples/${id}`, data);
    return response.data;
  },

  /**
   * Cambiar el estado de una muestra
   */
  async changeStatus(id: string, estado: SampleStatus): Promise<Sample> {
    const response = await api.patch<Sample>(`/samples/${id}/status`, { estado });
    return response.data;
  },

  /**
   * Registrar recepción de muestra
   */
  async receiveSample(id: string, observaciones?: string): Promise<Sample> {
    const response = await api.post<Sample>(`/samples/${id}/receive`, { observaciones });
    return response.data;
  },

  /**
   * Crear muestra derivada (contramuestra)
   */
  async createDerivative(id: string, data: { tipo: string; formato?: string; cantidad?: string; observaciones?: string }): Promise<Sample> {
    const response = await api.post<Sample>(`/samples/${id}/derivative`, data);
    return response.data;
  },

  /**
   * Eliminar una muestra
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/samples/${id}`);
  },
};
