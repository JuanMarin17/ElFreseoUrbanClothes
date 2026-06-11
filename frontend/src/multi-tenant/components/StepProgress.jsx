/**
 * StepProgress.jsx " ACTUALIZADO
 * ... Agrega el paso CMS (paso 8) entre Widgets y Crear Tienda
 * ... No modifica ningun paso existente " solo inserta el nuevo
 *
 * COPIA Y REEMPLAZA tu StepProgress.jsx actual con este archivo.
 */

import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../pages/useStore";
import "./styles/StepProgress.css";

const STEPS = [
  { label: "Plan", path: "/plan" },
  { label: "Basico", path: "/crear-tienda/basico" },
  { label: "Legal", path: "/crear-tienda/legal" },
  { label: "Pagos", path: "/crear-tienda/pagos" },
  { label: "Layout", path: "/layout" },
  { label: "Estilos", path: "/customer" },
  { label: "Componentes", path: "/component" },
  { label: "Widgets", path: "/widgets" },
  { label: "CMS", path: "/cms" }, // 
  { label: "Crear tienda", path: "/crear-tienda" },
  { label: "Resultado", path: "/resultado" },
];

export default function StepProgress() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useStore();

  // Coincide /cms/about, /cms/contact, etc. con el paso /cms
  const normalizedPath = pathname.startsWith("/cms/") ? "/cms" : pathname;

  const currentIndex = STEPS.findIndex((s) => s.path === normalizedPath);

  const handleClick = (step, i) => {
    if (i <= currentIndex) {
      navigate(step.path);
    }
  };

  return (
    <nav className="step-progress" aria-label="Progreso de creacion de tienda">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const isClickable = i <= currentIndex;

        return (
          <div
            key={step.path}
            className={`sp-item ${isDone ? "done" : ""} ${isActive ? "active" : ""} ${isClickable ? "clickable" : ""}`}
            onClick={() => handleClick(step, i)}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
            aria-label={isClickable ? `Ir a ${step.label}` : undefined}
            onKeyDown={(e) =>
              e.key === "Enter" && isClickable && handleClick(step, i)
            }
          >
            {/* Linea conectora */}
            {i > 0 && <div className={`sp-line ${isDone ? "done" : ""}`} />}

            {/* Circulo */}
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
