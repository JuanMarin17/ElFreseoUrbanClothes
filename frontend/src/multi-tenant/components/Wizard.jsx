import { useState } from "react";

import Progress from "./Progress";
import StepBasic from "./StepBasic";
import StepLegal from "./StepLegal";
import StepPayment from "./StepPayment";
import StepConfirm from "./StepConfirm";
import useStoreForm from "../hooks/useStoreForm";
import SelectLayoutStep from "./SelectLayout/SelectLayoutStep.jsx";
import ComponentCustomizer from "./ComponentCustomizer.jsx";
import CustomizationPanel from "./CustomizationPanel.jsx";
import CreateStore from "../pages/CreateStore.jsx";
import WidgetsCustomizer from "./WidgetsCustomizer.jsx";

const steps = [
  "basic",
  "legal",
  "payment",
  "confirm",
  "layout",
  "customizer",
  "panel",
  "widgets",
  "crear-tienda"
];
export default function Wizard() {
  const [step, setStep] = useState(0);
  const [selectedLayout, setSelectedLayout] = useState("minimalista");
  const { form, setForm, handleChange, handleFile } = useStoreForm();

  const next = () => {
    if (step === 0 && !form.name) return alert("Nombre requerido");

    if (step === 3 && !form.accepted) {
      return alert("Debes aceptar los términos y condiciones");
    }

    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prev = () => setStep((prev) => Math.max(prev - 1, 0));

  // -----------------------------
  // PANTALLAS FULLSCREEN 4-6
  // -----------------------------
  if (step >= 4) {
    return (
      <div className="fullscreen-wizard">
        {step === 4 && (
          <SelectLayoutStep
            selectedLayout={selectedLayout}
            setSelectedLayout={setSelectedLayout}
          />
        )}
        {step === 5 && <ComponentCustomizer />}
        {step === 6 && <CustomizationPanel selectedLayout={selectedLayout} />}
        {step === 7 && <CreateStore />}

        <div className="fullscreen-actions">
          {step > 4 && <button onClick={prev}>Atrás</button>}

          {step < steps.length - 1 && (
            <button className="primary" onClick={next}>
              Siguiente
            </button>
          )}
        </div>
      </div>
    );
  }

  // -----------------------------
  // WIZARD NORMAL
  // -----------------------------
  return (
    <div className="card">
      <Progress step={step} />

      {step === 0 && (
        <StepBasic
          form={form}
          handleChange={handleChange}
          handleFile={handleFile}
        />
      )}

      {step === 1 && (
        <StepLegal
          form={form}
          handleChange={handleChange}
          handleFile={handleFile}
        />
      )}

      {step === 2 && <StepPayment form={form} handleChange={handleChange} />}

      {step === 3 && <StepConfirm form={form} setForm={setForm} />}

      <div className="actions">
        {step > 0 && <button onClick={prev}>Atrás</button>}

        {step < 3 && <button onClick={next}>Continuar</button>}

        {step === 3 && (
          <button className="primary" onClick={next} disabled={!form.accepted}>
            Crear tienda
          </button>
        )}
      </div>
    </div>
  );
}
