'use client';

export default function StarRating({ value = 0, size = '0.9rem', onChange }) {
  const stars = [1, 2, 3, 4, 5];
  const rounded = Math.round(value * 2) / 2;

  return (
    <div
      className="d-flex align-items-center gap-1"
      style={{ cursor: onChange ? 'pointer' : 'default' }}
      role={onChange ? 'radiogroup' : undefined}
      aria-label={onChange ? 'تقييم' : undefined}
    >
      {stars.map(star => {
        const filled   = star <= Math.floor(rounded);
        const halfFill = !filled && star - 0.5 <= rounded;
        return (
          <i
            key={star}
            className={`bi bi-star${filled ? '-fill' : halfFill ? '-half' : ''}`}
            role={onChange ? 'radio' : undefined}
            aria-checked={onChange ? star === Math.ceil(value) : undefined}
            aria-label={onChange ? `${star} نجوم` : undefined}
            tabIndex={onChange ? 0 : undefined}
            style={{
              color: (filled || halfFill) ? 'var(--gold)' : 'var(--stone)',
              fontSize: size,
              transition: 'color .15s, transform .15s',
              outline: 'none',
            }}
            onClick={() => onChange?.(star)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange?.(star)}
            onMouseEnter={e => {
              if (onChange) {
                e.currentTarget.style.color = 'var(--gold)';
                e.currentTarget.style.transform = 'scale(1.2)';
              }
            }}
            onMouseLeave={e => {
              if (onChange) {
                e.currentTarget.style.color = '';
                e.currentTarget.style.transform = '';
              }
            }}
          />
        );
      })}
      {value > 0 && (
        <small style={{ color: 'var(--warm-gray)', fontSize: '0.73rem', marginRight: 3 }}>
          {Number(value).toFixed(1)}
        </small>
      )}
    </div>
  );
}
