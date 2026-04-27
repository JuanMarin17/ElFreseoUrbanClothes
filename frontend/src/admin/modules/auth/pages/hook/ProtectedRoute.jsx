import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './Useauth';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  // Mientras se verifica el estado de la sesión
  if (loading) return <div className="loading-spinner">Cargando sesión...</div>;

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol del usuario no está autorizado para esta sección
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Si todo es correcto, renderiza el contenido de la ruta
  return <Outlet />;
};