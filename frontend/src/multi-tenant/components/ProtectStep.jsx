import { Navigate } from "react-router-dom";
import { useStore } from "../pages/StoreContext";

/**
 * Redirige al usuario al paso correcto si intenta saltar pasos.
 * requiredStep: número mínimo de completedStep necesario para acceder.
 */
const STEP_PATHS = {
  0: "/plan",
  1: "/crear-tienda/basico",
  2: "/crear-tienda/legal",
  3: "/crear-tienda/pagos",
  4: "/crear-tienda",
  5: "/layout",
  6: "/customer",
  7: "/component",
  8: "/widgets",
};

export default function ProtectedStep({ requiredStep, children }) {
  const { state } = useStore();

  if (state.completedStep < requiredStep) {
    const redirectTo = STEP_PATHS[state.completedStep] ?? "/plan";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
