// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation, Outlet } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ requiredRoles = [] }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  // Si aún se está cargando, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-midnight"></div>
      </div>
    );
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se especifican roles requeridos, verificar que el usuario tenga alguno de esos roles
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    // Si el usuario no tiene el rol requerido, redirigir a una página de acceso denegado
    return <Navigate to="/unauthorized" replace />;
  }

  // Si el usuario está autenticado y tiene los permisos necesarios, mostrar el contenido protegido
  return <Outlet />;
};

export default ProtectedRoute;