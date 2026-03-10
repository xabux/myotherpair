import { useEffect, useRef } from "react";

const EMOJIS = ["👟", "🥿", "👠", "👞", "🥾"];
const COUNT = 35;

const FallingShoes = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const shoes: HTMLSpanElement[] = [];

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement("span");
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const size = 14 + Math.random() * 14;
      const left = Math.random() * 100;
      const duration = 6 + Math.random() * 12;
      const delay = Math.random() * duration;
      const opacity = 0.06 + Math.random() * 0.12;
      const startRotation = Math.random() * 360;
      const drift = (Math.random() - 0.5) * 60;

      el.textContent = emoji;
      el.style.cssText = `
        position: absolute;
        top: -40px;
        left: ${left}%;
        font-size: ${size}px;
        opacity: ${opacity};
        pointer-events: none;
        user-select: none;
        z-index: 0;
        animation: shoefall-${i} ${duration}s linear ${delay}s infinite;
        will-change: transform;
      `;

      const keyframes = `
        @keyframes shoefall-${i} {
          0% {
            transform: translateY(0) translateX(0) rotate(${startRotation}deg);
          }
          100% {
            transform: translateY(calc(100vh + 60px)) translateX(${drift}px) rotate(${startRotation + 360 + Math.random() * 360}deg);
          }
        }
      `;

      const style = document.createElement("style");
      style.textContent = keyframes;
      document.head.appendChild(style);

      container.appendChild(el);
      shoes.push(el);
    }

    return () => {
      shoes.forEach((el) => el.remove());
      // Clean up style elements
      document.querySelectorAll("style").forEach((s) => {
        if (s.textContent?.includes("shoefall-")) s.remove();
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default FallingShoes;
