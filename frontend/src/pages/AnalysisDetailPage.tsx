import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { analysisService } from '../services/analysis.service';
import { Analysis, AnalysisStatus } from '../types/analysis';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states
  const [responsableId, setResponsableId] = useState('');
  const [resultados, setResultados] = useState('');
  const [resultadosUrl, setResultadosUrl] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  useEffect(() => {
    if (id) {
      loadAnalysis();
    }
  }, [id]);

  const loadAnalysis = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await analysisService.getById(id);
      setAnalysis(data);
    } catch (error: any) {
      toast.error('Error al cargar el análisis');
      console.error(error);
      navigate('/analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStart = async () => {
    if (!id) return;

    try {
      await analysisService.start(id, responsableId || undefined);
      toast.success('Análisis iniciado');
      setShowStartModal(false);
      setResponsableId('');
      loadAnalysis();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al iniciar análisis');
    }
  };

  const handleComplete = async () => {
    if (!id) return;

    try {
      const data: any = {};
      if (resultados) data.resultados = JSON.parse(resultados);
      if (resultadosUrl) data.resultadosUrl = resultadosUrl;
      if (observaciones) data.observaciones = observaciones;

      await analysisService.complete(id, data);
      toast.success('Análisis completado');
      setShowCompleteModal(false);
      setResultados('');
      setResultadosUrl('');
      setObservaciones('');
      loadAnalysis();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al completar análisis');
    }
  };

  const handleCancel = async () => {
    if (!id || !motivoCancelacion.trim()) {
      toast.error('Ingrese el motivo de cancelación');
      return;
    }

    try {
      await analysisService.cancel(id, motivoCancelacion);
      toast.success('Análisis cancelado');
      setShowCancelModal(false);
      setMotivoCancelacion('');
      loadAnalysis();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cancelar análisis');
    }
  };

  const handleUploadResults = async () => {
    if (!id) return;

    try {
      const data: any = {};
      if (resultados) data.resultados = JSON.parse(resultados);
      if (resultadosUrl) data.resultadosUrl = resultadosUrl;
      if (observaciones) data.observaciones = observaciones;

      await analysisService.uploadResults(id, data);
      toast.success('Resultados subidos exitosamente');
      setShowUploadModal(false);
      setResultados('');
      setResultadosUrl('');
      setObservaciones('');
      loadAnalysis();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al subir resultados');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  const handleExportAnalysis = () => {
    if (!id) return;

    try {
      const url = `${API_URL}/exports/analysis/${id}/pdf`;
      window.open(url, '_blank');
      toast.success('Descargando reporte PDF...');
    } catch (error) {
      toast.error('Error al exportar análisis');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando análisis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">CMPC LIMS</h1>
              <p className="text-sm text-muted-foreground">Detalle de Análisis</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportAnalysis}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span>📄</span>
                Exportar PDF
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/analysis')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver a Análisis
          </button>
        </div>

        {/* Header Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Análisis #{analysis.id.slice(0, 8)}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(analysis.estado)}`}>
                  {getStatusLabel(analysis.estado)}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {analysis.estado === AnalysisStatus.PENDIENTE && (
                <button
                  onClick={() => setShowStartModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Iniciar Análisis
                </button>
              )}
              {analysis.estado === AnalysisStatus.EN_PROCESO && (
                <>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Subir Resultados
                  </button>
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Completar
                  </button>
                </>
              )}
              {analysis.estado !== AnalysisStatus.COMPLETADO &&
                analysis.estado !== AnalysisStatus.CANCELADO && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Cancelar
                  </button>
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
              <p className="text-base">{analysis.tipoAnalisis?.nombre || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Muestra
              </label>
              {analysis.sample ? (
                <button
                  onClick={() => navigate(`/samples/${analysis.sample?.id}`)}
                  className="text-primary hover:underline"
                >
                  {analysis.sample.codigoQR}
                </button>
              ) : (
                <p className="text-base">N/A</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Responsable
              </label>
              <p className="text-base">{analysis.responsable?.nombre || 'Sin asignar'}</p>
            </div>
            {analysis.fechaInicio && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Fecha de Inicio
                </label>
                <p className="text-base">
                  {new Date(analysis.fechaInicio).toLocaleDateString('es-CL')}
                </p>
              </div>
            )}
            {analysis.fechaFinalizacion && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Fecha de Finalización
                </label>
                <p className="text-base">
                  {new Date(analysis.fechaFinalizacion).toLocaleDateString('es-CL')}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Fecha de Creación
              </label>
              <p className="text-base">
                {new Date(analysis.createdAt).toLocaleDateString('es-CL')}
              </p>
            </div>
          </div>
        </div>

        {/* Results Card */}
        {(analysis.resultados || analysis.resultadosUrl) && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Resultados</h3>
            {analysis.resultados && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Datos de Resultados
                </label>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                  {JSON.stringify(analysis.resultados, null, 2)}
                </pre>
              </div>
            )}
            {analysis.resultadosUrl && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  URL de Resultados
                </label>
                <a
                  href={analysis.resultadosUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {analysis.resultadosUrl}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Observations Card */}
        {analysis.observaciones && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Observaciones</h3>
            <p className="text-base whitespace-pre-wrap">{analysis.observaciones}</p>
          </div>
        )}

        {/* Cancellation Reason Card */}
        {analysis.motivoCancelacion && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6 border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold mb-4 text-red-700">
              Motivo de Cancelación
            </h3>
            <p className="text-base whitespace-pre-wrap text-red-600">
              {analysis.motivoCancelacion}
            </p>
          </div>
        )}
      </main>

      {/* Start Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Iniciar Análisis</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                ID del Responsable (opcional)
              </label>
              <input
                type="text"
                value={responsableId}
                onChange={(e) => setResponsableId(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="ID del usuario responsable"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Si no se especifica, se asignará al usuario actual
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowStartModal(false);
                  setResponsableId('');
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleStart}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Iniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Completar Análisis</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Resultados (JSON)
                </label>
                <textarea
                  value={resultados}
                  onChange={(e) => setResultados(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  rows={6}
                  placeholder='{"propiedad": "valor"}'
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL de Resultados</label>
                <input
                  type="text"
                  value={resultadosUrl}
                  onChange={(e) => setResultadosUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setResultados('');
                  setResultadosUrl('');
                  setObservaciones('');
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Completar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Results Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Subir Resultados</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Resultados (JSON)
                </label>
                <textarea
                  value={resultados}
                  onChange={(e) => setResultados(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  rows={6}
                  placeholder='{"propiedad": "valor"}'
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL de Resultados</label>
                <input
                  type="text"
                  value={resultadosUrl}
                  onChange={(e) => setResultadosUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Observaciones</label>
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setResultados('');
                  setResultadosUrl('');
                  setObservaciones('');
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadResults}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancelar Análisis</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Motivo de Cancelación *
              </label>
              <textarea
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Describa el motivo de la cancelación..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setMotivoCancelacion('');
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Volver
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
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
