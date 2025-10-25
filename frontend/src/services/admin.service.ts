import { api } from './api';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  Plant,
  CreatePlantDto,
  UpdatePlantDto,
  AnalysisType,
  CreateAnalysisTypeDto,
  UpdateAnalysisTypeDto,
} from '../types/admin';

export const adminService = {
  // ========== User Management ==========

  /**
   * Crear un nuevo usuario
   */
  async createUser(data: CreateUserDto): Promise<User> {
    const response = await api.post<User>('/admin/users', data);
    return response.data;
  },

  /**
   * Obtener todos los usuarios
   */
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Actualizar un usuario
   */
  async updateUser(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch<User>(`/admin/users/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar (desactivar) un usuario
   */
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  // ========== Plant Management ==========

  /**
   * Crear una nueva planta
   */
  async createPlant(data: CreatePlantDto): Promise<Plant> {
    const response = await api.post<Plant>('/admin/plants', data);
    return response.data;
  },

  /**
   * Obtener todas las plantas
   */
  async getAllPlants(): Promise<Plant[]> {
    const response = await api.get<Plant[]>('/admin/plants');
    return response.data;
  },

  /**
   * Obtener una planta por ID
   */
  async getPlantById(id: string): Promise<Plant> {
    const response = await api.get<Plant>(`/admin/plants/${id}`);
    return response.data;
  },

  /**
   * Actualizar una planta
   */
  async updatePlant(id: string, data: UpdatePlantDto): Promise<Plant> {
    const response = await api.patch<Plant>(`/admin/plants/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar una planta
   */
  async deletePlant(id: string): Promise<void> {
    await api.delete(`/admin/plants/${id}`);
  },

  // ========== Analysis Type Management ==========

  /**
   * Crear un nuevo tipo de análisis
   */
  async createAnalysisType(data: CreateAnalysisTypeDto): Promise<AnalysisType> {
    const response = await api.post<AnalysisType>('/admin/analysis-types', data);
    return response.data;
  },

  /**
   * Obtener todos los tipos de análisis
   */
  async getAllAnalysisTypes(): Promise<AnalysisType[]> {
    const response = await api.get<AnalysisType[]>('/admin/analysis-types');
    return response.data;
  },

  /**
   * Obtener un tipo de análisis por ID
   */
  async getAnalysisTypeById(id: string): Promise<AnalysisType> {
    const response = await api.get<AnalysisType>(`/admin/analysis-types/${id}`);
    return response.data;
  },

  /**
   * Actualizar un tipo de análisis
   */
  async updateAnalysisType(id: string, data: UpdateAnalysisTypeDto): Promise<AnalysisType> {
    const response = await api.patch<AnalysisType>(`/admin/analysis-types/${id}`, data);
    return response.data;
  },

  /**
   * Eliminar un tipo de análisis
   */
  async deleteAnalysisType(id: string): Promise<void> {
    await api.delete(`/admin/analysis-types/${id}`);
  },
};
