import React, { useState } from "react";
import { Sparkles, X, Check, Loader2 } from "lucide-react";
import { suggestProduct } from "../../pages/IAAdmin/service/iaService";
import "./AIProductAssist.css";

/**
 * Botón + panel que pide a la IA del módulo admin (mismo backend que el chat
 * de IAAdmin, ruta dedicada sin sesión) que sugiera nombre/descripción/precio/
 * categoría para un producto, a partir de una breve descripción del admin.
 * Solo arma la sugerencia: quien la use decide cómo aplicarla al formulario.
 */
export default function AIProductAssist({ categories = [], onApply, disabled }) {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestion, setSuggestion] = useState(null);

  const reset = () => {
    setSuggestion(null);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setHint("");
    reset();
  };

  const handleGenerate = async () => {
    if (!hint.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const existingCategories = categories.map((c) => c.name).filter(Boolean);
      const data = await suggestProduct({ hint: hint.trim(), existing_categories: existingCategories });
      setSuggestion(data);
    } catch (e) {
      if (e.status === 429) {
        const secs = Number(e.retryAfterSeconds);
        setError(secs > 0 ? `Demasiadas peticiones. Intenta de nuevo en ${secs}s.` : "Demasiadas peticiones, intenta más tarde.");
      } else {
        setError(e.message ?? "No se pudo generar la sugerencia.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    const matched = suggestion.category
      ? categories.find((c) => c.name?.toLowerCase() === suggestion.category.toLowerCase())
      : null;
    onApply({
      name: suggestion.name ?? null,
      description: suggestion.description ?? null,
      price: suggestion.price ?? null,
      categoryId: matched?.categoryId ?? null,
      categoryName: suggestion.category ?? null,
    });
    handleClose();
  };

  if (!open) {
    return (
      <button type="button" className="aips-toggle-btn" onClick={() => setOpen(true)} disabled={disabled}>
        <Sparkles size={14} /> Generar con IA
      </button>
    );
  }

  return (
    <div className="aips-panel">
      <div className="aips-panel-head">
        <span className="aips-panel-title">
          <Sparkles size={14} /> Generar con IA
        </span>
        <button type="button" className="aips-close-btn" onClick={handleClose} aria-label="Cerrar">
          <X size={14} />
        </button>
      </div>

      {!suggestion && (
        <>
          <p className="aips-hint-text">
            Describe brevemente el producto y la IA sugerirá nombre, descripción, precio y categoría.
          </p>
          <textarea
            className="aips-textarea"
            placeholder="Ej: camiseta oversize negra de algodón 100%, estilo urbano"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            disabled={loading}
            rows={2}
            maxLength={300}
          />
          {error && <span className="aips-error">{error}</span>}
          <button
            type="button"
            className="aips-generate-btn"
            onClick={handleGenerate}
            disabled={loading || !hint.trim()}
          >
            {loading ? <Loader2 size={14} className="aips-spin" /> : <Sparkles size={14} />}
            {loading ? "Generando…" : "Generar sugerencia"}
          </button>
        </>
      )}

      {suggestion && (
        <div className="aips-suggestion">
          {suggestion.name && (
            <div className="aips-sug-row">
              <span className="aips-sug-label">Nombre</span>
              <span className="aips-sug-value">{suggestion.name}</span>
            </div>
          )}
          {suggestion.description && (
            <div className="aips-sug-row">
              <span className="aips-sug-label">Descripción</span>
              <span className="aips-sug-value">{suggestion.description}</span>
            </div>
          )}
          {suggestion.price != null && (
            <div className="aips-sug-row">
              <span className="aips-sug-label">Precio</span>
              <span className="aips-sug-value">${Number(suggestion.price).toLocaleString("es-CO")}</span>
            </div>
          )}
          {suggestion.category && (
            <div className="aips-sug-row">
              <span className="aips-sug-label">Categoría</span>
              <span className="aips-sug-tag">{suggestion.category}</span>
            </div>
          )}
          <div className="aips-sug-actions">
            <button type="button" className="aips-discard-btn" onClick={reset}>
              Descartar
            </button>
            <button type="button" className="aips-apply-btn" onClick={handleApply}>
              <Check size={14} /> Aplicar al formulario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
