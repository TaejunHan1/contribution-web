// components/FallingPetals.js
import { useState, useMemo } from 'react';

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
    rotateDeg: 100,
  },
  petal: {
    count: 18,
    imgs: null,
    sizeMin: 18,
    sizeMax: 30,
    durationMin: 8000,
    durationMax: 12000,
    opacityPeak: 0.82,
    rotateDeg: 360,
  },
};

const CUSTOM_PETAL_THEMES = {
  pink:   ['#ffb7c5', '#ff9eaf', '#ffd1dc', '#fff0f5', '#ffccd5'],
  yellow: ['#ffd700', '#ffea00', '#ffc100', '#fffacd', '#ffe066'],
  red:    ['#ff4060', '#d70000', '#ff6b6b', '#ff0000', '#c00000'],
  blue:   ['#8a2be2', '#4169e1', '#87cefa', '#e6e6fa', '#6ab0f5'],
  mixed:  ['#ffb7c5', '#ffd700', '#ff4060', '#87cefa', '#c8a2e0', '#ffd1dc', '#ffe066'],
};

function makeCustomPetals(count, colorTheme) {
  const colors = CUSTOM_PETAL_THEMES[colorTheme] || CUSTOM_PETAL_THEMES.pink;
  return [...Array(count)].map((_, i) => {
    const size    = 1.5 + Math.random() * 1.5;        // 1.5~3px (원 지름)
    const aspect  = 2.2 + Math.random() * 1.0;        // 2.2~3.2배 (세로 늘이기)
    const duration = 4000 + Math.random() * 5000;
    const flipDur  = duration * 0.35;
    const opPeak   = 0.55 + Math.random() * 0.4;
    return {
      id: i,
      left: Math.random() * 100,
      size,
      aspect,
      color: colors[i % colors.length],
      duration,
      delay: -(Math.random() * duration),
      flipDur,
      flipDelay: -(Math.random() * flipDur),
      wobble: 12 + Math.random() * 22,
      opPeak,
    };
  });
}

function makeParticles(config) {
  return [...Array(config.count)].map((_, i) => {
    const duration = config.durationMin + Math.random() * (config.durationMax - config.durationMin);
    return {
      id: i,
      left: Math.random() * 100,
      delay: -(Math.random() * duration),
      duration,
      size: config.sizeMin + Math.random() * (config.sizeMax - config.sizeMin),
      imgIdx: config.imgs ? i % config.imgs.length : 0,
    };
  });
}

export default function FallingPetals({ type, color = 'pink' }) {
  const config = PETAL_CONFIGS[type] || null;
  const isCustom = type === 'custom_petal';

  const [particles] = useState(() => config ? makeParticles(config) : []);
  const customPetals = useMemo(
    () => isCustom ? makeCustomPetals(30, color) : [],
    [isCustom, color]
  );

  if (!config && !isCustom) return null;

  // ── 커스텀꽃비 ──
  if (isCustom) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 999999, overflow: 'hidden',
      }}>
        <style>{`
          @keyframes cp-fall {
            0%   { transform: translateY(-60px); }
            100% { transform: translateY(calc(100vh + 60px)); }
          }
          @keyframes cp-wobble {
            0%   { margin-left: 0px; }
            25%  { margin-left: var(--wobble); }
            50%  { margin-left: 0px; }
            75%  { margin-left: calc(var(--wobble) * -1); }
            100% { margin-left: 0px; }
          }
          @keyframes cp-rotate {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes cp-flutter {
            0%   { transform: scaleY(var(--aspect)); }
            25%  { transform: scaleY(calc(var(--aspect) * 0.12)); }
            50%  { transform: scaleY(var(--aspect)); }
            75%  { transform: scaleY(calc(var(--aspect) * 0.12)); }
            100% { transform: scaleY(var(--aspect)); }
          }
          @keyframes cp-fade {
            0%   { opacity: 0; }
            4%   { opacity: var(--op); }
            92%  { opacity: var(--op); }
            100% { opacity: 0; }
          }
        `}</style>
        {customPetals.map((p) => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              top: 0,
              left: `${p.left}%`,
              '--wobble': `${p.wobble}px`,
              '--aspect': p.aspect,
              '--op': p.opPeak,
              animation: `cp-fall ${p.duration}ms ${p.delay}ms linear infinite,
                          cp-wobble ${p.duration}ms ${p.delay}ms ease-in-out infinite,
                          cp-fade ${p.duration}ms ${p.delay}ms linear infinite`,
              willChange: 'transform, opacity',
            }}
          >
            {/* 회전 래퍼 */}
            <div style={{
              width: p.size,
              height: p.size,
              animation: `cp-rotate ${p.duration}ms ${p.delay}ms linear infinite`,
            }}>
              {/* 타원 꽃잎: 원 + scaleY flutter */}
              <div style={{
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                backgroundColor: p.color,
                transformOrigin: 'center center',
                animation: `cp-flutter ${p.flipDur}ms ${p.flipDelay}ms linear infinite`,
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── 기존 flower / classic / petal ──
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 999999,
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
