import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import { adminService } from '../services/admin.service';
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  UserRole,
  Plant,
  CreatePlantDto,
  UpdatePlantDto,
  AnalysisType,
  CreateAnalysisTypeDto,
  UpdateAnalysisTypeDto,
} from '../types/admin';

type Tab = 'users' | 'plants' | 'analysisTypes';

export function AdminPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('users');

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<CreateUserDto>({
    email: '',
    password: '',
    nombre: '',
    rol: UserRole.LABORATORISTA,
    plantaId: '',
  });

  // Plants state
  const [plants, setPlants] = useState<Plant[]>([]);
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [plantForm, setPlantForm] = useState<CreatePlantDto>({
    nombre: '',
    codigo: '',
    ubicacion: '',
  });

  // Analysis Types state
  const [analysisTypes, setAnalysisTypes] = useState<AnalysisType[]>([]);
  const [showAnalysisTypeModal, setShowAnalysisTypeModal] = useState(false);
  const [editingAnalysisType, setEditingAnalysisType] = useState<AnalysisType | null>(null);
  const [analysisTypeForm, setAnalysisTypeForm] = useState<CreateAnalysisTypeDto>({
    nombre: '',
    descripcion: '',
    metodo: '',
    tiempoEstimadoHoras: 0,
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'users') {
        const data = await adminService.getAllUsers();
        setUsers(data);
        // Load plants for dropdown
        const plantsData = await adminService.getAllPlants();
        setPlants(plantsData);
      } else if (activeTab === 'plants') {
        const data = await adminService.getAllPlants();
        setPlants(data);
      } else if (activeTab === 'analysisTypes') {
        const data = await adminService.getAllAnalysisTypes();
        setAnalysisTypes(data);
      }
    } catch (error: any) {
      toast.error('Error al cargar datos');
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

  // User handlers
  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await adminService.updateUser(editingUser.id, userForm as UpdateUserDto);
        toast.success('Usuario actualizado');
      } else {
        await adminService.createUser(userForm);
        toast.success('Usuario creado');
      }
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('¿Está seguro de desactivar este usuario?')) return;
    try {
      await adminService.deleteUser(id);
      toast.success('Usuario desactivado');
      loadData();
    } catch (error: any) {
      toast.error('Error al desactivar usuario');
    }
  };

  const resetUserForm = () => {
    setUserForm({
      email: '',
      password: '',
      nombre: '',
      rol: UserRole.LABORATORISTA,
      plantaId: '',
    });
  };

  // Plant handlers
  const handleSavePlant = async () => {
    try {
      if (editingPlant) {
        await adminService.updatePlant(editingPlant.id, plantForm as UpdatePlantDto);
        toast.success('Planta actualizada');
      } else {
        await adminService.createPlant(plantForm);
        toast.success('Planta creada');
      }
      setShowPlantModal(false);
      setEditingPlant(null);
      resetPlantForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar planta');
    }
  };

  const handleDeletePlant = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta planta?')) return;
    try {
      await adminService.deletePlant(id);
      toast.success('Planta eliminada');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar planta');
    }
  };

  const resetPlantForm = () => {
    setPlantForm({
      nombre: '',
      codigo: '',
      ubicacion: '',
    });
  };

  // Analysis Type handlers
  const handleSaveAnalysisType = async () => {
    try {
      if (editingAnalysisType) {
        await adminService.updateAnalysisType(editingAnalysisType.id, analysisTypeForm as UpdateAnalysisTypeDto);
        toast.success('Tipo de análisis actualizado');
      } else {
        await adminService.createAnalysisType(analysisTypeForm);
        toast.success('Tipo de análisis creado');
      }
      setShowAnalysisTypeModal(false);
      setEditingAnalysisType(null);
      resetAnalysisTypeForm();
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar tipo de análisis');
    }
  };

  const handleDeleteAnalysisType = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este tipo de análisis?')) return;
    try {
      await adminService.deleteAnalysisType(id);
      toast.success('Tipo de análisis eliminado');
      loadData();
    } catch (error: any) {
      toast.error('Error al eliminar tipo de análisis');
    }
  };

  const resetAnalysisTypeForm = () => {
    setAnalysisTypeForm({
      nombre: '',
      descripcion: '',
      metodo: '',
      tiempoEstimadoHoras: 0,
      isActive: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">CMPC LIMS</h1>
              <p className="text-sm text-muted-foreground">Panel de Administración</p>
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
        {/* Tabs */}
        <div className="bg-card border border-border rounded-lg mb-6">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'users'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('plants')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'plants'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Plantas
            </button>
            <button
              onClick={() => setActiveTab('analysisTypes')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'analysisTypes'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tipos de Análisis
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Usuarios ({users.length})</h2>
                  <button
                    onClick={() => {
                      resetUserForm();
                      setEditingUser(null);
                      setShowUserModal(true);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Nuevo Usuario
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Nombre
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Rol
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Planta
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3">{u.nombre}</td>
                            <td className="px-4 py-3">{u.email}</td>
                            <td className="px-4 py-3">{u.rol}</td>
                            <td className="px-4 py-3">{u.planta?.nombre || 'N/A'}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {u.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setEditingUser(u);
                                  setUserForm({
                                    email: u.email,
                                    password: '',
                                    nombre: u.nombre,
                                    rol: u.rol,
                                    plantaId: u.plantaId || '',
                                  });
                                  setShowUserModal(true);
                                }}
                                className="text-primary hover:underline text-sm mr-3"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-red-600 hover:underline text-sm"
                              >
                                Desactivar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Plants Tab */}
            {activeTab === 'plants' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Plantas ({plants.length})</h2>
                  <button
                    onClick={() => {
                      resetPlantForm();
                      setEditingPlant(null);
                      setShowPlantModal(true);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Nueva Planta
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Nombre
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Código
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Ubicación
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {plants.map((p) => (
                          <tr key={p.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3">{p.nombre}</td>
                            <td className="px-4 py-3">{p.codigo}</td>
                            <td className="px-4 py-3">{p.ubicacion}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {p.isActive ? 'Activa' : 'Inactiva'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setEditingPlant(p);
                                  setPlantForm({
                                    nombre: p.nombre,
                                    codigo: p.codigo,
                                    ubicacion: p.ubicacion,
                                  });
                                  setShowPlantModal(true);
                                }}
                                className="text-primary hover:underline text-sm mr-3"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeletePlant(p.id)}
                                className="text-red-600 hover:underline text-sm"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Analysis Types Tab */}
            {activeTab === 'analysisTypes' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    Tipos de Análisis ({analysisTypes.length})
                  </h2>
                  <button
                    onClick={() => {
                      resetAnalysisTypeForm();
                      setEditingAnalysisType(null);
                      setShowAnalysisTypeModal(true);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Nuevo Tipo de Análisis
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Nombre
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Método
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Tiempo Estimado (hrs)
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {analysisTypes.map((at) => (
                          <tr key={at.id} className="hover:bg-muted/50">
                            <td className="px-4 py-3">{at.nombre}</td>
                            <td className="px-4 py-3">{at.metodo || 'N/A'}</td>
                            <td className="px-4 py-3">{at.tiempoEstimadoHoras}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  at.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {at.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  setEditingAnalysisType(at);
                                  setAnalysisTypeForm({
                                    nombre: at.nombre,
                                    descripcion: at.descripcion,
                                    metodo: at.metodo,
                                    tiempoEstimadoHoras: at.tiempoEstimadoHoras,
                                    isActive: at.isActive,
                                  });
                                  setShowAnalysisTypeModal(true);
                                }}
                                className="text-primary hover:underline text-sm mr-3"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteAnalysisType(at.id)}
                                className="text-red-600 hover:underline text-sm"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={userForm.nombre}
                  onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2">Rol</label>
                <select
                  value={userForm.rol}
                  onChange={(e) =>
                    setUserForm({ ...userForm, rol: e.target.value as UserRole })
                  }
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={UserRole.ADMIN}>Admin</option>
                  <option value={UserRole.JEFE_LAB}>Jefe de Laboratorio</option>
                  <option value={UserRole.LABORATORISTA}>Laboratorista</option>
                  <option value={UserRole.BODEGA}>Bodega</option>
                  <option value={UserRole.INVESTIGADOR}>Investigador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Planta (opcional)</label>
                <select
                  value={userForm.plantaId}
                  onChange={(e) => setUserForm({ ...userForm, plantaId: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sin planta</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  resetUserForm();
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plant Modal */}
      {showPlantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingPlant ? 'Editar Planta' : 'Nueva Planta'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={plantForm.nombre}
                  onChange={(e) => setPlantForm({ ...plantForm, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Código</label>
                <input
                  type="text"
                  value={plantForm.codigo}
                  onChange={(e) => setPlantForm({ ...plantForm, codigo: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ubicación</label>
                <input
                  type="text"
                  value={plantForm.ubicacion}
                  onChange={(e) => setPlantForm({ ...plantForm, ubicacion: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowPlantModal(false);
                  setEditingPlant(null);
                  resetPlantForm();
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePlant}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Type Modal */}
      {showAnalysisTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingAnalysisType ? 'Editar Tipo de Análisis' : 'Nuevo Tipo de Análisis'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={analysisTypeForm.nombre}
                  onChange={(e) =>
                    setAnalysisTypeForm({ ...analysisTypeForm, nombre: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={analysisTypeForm.descripcion}
                  onChange={(e) =>
                    setAnalysisTypeForm({ ...analysisTypeForm, descripcion: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Método</label>
                <input
                  type="text"
                  value={analysisTypeForm.metodo}
                  onChange={(e) =>
                    setAnalysisTypeForm({ ...analysisTypeForm, metodo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tiempo Estimado (horas)
                </label>
                <input
                  type="number"
                  value={analysisTypeForm.tiempoEstimadoHoras}
                  onChange={(e) =>
                    setAnalysisTypeForm({
                      ...analysisTypeForm,
                      tiempoEstimadoHoras: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={analysisTypeForm.isActive}
                  onChange={(e) =>
                    setAnalysisTypeForm({ ...analysisTypeForm, isActive: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <label className="text-sm font-medium">Activo</label>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowAnalysisTypeModal(false);
                  setEditingAnalysisType(null);
                  resetAnalysisTypeForm();
                }}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAnalysisType}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
