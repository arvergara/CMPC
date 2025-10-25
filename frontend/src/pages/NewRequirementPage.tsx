import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { requirementsService } from '../services/requirements.service';
import { Plant } from '../types/requirement';

export function NewRequirementPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);

  const [formData, setFormData] = useState({
    tipoMuestra: '',
    cantidadEsperada: 1,
    descripcion: '',
    plantaId: '',
  });

  useEffect(() => {
    loadPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const plantsData = await requirementsService.getPlants();
      setPlants(plantsData);

      // Auto-select user's plant if available
      if (user?.plantaId) {
        setFormData(prev => ({ ...prev, plantaId: user.plantaId || '' }));
      }
    } catch (error: any) {
      toast.error('Error al cargar plantas');
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipoMuestra.trim()) {
      toast.error('Debe ingresar el tipo de muestra');
      return;
    }

    if (formData.cantidadEsperada < 1) {
      toast.error('La cantidad de muestras debe ser al menos 1');
      return;
    }

    if (!user?.id) {
      toast.error('No se pudo obtener la información del usuario');
      return;
    }

    setIsLoading(true);

    try {
      const requirement = await requirementsService.create({
        investigadorId: user.id,
        tipoMuestra: formData.tipoMuestra.trim(),
        cantidadEsperada: formData.cantidadEsperada,
        descripcion: formData.descripcion.trim() || undefined,
        plantaId: formData.plantaId || undefined,
      });

      toast.success(`Requerimiento ${requirement.codigo} creado exitosamente`);
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear requerimiento';
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">CMPC LIMS</h1>
              <p className="text-sm text-muted-foreground">
                Nuevo Requerimiento
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Crear Nuevo Requerimiento</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tipo de Muestra */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Muestra <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.tipoMuestra}
                onChange={(e) =>
                  setFormData({ ...formData, tipoMuestra: e.target.value })
                }
                placeholder="Ej: Pulpa de celulosa, Cartón kraft, etc."
                className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describa el tipo de muestra que necesita analizar
              </p>
            </div>

            {/* Cantidad de Muestras */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Cantidad de Muestras <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.cantidadEsperada}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cantidadEsperada: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Número de muestras que espera recibir
              </p>
            </div>

            {/* Planta */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Planta (Opcional)
              </label>
              <select
                value={formData.plantaId}
                onChange={(e) =>
                  setFormData({ ...formData, plantaId: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccione una planta</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.nombre} ({plant.codigo})
                  </option>
                ))}
              </select>
              {user?.plantaId && formData.plantaId === user.plantaId && (
                <p className="text-xs text-muted-foreground mt-1">
                  (Planta asignada a su usuario)
                </p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción (Opcional)
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Descripción detallada del requerimiento, objetivos del análisis, especificaciones especiales, etc."
              />
            </div>

            {/* Info Box */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Información:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>El requerimiento será creado a nombre de: <strong>{user?.nombre}</strong></li>
                <li>Se generará un código único automáticamente</li>
                <li>Las muestras se crearán una vez que ingresen al sistema</li>
                <li>Podrá hacer seguimiento del estado en el dashboard</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 px-6 py-3 border border-border rounded-md hover:bg-muted transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creando...' : 'Crear Requerimiento'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
