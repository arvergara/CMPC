import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { dashboardService } from '../services/dashboard.service';
import { DashboardOverview, RecentActivity } from '../types/dashboard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [overviewData, activityData] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getRecentActivity(),
      ]);
      setOverview(overviewData);
      setRecentActivity(activityData);
    } catch (error: any) {
      toast.error('Error al cargar datos del dashboard');
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

  const handleExportDashboard = () => {
    try {
      window.open(`${API_URL}/exports/dashboard/pdf`, '_blank');
      toast.success('Descargando reporte PDF...');
    } catch (error) {
      toast.error('Error al exportar dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
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
                Dashboard de Laboratorio
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleExportDashboard}
                className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span>📄</span>
                Exportar PDF
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Requerimientos"
            total={overview?.totals.requirements || 0}
            pending={overview?.pending.requirements || 0}
            icon="📋"
          />
          <StatCard
            title="Muestras"
            total={overview?.totals.samples || 0}
            pending={overview?.pending.samples || 0}
            icon="🧪"
          />
          <StatCard
            title="Análisis"
            total={overview?.totals.analysis || 0}
            pending={overview?.pending.analysis || 0}
            icon="📊"
          />
          <StatCard
            title="Almacenamiento"
            total={overview?.totals.storage || 0}
            icon="📦"
          />
          <StatCard
            title="Usuarios"
            total={overview?.totals.users || 0}
            icon="👥"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ActivityCard
            title="Requerimientos Recientes"
            items={recentActivity?.requirements || []}
            onViewAll={() => navigate('/requirements')}
            renderItem={(item) => (
              <div
                className="flex justify-between items-start cursor-pointer hover:bg-muted/50 -mx-2 px-2 py-1 rounded transition-colors"
                onClick={() => navigate(`/requirements/${item.id}`)}
              >
                <div>
                  <p className="font-medium">{item.codigo}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    item.estado
                  )}`}
                >
                  {item.estado}
                </span>
              </div>
            )}
          />
          <ActivityCard
            title="Muestras Recientes"
            items={recentActivity?.samples || []}
            renderItem={(item) => (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.codigoQR}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    item.estado
                  )}`}
                >
                  {item.estado}
                </span>
              </div>
            )}
          />
          <ActivityCard
            title="Análisis Recientes"
            items={recentActivity?.analysis || []}
            renderItem={(item) => (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Análisis #{item.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString('es-CL')}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                    item.estado
                  )}`}
                >
                  {item.estado}
                </span>
              </div>
            )}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionButton
            title="Ver Requerimientos"
            description="Gestión de requerimientos"
            icon="📋"
            onClick={() => navigate('/requirements')}
          />
          <QuickActionButton
            title="Nuevo Requerimiento"
            description="Crear solicitud de análisis"
            icon="➕"
            onClick={() => navigate('/requirements/new')}
          />
          <QuickActionButton
            title="Escanear QR"
            description="Registrar evento de muestra"
            icon="📱"
            onClick={() => navigate('/qr-scanner')}
          />
          <QuickActionButton
            title="Ver Reportes"
            description="Análisis y estadísticas"
            icon="📈"
            onClick={() => navigate('/reports')}
          />
          <QuickActionButton
            title="Ver Almacenamiento"
            description="Gestión de bodega"
            icon="📦"
            onClick={() => navigate('/storage')}
          />
          <QuickActionButton
            title="Administración"
            description="Usuarios y configuración"
            icon="⚙️"
            onClick={() => navigate('/admin')}
          />
        </div>
      </main>
    </div>
  );
}

// Helper Components
interface StatCardProps {
  title: string;
  total: number;
  pending?: number;
  icon: string;
}

function StatCard({ title, total, pending, icon }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-3xl font-bold text-primary">{total}</span>
      </div>
      <h3 className="font-medium text-sm mb-1">{title}</h3>
      {pending !== undefined && (
        <p className="text-xs text-muted-foreground">
          {pending} pendiente{pending !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

interface ActivityCardProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onViewAll?: () => void;
}

function ActivityCard<T>({ title, items, renderItem, onViewAll }: ActivityCardProps<T>) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-primary hover:underline"
          >
            Ver todos →
          </button>
        )}
      </div>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="pb-3 border-b border-border last:border-0 last:pb-0">
              {renderItem(item)}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay actividad reciente
          </p>
        )}
      </div>
    </div>
  );
}

interface QuickActionButtonProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

function QuickActionButton({
  title,
  description,
  icon,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-6 text-left hover:bg-muted transition-colors"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </button>
  );
}

function getStatusColor(estado: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDIENTE: 'bg-yellow-100 text-yellow-700',
    EN_PROCESO: 'bg-blue-100 text-blue-700',
    COMPLETADO: 'bg-green-100 text-green-700',
    ESPERADA: 'bg-purple-100 text-purple-700',
    RECIBIDA: 'bg-cyan-100 text-cyan-700',
    EN_ANALISIS: 'bg-orange-100 text-orange-700',
    ANALISIS_COMPLETO: 'bg-emerald-100 text-emerald-700',
  };
  return colors[estado] || 'bg-gray-100 text-gray-700';
}
