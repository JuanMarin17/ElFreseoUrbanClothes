import { useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../pages/useStore";
import "./styles/StepProgress.css";

const STEPS = [
  { label: "Plan",         path: "/plan" },
  { label: "Básico",       path: "/crear-tienda/basico" },
  { label: "Legal",        path: "/crear-tienda/legal" },
  { label: "Pagos",        path: "/crear-tienda/pagos" },
  { label: "Layout",       path: "/layout" },
  { label: "Estilos",      path: "/customer" },
  { label: "Componentes",  path: "/component" },
  { label: "Widgets",      path: "/widgets" },
  { label: "CMS",          path: "/cms" },
  { label: "Crear tienda", path: "/crear-tienda" },
  { label: "Resultado",    path: "/resultado" },
];

export default function StepProgress() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useStore();

  const normalizedPath = pathname.startsWith("/cms/") ? "/cms" : pathname;
  const currentIndex = STEPS.findIndex((s) => s.path === normalizedPath);
  const currentStep  = STEPS[currentIndex];
  const totalSteps   = STEPS.length;
  const progressPct  = currentIndex >= 0
    ? Math.round((currentIndex / (totalSteps - 1)) * 100)
    : 0;

  const handleClick = (step, i) => {
    if (i <= currentIndex) navigate(step.path);
  };

  return (
    <nav className="step-progress" aria-label="Progreso de creación de tienda">

      {/* ── Barra compacta para móvil ── */}
      <div className="sp-compact" aria-hidden="true">
        <div className="sp-compact-info">
          <span className="sp-compact-count">
            Paso {currentIndex + 1} de {totalSteps}
          </span>
          <span className="sp-compact-label">{currentStep?.label}</span>
        </div>
        <div className="sp-compact-track">
          <div
            className="sp-compact-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Círculos completos para desktop ── */}
      <div className="sp-circles-row">
        {STEPS.map((step, i) => {
          const isDone      = i < currentIndex;
          const isActive    = i === currentIndex;
          const isClickable = i <= currentIndex;

          return (
            <div
              key={step.path}
              className={[
                "sp-item",
                isDone      ? "done"      : "",
                isActive    ? "active"    : "",
                isClickable ? "clickable" : "",
              ].join(" ")}
              onClick={() => handleClick(step, i)}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              aria-label={isClickable ? `Ir a ${step.label}` : undefined}
              onKeyDown={(e) =>
                e.key === "Enter" && isClickable && handleClick(step, i)
              }
            >
              {i > 0 && <div className={`sp-line ${isDone ? "done" : ""}`} />}

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

              <span className="sp-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
