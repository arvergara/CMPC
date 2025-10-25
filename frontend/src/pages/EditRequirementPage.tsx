import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { requirementsService } from '../services/requirements.service';
import { Plant, Requirement, RequirementStatus } from '../types/requirement';

export function EditRequirementPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [requirement, setRequirement] = useState<Requirement | null>(null);

  const [formData, setFormData] = useState({
    tipoMuestra: '',
    cantidadEsperada: 1,
    descripcion: '',
    plantaId: '',
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      const [requirementData, plantsData] = await Promise.all([
        requirementsService.getById(id),
        requirementsService.getPlants(),
      ]);

      setRequirement(requirementData);
      setPlants(plantsData);

      // Check if requirement can be edited
      if (requirementData.estado !== RequirementStatus.DRAFT) {
        toast.error('Solo se pueden editar requerimientos en estado Borrador');
        navigate(`/requirements/${id}`);
        return;
      }

      // Populate form with existing data
      setFormData({
        tipoMuestra: requirementData.tipoAnalisis?.nombre || '',
        cantidadEsperada: requirementData.cantidadMuestras,
        descripcion: requirementData.observaciones || '',
        plantaId: requirementData.plantaId || '',
      });
    } catch (error: any) {
      toast.error('Error al cargar el requerimiento');
      console.error(error);
      navigate('/requirements');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    if (!formData.tipoMuestra.trim()) {
      toast.error('Debe ingresar el tipo de muestra');
      return;
    }

    if (formData.cantidadEsperada < 1) {
      toast.error('La cantidad de muestras debe ser al menos 1');
      return;
    }

    setIsSaving(true);

    try {
      await requirementsService.update(id, {
        tipoMuestra: formData.tipoMuestra.trim(),
        cantidadEsperada: formData.cantidadEsperada,
        descripcion: formData.descripcion.trim() || undefined,
        plantaId: formData.plantaId || undefined,
      });

      toast.success('Requerimiento actualizado exitosamente');
      navigate(`/requirements/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar requerimiento';
      toast.error(message);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
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
          <p className="text-muted-foreground">Cargando requerimiento...</p>
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
                Editar Requerimiento {requirement?.codigo}
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
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/requirements/${id}`)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver al Detalle
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Muestra *
              </label>
              <input
                type="text"
                value={formData.tipoMuestra}
                onChange={(e) => setFormData({ ...formData, tipoMuestra: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Agua, Suelo, Tejido vegetal, etc."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Cantidad Esperada de Muestras *
              </label>
              <input
                type="number"
                min="1"
                value={formData.cantidadEsperada}
                onChange={(e) => setFormData({ ...formData, cantidadEsperada: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Planta
              </label>
              <select
                value={formData.plantaId}
                onChange={(e) => setFormData({ ...formData, plantaId: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccione una planta</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.nombre} ({plant.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción / Observaciones
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Detalles adicionales sobre el requerimiento..."
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/requirements/${id}`)}
                disabled={isSaving}
                className="px-6 py-3 border border-border rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-muted p-4 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            Los campos marcados con * son obligatorios. Solo los requerimientos en estado
            "Borrador" pueden ser editados.
          </p>
        </div>
      </main>
    </div>
  );
}
