import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'PRESTADOR' | 'CONTRATANTE')[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redireciona para a página apropriada baseada no role do usuário
    switch (user.role) {
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'PRESTADOR':
        return <Navigate to="/home/providers" replace />;
      case 'CONTRATANTE':
        return <Navigate to="/home/clients" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
