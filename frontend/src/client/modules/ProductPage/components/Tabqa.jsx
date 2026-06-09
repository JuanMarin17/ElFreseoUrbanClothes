/**
 * TabQA
 * Panel de preguntas y respuestas del producto.
 *
 * Props:
 *  - qaItems {Array} Lista de Q&A:
 *    [{ id, question, answer, answeredBy, date, helpfulCount }]
 */
export default function TabQA({ qaItems = [] }) {
  return (
    <div
      role="tabpanel"
      id="panel-qa"
      aria-labelledby="tab-qa"
      style={{ maxWidth: 700 }}
    >
      {/* Campo de pregunta */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <input
          type="text"
          placeholder="Escribe tu pregunta sobre este producto..."
          aria-label="Tu pregunta"
          style={{
            flex: 1,
            padding: "12px 16px",
            background: "var(--vx-card2)",
            border: "1px solid var(--vx-border)",
            borderRadius: "var(--vx-radius)",
            color: "var(--vx-text)",
            fontFamily: "var(--vx-font-body)",
            fontSize: "0.88rem",
            outline: "none",
          }}
        />
        <button className="vx-btn vx-btn--primary">
          <i className="fa-solid fa-paper-plane" aria-hidden="true" />
          Preguntar
        </button>
      </div>

      {/* Lista de Q&A */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {qaItems.map((qa) => (
          <article
            key={qa.id}
            style={{
              padding: 20,
              background: "var(--vx-card)",
              border: "1px solid var(--vx-border)",
              borderRadius: "var(--vx-radius-lg)",
            }}
          >
            <p
              style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: 8 }}
            >
              <i
                className="fa-regular fa-circle-question"
                style={{ color: "var(--vx-cyan)", marginRight: 6 }}
                aria-hidden="true"
              />
              {qa.question}
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--vx-muted)",
                lineHeight: 1.7,
                marginBottom: 8,
              }}
            >
              <i
                className="fa-solid fa-check-circle"
                style={{ color: "var(--vx-green)", marginRight: 6 }}
                aria-hidden="true"
              />
              <strong style={{ color: "var(--vx-text)" }}>
                {qa.answeredBy}:
              </strong>{" "}
              {qa.answer}
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--vx-muted2)" }}>
              {qa.date} · {qa.helpfulCount} personas encontraron esta respuesta
              útil
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
