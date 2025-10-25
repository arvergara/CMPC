import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewRequirementPage } from './pages/NewRequirementPage';
import { RequirementsPage } from './pages/RequirementsPage';
import { RequirementDetailPage } from './pages/RequirementDetailPage';
import { EditRequirementPage } from './pages/EditRequirementPage';
import { SamplesPage } from './pages/SamplesPage';
import { SampleDetailPage } from './pages/SampleDetailPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';
import { StoragePage } from './pages/StoragePage';
import { AdminPage } from './pages/AdminPage';
import { QRScannerPage } from './pages/QRScannerPage';
import { ReportsPage } from './pages/ReportsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

function App() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Toaster position="top-right" richColors />

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Requirements routes */}
          <Route
            path="/requirements"
            element={
              <ProtectedRoute>
                <RequirementsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requirements/new"
            element={
              <ProtectedRoute>
                <NewRequirementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requirements/:id"
            element={
              <ProtectedRoute>
                <RequirementDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requirements/:id/edit"
            element={
              <ProtectedRoute>
                <EditRequirementPage />
              </ProtectedRoute>
            }
          />

          {/* Samples routes */}
          <Route
            path="/samples"
            element={
              <ProtectedRoute>
                <SamplesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/samples/:id"
            element={
              <ProtectedRoute>
                <SampleDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Analysis routes */}
          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <AnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analysis/:id"
            element={
              <ProtectedRoute>
                <AnalysisDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Storage routes */}
          <Route
            path="/storage"
            element={
              <ProtectedRoute>
                <StoragePage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Other feature routes */}
          <Route
            path="/qr-scanner"
            element={
              <ProtectedRoute>
                <QRScannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
