export interface DashboardOverview {
  totals: {
    requirements: number;
    samples: number;
    analysis: number;
    storage: number;
    users: number;
  };
  pending: {
    requirements: number;
    samples: number;
    analysis: number;
  };
}

export interface RecentActivity {
  requirements: Array<{
    id: string;
    codigo: string;
    estado: string;
    createdAt: string;
  }>;
  samples: Array<{
    id: string;
    codigoQR: string;
    estado: string;
    createdAt: string;
  }>;
  analysis: Array<{
    id: string;
    estado: string;
    createdAt: string;
  }>;
}
