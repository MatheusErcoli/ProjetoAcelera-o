import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { apiUrl } from "./config/api";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPrestadores from "./pages/admin/AdminPrestadores";
import AdminContratantes from "./pages/admin/AdminContratantes";
import ProvidersPage from "./pages/home/ProvidersPage";
import ClientsPage from "./pages/home/ClientsPage";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";


const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Exemplo de chamada à API do backend
    fetch(`${apiUrl}/orders`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Dados recebidos do backend:", data);
      })
      .catch((error) => {
        console.error("Erro ao conectar com o backend:", error);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />

              <Route path="/login" 
                element={<LoginPage />} 
              />

              <Route 
                path="/register" 
                element={<RegisterPage/>} 
              />

              {/* Rotas Admin - Apenas ADMIN */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/prestadores"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout>
                      <AdminPrestadores />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/contratantes"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout>
                      <AdminContratantes />
                    </AdminLayout>
                  </ProtectedRoute>
                } 
              />

              {/* Rota Prestador - Apenas PRESTADOR */}
              <Route
                path="/home/providers"
                element={
                  <ProtectedRoute allowedRoles={['PRESTADOR']}>
                    <ProvidersPage />
                  </ProtectedRoute>
                } 
              />

              {/* Rota Cliente - Apenas CONTRATANTE */}
              <Route
                path="/home/clients"
                element={
                  <ProtectedRoute allowedRoles={['CONTRATANTE']}>
                    <ClientsPage />
                  </ProtectedRoute>
                } 
              />

              <Route
                path="*"
                element={
                  <NotFound />
                } 
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
