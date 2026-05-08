function toSparklinePoints(trend = []) {
  const safeTrend = Array.isArray(trend) && trend.length > 0 ? trend : [0, 0, 0, 0, 0, 0];
  const minValue = Math.min(...safeTrend);
  const maxValue = Math.max(...safeTrend);
  const range = maxValue - minValue || 1;

  return safeTrend
    .map((value, index) => {
      const x = (120 / Math.max(safeTrend.length - 1, 1)) * index;
      const y = 30 - ((value - minValue) / range) * 22;
      return `${x},${y.toFixed(1)}`;
    })
    .join(' ');
}

function parseChangeValue(change) {
  const numeric = Number.parseFloat(String(change ?? '').replace(/[^\d.+-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  color = 'var(--burgundy)',
  trend = [],
  periodLabel = 'هذا الشهر',
}) {
  const positive = parseChangeValue(change) >= 0;
  const linePoints = toSparklinePoints(trend);

  return (
    <div className="ha-card p-4 h-100">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <div style={{ fontSize: '0.78rem', color: 'var(--warm-gray)', fontWeight: 500, marginBottom: 4 }}>{title}</div>
          <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '1.8rem', fontWeight: 700, color: 'var(--charcoal)' }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            color,
          }}
        >
          <i className={`bi bi-${icon}`} />
        </div>
      </div>

      <svg width="100%" height="36" viewBox="0 0 120 36" preserveAspectRatio="none">
        <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" opacity="0.5" />
        <polyline points={`${linePoints} 120,36 0,36`} fill={color} opacity="0.08" />
      </svg>

      <div className="mt-2">
        <span style={{ color: positive ? '#22c55e' : '#ef4444', fontSize: '0.78rem', fontWeight: 600 }}>
          <i className={`bi bi-arrow-${positive ? 'up' : 'down'}-right me-1`} />
          {change}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', marginRight: 4 }}>{periodLabel}</span>
      </div>
    </div>
  );
}
