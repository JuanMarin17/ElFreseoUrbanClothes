import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./ModalTastes.css";

const CATALOG_PATH = "/catalogo";
export const REOPEN_KEY = "vexio_tastes_reopen";

const QUESTIONS = [
  {
    id: "categorias",
    question: "¿Qué categorías te interesan más?",
    type: "multi",
    options: [
      "Camisetas",
      "Hoodies",
      "Chaquetas",
      "Pantalones",
      "Gorras",
      "Gaming / Videojuegos",
      "Tecnología / Electrónica",
      "Ferretería / Herramientas",
      "Hogar / Decoración",
      "Deportes / Fitness",
      "Accesorios",
      "Calzado",
    ],
  },
  {
    id: "estilos",
    question: "¿Qué estilos te representan?",
    type: "multi",
    options: [
      "Urbano / Streetwear",
      "Casual",
      "Deportivo",
      "Oversize",
      "Clásico / Formal",
      "Sin preferencia",
    ],
  },
  {
    id: "colores",
    question: "¿Qué paleta de colores prefieres?",
    type: "multi",
    options: [
      "Neutros (negro, blanco, gris)",
      "Colores vivos",
      "Azules",
      "Verdes",
      "Sin preferencia",
    ],
  },
  {
    id: "presupuesto",
    question: "¿Cuál es tu presupuesto promedio por compra?",
    type: "single",
    options: [
      "Menos de $50.000",
      "$50.000 - $100.000",
      "$100.000 - $200.000",
      "Más de $200.000",
    ],
  },
  {
    id: "frecuencia",
    question: "¿Con qué frecuencia compras online?",
    type: "single",
    options: [
      "Varias veces a la semana",
      "Una vez al mes",
      "Cada temporada",
      "Solo cuando necesito",
    ],
  },
];

const STORAGE_KEY = "vexio_tastes_completed";
const API_BASE = import.meta.env.VITE_API_URL;

function getJwt() {
  return localStorage.getItem("jwt");
}
function isAuthed() {
  const j = getJwt();
  return !!(j && j !== "null");
}

async function fetchTastesFromBackend() {
  try {
    const res = await fetch(`${API_BASE}/preferences`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getJwt()}`,
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const prefs = json?.data ?? json;
    const tastes = prefs?.tastes ?? prefs;
    if (tastes && (tastes.categorias || tastes.colores || tastes.estilos)) {
      return tastes;
    }
    return null;
  } catch {
    return null;
  }
}

async function saveTastesToBackend(tastes) {
  try {
    await fetch(`${API_BASE}/preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${getJwt()}`,
      },
      body: JSON.stringify({ tastes }),
    });
  } catch {
    /* guardar en localStorage siempre es el fallback */
  }
}

const ModalTastes = () => {
  const { pathname } = useLocation();
  const isOnCatalog = pathname === CATALOG_PATH || pathname.startsWith(CATALOG_PATH + "/");

  // visible = true si: autenticado + no tiene respuesta guardada, O si se pidió reabrir
  const [visible,    setVisible]    = useState(() => {
    if (!isAuthed()) return false;
    if (localStorage.getItem(REOPEN_KEY) === "true") return true;
    return !localStorage.getItem(STORAGE_KEY);
  });
  const [step,       setStep]       = useState(0);
  const [answers,    setAnswers]    = useState({});
  const [closing,    setClosing]    = useState(false);
  const [checking,   setChecking]   = useState(false);
  // forcedOpen = true cuando el usuario abre el modal desde Preferencias (sin navegar)
  const [forcedOpen, setForcedOpen] = useState(false);

  // Evento global desde la página de Preferencias
  useEffect(() => {
    const handler = () => {
      if (!isAuthed()) return;
      localStorage.removeItem(STORAGE_KEY);
      setStep(0);
      setAnswers({});
      setForcedOpen(true);
      setVisible(true);
    };
    window.addEventListener("vexio:open-tastes", handler);
    return () => window.removeEventListener("vexio:open-tastes", handler);
  }, []);

  // Cuando el usuario navega a /catalogo con la flag de reabrir, mostrar el modal
  useEffect(() => {
    if (!isOnCatalog) return;
    if (!isAuthed()) return;
    if (localStorage.getItem(REOPEN_KEY) === "true") {
      localStorage.removeItem(REOPEN_KEY);
      setStep(0);
      setAnswers({});
      setVisible(true);
    }
  }, [isOnCatalog]);

  // Si el usuario está autenticado, verificar si el backend ya tiene sus gustos
  useEffect(() => {
    if (!visible) return;
    if (!isAuthed()) return;
    if (localStorage.getItem(REOPEN_KEY) === "true") return; // reopen manual, no cancelar

    setChecking(true);
    fetchTastesFromBackend()
      .then((tastes) => {
        if (tastes && !localStorage.getItem(REOPEN_KEY)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(tastes));
          setVisible(false);
        }
      })
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = QUESTIONS[step];
  const currentAnswer = answers[currentQuestion?.id] ?? [];

  const toggleOption = (option) => {
    const key = currentQuestion.id;
    if (currentQuestion.type === "single") {
      setAnswers((prev) => ({ ...prev, [key]: [option] }));
    } else {
      setAnswers((prev) => {
        const current = prev[key] ?? [];
        return {
          ...prev,
          [key]: current.includes(option)
            ? current.filter((o) => o !== option)
            : [...current, option],
        };
      });
    }
  };

  const canContinue = (answers[currentQuestion?.id] ?? []).length > 0;

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    // 1. Guardar en localStorage (caché inmediata)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));

    // 2. Persistir en el backend si hay sesión activa
    if (isAuthed()) {
      await saveTastesToBackend(answers);
    }

    closeModal();
  };

  const closeModal = () => {
    setClosing(true);
    setForcedOpen(false);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "skipped");
    closeModal();
  };

  // Solo mostrar si: autenticado, visible, y (en /catalogo O forzado desde Preferencias)
  if (!visible || checking || !isAuthed()) return null;
  if (!isOnCatalog && !forcedOpen) return null;

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className={`modalOverlay ${closing ? "closing" : ""}`}>
      <div className={`modalBox ${closing ? "closing" : ""}`}>
        <div className="modalHeader">
          <div className="modalHeaderText">
            <h2 className="modalTitle">Personaliza tu experiencia</h2>
            <p className="modalSubtitle">
              Cuéntanos tus gustos y te sugerimos lo mejor
            </p>
          </div>
          <button className="skipBtn" onClick={handleSkip}>
            Omitir
          </button>
        </div>

        <div className="progressBar">
          <div className="progressFill" style={{ width: `${progress}%` }} />
        </div>
        <p className="stepCount">
          {step + 1} de {QUESTIONS.length}
        </p>

        <div className="questionBlock">
          <p className="questionText">{currentQuestion.question}</p>
          {currentQuestion.type === "multi" && (
            <p className="questionHint">Puedes elegir varias opciones</p>
          )}
          <div className="optionsGrid">
            {currentQuestion.options.map((option) => (
              <button
                key={`opt-${currentQuestion.id}-${option}`}
                className={`optionBtn ${currentAnswer.includes(option) ? "selected" : ""}`}
                onClick={() => toggleOption(option)}
              >
                {currentAnswer.includes(option) && (
                  <span className="optionCheck">✓</span>
                )}
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="modalFooter">
          <button
            className="backBtn"
            onClick={handleBack}
            disabled={step === 0}
          >
            Atrás
          </button>
          <button
            className="nextBtn"
            onClick={handleNext}
            disabled={!canContinue}
          >
            {step === QUESTIONS.length - 1 ? "Finalizar" : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTastes;
