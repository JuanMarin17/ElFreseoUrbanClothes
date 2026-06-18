import React, { useState, useEffect } from 'react';
import {
  Star, TrendingUp, TrendingDown, Gift,
  ChevronDown, ChevronUp, Loader2, Lock, ShoppingBag,
} from 'lucide-react';
import { getPoints, getLoyaltyHistory } from '../../../../../utils/loyaltyService';
import './LoyaltyWidget.css';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const TIER_COLORS = {
  BRONZE:   { bg: 'rgba(180,100,50,0.12)',  border: 'rgba(180,100,50,0.25)',  text: '#cd7f32', label: 'Bronce'   },
  SILVER:   { bg: 'rgba(180,180,180,0.10)', border: 'rgba(180,180,180,0.25)', text: '#c0c0c0', label: 'Plata'    },
  GOLD:     { bg: 'rgba(255,200,50,0.10)',  border: 'rgba(255,200,50,0.25)',  text: '#ffd700', label: 'Oro'      },
  PLATINUM: { bg: 'rgba(150,200,255,0.10)', border: 'rgba(150,200,255,0.25)', text: '#90cff5', label: 'Platino'  },
};

const MOVE_ICONS = {
  EARNED:   { Icon: TrendingUp,   color: '#22c55e' },
  REDEEMED: { Icon: TrendingDown, color: '#f59e0b' },
  EXPIRED:  { Icon: TrendingDown, color: '#6b7280' },
};

function fmtDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

/* ─── Sub-componente: badge de puntos ────────────────────────────────────── */
function PointsBadge({ points, tier }) {
  const colors = TIER_COLORS[tier] ?? TIER_COLORS.BRONZE;
  return (
    <div
      className="loy-points-badge"
      style={{ background: colors.bg, borderColor: colors.border }}
    >
      <div className="loy-badge-star-wrap" style={{ color: colors.text }}>
        <Star size={32} fill={colors.text} color={colors.text} />
      </div>
      <div className="loy-badge-info">
        <p className="loy-points-number" style={{ color: colors.text }}>
          {(points ?? 0).toLocaleString('es-CO')}
        </p>
        <p className="loy-points-label">puntos acumulados</p>
      </div>
      <span className="loy-tier-tag" style={{ color: colors.text, borderColor: colors.border }}>
        {colors.label}
      </span>
    </div>
  );
}

/* ─── Sub-componente: estado vacío (sin puntos todavía) ──────────────────── */
function EmptyPoints() {
  return (
    <div className="loy-empty-state">
      <div className="loy-empty-icon-wrap">
        <ShoppingBag size={36} />
      </div>
      <h3 className="loy-empty-title">Aún no tienes puntos</h3>
      <p className="loy-empty-desc">
        Realiza tu primera compra para comenzar a acumular puntos y desbloquear beneficios exclusivos.
      </p>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────────────────── */
export default function LoyaltyWidget() {
  const [pointsData,   setPointsData]   = useState(null);
  const [history,      setHistory]      = useState([]);
  const [loadingPts,   setLoadingPts]   = useState(true);
  const [loadingHist,  setLoadingHist]  = useState(true);
  const [showHistory,  setShowHistory]  = useState(false);

  useEffect(() => {
    getPoints()
      .then(d => {
        const data = d?.data ?? d;
        // Si no hay datos reales, usar valores por defecto seguros
        setPointsData(data && typeof data === 'object' ? data : { points: 0 });
      })
      .catch(() => {
        // Sin backend disponible → mostrar 0 puntos sin mostrar error al usuario
        setPointsData({ points: 0, tier: 'BRONZE' });
      })
      .finally(() => setLoadingPts(false));

    getLoyaltyHistory()
      .then(d => {
        const list = Array.isArray(d)        ? d
          : Array.isArray(d?.data)           ? d.data
          : Array.isArray(d?.content)        ? d.content
          : [];
        setHistory(list);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoadingHist(false));
  }, []);

  const points         = pointsData?.points       ?? 0;
  const tier           = pointsData?.tier         ?? 'BRONZE';
  const nextTierPoints = pointsData?.nextTierPoints;

  const progress = nextTierPoints && nextTierPoints > 0
    ? Math.min(100, Math.round((points / nextTierPoints) * 100))
    : 0;

  const hasPoints = points > 0;

  return (
    <div className="loy-root">

      {/* ── Encabezado ───────────────────────────────────────────────────── */}
      <div className="loy-header">
        <p className="loy-eyebrow">Programa de fidelización</p>
        <h2 className="loy-title">Mis Puntos</h2>
        <p className="loy-subtitle">
          Acumulá puntos con cada compra y canjeálos por descuentos exclusivos.
        </p>
      </div>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      {loadingPts ? (
        <div className="loy-loading">
          <Loader2 size={20} className="loy-spinner" />
          <span>Cargando puntos...</span>
        </div>
      ) : hasPoints ? (
        <>
          <PointsBadge points={points} tier={tier} />

          {nextTierPoints && (
            <div className="loy-progress-card">
              <div className="loy-progress-header">
                <span className="loy-progress-label">Progreso al siguiente nivel</span>
                <span className="loy-progress-pct">{progress}%</span>
              </div>
              <div className="loy-progress-bar">
                <div className="loy-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="loy-progress-sub">
                Te faltan <strong>{(nextTierPoints - points).toLocaleString('es-CO')} pts</strong> para subir de nivel.
              </p>
            </div>
          )}
        </>
      ) : (
        <EmptyPoints />
      )}

      {/* ── Cómo funciona (visible siempre) ──────────────────────────────── */}
      <div className="loy-how-section">
        <p className="loy-how-title">¿Cómo funciona?</p>
        <div className="loy-how-grid">
          <div className="loy-how-card">
            <ShoppingBag size={18} className="loy-how-icon" />
            <p className="loy-how-label">Compra</p>
            <p className="loy-how-desc">Por cada $1.000 COP en compras ganas <strong>1 punto</strong>.</p>
          </div>
          <div className="loy-how-card">
            <Star size={18} className="loy-how-icon" />
            <p className="loy-how-label">Acumula</p>
            <p className="loy-how-desc">Sube de nivel: Bronce → Plata → Oro → Platino.</p>
          </div>
          <div className="loy-how-card">
            <Gift size={18} className="loy-how-icon" />
            <p className="loy-how-label">Canjea</p>
            <p className="loy-how-desc">Usa tus puntos para obtener descuentos en el checkout.</p>
          </div>
          <div className="loy-how-card">
            <Lock size={18} className="loy-how-icon" />
            <p className="loy-how-label">Beneficios VIP</p>
            <p className="loy-how-desc">Niveles superiores desbloquean envíos gratis y acceso anticipado.</p>
          </div>
        </div>
      </div>

      {/* ── Historial de movimientos ──────────────────────────────────────── */}
      <div className="loy-history-card">
        <button
          className="loy-history-toggle"
          onClick={() => setShowHistory(s => !s)}
        >
          <Gift size={15} />
          <span>Historial de movimientos</span>
          {history.length > 0 && <span className="loy-count">{history.length}</span>}
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showHistory && (
          <div className="loy-history-body">
            {loadingHist ? (
              <div className="loy-loading small">
                <Loader2 size={16} className="loy-spinner" /> Cargando...
              </div>
            ) : history.length === 0 ? (
              <div className="loy-history-empty">
                <Star size={26} className="loy-empty-icon" />
                <p>Todavía no tienes movimientos de puntos.</p>
                <p className="loy-history-hint">Realizá una compra para empezar a acumular.</p>
              </div>
            ) : (
              <div className="loy-movements">
                {history.map((m, i) => {
                  const cfg  = MOVE_ICONS[m.type] ?? MOVE_ICONS.EARNED;
                  const sign = m.type === 'EARNED' ? '+' : '-';
                  return (
                    <div key={m.id ?? i} className="loy-movement-row">
                      <div className="loy-movement-icon" style={{ color: cfg.color }}>
                        <cfg.Icon size={15} />
                      </div>
                      <div className="loy-movement-info">
                        <p className="loy-movement-desc">{m.description ?? m.type}</p>
                        <p className="loy-movement-date">{fmtDate(m.createdAt)}</p>
                      </div>
                      <span className="loy-movement-pts" style={{ color: cfg.color }}>
                        {sign}{(m.points ?? 0).toLocaleString('es-CO')} pts
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="loy-footer-hint">
        <Gift size={13} />
        <span>Los puntos son válidos por 12 meses desde que se acumulan.</span>
      </div>
    </div>
  );
}
