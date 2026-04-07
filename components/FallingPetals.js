// components/FallingPetals.js
import { useState } from 'react';

const FLOWER_IMGS = [
  '/flowers/flower2.png',
  '/flowers/flower3.png',
  '/flowers/flower4.png',
  '/flowers/flower5.png',
];

const CLASSIC_IMGS = Array.from({ length: 12 }, (_, i) => `/icons/${i + 1}.png`);

const PETAL_CONFIGS = {
  flower: {
    count: 28,
    imgs: FLOWER_IMGS,
    sizeMin: 26,
    sizeMax: 64,
    durationMin: 7000,
    durationMax: 9000,
    opacityPeak: 0.82,
    swingX: [0, 14, -9, 5],
    rotateDeg: 120,
  },
  classic: {
    count: 32,
    imgs: CLASSIC_IMGS,
    sizeMin: 4,
    sizeMax: 11,
    durationMin: 5000,
    durationMax: 7000,
    opacityPeak: 0.68,
    swingX: [0, 12, -8, 5],
    rotateDeg: 100,
  },
  petal: {
    count: 18,
    imgs: null, // emoji
    sizeMin: 18,
    sizeMax: 30,
    durationMin: 8000,
    durationMax: 12000,
    opacityPeak: 0.82,
    swingX: [0, 0, 0, 0],
    rotateDeg: 360,
  },
};

export default function FallingPetals({ type }) {
  const config = PETAL_CONFIGS[type];
  if (!config) return null;

  const [particles] = useState(() =>
    [...Array(config.count)].map((_, i) => {
      const duration = config.durationMin + Math.random() * (config.durationMax - config.durationMin);
      return {
        id: i,
        left: Math.random() * 100,
        // 음수 delay = 애니메이션이 이미 진행 중인 것처럼 시작 → 로드 즉시 화면 전체에 흩날림
        delay: -(Math.random() * duration),
        duration,
        size: config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
        imgIdx: config.imgs ? i % config.imgs.length : 0,
      };
    })
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes gyeongjo-fall-y {
          0%   { transform: translateY(-100px); }
          100% { transform: translateY(calc(100vh + 100px)); }
        }
        @keyframes gyeongjo-swing-x {
          0%   { margin-left: 0px; }
          25%  { margin-left: 14px; }
          50%  { margin-left: -9px; }
          75%  { margin-left: 5px; }
          100% { margin-left: 0px; }
        }
        @keyframes gyeongjo-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(${config.rotateDeg}deg); }
        }
        @keyframes gyeongjo-fade {
          0%   { opacity: 0; }
          4%   { opacity: ${config.opacityPeak}; }
          92%  { opacity: ${config.opacityPeak}; }
          100% { opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            animation: `gyeongjo-fall-y ${p.duration}ms ${p.delay}ms linear infinite,
                        gyeongjo-swing-x ${p.duration}ms ${p.delay}ms ease-in-out infinite,
                        gyeongjo-fade ${p.duration}ms ${p.delay}ms linear infinite`,
            willChange: 'transform, opacity',
          }}
        >
          {config.imgs ? (
            <img
              src={config.imgs[p.imgIdx]}
              alt=""
              style={{
                width: p.size,
                height: p.size,
                display: 'block',
                animation: `gyeongjo-rotate ${p.duration}ms ${p.delay}ms linear infinite`,
              }}
            />
          ) : (
            <span style={{ fontSize: p.size, display: 'block', lineHeight: 1,
              animation: `gyeongjo-rotate ${p.duration}ms ${p.delay}ms linear infinite` }}>
              🌸
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
