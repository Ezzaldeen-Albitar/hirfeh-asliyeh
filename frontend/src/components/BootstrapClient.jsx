'use client';
import { useEffect } from 'react';

// مكوّن لتحميل Bootstrap JS على جانب العميل فقط
export default function BootstrapClient() {
  useEffect(() => {
    // تحميل Bootstrap JS بعد ما الصفحة تتحمل
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);
  return null;
}
