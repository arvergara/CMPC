import { api } from './api';
import { Requirement, CreateRequirementDto, Plant, UpdateRequirementDto, RequirementStatus } from '../types/requirement';

export interface RequirementFilters {
  investigadorId?: string;
  estado?: RequirementStatus;
  plantaId?: string;
}

export const requirementsService = {
  async create(data: CreateRequirementDto): Promise<Requirement> {
    const response = await api.post<Requirement>('/requirements', data);
    return response.data;
  },

  async getAll(filters?: RequirementFilters): Promise<Requirement[]> {
    const params = new URLSearchParams();
    if (filters?.investigadorId) params.append('investigadorId', filters.investigadorId);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.plantaId) params.append('plantaId', filters.plantaId);

    const queryString = params.toString();
    const url = queryString ? `/requirements?${queryString}` : '/requirements';
    const response = await api.get<Requirement[]>(url);
    return response.data;
  },

  async getById(id: string): Promise<Requirement> {
    const response = await api.get<Requirement>(`/requirements/${id}`);
    return response.data;
  },

  async getByCode(codigo: string): Promise<Requirement> {
    const response = await api.get<Requirement>(`/requirements/code/${codigo}`);
    return response.data;
  },

  async getHistory(investigadorId: string): Promise<Requirement[]> {
    const response = await api.get<Requirement[]>(`/requirements/investigador/${investigadorId}/history`);
    return response.data;
  },

  async update(id: string, data: UpdateRequirementDto): Promise<Requirement> {
    const response = await api.patch<Requirement>(`/requirements/${id}`, data);
    return response.data;
  },

  async changeStatus(id: string, estado: RequirementStatus): Promise<Requirement> {
    const response = await api.patch<Requirement>(`/requirements/${id}/status`, { estado });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/requirements/${id}`);
  },

  async getPlants(): Promise<Plant[]> {
    const response = await api.get<Plant[]>('/admin/plants');
    return response.data;
  },
};
