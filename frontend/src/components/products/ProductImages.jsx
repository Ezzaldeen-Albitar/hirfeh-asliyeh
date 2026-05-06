'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ProductImages({ images = [] }) {
  const [active, setActive] = useState(0);
  const imgs = images.length ? images : ['https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&q=80'];

  return (
    <div>
      {/* Main */}
      <div className="img-gallery-main mb-3 position-relative" style={{height:380,borderRadius:12,overflow:'hidden'}}>
        <Image
          src={imgs[active]}
          alt="main"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{objectFit:'cover'}}
          priority
        />
      </div>
      {/* Thumbs */}
      <div className="d-flex gap-2 flex-wrap">
        {imgs.map((src, i) => (
          <div
            key={i}
            className={`img-gallery-thumb${i === active ? ' active' : ''}`}
            onClick={() => setActive(i)}
            style={{position:'relative',cursor:'pointer'}}
          >
            <Image
              src={src}
              alt={`thumb-${i}`}
              fill
              sizes="80px"
              style={{objectFit:'cover'}}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
