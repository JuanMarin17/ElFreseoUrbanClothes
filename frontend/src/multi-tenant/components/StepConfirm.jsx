import React, { useState } from "react";
import VexioTermsPage from "./VexioTermsPage.jsx";

export default function StepConfirm({ form, setForm }) {
  const [showTerms, setShowTerms] = useState(false);

  // Cuando el usuario acepta en el modal
  const handleAcceptTerms = () => {
    setForm({ ...form, accepted: true });
    setShowTerms(false);
  };

  return (
    <div className="step">
      <label>
        <input
          type="checkbox"
          checked={!!form.accepted}
          onChange={(e) => {
            if (!form.accepted) setShowTerms(true);
            else setForm({ ...form, accepted: false });
          }}
        />
        <span
          style={{
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => setShowTerms(true)}
        >
          Acepto términos y condiciones
        </span>
      </label>

      {showTerms && (
        <div
          className="modal-terms-bg"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              maxWidth: 800,
              width: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              position: "relative",
            }}
          >
            <button
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
              }}
              onClick={() => setShowTerms(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <VexioTermsPage />
            <div style={{ padding: 24, textAlign: "center" }}>
              <button className="primary" onClick={handleAcceptTerms}>
                He leído y acepto los términos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
