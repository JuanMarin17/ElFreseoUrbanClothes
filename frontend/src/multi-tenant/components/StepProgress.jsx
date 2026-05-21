/**
 * StepProgress.jsx
 * Barra de progreso visual para el flujo de creación de tienda.
 * Los pasos completados son clickeables y navegan directamente.
 */

import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../pages/StoreContext";
import "./styles/StepProgress.css";

const STEPS = [
  { label: "Plan",        path: "/plan" },
  { label: "Básico",      path: "/crear-tienda/basico" },
  { label: "Legal",       path: "/crear-tienda/legal" },
  { label: "Pagos",       path: "/crear-tienda/pagos" },
  { label: "Términos",    path: "/crear-tienda" },
  { label: "Layout",      path: "/layout" },
  { label: "Estilos",     path: "/customer" },
  { label: "Componentes", path: "/component" },
  { label: "Widgets",     path: "/widgets" },
];

export default function StepProgress() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useStore();

  const currentIndex = STEPS.findIndex((s) => s.path === pathname);

  const handleClick = (step, i) => {
    // Solo navega si el paso ya fue visitado (completado o activo)
    if (i <= currentIndex) {
      navigate(step.path);
    }
  };

  return (
    <nav className="step-progress" aria-label="Progreso de creación de tienda">
      {STEPS.map((step, i) => {
        const isDone      = i < currentIndex;
        const isActive    = i === currentIndex;
        const isClickable = i <= currentIndex;

        return (
          <div
            key={step.path}
            className={`sp-item ${isDone ? "done" : ""} ${isActive ? "active" : ""} ${isClickable ? "clickable" : ""}`}
            onClick={() => handleClick(step, i)}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            aria-label={isClickable ? `Ir a ${step.label}` : undefined}
            onKeyDown={(e) => e.key === "Enter" && isClickable && handleClick(step, i)}
          >
            {/* Línea conectora */}
            {i > 0 && <div className={`sp-line ${isDone ? "done" : ""}`} />}

            {/* Círculo */}
            <div className="sp-circle">
              {isDone ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>

            {/* Etiqueta */}
            <span className="sp-label">{step.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
