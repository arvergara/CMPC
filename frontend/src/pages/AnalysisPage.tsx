import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { analysisService, AnalysisFilters } from '../services/analysis.service';
import { Analysis, AnalysisStatus } from '../types/analysis';

export function AnalysisPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [analysisList, setAnalysisList] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<AnalysisFilters>({});

  useEffect(() => {
    loadAnalysis();
  }, [filters]);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      const data = await analysisService.getAll(filters);
      setAnalysisList(data);
    } catch (error: any) {
      toast.error('Error al cargar análisis');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">CMPC LIMS</h1>
              <p className="text-sm text-muted-foreground">Gestión de Análisis</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Dashboard
              </button>
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
        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={filters.estado || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    estado: e.target.value ? (e.target.value as AnalysisStatus) : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos</option>
                <option value={AnalysisStatus.PENDIENTE}>Pendiente</option>
                <option value={AnalysisStatus.EN_PROCESO}>En Proceso</option>
                <option value={AnalysisStatus.COMPLETADO}>Completado</option>
                <option value={AnalysisStatus.CANCELADO}>Cancelado</option>
              </select>
            </div>

            <div className="flex justify-end items-end">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">
              Análisis ({analysisList.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : analysisList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron análisis</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tipo de Análisis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Muestra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Responsable
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Fecha Inicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analysisList.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-sm">#{analysis.id.slice(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {analysis.tipoAnalisis?.nombre || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {analysis.sample?.codigoQR || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {analysis.responsable?.nombre || 'Sin asignar'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            analysis.estado
                          )}`}
                        >
                          {getStatusLabel(analysis.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {analysis.fechaInicio
                          ? new Date(analysis.fechaInicio).toLocaleDateString('es-CL')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/analysis/${analysis.id}`)}
                          className="text-primary hover:underline text-sm"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getStatusColor(estado: AnalysisStatus): string {
  const colors: Record<AnalysisStatus, string> = {
    [AnalysisStatus.PENDIENTE]: 'bg-yellow-100 text-yellow-700',
    [AnalysisStatus.EN_PROCESO]: 'bg-blue-100 text-blue-700',
    [AnalysisStatus.COMPLETADO]: 'bg-green-100 text-green-700',
    [AnalysisStatus.CANCELADO]: 'bg-red-100 text-red-700',
  };
  return colors[estado] || 'bg-gray-100 text-gray-700';
}

function getStatusLabel(estado: AnalysisStatus): string {
  const labels: Record<AnalysisStatus, string> = {
    [AnalysisStatus.PENDIENTE]: 'Pendiente',
    [AnalysisStatus.EN_PROCESO]: 'En Proceso',
    [AnalysisStatus.COMPLETADO]: 'Completado',
    [AnalysisStatus.CANCELADO]: 'Cancelado',
  };
  return labels[estado] || estado;
}
