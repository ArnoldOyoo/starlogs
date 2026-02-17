import { useMemo } from "react";

interface Star {
  id: number;
  left: string;
  top: string;
  size: number;
  animationDuration: string;
  animationDelay: string;
  opacity: number;
  isTwinkling: boolean;
  twinkleSpeed: string;
}

export default function StarParticles({ count = 50 }: { count?: number }) {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      animationDuration: `${Math.random() * 10 + 10}s`,
      animationDelay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.2,
      isTwinkling: Math.random() > 0.6, // ~40% of stars twinkle
      twinkleSpeed: `${Math.random() * 2 + 1}s`, // 1-3 second twinkle cycle
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full bg-white animate-float-star ${
            star.isTwinkling ? "animate-twinkle" : ""
          }`}
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDuration: star.isTwinkling 
              ? `${star.animationDuration}, ${star.twinkleSpeed}`
              : star.animationDuration,
            animationDelay: star.animationDelay,
          }}
        />
      ))}
    </div>
  );
}
