import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./Useauth";

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 🔹 1. Mientras se carga el estado inicial
  if (loading) {
    return <div className="loading-spinner">Cargando sesión...</div>;
  }

  // 🔹 2. No autenticado → login
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }} // 👈 opcional: volver a donde estaba
      />
    );
  }

  // 🔹 3. Usuario sin permisos
  if (allowedRoles && !allowedRoles.includes(user.rolId)) {
    return <Navigate to="/" replace />;
  }

  // 🔹 4. Todo correcto
  return <Outlet />;
};
