import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuthStore } from '../stores/authStore';
import { qrService } from '../services/qr.service';
import { Sample, QREvent } from '../types/qr';

export function QRScannerPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isScanning, setIsScanning] = useState(false);
  const [sample, setSample] = useState<Sample | null>(null);
  const [events, setEvents] = useState<QREvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [eventType, setEventType] = useState('RECEIVED');
  const [location, setLocation] = useState('');
  const [observations, setObservations] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [manualQR, setManualQR] = useState('');

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await handleQRScanned(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Ignore scan errors, they happen frequently during scanning
        }
      );

      setIsScanning(true);
    } catch (error: any) {
      toast.error('Error al iniciar la cámara. Verifique los permisos.');
      console.error(error);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const handleQRScanned = async (qrCode: string) => {
    setIsLoading(true);
    try {
      const sampleData = await qrService.getSampleByQR(qrCode);
      setSample(sampleData);

      const timeline = await qrService.getSampleTimeline(sampleData.id);
      setEvents(timeline.events);

      toast.success(`Muestra encontrada: ${qrCode}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Muestra no encontrada';
      toast.error(message);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = async () => {
    if (!manualQR.trim()) {
      toast.error('Ingrese un código QR');
      return;
    }
    await handleQRScanned(manualQR.trim());
  };

  const handleRegisterEvent = async () => {
    if (!sample) {
      toast.error('Debe escanear una muestra primero');
      return;
    }

    if (!eventType) {
      toast.error('Seleccione un tipo de evento');
      return;
    }

    setIsLoading(true);

    try {
      const event = await qrService.createEvent({
        sampleId: sample.id,
        tipoEvento: eventType,
        ubicacion: location || undefined,
        observaciones: observations || undefined,
      });

      setEvents([event, ...events]);
      toast.success('Evento registrado exitosamente');

      // Reset form
      setLocation('');
      setObservations('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al registrar evento';
      toast.error(message);
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

  const handleReset = async () => {
    if (isScanning) {
      await stopScanner();
    }
    setSample(null);
    setEvents([]);
    setManualQR('');
    setLocation('');
    setObservations('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">CMPC LIMS</h1>
              <p className="text-sm text-muted-foreground">Escaneo de QR</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Escanear Código QR</h2>

            {/* Camera Scanner */}
            <div className="mb-6">
              <div
                id="qr-reader"
                className="w-full rounded-lg overflow-hidden bg-black mb-4"
                style={{ minHeight: isScanning ? '300px' : '0px' }}
              ></div>

              <div className="flex gap-3">
                {!isScanning ? (
                  <button
                    onClick={startScanner}
                    disabled={isLoading || !!sample}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Iniciar Cámara
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Detener Cámara
                  </button>
                )}

                {sample && (
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 border border-border rounded-md hover:bg-muted transition-colors"
                  >
                    Nuevo Escaneo
                  </button>
                )}
              </div>
            </div>

            {/* Manual Input */}
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-3">Búsqueda Manual</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={manualQR}
                  onChange={(e) => setManualQR(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                  placeholder="Ingrese código QR"
                  disabled={isLoading || !!sample}
                  className="flex-1 px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  onClick={handleManualSearch}
                  disabled={isLoading || !!sample}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Sample Info */}
            {sample && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-3">Información de la Muestra</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Código QR:</span> {sample.codigoQR}
                  </p>
                  <p>
                    <span className="font-medium">Tipo:</span> {sample.tipoMuestra}
                  </p>
                  <p>
                    <span className="font-medium">Estado:</span>{' '}
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(sample.estado)}`}>
                      {sample.estado}
                    </span>
                  </p>
                  {sample.requirement && (
                    <p>
                      <span className="font-medium">Requerimiento:</span>{' '}
                      {sample.requirement.codigo}
                    </p>
                  )}
                  {sample.requirement?.tipoAnalisis && (
                    <p>
                      <span className="font-medium">Análisis:</span>{' '}
                      {sample.requirement.tipoAnalisis.nombre}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Event Registration Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Registrar Evento</h2>

            {sample ? (
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tipo de Evento <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="RECEIVED">Recibido</option>
                      <option value="IN_TRANSIT">En Tránsito</option>
                      <option value="STORED">Almacenado</option>
                      <option value="IN_ANALYSIS">En Análisis</option>
                      <option value="DISPOSED">Eliminado</option>
                      <option value="OTHER">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ubicación (Opcional)
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ej: Laboratorio A, Estante 3"
                      className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Observaciones (Opcional)
                    </label>
                    <textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      rows={3}
                      placeholder="Notas adicionales..."
                      className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRegisterEvent}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Registrando...' : 'Registrar Evento'}
                </button>

                {/* Events Timeline */}
                {events.length > 0 && (
                  <div className="mt-6 border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">Historial de Eventos</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="p-3 bg-muted rounded-lg text-sm"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">{event.tipoEvento}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString('es-CL')}
                            </span>
                          </div>
                          {event.ubicacion && (
                            <p className="text-muted-foreground">
                              Ubicación: {event.ubicacion}
                            </p>
                          )}
                          {event.observaciones && (
                            <p className="text-muted-foreground">
                              {event.observaciones}
                            </p>
                          )}
                          {event.usuario && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Por: {event.usuario.nombre}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No hay muestra escaneada</p>
                <p className="text-sm">
                  Escanee un código QR o búsquelo manualmente para registrar eventos
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function getStatusColor(estado: string): string {
  const colors: Record<string, string> = {
    ESPERADA: 'bg-purple-100 text-purple-700',
    RECIBIDA: 'bg-cyan-100 text-cyan-700',
    EN_ANALISIS: 'bg-orange-100 text-orange-700',
    ANALISIS_COMPLETO: 'bg-emerald-100 text-emerald-700',
    ALMACENADA: 'bg-blue-100 text-blue-700',
    ELIMINADA: 'bg-red-100 text-red-700',
  };
  return colors[estado] || 'bg-gray-100 text-gray-700';
}
