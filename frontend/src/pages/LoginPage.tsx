import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      login(response.token, response.user);
      toast.success(`Bienvenido, ${response.user.nombre}`);
      navigate('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { email: 'admin@cmpc.cl', role: 'Administrador' },
    { email: 'maria.gonzalez@cmpc.cl', role: 'Investigadora' },
    { email: 'ana.martinez@cmpc.cl', role: 'Técnico Lab' },
  ];

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">CMPC LIMS</h1>
            <p className="text-muted-foreground">
              Sistema de Gestión de Muestras de Laboratorio
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6">Iniciar Sesión</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-2"
                >
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="usuario@cmpc.cl"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Demo users section */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Usuarios de demostración:
              </p>
              <div className="space-y-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => fillDemo(user.email)}
                    className="w-full text-left px-3 py-2 rounded-md bg-muted/50 hover:bg-muted transition-colors text-sm"
                    disabled={isLoading}
                  >
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.role} • Password: password123
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-8 text-white">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-6">
            Gestión Eficiente de Laboratorio
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/90">
            Sistema integral para el seguimiento y control de muestras,
            análisis y resultados de laboratorio.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h3 className="font-semibold mb-1">Trazabilidad Completa</h3>
                <p className="text-sm text-primary-foreground/80">
                  Seguimiento de muestras desde la recepción hasta la entrega
                  de resultados
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h3 className="font-semibold mb-1">Códigos QR</h3>
                <p className="text-sm text-primary-foreground/80">
                  Identificación y registro rápido mediante tecnología QR
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h3 className="font-semibold mb-1">Dashboard Analítico</h3>
                <p className="text-sm text-primary-foreground/80">
                  Visualización en tiempo real del estado de análisis y KPIs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
