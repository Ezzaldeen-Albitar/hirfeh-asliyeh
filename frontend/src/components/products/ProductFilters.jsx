'use client';
import { useState } from 'react';

const GOVERNORATES = ['عمان','الزرقاء','إربد','مأدبا','جرش','عجلون','البلقاء','الكرك','العقبة'];
const CRAFT_TYPES  = ['السيراميك','النسيج','الفسيفساء','التطريز','الفخار','المجوهرات','الخشب','الزجاج'];

export default function ProductFilters({ filters, onChange }) {
  const [open, setOpen] = useState(true);

  const toggle = (key, value) => {
    const arr = filters[key] || [];
    onChange({ ...filters, [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] });
  };

  return (
    <div className="ha-card p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3"
        onClick={() => setOpen(o => !o)} style={{cursor:'pointer'}}>
        <h6 className="mb-0" style={{fontFamily:'Amiri,serif',fontSize:'1.1rem'}}>
          <i className="bi bi-funnel me-2 text-burgundy"/>تصفية النتائج
        </h6>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{color:'var(--warm-gray)'}}/>
      </div>

      {open && (
        <>
          {/* Price range */}
          <div className="mb-4">
            <label className="section-label mb-2">السعر (د.أ)</label>
            <div className="d-flex gap-2">
              <input type="number" className="form-control form-control-sm" placeholder="من"
                value={filters.minPrice || ''} style={{borderRadius:8}}
                onChange={e => onChange({ ...filters, minPrice: e.target.value })}/>
              <input type="number" className="form-control form-control-sm" placeholder="إلى"
                value={filters.maxPrice || ''} style={{borderRadius:8}}
                onChange={e => onChange({ ...filters, maxPrice: e.target.value })}/>
            </div>
          </div>

          {/* Governorate */}
          <div className="mb-4">
            <label className="section-label mb-2">المحافظة</label>
            {GOVERNORATES.map(g => (
              <div key={g} className="form-check mb-1">
                <input type="checkbox" className="form-check-input" id={`gov-${g}`}
                  checked={(filters.governorates || []).includes(g)}
                  onChange={() => toggle('governorates', g)}
                  style={{borderColor:'var(--stone)',cursor:'pointer'}}/>
                <label htmlFor={`gov-${g}`} className="form-check-label"
                  style={{fontSize:'0.87rem',cursor:'pointer'}}>{g}</label>
              </div>
            ))}
          </div>

          {/* Craft type */}
          <div className="mb-4">
            <label className="section-label mb-2">نوع الحرفة</label>
            {CRAFT_TYPES.map(t => (
              <div key={t} className="form-check mb-1">
                <input type="checkbox" className="form-check-input" id={`craft-${t}`}
                  checked={(filters.craftTypes || []).includes(t)}
                  onChange={() => toggle('craftTypes', t)}
                  style={{borderColor:'var(--stone)',cursor:'pointer'}}/>
                <label htmlFor={`craft-${t}`} className="form-check-label"
                  style={{fontSize:'0.87rem',cursor:'pointer'}}>{t}</label>
              </div>
            ))}
          </div>

          {/* Clear */}
          <button className="btn btn-outline-primary w-100" style={{borderRadius:8,fontSize:'0.85rem'}}
            onClick={() => onChange({})}>
            <i className="bi bi-x-circle me-2"/>إعادة تعيين الفلاتر
          </button>
        </>
      )}
    </div>
  );
}
