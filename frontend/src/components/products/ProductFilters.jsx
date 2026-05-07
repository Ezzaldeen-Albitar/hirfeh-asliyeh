'use client';
import { useState } from 'react';

const GOVERNORATES = ['عمان','الزرقاء','إربد','مأدبا','جرش','عجلون','البلقاء','الكرك','العقبة'];
const CRAFT_TYPES  = ['السيراميك','النسيج','الفسيفساء','التطريز','الفخار','المجوهرات','الخشب','الزجاج'];

export default function ProductFilters({ filters, onChange }) {
  const [open, setOpen] = useState(true);

  // الـ API تاخذ قيم مفردة — نرسل أول عنصر مختار أو نص فارغ
  const toggleGovernorate = (value) => {
    const current = filters.governorate || '';
    onChange({ ...filters, governorate: current === value ? '' : value });
  };

  const toggleCraftType = (value) => {
    const current = filters.craftType || '';
    onChange({ ...filters, craftType: current === value ? '' : value });
  };

  const handlePrice = (key, rawVal) => {
    if (rawVal === '') {
      onChange({ ...filters, [key]: '' });
    } else {
      const num = parseFloat(rawVal);
      onChange({ ...filters, [key]: Math.max(0, isNaN(num) ? 0 : num) });
    }
  };

  const minPrice = Number(filters.minPrice) || 0;
  const maxPrice = Number(filters.maxPrice) || 0;
  const priceError = filters.minPrice && filters.maxPrice && minPrice > maxPrice;

  return (
    <div className="ha-card p-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3"
        onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer' }}>
        <h6 className="mb-0" style={{ fontFamily: 'Amiri,serif', fontSize: '1.1rem' }}>
          <i className="bi bi-funnel me-2 text-burgundy" />تصفية النتائج
        </h6>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--warm-gray)' }} />
      </div>

      {open && (
        <>
          {/* Price range */}
          <div className="mb-4">
            <label className="section-label mb-2">السعر (د.أ)</label>
            <div className="d-flex gap-2">
              <input
                type="number"
                className={`form-control form-control-sm${priceError ? ' is-invalid' : ''}`}
                placeholder="من"
                value={filters.minPrice ?? ''}
                min="0"
                step="0.5"
                style={{ borderRadius: 8 }}
                onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()}
                onChange={e => handlePrice('minPrice', e.target.value)}
              />
              <input
                type="number"
                className={`form-control form-control-sm${priceError ? ' is-invalid' : ''}`}
                placeholder="إلى"
                value={filters.maxPrice ?? ''}
                min="0"
                step="0.5"
                style={{ borderRadius: 8 }}
                onKeyDown={e => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()}
                onChange={e => handlePrice('maxPrice', e.target.value)}
              />
            </div>
            {priceError && (
              <small className="text-danger mt-1 d-block">
                <i className="bi bi-exclamation-circle me-1" />السعر الأدنى أكبر من الأعلى
              </small>
            )}
          </div>

          {/* Governorate — single select (radio style) */}
          <div className="mb-4">
            <label className="section-label mb-2">المحافظة</label>
            {GOVERNORATES.map(g => (
              <div key={g} className="form-check mb-1">
                <input
                  type="radio"
                  className="form-check-input"
                  id={`gov-${g}`}
                  name="governorate"
                  checked={(filters.governorate || '') === g}
                  onChange={() => toggleGovernorate(g)}
                  style={{ borderColor: 'var(--stone)', cursor: 'pointer' }}
                />
                <label htmlFor={`gov-${g}`} className="form-check-label"
                  style={{ fontSize: '0.87rem', cursor: 'pointer' }}>{g}</label>
              </div>
            ))}
            {filters.governorate && (
              <button
                className="btn btn-sm btn-link p-0 mt-1"
                style={{ fontSize: '0.78rem', color: 'var(--warm-gray)' }}
                onClick={() => onChange({ ...filters, governorate: '' })}
              >
                <i className="bi bi-x me-1" />إلغاء الاختيار
              </button>
            )}
          </div>

          {/* Craft type — single select (radio style) */}
          <div className="mb-4">
            <label className="section-label mb-2">نوع الحرفة</label>
            {CRAFT_TYPES.map(t => (
              <div key={t} className="form-check mb-1">
                <input
                  type="radio"
                  className="form-check-input"
                  id={`craft-${t}`}
                  name="craftType"
                  checked={(filters.craftType || '') === t}
                  onChange={() => toggleCraftType(t)}
                  style={{ borderColor: 'var(--stone)', cursor: 'pointer' }}
                />
                <label htmlFor={`craft-${t}`} className="form-check-label"
                  style={{ fontSize: '0.87rem', cursor: 'pointer' }}>{t}</label>
              </div>
            ))}
            {filters.craftType && (
              <button
                className="btn btn-sm btn-link p-0 mt-1"
                style={{ fontSize: '0.78rem', color: 'var(--warm-gray)' }}
                onClick={() => onChange({ ...filters, craftType: '' })}
              >
                <i className="bi bi-x me-1" />إلغاء الاختيار
              </button>
            )}
          </div>

          {/* Clear all */}
          <button
            className="btn btn-outline-primary w-100"
            style={{ borderRadius: 8, fontSize: '0.85rem' }}
            onClick={() => onChange({})}
          >
            <i className="bi bi-x-circle me-2" />إعادة تعيين الفلاتر
          </button>
        </>
      )}
    </div>
  );
}