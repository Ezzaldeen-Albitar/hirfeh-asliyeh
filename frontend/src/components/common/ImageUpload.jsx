'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

function resolvePreview(value) {
  if (typeof value === 'string' && value.trim()) return value;
  if (Array.isArray(value)) {
    const firstImage = value.find((item) => typeof item === 'string' && item.trim());
    return firstImage || null;
  }
  return null;
}

export default function ImageUpload({
  value,
  currentImage,
  onChange,
  label = 'رفع صورة',
  multiple = false,
}) {
  const inputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);
  const preview = localPreview || resolvePreview(value) || resolvePreview(currentImage);

  const handleChange = (event) => {
    const files = Array.from(event.target.files || []);
    const firstFile = files[0];
    if (!firstFile) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const nextPreview = typeof loadEvent.target?.result === 'string'
        ? loadEvent.target.result
        : null;
      setLocalPreview(nextPreview);
      onChange?.(multiple ? files : firstFile);
    };
    reader.readAsDataURL(firstFile);
  };

  return (
    <div className="text-center">
      {preview ? (
        <div className="position-relative d-inline-block">
          <Image
            src={preview}
            alt="preview"
            width={120}
            height={120}
            unoptimized
            style={{
              width: 120,
              height: 120,
              objectFit: 'cover',
              borderRadius: 12,
              border: '2px solid var(--gold)',
            }}
          />
          <button
            type="button"
            onClick={() => {
              setLocalPreview(null);
              onChange?.(null);
            }}
            className="btn btn-sm position-absolute top-0 start-0 translate-middle rounded-circle p-0"
            style={{
              width: 22,
              height: 22,
              background: 'var(--burgundy)',
              color: '#fff',
              fontSize: '0.7rem',
            }}
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="d-flex flex-column align-items-center justify-content-center gap-2"
          style={{
            width: 120,
            height: 120,
            borderRadius: 12,
            border: '2px dashed var(--stone)',
            cursor: 'pointer',
            background: 'var(--parchment)',
            transition: 'border-color .2s',
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.borderColor = 'var(--burgundy)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.borderColor = 'var(--stone)';
          }}
        >
          <i className="bi bi-cloud-arrow-up fs-3 text-warm-gray" />
          <small style={{ color: 'var(--warm-gray)', fontSize: '0.72rem' }}>{label}</small>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="d-none"
        onChange={handleChange}
      />
    </div>
  );
}
