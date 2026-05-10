'use client';
import { useState } from 'react';

export default function ProductImages({ images = [] }) {
  const [active, setActive] = useState(0);
  const imgs = images.filter((image) => typeof image === 'string' && image.trim());

  return (
    <div>
      <div className="img-gallery-main mb-3 position-relative" style={{height:380,borderRadius:12,overflow:'hidden'}}>
        {imgs.length ? (
          <img
            src={imgs[active]}
            alt="main"
            style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
          />
        ) : (
          <div className="d-flex align-items-center justify-content-center h-100" style={{background:'var(--parchment)',color:'var(--stone)'}}>
            <i className="bi bi-image fs-1"/>
          </div>
        )}
      </div>
      {imgs.length ? <div className="d-flex gap-2 flex-wrap">
        {imgs.map((src, i) => (
          <div
            key={i}
            className={`img-gallery-thumb${i === active ? ' active' : ''}`}
            onClick={() => setActive(i)}
            style={{position:'relative',cursor:'pointer'}}
          >
            <img
              src={src}
              alt={`thumb-${i}`}
              style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
            />
          </div>
        ))}
      </div> : null}
    </div>
  );
}
