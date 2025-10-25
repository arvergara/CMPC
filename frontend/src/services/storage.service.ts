import { api } from './api';
import { Storage, CreateStorageDto, UpdateStorageDto, StorageStatistics, StorageFilters, StorageStatus } from '../types/storage';

export const storageService = {
  /**
   * Crear un nuevo registro de almacenamiento
   */
  async create(data: CreateStorageDto): Promise<Storage> {
    const response = await api.post<Storage>('/storage', data);
    return response.data;
  },

  /**
   * Obtener todos los almacenamientos con filtros opcionales
   */
  async getAll(filters?: StorageFilters): Promise<Storage[]> {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.ubicacionFisica) params.append('ubicacionFisica', filters.ubicacionFisica);
    if (filters?.estanteria) params.append('estanteria', filters.estanteria);

    const queryString = params.toString();
    const url = queryString ? `/storage?${queryString}` : '/storage';
    const response = await api.get<Storage[]>(url);
    return response.data;
  },

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStatistics(): Promise<StorageStatistics> {
    const response = await api.get<StorageStatistics>('/storage/statistics');
    return response.data;
  },

  /**
   * Obtener muestras próximas a vencer
   */
  async getExpiringSoon(days: number = 30): Promise<Storage[]> {
    const response = await api.get<Storage[]>(`/storage/expiring?days=${days}`);
    return response.data;
  },

  /**
   * Obtener ubicaciones disponibles en una estantería
   */
  async getAvailableLocations(estanteria: string): Promise<any> {
    const response = await api.get(`/storage/locations/${estanteria}`);
    return response.data;
  },

  /**
   * Obtener un almacenamiento por ID
   */
  async getById(id: string): Promise<Storage> {
    const response = await api.get<Storage>(`/storage/${id}`);
    return response.data;
  },

  /**
   * Obtener almacenamiento por ID de muestra
   */
  async getBySampleId(sampleId: string): Promise<Storage> {
    const response = await api.get<Storage>(`/storage/sample/${sampleId}`);
    return response.data;
  },

  /**
   * Actualizar un almacenamiento
   */
  async update(id: string, data: UpdateStorageDto): Promise<Storage> {
    const response = await api.patch<Storage>(`/storage/${id}`, data);
    return response.data;
  },

  /**
   * Solicitar eliminación de una muestra almacenada
   */
  async requestDeletion(id: string): Promise<Storage> {
    const response = await api.post<Storage>(`/storage/${id}/request-deletion`);
    return response.data;
  },

  /**
   * Aprobar eliminación de una muestra almacenada
   */
  async approveDeletion(id: string): Promise<Storage> {
    const response = await api.post<Storage>(`/storage/${id}/approve-deletion`);
    return response.data;
  },

  /**
   * Eliminar registro de almacenamiento
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/storage/${id}`);
  },
};
