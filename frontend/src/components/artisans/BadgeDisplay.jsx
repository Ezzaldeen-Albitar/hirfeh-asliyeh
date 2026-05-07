const BADGE_ICONS = {
  gold:    { icon: 'bi-trophy-fill',   color: '#B8963C', label: 'ذهبي' },
  silver:  { icon: 'bi-award-fill',    color: '#94A3B8', label: 'فضي'  },
  bronze:  { icon: 'bi-star-fill',     color: '#CD7F32', label: 'برونزي'},
  master:  { icon: 'bi-patch-check-fill', color: '#7A1C2E', label: 'ماستر'},
};

export default function BadgeDisplay({ badges = [] }) {
  if (!badges.length) return null;
  return (
    <div className="d-flex flex-wrap gap-2">
      {badges.map((b, i) => {
        const cfg = BADGE_ICONS[b.type] || BADGE_ICONS.bronze;
        return (
          <div key={i} className="d-flex align-items-center gap-1 px-3 py-1"
            style={{background:`${cfg.color}18`,border:`1.5px solid ${cfg.color}40`,borderRadius:20}}>
            <i className={`bi ${cfg.icon}`} style={{color:cfg.color,fontSize:'0.85rem'}}/>
            <span style={{fontSize:'0.78rem',fontWeight:600,color:cfg.color}}>{b.name || cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
}
