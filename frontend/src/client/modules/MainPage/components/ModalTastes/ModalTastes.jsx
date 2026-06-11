import { useState } from "react";
import "./ModalTastes.css";

const QUESTIONS = [
  {
    id: "categorias",
    question: "¿Qué categorías te interesan más?",
    type: "multi",
    options: [
      "Camisetas", "Hoodies", "Chaquetas", "Pantalones", "Gorras",
      "Gaming / Videojuegos", "Tecnología / Electrónica",
      "Ferretería / Herramientas", "Hogar / Decoración",
      "Deportes / Fitness", "Accesorios", "Calzado",
    ],
  },
  {
    id: "estilos",
    question: "¿Qué estilos te representan?",
    type: "multi",
    options: ["Urbano / Streetwear", "Casual", "Deportivo", "Oversize", "Clásico / Formal", "Sin preferencia"],
  },
  {
    id: "colores",
    question: "¿Qué paleta de colores prefieres?",
    type: "multi",
    options: ["Neutros (negro, blanco, gris)", "Colores vivos", "Azules", "Verdes", "Sin preferencia"],
  },
  {
    id: "presupuesto",
    question: "¿Cuál es tu presupuesto promedio por compra?",
    type: "single",
    options: ["Menos de $50.000", "$50.000 - $100.000", "$100.000 - $200.000", "Más de $200.000"],
  },
  {
    id: "frecuencia",
    question: "¿Con qué frecuencia compras online?",
    type: "single",
    options: ["Varias veces a la semana", "Una vez al mes", "Cada temporada", "Solo cuando necesito"],
  },
];

const STORAGE_KEY = "vexio_tastes_completed";

const ModalTastes = () => {
  const [visible, setVisible] = useState(() => {

    const alreadyAnswered = localStorage.getItem(STORAGE_KEY);

    return !alreadyAnswered;

  });
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [closing, setClosing] = useState(false);

  const currentQuestion = QUESTIONS[step];
  const currentAnswer = answers[currentQuestion?.id] ?? [];

  const toggleOption = (option) => {
    const key = currentQuestion.id;
    if (currentQuestion.type === "single") {
      setAnswers(prev => ({ ...prev, [key]: [option] }));
    } else {
      setAnswers(prev => {
        const current = prev[key] ?? [];
        return {
          ...prev,
          [key]: current.includes(option)
            ? current.filter(o => o !== option)
            : [...current, option],
        };
      });
    }
  };

  const canContinue = (answers[currentQuestion?.id] ?? []).length > 0;

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSubmit = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    closeModal();
  };

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 300);
  };

  const handleSkip = () => {
    // Marca como completado sin guardar respuestas
    localStorage.setItem(STORAGE_KEY, "skipped");
    closeModal();
  };

  if (!visible) return null;

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <div className={`modalOverlay ${closing ? "closing" : ""}`}>
      <div className={`modalBox ${closing ? "closing" : ""}`}>

        {/* Header */}
        <div className="modalHeader">
          <div className="modalHeaderText">
            <h2 className="modalTitle">Personaliza tu experiencia</h2>
            <p className="modalSubtitle">Cuéntanos tus gustos y te sugerimos lo mejor</p>
          </div>
          <button className="skipBtn" onClick={handleSkip}>Omitir</button>
        </div>

        {/* Progress bar */}
        <div className="progressBar">
          <div className="progressFill" style={{ width: `${progress}%` }} />
        </div>
        <p className="stepCount">{step + 1} de {QUESTIONS.length}</p>

        {/* Pregunta */}
        <div className="questionBlock">
          <p className="questionText">{currentQuestion.question}</p>
          {currentQuestion.type === "multi" && (
            <p className="questionHint">Puedes elegir varias opciones</p>
          )}
          <div className="optionsGrid">
            {currentQuestion.options.map(option => (
              <button
                key={`opt-${currentQuestion.id}-${option}`}
                className={`optionBtn ${currentAnswer.includes(option) ? "selected" : ""}`}
                onClick={() => toggleOption(option)}
              >
                {currentAnswer.includes(option) && <span className="optionCheck">✓</span>}
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Footer navegación */}
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