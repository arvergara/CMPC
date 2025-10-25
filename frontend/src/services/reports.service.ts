import { api } from './api';

export interface StatusCount {
  status: string;
  count: number;
}

export interface TypeCount {
  type?: string;
  tipoAnalisisId?: string;
  tipoAnalisisNombre?: string;
  count: number;
}

export interface MonthCount {
  month: string;
  count: number;
}

export interface RequirementsStatsResponse {
  byStatus: StatusCount[];
  byMonth: MonthCount[];
}

export interface SamplesStatsResponse {
  byStatus: StatusCount[];
  byType: TypeCount[];
  byMonth: MonthCount[];
}

export interface AnalysisStatsResponse {
  byStatus: StatusCount[];
  byType: TypeCount[];
  byMonth: MonthCount[];
}

export const reportsService = {
  async getRequirementsStats(): Promise<RequirementsStatsResponse> {
    const response = await api.get<RequirementsStatsResponse>('/dashboard/requirements/stats');
    return response.data;
  },

  async getSamplesStats(): Promise<SamplesStatsResponse> {
    const response = await api.get<SamplesStatsResponse>('/dashboard/samples/stats');
    return response.data;
  },

  async getAnalysisStats(): Promise<AnalysisStatsResponse> {
    const response = await api.get<AnalysisStatsResponse>('/dashboard/analysis/stats');
    return response.data;
  },
};
