import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { requirementsService, RequirementFilters } from '../services/requirements.service';
import { Requirement, RequirementStatus, Plant } from '../types/requirement';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function RequirementsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [filters, setFilters] = useState<RequirementFilters>({});

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      const [requirementsData, plantsData] = await Promise.all([
        requirementsService.getAll(filters),
        requirementsService.getPlants(),
      ]);
      setRequirements(requirementsData);
      setPlants(plantsData);
    } catch (error: any) {
      toast.error('Error al cargar requerimientos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      toast.error('Ingrese un código de requerimiento');
      return;
    }

    try {
      const requirement = await requirementsService.getByCode(searchCode.trim());
      navigate(`/requirements/${requirement.id}`);
    } catch (error: any) {
      toast.error('Requerimiento no encontrado');
    }
  };

  const handleFilterChange = (key: keyof RequirementFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleDelete = async (id: string, codigo: string) => {
    if (!confirm(`¿Está seguro que desea eliminar el requerimiento ${codigo}?`)) {
      return;
    }

    try {
      await requirementsService.delete(id);
      toast.success('Requerimiento eliminado');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar requerimiento');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const handleExportRequirements = () => {
    try {
      const params = new URLSearchParams();
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.plantaId) params.append('plantaId', filters.plantaId);

      const url = `${API_URL}/exports/requirements/excel${params.toString() ? '?' + params.toString() : ''}`;
      window.open(url, '_blank');
      toast.success('Descargando reporte Excel...');
    } catch (error) {
      toast.error('Error al exportar requerimientos');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando requerimientos...</p>
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
                Gestión de Requerimientos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportRequirements}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span>📊</span>
                Exportar Excel
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
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>

        {/* Search and Actions */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por código (REQ-2025-XXXXXX)"
              className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Buscar
            </button>
          </div>
          <button
            onClick={() => navigate('/requirements/new')}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            + Nuevo Requerimiento
          </button>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Estado</label>
              <select
                value={filters.estado || ''}
                onChange={(e) => handleFilterChange('estado', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todos</option>
                <option value={RequirementStatus.DRAFT}>Borrador</option>
                <option value={RequirementStatus.PENDIENTE}>Pendiente</option>
                <option value={RequirementStatus.EN_PROCESO}>En Proceso</option>
                <option value={RequirementStatus.COMPLETADO}>Completado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Planta</label>
              <select
                value={filters.plantaId || ''}
                onChange={(e) => handleFilterChange('plantaId', e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Todas</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Tipo Muestra</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Investigador</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Planta</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Fecha Solicitud</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requirements.length > 0 ? (
                  requirements.map((requirement) => (
                    <tr key={requirement.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">
                        {requirement.codigo}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {requirement.tipoAnalisis?.nombre || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {requirement.investigador?.nombre || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {requirement.planta?.nombre || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(requirement.estado)}`}>
                          {getStatusLabel(requirement.estado)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(requirement.createdAt).toLocaleDateString('es-CL')}
                      </td>
                      <td className="px-4 py-3 text-sm text-right space-x-2">
                        <button
                          onClick={() => navigate(`/requirements/${requirement.id}`)}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          Ver
                        </button>
                        {requirement.estado === RequirementStatus.DRAFT && (
                          <>
                            <button
                              onClick={() => navigate(`/requirements/${requirement.id}/edit`)}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(requirement.id, requirement.codigo)}
                              className="text-red-600 hover:text-red-700 font-medium"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron requerimientos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          Total: {requirements.length} requerimiento{requirements.length !== 1 ? 's' : ''}
        </div>
      </main>
    </div>
  );
}

function getStatusColor(estado: RequirementStatus): string {
  const colors: Record<RequirementStatus, string> = {
    [RequirementStatus.DRAFT]: 'bg-gray-100 text-gray-700',
    [RequirementStatus.ENVIADO]: 'bg-yellow-100 text-yellow-700',
    [RequirementStatus.EN_PROCESO]: 'bg-blue-100 text-blue-700',
    [RequirementStatus.COMPLETADO]: 'bg-green-100 text-green-700',
    [RequirementStatus.CANCELADO]: 'bg-red-100 text-red-700',
  };
  return colors[estado] || 'bg-gray-100 text-gray-700';
}

function getStatusLabel(estado: RequirementStatus): string {
  const labels: Record<RequirementStatus, string> = {
    [RequirementStatus.DRAFT]: 'Borrador',
    [RequirementStatus.ENVIADO]: 'Enviado',
    [RequirementStatus.EN_PROCESO]: 'En Proceso',
    [RequirementStatus.COMPLETADO]: 'Completado',
    [RequirementStatus.CANCELADO]: 'Cancelado',
  };
  return labels[estado] || estado;
}
