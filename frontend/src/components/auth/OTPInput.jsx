'use client';

/* cSpell:disable */
import { useRef, useState, useEffect } from 'react';

/**
 * OTPInput — مكون إدخال رمز التحقق
 * يستمع لـ value من الخارج لتصفير المربعات عند الحاجة
 */
export default function OTPInput({ length = 6, onChange, value = '' }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const refs = useRef([]);

  // المزامنة مع القيمة القادمة من الخارج (مثلاً عند عمل Resend)
  useEffect(() => {
    if (value === '') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues(Array(length).fill(''));
      refs.current[0]?.focus();
    }
  }, [value, length]);

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...values];
    next[i] = val;
    setValues(next);
    onChange?.(next.join(''));
    
    // الانتقال للمربع التالي إذا تم إدخال رقم
    if (val && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i, e) => {
    // العودة للمربع السابق عند المسح
    if (e.key === 'Backspace' && !values[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;

    const next = Array(length).fill('');
    pasted.split('').forEach((ch, i) => {
      next[i] = ch;
    });

    setValues(next);
    onChange?.(next.join(''));

    // التركيز على المربع المناسب بعد اللصق
    const focusIdx = Math.min(pasted.length, length - 1);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="d-flex gap-2 justify-content-center" dir="ltr">
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={v}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="form-control text-center fw-bold"
          style={{
            width: 52,
            height: 56,
            fontSize: '1.4rem',
            borderRadius: 10,
            borderColor: v ? 'var(--burgundy)' : 'var(--stone)',
            boxShadow: v ? '0 0 0 .15rem rgba(122,28,46,.2)' : 'none',
            transition: 'all .2s',
          }}
        />
      ))}
    </div>
  );
}