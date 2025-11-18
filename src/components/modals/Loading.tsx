'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Loading() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 flex justify-center items-center bg-white/1 backdrop-blur-xs z-loading">
      <div className="flex items-center gap-3 ">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary-c700"></div>
        <span className="text-grey-c600 font-medium text-xl">Đang tải...</span>
      </div>
    </div>,
    document.body
  );
}
