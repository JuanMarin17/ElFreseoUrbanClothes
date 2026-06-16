import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, TrendingDown, Gift, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getPoints, getLoyaltyHistory } from '../../../../../utils/loyaltyService';
import './LoyaltyWidget.css';

const MOVEMENT_ICONS = {
  EARNED:   { icon: TrendingUp,   color: '#22c55e' },
  REDEEMED: { icon: TrendingDown, color: '#f59e0b' },
  EXPIRED:  { icon: TrendingDown, color: '#6b7280' },
};

function relDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(iso));
}

function PointsBadge({ points, tier }) {
  const tierColors = {
    BRONZE:   { bg: 'rgba(180,100,50,0.15)', border: 'rgba(180,100,50,0.3)', text: '#cd7f32' },
    SILVER:   { bg: 'rgba(180,180,180,0.12)', border: 'rgba(180,180,180,0.3)', text: '#c0c0c0' },
    GOLD:     { bg: 'rgba(255,200,50,0.12)', border: 'rgba(255,200,50,0.3)', text: '#ffd700' },
    PLATINUM: { bg: 'rgba(150,200,255,0.12)', border: 'rgba(150,200,255,0.3)', text: '#90cff5' },
  };
  const colors = tierColors[tier] ?? tierColors.BRONZE;

  return (
    <div className="loy-points-badge" style={{ background: colors.bg, borderColor: colors.border }}>
      <Star size={28} fill={colors.text} color={colors.text} className="loy-star-icon" />
      <div>
        <p className="loy-points-number" style={{ color: colors.text }}>
          {(points ?? 0).toLocaleString('es-CO')}
        </p>
        <p className="loy-points-label">puntos acumulados</p>
      </div>
      {tier && (
        <span className="loy-tier-tag" style={{ color: colors.text, borderColor: colors.border }}>
          {tier}
        </span>
      )}
    </div>
  );
}

export default function LoyaltyWidget() {
  const [pointsData, setPointsData]   = useState(null);
  const [history, setHistory]         = useState([]);
  const [loadingPts, setLoadingPts]   = useState(true);
  const [loadingHist, setLoadingHist] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    getPoints()
      .then(d => {
        const data = d?.data ?? d;
        setPointsData(data);
      })
      .catch(() => setError('No fue posible cargar tus puntos.'))
      .finally(() => setLoadingPts(false));

    getLoyaltyHistory()
      .then(d => {
        const list = Array.isArray(d) ? d
          : Array.isArray(d?.data)    ? d.data
          : Array.isArray(d?.content) ? d.content
          : [];
        setHistory(list);
      })
      .catch(() => {})
      .finally(() => setLoadingHist(false));
  }, []);

  const points         = pointsData?.points ?? 0;
  const tier           = pointsData?.tier;
  const nextTierPoints = pointsData?.nextTierPoints;

  const progress = nextTierPoints && nextTierPoints > 0
    ? Math.min(100, Math.round((points / nextTierPoints) * 100))
    : 100;

  return (
    <div className="loy-root">
      <div className="loy-header">
        <p className="loy-eyebrow">Programa de fidelización</p>
        <h2 className="loy-title">Mis Puntos</h2>
        <p className="loy-subtitle">Acumulá puntos con cada compra y canjeálos por descuentos.</p>
      </div>

      {loadingPts ? (
        <div className="loy-loading">
          <Loader2 size={20} className="loy-spinner" />
          <span>Cargando puntos...</span>
        </div>
      ) : error ? (
        <div className="loy-error">{error}</div>
      ) : (
        <>
          <PointsBadge points={points} tier={tier} />

          {nextTierPoints && (
            <div className="loy-progress-card">
              <div className="loy-progress-header">
                <span className="loy-progress-label">Progreso hacia el siguiente nivel</span>
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
      )}

      {/* ── Historial ─────────────────────────────────────────────────── */}
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
                <Star size={28} className="loy-empty-icon" />
                <p>Todavía no tenés movimientos de puntos.</p>
                <p className="loy-history-hint">Realizá una compra para empezar a acumular.</p>
              </div>
            ) : (
              <div className="loy-movements">
                {history.map((m, i) => {
                  const config = MOVEMENT_ICONS[m.type] ?? MOVEMENT_ICONS.EARNED;
                  const MIcon  = config.icon;
                  const sign   = m.type === 'EARNED' ? '+' : '-';
                  return (
                    <div key={m.id ?? i} className="loy-movement-row">
                      <div className="loy-movement-icon" style={{ color: config.color }}>
                        <MIcon size={15} />
                      </div>
                      <div className="loy-movement-info">
                        <p className="loy-movement-desc">{m.description ?? m.type}</p>
                        <p className="loy-movement-date">{relDate(m.createdAt)}</p>
                      </div>
                      <span
                        className="loy-movement-pts"
                        style={{ color: config.color }}
                      >
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
