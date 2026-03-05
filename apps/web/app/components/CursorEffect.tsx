'use client';

import { useEffect, useRef } from 'react';

export default function CursorEffect() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos  = useRef({ x: -200, y: -200 });
  const ring = useRef({ x: -200, y: -200 });
  const raf  = useRef<number>(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform =
          `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      }
    };

    const animate = () => {
      ring.current.x += (pos.current.x - ring.current.x) * 0.12;
      ring.current.y += (pos.current.y - ring.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform =
          `translate(calc(${ring.current.x}px - 50%), calc(${ring.current.y}px - 50%))`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    raf.current = requestAnimationFrame(animate);
    document.documentElement.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
      document.documentElement.style.cursor = '';
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{ willChange: 'transform' }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#e63946]" />
      </div>
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998]"
        style={{ willChange: 'transform' }}
      >
        <div className="w-9 h-9 rounded-full border-2 border-[#e63946]/50" />
      </div>
    </>
  );
}
