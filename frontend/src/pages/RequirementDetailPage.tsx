import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { requirementsService } from '../services/requirements.service';
import { Requirement, RequirementStatus } from '../types/requirement';

export function RequirementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<RequirementStatus | ''>('');

  useEffect(() => {
    if (id) {
      loadRequirement();
    }
  }, [id]);

  const loadRequirement = async () => {
    if (!id) return;

    try {
      const data = await requirementsService.getById(id);
      setRequirement(data);
    } catch (error: any) {
      toast.error('Error al cargar el requerimiento');
      console.error(error);
      navigate('/requirements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!id || !newStatus) {
      toast.error('Seleccione un estado');
      return;
    }

    try {
      await requirementsService.changeStatus(id, newStatus as RequirementStatus);
      toast.success('Estado actualizado');
      setIsChangingStatus(false);
      setNewStatus('');
      loadRequirement();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async () => {
    if (!id || !requirement) return;

    if (!confirm(`¿Está seguro que desea eliminar el requerimiento ${requirement.codigo}?`)) {
      return;
    }

    try {
      await requirementsService.delete(id);
      toast.success('Requerimiento eliminado');
      navigate('/requirements');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar requerimiento');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const getAvailableStatusTransitions = (currentStatus: RequirementStatus): RequirementStatus[] => {
    switch (currentStatus) {
      case RequirementStatus.DRAFT:
        return [RequirementStatus.ENVIADO, RequirementStatus.CANCELADO];
      case RequirementStatus.ENVIADO:
        return [RequirementStatus.EN_PROCESO, RequirementStatus.CANCELADO];
      case RequirementStatus.EN_PROCESO:
        return [RequirementStatus.COMPLETADO, RequirementStatus.CANCELADO];
      case RequirementStatus.COMPLETADO:
        return [];
      case RequirementStatus.CANCELADO:
        return [];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando requerimiento...</p>
        </div>
      </div>
    );
  }

  if (!requirement) {
    return null;
  }

  const availableTransitions = getAvailableStatusTransitions(requirement.estado);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">CMPC LIMS</h1>
              <p className="text-sm text-muted-foreground">
                Detalle de Requerimiento
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/requirements')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver a Requerimientos
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{requirement.codigo}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(requirement.estado)}`}>
                  {getStatusLabel(requirement.estado)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {requirement.estado === RequirementStatus.DRAFT && (
                <>
                  <button
                    onClick={() => navigate(`/requirements/${requirement.id}/edit`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tipo de Análisis
              </label>
              <p className="text-base">{requirement.tipoAnalisis?.nombre || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Planta
              </label>
              <p className="text-base">{requirement.planta?.nombre || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Investigador
              </label>
              <p className="text-base">{requirement.investigador?.nombre || 'N/A'}</p>
              {requirement.investigador?.email && (
                <p className="text-sm text-muted-foreground">{requirement.investigador.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Cantidad de Muestras
              </label>
              <p className="text-base">{requirement.cantidadMuestras}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Fecha de Solicitud
              </label>
              <p className="text-base">{new Date(requirement.createdAt).toLocaleDateString('es-CL')}</p>
            </div>
            {requirement.fechaLimite && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Fecha Límite
                </label>
                <p className="text-base">{new Date(requirement.fechaLimite).toLocaleDateString('es-CL')}</p>
              </div>
            )}
          </div>

          {requirement.observaciones && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Observaciones
              </label>
              <p className="text-base whitespace-pre-wrap">{requirement.observaciones}</p>
            </div>
          )}
        </div>

        {/* Status Change Card */}
        {availableTransitions.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Cambiar Estado</h3>
            {!isChangingStatus ? (
              <button
                onClick={() => setIsChangingStatus(true)}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Cambiar Estado
              </button>
            ) : (
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Nuevo Estado</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as RequirementStatus)}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seleccione un estado</option>
                    {availableTransitions.map((status) => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleChangeStatus}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => {
                    setIsChangingStatus(false);
                    setNewStatus('');
                  }}
                  className="px-6 py-2 border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Historial</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
              <div className="flex-1">
                <p className="font-medium">Requerimiento creado</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(requirement.createdAt).toLocaleString('es-CL')}
                </p>
              </div>
            </div>
            {requirement.updatedAt !== requirement.createdAt && (
              <div className="flex gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-muted"></div>
                <div className="flex-1">
                  <p className="font-medium">Última actualización</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(requirement.updatedAt).toLocaleString('es-CL')}
                  </p>
                </div>
              </div>
            )}
          </div>
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
