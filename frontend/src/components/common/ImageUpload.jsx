'use client';
import { useRef, useState } from 'react';

export default function ImageUpload({ value, onChange, label = 'رفع صورة', multiple = false }) {
  const inputRef = useRef();
  const [preview, setPreview] = useState(value || null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
      onChange?.(file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="text-center">
      {preview ? (
        <div className="position-relative d-inline-block">
          <img src={preview} alt="preview"
            style={{width:120,height:120,objectFit:'cover',borderRadius:12,border:'2px solid var(--gold)'}}/>
          <button type="button" onClick={() => { setPreview(null); onChange?.(null); }}
            className="btn btn-sm position-absolute top-0 start-0 translate-middle rounded-circle p-0"
            style={{width:22,height:22,background:'var(--burgundy)',color:'#fff',fontSize:'0.7rem'}}>
            ✕
          </button>
        </div>
      ) : (
        <div onClick={() => inputRef.current.click()}
          className="d-flex flex-column align-items-center justify-content-center gap-2"
          style={{width:120,height:120,borderRadius:12,border:'2px dashed var(--stone)',cursor:'pointer',
            background:'var(--parchment)',transition:'border-color .2s'}}
          onMouseEnter={e=>e.currentTarget.style.borderColor='var(--burgundy)'}
          onMouseLeave={e=>e.currentTarget.style.borderColor='var(--stone)'}>
          <i className="bi bi-cloud-arrow-up fs-3 text-warm-gray"/>
          <small style={{color:'var(--warm-gray)',fontSize:'0.72rem'}}>{label}</small>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple}
        className="d-none" onChange={handleChange}/>
    </div>
  );
}
