'use client';
import { useRef, useState } from 'react';

export default function OTPInput({ length = 6, onChange }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const refs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...values];
    next[i] = val;
    setValues(next);
    onChange?.(next.join(''));
    if (val && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="d-flex gap-2 justify-content-center" dir="ltr">
      {values.map((v, i) => (
        <input key={i} ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1} value={v}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="form-control text-center fw-bold"
          style={{width:52,height:56,fontSize:'1.4rem',borderRadius:10,
            borderColor: v ? 'var(--burgundy)' : 'var(--stone)',
            boxShadow: v ? '0 0 0 .15rem rgba(122,28,46,.2)' : 'none',
            transition:'all .2s'}}
        />
      ))}
    </div>
  );
}
