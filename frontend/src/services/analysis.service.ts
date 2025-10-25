import { api } from './api';
import { Analysis, CreateAnalysisDto, UpdateAnalysisDto, UploadResultsDto, AnalysisStatus, AnalysisStatistics } from '../types/analysis';

export interface AnalysisFilters {
  sampleId?: string;
  estado?: AnalysisStatus;
  responsableId?: string;
  tipoAnalisisId?: string;
}

export const analysisService = {
  /**
   * Crear un nuevo análisis
   */
  async create(data: CreateAnalysisDto): Promise<Analysis> {
    const response = await api.post<Analysis>('/analysis', data);
    return response.data;
  },

  /**
   * Obtener todos los análisis con filtros opcionales
   */
  async getAll(filters?: AnalysisFilters): Promise<Analysis[]> {
    const params = new URLSearchParams();
    if (filters?.sampleId) params.append('sampleId', filters.sampleId);
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.responsableId) params.append('responsableId', filters.responsableId);
    if (filters?.tipoAnalisisId) params.append('tipoAnalisisId', filters.tipoAnalisisId);

    const queryString = params.toString();
    const url = queryString ? `/analysis?${queryString}` : '/analysis';
    const response = await api.get<Analysis[]>(url);
    return response.data;
  },

  /**
   * Obtener análisis por estado
   */
  async getByStatus(estado: AnalysisStatus): Promise<Analysis[]> {
    const response = await api.get<Analysis[]>(`/analysis/status/${estado}`);
    return response.data;
  },

  /**
   * Obtener un análisis por ID
   */
  async getById(id: string): Promise<Analysis> {
    const response = await api.get<Analysis>(`/analysis/${id}`);
    return response.data;
  },

  /**
   * Obtener análisis por muestra
   */
  async getBySampleId(sampleId: string): Promise<Analysis[]> {
    const response = await api.get<Analysis[]>(`/analysis/sample/${sampleId}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de análisis
   */
  async getStatistics(): Promise<AnalysisStatistics> {
    const response = await api.get<AnalysisStatistics>('/analysis/statistics');
    return response.data;
  },

  /**
   * Actualizar un análisis
   */
  async update(id: string, data: UpdateAnalysisDto): Promise<Analysis> {
    const response = await api.patch<Analysis>(`/analysis/${id}`, data);
    return response.data;
  },

  /**
   * Iniciar análisis (cambiar a EN_PROCESO)
   */
  async start(id: string, responsableId?: string): Promise<Analysis> {
    const response = await api.post<Analysis>(`/analysis/${id}/start`, { responsableId });
    return response.data;
  },

  /**
   * Completar análisis
   */
  async complete(id: string, data?: { resultados?: any; resultadosUrl?: string; observaciones?: string }): Promise<Analysis> {
    const response = await api.post<Analysis>(`/analysis/${id}/complete`, data);
    return response.data;
  },

  /**
   * Cancelar análisis
   */
  async cancel(id: string, motivoCancelacion: string): Promise<Analysis> {
    const response = await api.post<Analysis>(`/analysis/${id}/cancel`, { motivoCancelacion });
    return response.data;
  },

  /**
   * Subir resultados
   */
  async uploadResults(id: string, data: UploadResultsDto): Promise<Analysis> {
    const response = await api.post<Analysis>(`/analysis/${id}/results`, data);
    return response.data;
  },
};
