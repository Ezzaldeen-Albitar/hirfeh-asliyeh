'use client';
import { useState } from 'react';

export default function ProductImages({ images = [] }) {
  const [active, setActive] = useState(0);
  const imgs = images.length ? images : ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80'];

  return (
    <div>
      {/* Main */}
      <div className="img-gallery-main mb-3" style={{height:380}}>
        <img src={imgs[active]} alt="main"
          className="w-100 h-100" style={{objectFit:'cover'}}/>
      </div>
      {/* Thumbs */}
      <div className="d-flex gap-2 flex-wrap">
        {imgs.map((src, i) => (
          <img key={i} src={src} alt={`thumb-${i}`}
            className={`img-gallery-thumb${i === active ? ' active' : ''}`}
            onClick={() => setActive(i)}/>
        ))}
      </div>
    </div>
  );
}
