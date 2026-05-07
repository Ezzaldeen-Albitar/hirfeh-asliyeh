'use client';
import { useEffect } from 'react';

export default function MapView({ lat = 31.95, lng = 35.93, label = 'الموقع', height = 260 }) {
  return (
    <div style={{borderRadius:12,overflow:'hidden',height,background:'var(--parchment)',
      border:'1px solid var(--gold)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:8}}>
      <i className="bi bi-geo-alt-fill fs-2" style={{color:'var(--burgundy)'}}/>
      <div style={{fontFamily:'Amiri,serif',fontSize:'1rem',color:'var(--charcoal)'}}>{label}</div>
      <small style={{color:'var(--warm-gray)'}}>
        {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
      </small>
      <a href={`https://maps.google.com/?q=${lat},${lng}`} target="_blank" rel="noreferrer"
        className="btn btn-sm btn-outline-primary mt-1" style={{borderRadius:20,fontSize:'0.78rem'}}>
        <i className="bi bi-box-arrow-up-left me-1"/>فتح في خرائط Google
      </a>
    </div>
  );
}
