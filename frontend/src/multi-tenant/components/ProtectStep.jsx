import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "../pages/useStore";

/**
 * Redirige al usuario al paso correcto si intenta saltar pasos.
 * requiredStep: numero minimo de completedStep necesario para acceder.
 */
const STEP_PATHS = {
  0: "/plan",
  1: "/crear-tienda/basico",
  2: "/crear-tienda/legal",
  3: "/crear-tienda/pagos",
  4: "/layout",
  5: "/customer",
  6: "/component",
  7: "/widgets",
  8: "/cms",
  9: "/crear-tienda",
  10: "/resultado",
};

export default function ProtectedStep({ requiredStep, children }) {
  const { state } = useStore();
  const location = useLocation();

  // Allow bypass when navigation includes the special flag (e.g. after create)
  if (location.state?.bypassProtected) return children;

  if (state.completedStep < requiredStep) {
    const redirectTo = STEP_PATHS[state.completedStep] ?? "/plan";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
