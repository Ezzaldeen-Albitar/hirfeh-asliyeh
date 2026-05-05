export default function StatsCard({ title, value, change, icon, color = 'var(--burgundy)' }) {
  const positive = parseFloat(change) >= 0;
  return (
    <div className="ha-card p-4 h-100">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <div style={{fontSize:'0.78rem',color:'var(--warm-gray)',fontWeight:500,marginBottom:4}}>{title}</div>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.8rem',fontWeight:700,color:'var(--charcoal)'}}>
            {value}
          </div>
        </div>
        <div style={{width:46,height:46,borderRadius:12,background:`${color}18`,
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',color}}>
          <i className={`bi bi-${icon}`}/>
        </div>
      </div>
      {/* Sparkline placeholder */}
      <svg width="100%" height="36" viewBox="0 0 120 36" preserveAspectRatio="none">
        <polyline points="0,30 20,22 40,26 60,14 80,18 100,8 120,12"
          fill="none" stroke={color} strokeWidth="2" opacity="0.5"/>
        <polyline points="0,30 20,22 40,26 60,14 80,18 100,8 120,12 120,36 0,36"
          fill={color} opacity="0.08"/>
      </svg>
      <div className="mt-2">
        <span style={{color: positive ? '#22c55e' : '#ef4444', fontSize:'0.78rem', fontWeight:600}}>
          <i className={`bi bi-arrow-${positive ? 'up' : 'down'}-right me-1`}/>
          {change}
        </span>
        <span style={{fontSize:'0.75rem',color:'var(--warm-gray)',marginRight:4}}>هذا الشهر</span>
      </div>
    </div>
  );
}
