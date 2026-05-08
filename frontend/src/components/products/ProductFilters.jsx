'use client';

import { useState } from 'react';
import { GOVERNORATE_OPTIONS, PRODUCT_CATEGORY_OPTIONS } from '@/lib/productFilters';

export default function ProductFilters({ filters, onChange }) {
  const [open, setOpen] = useState(true);

  const toggleGovernorate = (value) => {
    const current = filters.governorate || '';
    onChange({ ...filters, governorate: current === value ? '' : value });
  };

  const toggleCraftType = (value) => {
    const current = filters.craftType || '';
    onChange({ ...filters, craftType: current === value ? '' : value });
  };

  const handlePrice = (key, rawValue) => {
    if (rawValue === '') {
      onChange({ ...filters, [key]: '' });
      return;
    }

    const numericValue = parseFloat(rawValue);
    onChange({ ...filters, [key]: Math.max(0, Number.isNaN(numericValue) ? 0 : numericValue) });
  };

  const minPrice = Number(filters.minPrice) || 0;
  const maxPrice = Number(filters.maxPrice) || 0;
  const priceError = filters.minPrice && filters.maxPrice && minPrice > maxPrice;

  return (
    <div className="ha-card p-3">
      <div
        className="d-flex justify-content-between align-items-center mb-3"
        onClick={() => setOpen((current) => !current)}
        style={{ cursor: 'pointer' }}
      >
        <h6 className="mb-0" style={{ fontFamily: 'Amiri,serif', fontSize: '1.1rem' }}>
          <i className="bi bi-funnel me-2 text-burgundy" />
          تصفية النتائج
        </h6>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{ color: 'var(--warm-gray)' }} />
      </div>

      {open && (
        <>
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
                onKeyDown={(event) => ['-', 'e', 'E', '+'].includes(event.key) && event.preventDefault()}
                onChange={(event) => handlePrice('minPrice', event.target.value)}
              />
              <input
                type="number"
                className={`form-control form-control-sm${priceError ? ' is-invalid' : ''}`}
                placeholder="إلى"
                value={filters.maxPrice ?? ''}
                min="0"
                step="0.5"
                style={{ borderRadius: 8 }}
                onKeyDown={(event) => ['-', 'e', 'E', '+'].includes(event.key) && event.preventDefault()}
                onChange={(event) => handlePrice('maxPrice', event.target.value)}
              />
            </div>
            {priceError && (
              <small className="text-danger mt-1 d-block">
                <i className="bi bi-exclamation-circle me-1" />
                السعر الأدنى أكبر من الأعلى
              </small>
            )}
          </div>

          <div className="mb-4">
            <label className="section-label mb-2">المحافظة</label>
            {GOVERNORATE_OPTIONS.map((option) => (
              <div key={option.value} className="form-check mb-1">
                <input
                  type="radio"
                  className="form-check-input"
                  id={`gov-${option.value}`}
                  name="governorate"
                  checked={(filters.governorate || '') === option.value}
                  onChange={() => toggleGovernorate(option.value)}
                  style={{ borderColor: 'var(--stone)', cursor: 'pointer' }}
                />
                <label
                  htmlFor={`gov-${option.value}`}
                  className="form-check-label"
                  style={{ fontSize: '0.87rem', cursor: 'pointer' }}
                >
                  {option.label}
                </label>
              </div>
            ))}
            {filters.governorate && (
              <button
                className="btn btn-sm btn-link p-0 mt-1"
                style={{ fontSize: '0.78rem', color: 'var(--warm-gray)' }}
                onClick={() => onChange({ ...filters, governorate: '' })}
              >
                <i className="bi bi-x me-1" />
                إلغاء الاختيار
              </button>
            )}
          </div>

          <div className="mb-4">
            <label className="section-label mb-2">نوع الحرفة</label>
            {PRODUCT_CATEGORY_OPTIONS.map((option) => (
              <div key={option.value} className="form-check mb-1">
                <input
                  type="radio"
                  className="form-check-input"
                  id={`craft-${option.value}`}
                  name="craftType"
                  checked={(filters.craftType || '') === option.value}
                  onChange={() => toggleCraftType(option.value)}
                  style={{ borderColor: 'var(--stone)', cursor: 'pointer' }}
                />
                <label
                  htmlFor={`craft-${option.value}`}
                  className="form-check-label"
                  style={{ fontSize: '0.87rem', cursor: 'pointer' }}
                >
                  {option.label}
                </label>
              </div>
            ))}
            {filters.craftType && (
              <button
                className="btn btn-sm btn-link p-0 mt-1"
                style={{ fontSize: '0.78rem', color: 'var(--warm-gray)' }}
                onClick={() => onChange({ ...filters, craftType: '' })}
              >
                <i className="bi bi-x me-1" />
                إلغاء الاختيار
              </button>
            )}
          </div>

          <button
            className="btn btn-outline-primary w-100"
            style={{ borderRadius: 8, fontSize: '0.85rem' }}
            onClick={() => onChange({})}
          >
            <i className="bi bi-x-circle me-2" />
            إعادة تعيين الفلاتر
          </button>
        </>
      )}
    </div>
  );
}
