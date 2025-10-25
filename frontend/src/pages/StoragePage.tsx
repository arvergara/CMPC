import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { storageService } from '../services/storage.service';
import { Storage, StorageStatus, StorageFilters, StorageStatistics } from '../types/storage';

export function StoragePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [storageList, setStorageList] = useState<Storage[]>([]);
  const [statistics, setStatistics] = useState<StorageStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<StorageFilters>({});

  useEffect(() => {
    loadStorage();
    loadStatistics();
  }, [filters]);

  const loadStorage = async () => {
    try {
      setIsLoading(true);
      const data = await storageService.getAll(filters);
      setStorageList(data);
    } catch (error: any) {
      toast.error('Error al cargar almacenamiento');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await storageService.getStatistics();
      setStatistics(stats);
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
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
              <p className="text-sm text-muted-foreground">Gestión de Almacenamiento</p>
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
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{statistics.total}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Ocupadas</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.ocupadas}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Próximas a Vencer</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.proximasAVencer}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Solicitudes Pendientes</p>
              <p className="text-2xl font-bold text-red-600">{statistics.solicitudesPendientes}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={filters.estado || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    estado: e.target.value ? (e.target.value as StorageStatus) : undefined,
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos</option>
                <option value={StorageStatus.DISPONIBLE}>Disponible</option>
                <option value={StorageStatus.OCUPADA}>Ocupada</option>
                <option value={StorageStatus.RESERVADA}>Reservada</option>
                <option value={StorageStatus.VENCIDA}>Vencida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ubicación</label>
              <input
                type="text"
                value={filters.ubicacionFisica || ''}
                onChange={(e) =>
                  setFilters({ ...filters, ubicacionFisica: e.target.value || undefined })
                }
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Bodega Principal..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Estantería</label>
              <input
                type="text"
                value={filters.estanteria || ''}
                onChange={(e) =>
                  setFilters({ ...filters, estanteria: e.target.value || undefined })
                }
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="EST-A-01..."
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setFilters({})}
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
              Almacenamiento ({storageList.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : storageList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron registros de almacenamiento</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Muestra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estantería
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Caja / Posición
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Vencimiento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {storageList.map((storage) => (
                    <tr key={storage.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium">{storage.sample?.codigoQR || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {storage.ubicacionFisica}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {storage.estanteria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {storage.caja && storage.posicion
                          ? `${storage.caja} / ${storage.posicion}`
                          : storage.caja || storage.posicion || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            storage.estado
                          )}`}
                        >
                          {getStatusLabel(storage.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {storage.fechaVencimientoEstimada
                          ? new Date(storage.fechaVencimientoEstimada).toLocaleDateString('es-CL')
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/samples/${storage.sampleId}`)}
                          className="text-primary hover:underline text-sm"
                        >
                          Ver Muestra
                        </button>
                      </td>
                    </tr>
                  ))
}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function getStatusColor(estado: StorageStatus): string {
  const colors: Record<StorageStatus, string> = {
    [StorageStatus.DISPONIBLE]: 'bg-gray-100 text-gray-700',
    [StorageStatus.OCUPADA]: 'bg-blue-100 text-blue-700',
    [StorageStatus.RESERVADA]: 'bg-yellow-100 text-yellow-700',
    [StorageStatus.VENCIDA]: 'bg-red-100 text-red-700',
  };
  return colors[estado] || 'bg-gray-100 text-gray-700';
}

function getStatusLabel(estado: StorageStatus): string {
  const labels: Record<StorageStatus, string> = {
    [StorageStatus.DISPONIBLE]: 'Disponible',
    [StorageStatus.OCUPADA]: 'Ocupada',
    [StorageStatus.RESERVADA]: 'Reservada',
    [StorageStatus.VENCIDA]: 'Vencida',
  };
  return labels[estado] || estado;
}
