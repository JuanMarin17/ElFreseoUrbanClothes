import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import "./DisableStoreModal.css";

const SUGGESTIONS = [
  "Incumplimiento de términos de uso",
  "Actividad sospechosa detectada",
  "Productos o contenido no permitidos",
  "Solicitud del propietario",
  "Tienda inactiva por largo tiempo",
  "Verificación de identidad pendiente",
];

export default function DisableStoreModal({ store, onConfirm, onClose, loading, error }) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(store.storeId, reason.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <>
      <div className="dsm-overlay" onClick={!loading ? onClose : undefined} />
      <div className="dsm-modal" role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
        <div className="dsm-header">
          <div className="dsm-header-left">
            <span className="dsm-header-icon">
              <AlertTriangle size={17} />
            </span>
            <div>
              <h2 className="dsm-title">Inhabilitar tienda</h2>
              <p className="dsm-subtitle">{store.name}</p>
            </div>
          </div>
          <button className="dsm-close" onClick={onClose} disabled={loading} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="dsm-body">
          <p className="dsm-desc">
            Al inhabilitar esta tienda dejará de ser visible para los clientes.
            Selecciona un motivo o escribe uno personalizado.
          </p>

          <label className="dsm-label">
            Motivo de inhabilitación <span className="dsm-required">*</span>
          </label>

          <div className="dsm-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className={`dsm-chip${reason === s ? " dsm-chip--active" : ""}`}
                onClick={() => setReason(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>

          <textarea
            className="dsm-textarea"
            placeholder="O escribe un motivo personalizado…"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={300}
            disabled={loading}
          />
          <span className="dsm-char-count">{reason.length}/300</span>

          {error && <p className="dsm-error">{error}</p>}
        </div>

        <div className="dsm-footer">
          <button className="dsm-btn dsm-btn--cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
          <button
            className="dsm-btn dsm-btn--confirm"
            onClick={handleConfirm}
            disabled={!reason.trim() || loading}
          >
            {loading ? "Inhabilitando…" : "Inhabilitar tienda"}
          </button>
        </div>
      </div>
    </>
  );
}
