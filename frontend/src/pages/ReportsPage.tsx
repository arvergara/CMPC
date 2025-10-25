import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { reportsService, RequirementsStatsResponse, SamplesStatsResponse, AnalysisStatsResponse } from '../services/reports.service';

export function ReportsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [requirementsStats, setRequirementsStats] = useState<RequirementsStatsResponse | null>(null);
  const [samplesStats, setSamplesStats] = useState<SamplesStatsResponse | null>(null);
  const [analysisStats, setAnalysisStats] = useState<AnalysisStatsResponse | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [reqStats, sampStats, analStats] = await Promise.all([
        reportsService.getRequirementsStats(),
        reportsService.getSamplesStats(),
        reportsService.getAnalysisStats(),
      ]);

      setRequirementsStats(reqStats);
      setSamplesStats(sampStats);
      setAnalysisStats(analStats);
    } catch (error: any) {
      toast.error('Error al cargar reportes');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to convert array to object and calculate total
  const getTotal = (byStatus: { status: string; count: number }[]) => {
    return byStatus.reduce((sum, item) => sum + item.count, 0);
  };

  const convertByStatusToObject = (byStatus: { status: string; count: number }[]) => {
    return byStatus.reduce((acc, item) => {
      acc[item.status] = item.count;
      return acc;
    }, {} as { [key: string]: number });
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">CMPC LIMS</h1>
              <p className="text-sm text-muted-foreground">
                Reportes y Estadísticas
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user?.nombre}</p>
                <p className="text-sm text-muted-foreground">{user?.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <SummaryCard
            title="Requerimientos"
            total={requirementsStats ? getTotal(requirementsStats.byStatus) : 0}
            icon="📋"
            color="blue"
          />
          <SummaryCard
            title="Muestras"
            total={samplesStats ? getTotal(samplesStats.byStatus) : 0}
            icon="🧪"
            color="green"
          />
          <SummaryCard
            title="Análisis"
            total={analysisStats ? getTotal(analysisStats.byStatus) : 0}
            icon="📊"
            color="purple"
          />
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Requirements Stats */}
          {requirementsStats && (
            <StatsCard
              title="Estadísticas de Requerimientos"
              data={convertByStatusToObject(requirementsStats.byStatus)}
              colorMap={{
                DRAFT: 'bg-gray-500',
                PENDIENTE: 'bg-yellow-500',
                EN_PROCESO: 'bg-blue-500',
                COMPLETADO: 'bg-green-500',
              }}
            />
          )}

          {/* Samples Stats */}
          {samplesStats && (
            <StatsCard
              title="Estadísticas de Muestras"
              data={convertByStatusToObject(samplesStats.byStatus)}
              colorMap={{
                ESPERADA: 'bg-purple-500',
                RECIBIDA: 'bg-cyan-500',
                EN_ANALISIS: 'bg-orange-500',
                ANALISIS_COMPLETO: 'bg-emerald-500',
                ALMACENADA: 'bg-blue-500',
                ELIMINADA: 'bg-red-500',
              }}
            />
          )}

          {/* Analysis Stats */}
          {analysisStats && (
            <StatsCard
              title="Estadísticas de Análisis"
              data={convertByStatusToObject(analysisStats.byStatus)}
              colorMap={{
                PENDIENTE: 'bg-yellow-500',
                EN_PROCESO: 'bg-blue-500',
                COMPLETADO: 'bg-green-500',
                CANCELADO: 'bg-red-500',
              }}
            />
          )}

          {/* System Overview */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen del Sistema</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm font-medium">Total de Requerimientos</span>
                <span className="text-lg font-bold text-primary">{requirementsStats ? getTotal(requirementsStats.byStatus) : 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm font-medium">Total de Muestras</span>
                <span className="text-lg font-bold text-primary">{samplesStats ? getTotal(samplesStats.byStatus) : 0}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <span className="text-sm font-medium">Total de Análisis</span>
                <span className="text-lg font-bold text-primary">{analysisStats ? getTotal(analysisStats.byStatus) : 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-muted p-6 rounded-lg border border-border">
          <h3 className="font-semibold mb-2">Información sobre los Reportes</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Los datos se actualizan en tiempo real desde la base de datos</li>
            <li>Las estadísticas incluyen todos los registros históricos del sistema</li>
            <li>Puedes exportar estos datos a Excel o PDF (función en desarrollo)</li>
            <li>Los gráficos muestran la distribución por estado de cada entidad</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

// Helper Components
interface SummaryCardProps {
  title: string;
  total: number;
  icon: string;
  color: 'blue' | 'green' | 'purple';
}

function SummaryCard({ title, total, icon, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-4xl font-bold text-primary">{total}</span>
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">Total en el sistema</p>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  data: { [key: string]: number };
  colorMap: { [key: string]: string };
}

function StatsCard({ title, data, colorMap }: StatsCardProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {entries.map(([status, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const color = colorMap[status] || 'bg-gray-500';

          return (
            <div key={status}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{status}</span>
                <span className="text-sm font-bold">{count} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No hay datos disponibles
        </p>
      )}
    </div>
  );
}
