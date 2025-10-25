export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  plantaId?: string;
  estado?: string;
}

export interface RequirementStats {
  total: number;
  byStatus: {
    [key: string]: number;
  };
}

export interface SampleStats {
  total: number;
  byStatus: {
    [key: string]: number;
  };
}

export interface AnalysisStats {
  total: number;
  byStatus: {
    [key: string]: number;
  };
  byType?: {
    tipo: string;
    count: number;
  }[];
}

export interface SystemStats {
  requirements: RequirementStats;
  samples: SampleStats;
  analysis: AnalysisStats;
}
