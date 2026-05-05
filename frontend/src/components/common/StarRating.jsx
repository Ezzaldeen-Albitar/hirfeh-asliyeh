'use client';
export default function StarRating({ value = 0, max = 5, size = '0.85rem', onChange }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <span className="stars" style={{ fontSize: size }}>
      {stars.map(s => (
        <i key={s}
          className={`bi bi-star${s <= Math.round(value) ? '-fill' : s - 0.5 <= value ? '-half' : ''}`}
          style={{ cursor: onChange ? 'pointer' : 'default' }}
          onClick={() => onChange?.(s)}
        />
      ))}
    </span>
  );
}
