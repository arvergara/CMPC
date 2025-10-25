import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { samplesService } from '../services/samples.service';
import { Sample, SampleStatus } from '../types/sample';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function SampleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sample, setSample] = useState<Sample | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<SampleStatus | ''>('');

  useEffect(() => {
    if (id) {
      loadSample();
    }
  }, [id]);

  const loadSample = async () => {
    if (!id) return;

    try {
      const data = await samplesService.getById(id);
      setSample(data);
    } catch (error: any) {
      toast.error('Error al cargar la muestra');
      console.error(error);
      navigate('/samples');
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
      await samplesService.changeStatus(id, newStatus as SampleStatus);
      toast.success('Estado actualizado');
      setIsChangingStatus(false);
      setNewStatus('');
      loadSample();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
    }
  };

  const handleReceiveSample = async () => {
    if (!id) return;

    try {
      await samplesService.receiveSample(id);
      toast.success('Muestra recibida exitosamente');
      loadSample();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al recibir muestra');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const handleDownloadQR = () => {
    if (!id) return;

    try {
      const url = `${API_URL}/samples/${id}/qr-image?format=png`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${sample?.codigoQR}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Descargando código QR...');
    } catch (error) {
      toast.error('Error al descargar código QR');
    }
  };

  const getAvailableStatusTransitions = (currentStatus: SampleStatus): SampleStatus[] => {
    switch (currentStatus) {
      case SampleStatus.ESPERADA:
        return [SampleStatus.RECIBIDA];
      case SampleStatus.RECIBIDA:
        return [SampleStatus.EN_ANALISIS];
      case SampleStatus.EN_ANALISIS:
        return [SampleStatus.ANALISIS_COMPLETO];
      case SampleStatus.ANALISIS_COMPLETO:
        return [SampleStatus.ALMACENADA];
      case SampleStatus.ALMACENADA:
        return [SampleStatus.ELIMINADA];
      case SampleStatus.ELIMINADA:
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
          <p className="text-muted-foreground">Cargando muestra...</p>
        </div>
      </div>
    );
  }

  if (!sample) {
    return null;
  }

  const availableTransitions = getAvailableStatusTransitions(sample.estado);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">CMPC LIMS</h1>
              <p className="text-sm text-muted-foreground">
                Detalle de Muestra
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
            onClick={() => navigate('/samples')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver a Muestras
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{sample.codigoQR}</h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(sample.estado)}`}>
                  {getStatusLabel(sample.estado)}
                </span>
                {sample.esContramuestra && (
                  <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                    Contramuestra
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {sample.estado === SampleStatus.ESPERADA && (
                <button
                  onClick={handleReceiveSample}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Recibir Muestra
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Código QR</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Utiliza este código QR para registrar eventos de la muestra
              </p>
              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Descargar QR
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={`${API_URL}/samples/${id}/qr-image?format=png`}
                alt={`QR Code for ${sample.codigoQR}`}
                className="w-64 h-64 border-2 border-border rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  toast.error('Error al cargar código QR');
                }}
              />
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Información General</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Tipo
              </label>
              <p className="text-base">{sample.tipo}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Formato
              </label>
              <p className="text-base">{sample.formato || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Cantidad
              </label>
              <p className="text-base">{sample.cantidad || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Requerimiento
              </label>
              {sample.requirement ? (
                <button
                  onClick={() => navigate(`/requirements/${sample.requirement?.id}`)}
                  className="text-primary hover:underline"
                >
                  {sample.requirement.codigo}
                </button>
              ) : (
                <p className="text-base">N/A</p>
              )}
            </div>
            {sample.fechaRecepcion && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Fecha de Recepción
                </label>
                <p className="text-base">{new Date(sample.fechaRecepcion).toLocaleDateString('es-CL')}</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Fecha de Creación
              </label>
              <p className="text-base">{new Date(sample.createdAt).toLocaleDateString('es-CL')}</p>
            </div>
          </div>

          {sample.observaciones && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Observaciones
              </label>
              <p className="text-base whitespace-pre-wrap">{sample.observaciones}</p>
            </div>
          )}

          {sample.parentSample && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Muestra Padre
              </label>
              <button
                onClick={() => navigate(`/samples/${sample.parentSample?.id}`)}
                className="text-primary hover:underline"
              >
                {sample.parentSample.codigoQR}
              </button>
            </div>
          )}
        </div>

        {/* Derived Samples */}
        {sample.derivedSamples && sample.derivedSamples.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Muestras Derivadas</h3>
            <div className="space-y-2">
              {sample.derivedSamples.map((derived) => (
                <div key={derived.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">{derived.codigoQR}</p>
                    <p className="text-sm text-muted-foreground">{derived.tipo}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/samples/${derived.id}`)}
                    className="text-primary hover:underline text-sm"
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analysis */}
        {sample.analysis && sample.analysis.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Análisis Asociados</h3>
            <div className="space-y-2">
              {sample.analysis.map((analysis) => (
                <div key={analysis.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">{analysis.tipoAnalisis.nombre}</p>
                    <p className="text-sm text-muted-foreground">Estado: {analysis.estado}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/analysis/${analysis.id}`)}
                    className="text-primary hover:underline text-sm"
                  >
                    Ver
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                    onChange={(e) => setNewStatus(e.target.value as SampleStatus)}
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
