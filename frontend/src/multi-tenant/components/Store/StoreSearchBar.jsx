import { SearchIcon } from './storeUtils.jsx';

export default function StoreSearchBar({ value, onChange, cfg, accent, maxWidth = 340 }) {
  if (!cfg.visible) return null;

  return (
    <div style={{
      flex: 1, maxWidth, minWidth: 100,
      background: cfg.bg,
      border: `${cfg.borderWidth}px solid ${value ? accent : cfg.borderColor}`,
      borderRadius: cfg.radius,
      padding: "0 12px",
      display: "flex", alignItems: "center", gap: 8,
      fontFamily: `"${cfg.font}",sans-serif`,
      height: 36,
      transition: "border-color 0.2s",
    }}>
      {cfg.showIcon && <SearchIcon color={value ? accent : cfg.iconColor} />}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={cfg.placeholder}
        style={{
          flex: 1, background: "transparent", border: "none", outline: "none",
          fontSize: 12, color: cfg.color, fontFamily: `"${cfg.font}",sans-serif`,
          minWidth: 0,
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: cfg.iconColor, fontSize: 16, lineHeight: 1, padding: "0 2px", flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
