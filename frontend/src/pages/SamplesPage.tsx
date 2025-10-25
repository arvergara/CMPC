import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { samplesService, SampleFilters } from '../services/samples.service';
import { Sample, SampleStatus } from '../types/sample';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function SamplesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SampleFilters>({});
  const [searchQR, setSearchQR] = useState('');

  useEffect(() => {
    loadSamples();
  }, [filters]);

  const loadSamples = async () => {
    try {
      setIsLoading(true);
      const data = await samplesService.getAll(filters);
      setSamples(data);
    } catch (error: any) {
      toast.error('Error al cargar muestras');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQR.trim()) {
      toast.error('Ingrese un código QR');
      return;
    }

    try {
      const sample = await samplesService.getByQRCode(searchQR.trim());
      navigate(`/samples/${sample.id}`);
    } catch (error: any) {
      toast.error('Muestra no encontrada');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const handleExportSamples = () => {
    try {
      const params = new URLSearchParams();
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.requirementId) params.append('requirementId', filters.requirementId);

      const url = `${API_URL}/exports/samples/excel${params.toString() ? '?' + params.toString() : ''}`;
      window.open(url, '_blank');
      toast.success('Descargando reporte Excel...');
    } catch (error) {
      toast.error('Error al exportar muestras');
    }
  };

  const filteredSamples = samples.filter((sample) => {
    if (searchQR && !sample.codigoQR.toLowerCase().includes(searchQR.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">CMPC LIMS</h1>
              <p className="text-sm text-muted-foreground">Gestión de Muestras</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportSamples}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span>📊</span>
                Exportar Excel
              </button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar por QR</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQR}
                  onChange={(e) => setSearchQR(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="QR-2025-000001"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Buscar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={filters.estado || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    estado: e.target.value ? (e.target.value as SampleStatus) : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos</option>
                <option value={SampleStatus.ESPERADA}>Esperada</option>
                <option value={SampleStatus.RECIBIDA}>Recibida</option>
                <option value={SampleStatus.EN_ANALISIS}>En Análisis</option>
                <option value={SampleStatus.ANALISIS_COMPLETO}>Análisis Completo</option>
                <option value={SampleStatus.ALMACENADA}>Almacenada</option>
                <option value={SampleStatus.ELIMINADA}>Eliminada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <input
                type="text"
                value={filters.tipo || ''}
                onChange={(e) =>
                  setFilters({ ...filters, tipo: e.target.value || undefined })
                }
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Filtrar por tipo..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contramuestra</label>
              <select
                value={filters.esContramuestra?.toString() || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    esContramuestra: e.target.value === '' ? undefined : e.target.value === 'true',
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todas</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilters({});
                setSearchQR('');
              }}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold">
              Muestras ({filteredSamples.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredSamples.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron muestras</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Código QR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Requerimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Contramuestra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSamples.map((sample) => (
                    <tr key={sample.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">{sample.codigoQR}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{sample.tipo}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sample.requirement?.codigo || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            sample.estado
                          )}`}
                        >
                          {getStatusLabel(sample.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sample.esContramuestra ? (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Sí
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/samples/${sample.id}`)}
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

function getStatusColor(estado: SampleStatus): string {
  const colors: Record<SampleStatus, string> = {
    [SampleStatus.ESPERADA]: 'bg-gray-100 text-gray-700',
    [SampleStatus.RECIBIDA]: 'bg-blue-100 text-blue-700',
    [SampleStatus.EN_ANALISIS]: 'bg-yellow-100 text-yellow-700',
    [SampleStatus.ANALISIS_COMPLETO]: 'bg-green-100 text-green-700',
    [SampleStatus.ALMACENADA]: 'bg-purple-100 text-purple-700',
    [SampleStatus.ELIMINADA]: 'bg-red-100 text-red-700',
  };
  return colors[estado] || 'bg-gray-100 text-gray-700';
}

function getStatusLabel(estado: SampleStatus): string {
  const labels: Record<SampleStatus, string> = {
    [SampleStatus.ESPERADA]: 'Esperada',
    [SampleStatus.RECIBIDA]: 'Recibida',
    [SampleStatus.EN_ANALISIS]: 'En Análisis',
    [SampleStatus.ANALISIS_COMPLETO]: 'Análisis Completo',
    [SampleStatus.ALMACENADA]: 'Almacenada',
    [SampleStatus.ELIMINADA]: 'Eliminada',
  };
  return labels[estado] || estado;
}
