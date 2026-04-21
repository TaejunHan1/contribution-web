// components/WeddingIntroOverlay.js
// 앱의 WeddingIntroSelectModal 도어 인트로를 웹 CSS로 1:1 포팅
import { useState, useEffect, useRef } from 'react';

const SERIF = '"Playfair Display", Georgia, "Noto Serif KR", serif';

// ── 신랑 · 신부 이름 좌우 분리 레이아웃 ──
// 문 이음새(가운데) 기준으로 신랑 우측정렬 / 신부 좌측정렬
function NamesRow({ groom, bride, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', width: 200, marginBottom: 0 }}>
      <div style={{
        flex: 1, textAlign: 'right', fontSize: 12, color, fontStyle: 'italic',
        fontFamily: SERIF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        minWidth: 0,
      }}>{groom}</div>
      <span style={{ margin: '0 5px', color, fontSize: 10, opacity: 0.7, flexShrink: 0 }}>·</span>
      <div style={{
        flex: 1, textAlign: 'left', fontSize: 12, color, fontStyle: 'italic',
        fontFamily: SERIF, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        minWidth: 0,
      }}>{bride}</div>
    </div>
  );
}

// ── 터치 힌트 (애니메이션) ──
function TapHint({ textColor, pillBg, visible }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setPulse(p => !p), 850);
    return () => clearInterval(id);
  }, [visible]);
  if (!visible) return null;
  return (
    <div style={{
      marginTop: 20,
      padding: '6px 14px',
      backgroundColor: pillBg,
      borderRadius: 20,
      border: `0.5px solid ${textColor}`,
      opacity: pulse ? 0.25 : 1,
      transform: `scale(${pulse ? 0.93 : 1})`,
      transition: 'opacity 850ms ease, transform 850ms ease',
    }}>
      <span style={{
        fontSize: 11, letterSpacing: 2.5, color: textColor,
        fontWeight: '600', fontFamily: SERIF,
      }}>초대장 열기</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 1. Grand — 아이보리 패널 · 골드 채운 원 씰
// ══════════════════════════════════════════════════════
function GrandSeal({ groom, bride, tapToOpen, animPhase, sealScale = 1 }) {
  const sealOut = animPhase === 'sealOut' || animPhase === 'doorsOut';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: sealOut ? 0 : 1, transform: `scale(${sealOut ? 0.92 * sealScale : sealScale})`,
      transition: 'opacity 600ms ease, transform 600ms ease',
      pointerEvents: 'none',
    }}>
      {/* 골드 채운 원 씰 */}
      <div style={{
        width: 56, height: 56, borderRadius: 28, backgroundColor: '#D4AF37',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 6, position: 'relative',
        boxShadow: '0 4px 16px rgba(212,175,55,0.45)',
      }}>
        <div style={{
          position: 'absolute', top: 4, left: 4, right: 4, bottom: 4,
          borderRadius: 24, border: '1px solid rgba(255,255,255,0.35)',
        }} />
        <span style={{ fontFamily: SERIF, fontSize: 22, color: '#fff', fontStyle: 'italic' }}>W</span>
      </div>
      <span style={{ fontSize: 8, letterSpacing: 3, color: 'rgba(140,115,90,0.6)', marginBottom: 4, fontFamily: SERIF }}>Wedding</span>
      <NamesRow groom={groom} bride={bride} color="#8C7B65" />
      <TapHint textColor="rgba(70,50,25,0.9)" pillBg="rgba(70,50,25,0.12)" visible={tapToOpen && animPhase === 'idle'} />
    </div>
  );
}
function GrandPanel({ side, animPhase }) {
  const tx = animPhase === 'doorsOut' ? (side === 'left' ? '-100%' : '100%') : '0%';
  return (
    <div style={{
      position: 'absolute', top: 0, [side]: 0,
      width: '50%', height: '100%',
      backgroundColor: '#EFECE8',
      borderRight: side === 'left' ? '1px solid #D9D1C7' : undefined,
      borderLeft: side === 'right' ? '1px solid rgba(255,255,255,0.6)' : undefined,
      overflow: 'hidden',
      transform: `translateX(${tx})`,
      transition: 'transform 900ms cubic-bezier(0.77,0,0.18,1)',
    }}>
      {/* 인셋 테두리 */}
      <div style={{ position: 'absolute', top: 18, left: 7, right: 7, bottom: 18,
        border: '1px solid rgba(217,209,199,0.6)' }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 2. Classic — 칠흑 패널 · 팔각형 씰
// ══════════════════════════════════════════════════════
function ClassicSeal({ groom, bride, tapToOpen, animPhase, sealScale = 1 }) {
  const sealOut = animPhase === 'sealOut' || animPhase === 'doorsOut';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: sealOut ? 0 : 1, transform: `scale(${sealOut ? 0.92 * sealScale : sealScale})`,
      transition: 'opacity 600ms ease, transform 600ms ease',
      pointerEvents: 'none',
    }}>
      {/* 팔각형 씰: 원 + 내부 45° 사각형 */}
      <div style={{
        width: 56, height: 56, borderRadius: 28,
        border: '1.5px solid rgba(210,210,230,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 6, position: 'relative',
        boxShadow: '0 4px 12px rgba(160,160,192,0.35)',
      }}>
        <div style={{
          position: 'absolute', width: 32, height: 32,
          border: '1px solid rgba(210,210,230,0.45)',
          transform: 'rotate(45deg)',
        }} />
        <span style={{ fontFamily: SERIF, fontSize: 22, color: 'rgba(220,220,240,0.95)', fontStyle: 'italic' }}>W</span>
      </div>
      <span style={{ fontSize: 8, letterSpacing: 3, color: 'rgba(200,200,220,0.45)', marginBottom: 4, fontFamily: SERIF }}>Wedding</span>
      <NamesRow groom={groom} bride={bride} color="rgba(210,210,235,0.82)" />
      <TapHint textColor="#D0D0E8" pillBg="rgba(200,200,220,0.15)" visible={tapToOpen && animPhase === 'idle'} />
    </div>
  );
}
function ClassicDetail() {
  return (
    <div style={{ position: 'absolute', top: 18, left: 7, right: 7, bottom: 18,
      border: '1px solid rgba(210,210,225,0.28)', overflow: 'hidden' }}>
      {/* 상단 아치 힌트 */}
      <div style={{
        position: 'absolute', top: -1, left: '20%', right: '20%', height: 18,
        borderTopLeftRadius: 40, borderTopRightRadius: 40,
        borderTop: '1px solid rgba(210,210,225,0.22)',
        borderLeft: '1px solid rgba(210,210,225,0.22)',
        borderRight: '1px solid rgba(210,210,225,0.22)',
      }} />
      {/* 세로 1/3 분할선 */}
      <div style={{ position: 'absolute', top: 6, bottom: 6, left: '33%', width: 0.5, backgroundColor: 'rgba(210,210,225,0.15)' }} />
      <div style={{ position: 'absolute', top: 6, bottom: 6, left: '66%', width: 0.5, backgroundColor: 'rgba(210,210,225,0.15)' }} />
    </div>
  );
}
function ClassicPanel({ side, animPhase }) {
  const tx = animPhase === 'doorsOut' ? (side === 'left' ? '-100%' : '100%') : '0%';
  return (
    <div style={{
      position: 'absolute', top: 0, [side]: 0,
      width: '50%', height: '100%',
      backgroundColor: '#18181E',
      borderRight: side === 'left' ? '1px solid rgba(200,200,220,0.5)' : undefined,
      borderLeft: side === 'right' ? '1px solid rgba(200,200,220,0.5)' : undefined,
      overflow: 'hidden',
      transform: `translateX(${tx})`,
      transition: 'transform 900ms cubic-bezier(0.77,0,0.18,1)',
    }}>
      <ClassicDetail />
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 3. Arch — 와인빛 패널 · 로즈골드 다이아몬드 씰
// ══════════════════════════════════════════════════════
function ArchSeal({ groom, bride, tapToOpen, animPhase, sealScale = 1 }) {
  const sealOut = animPhase === 'sealOut' || animPhase === 'doorsOut';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: sealOut ? 0 : 1, transform: `scale(${sealOut ? 0.92 * sealScale : sealScale})`,
      transition: 'opacity 600ms ease, transform 600ms ease',
      pointerEvents: 'none',
    }}>
      {/* 다이아몬드 씰 (45° 회전 정사각형) */}
      <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <div style={{
          width: 46, height: 46, backgroundColor: '#C4977A',
          transform: 'rotate(45deg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 4px 16px rgba(196,151,122,0.4)',
        }}>
          <div style={{ position: 'absolute', top: 5, left: 5, right: 5, bottom: 5, border: '1px solid rgba(255,255,255,0.28)' }} />
          <span style={{ transform: 'rotate(-45deg)', fontFamily: SERIF, fontSize: 20, color: '#fff', fontStyle: 'italic' }}>W</span>
        </div>
      </div>
      <span style={{ fontSize: 8, letterSpacing: 3, color: 'rgba(220,185,165,0.55)', marginBottom: 4, fontFamily: SERIF }}>Wedding</span>
      <NamesRow groom={groom} bride={bride} color="rgba(220,185,165,0.9)" />
      <TapHint textColor="#E8C4A8" pillBg="rgba(196,151,122,0.22)" visible={tapToOpen && animPhase === 'idle'} />
    </div>
  );
}
function ArchPanel({ side, animPhase }) {
  const tx = animPhase === 'doorsOut' ? (side === 'left' ? '-100%' : '100%') : '0%';
  // 왼쪽: 우측 상단 아치 / 오른쪽: 좌측 상단 아치
  const archStyle = side === 'left'
    ? { borderTopRightRadius: 26, borderTopLeftRadius: 0 }
    : { borderTopLeftRadius: 26, borderTopRightRadius: 0 };
  const diamondPos = side === 'left' ? { top: -4, right: -4 } : { top: -4, left: -4 };
  return (
    <div style={{
      position: 'absolute', top: 0, [side]: 0,
      width: '50%', height: '100%',
      backgroundColor: '#3B2030',
      borderRight: side === 'left' ? '1px solid #C4977A' : undefined,
      borderLeft: side === 'right' ? '1px solid #C4977A' : undefined,
      overflow: 'hidden',
      transform: `translateX(${tx})`,
      transition: 'transform 900ms cubic-bezier(0.77,0,0.18,1)',
    }}>
      <div style={{
        position: 'absolute', top: 18, left: 7, right: 7, bottom: 18,
        border: '1px solid rgba(196,151,122,0.45)', ...archStyle, overflow: 'visible',
      }}>
        <div style={{
          position: 'absolute', ...diamondPos, width: 7, height: 7,
          transform: 'rotate(45deg)', backgroundColor: 'rgba(196,151,122,0.65)',
        }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 4. Glass (딥 오션) — 네이비 패널 · 더블링 씰
// ══════════════════════════════════════════════════════
function GlassSeal({ groom, bride, tapToOpen, animPhase, sealScale = 1 }) {
  const sealOut = animPhase === 'sealOut' || animPhase === 'doorsOut';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: sealOut ? 0 : 1, transform: `scale(${sealOut ? 0.92 * sealScale : sealScale})`,
      transition: 'opacity 600ms ease, transform 600ms ease',
      pointerEvents: 'none',
    }}>
      {/* 더블링 씰 */}
      <div style={{
        width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8EAF4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 6, position: 'relative',
        boxShadow: '0 4px 16px rgba(128,144,184,0.4)',
      }}>
        <div style={{ position: 'absolute', top: 5, left: 5, right: 5, bottom: 5, borderRadius: 23, border: '1px solid rgba(130,150,190,0.45)' }} />
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, borderRadius: 18, border: '1px solid rgba(130,150,190,0.25)' }} />
        <span style={{ fontFamily: SERIF, fontSize: 22, color: '#18243E', fontStyle: 'italic' }}>W</span>
      </div>
      <span style={{ fontSize: 8, letterSpacing: 3, color: 'rgba(200,215,245,0.5)', marginBottom: 4, fontFamily: SERIF }}>Wedding</span>
      <NamesRow groom={groom} bride={bride} color="rgba(200,215,245,0.9)" />
      <TapHint textColor="#C8D8F8" pillBg="rgba(200,215,255,0.18)" visible={tapToOpen && animPhase === 'idle'} />
    </div>
  );
}
function GlassPanel({ side, animPhase }) {
  const tx = animPhase === 'doorsOut' ? (side === 'left' ? '-100%' : '100%') : '0%';
  return (
    <div style={{
      position: 'absolute', top: 0, [side]: 0,
      width: '50%', height: '100%',
      backgroundColor: '#18243E',
      borderRight: side === 'left' ? '1px solid rgba(200,215,255,0.4)' : undefined,
      borderLeft: side === 'right' ? '1px solid rgba(200,215,255,0.4)' : undefined,
      overflow: 'hidden',
      transform: `translateX(${tx})`,
      transition: 'transform 900ms cubic-bezier(0.77,0,0.18,1)',
    }}>
      {/* 창문 그리드 */}
      <div style={{ position: 'absolute', top: 18, left: 7, right: 7, bottom: 18, border: '1px solid rgba(200,215,255,0.28)' }}>
        <div style={{ position: 'absolute', top: 6, bottom: 6, left: '50%', width: 1, backgroundColor: 'rgba(200,215,255,0.18)' }} />
        <div style={{ position: 'absolute', left: 6, right: 6, top: '45%', height: 1, backgroundColor: 'rgba(200,215,255,0.18)' }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 5. ArtDeco (골드 럭셔리) — 딥 퍼플 · 골드 다이아몬드 씰
// ══════════════════════════════════════════════════════
function ArtDecoSeal({ groom, bride, tapToOpen, animPhase, sealScale = 1 }) {
  const sealOut = animPhase === 'sealOut' || animPhase === 'doorsOut';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: sealOut ? 0 : 1, transform: `scale(${sealOut ? 0.92 * sealScale : sealScale})`,
      transition: 'opacity 600ms ease, transform 600ms ease',
      pointerEvents: 'none',
    }}>
      <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
        <div style={{
          width: 46, height: 46, backgroundColor: '#D4AF37',
          transform: 'rotate(45deg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 4px 16px rgba(212,175,55,0.45)',
        }}>
          <div style={{ position: 'absolute', top: 5, left: 5, right: 5, bottom: 5, border: '1px solid rgba(255,255,255,0.3)' }} />
          <span style={{ transform: 'rotate(-45deg)', fontFamily: SERIF, fontSize: 20, color: '#0E0C18', fontStyle: 'italic' }}>W</span>
        </div>
      </div>
      <span style={{ fontSize: 8, letterSpacing: 3, color: 'rgba(212,175,55,0.55)', marginBottom: 4, fontFamily: SERIF }}>Wedding</span>
      <NamesRow groom={groom} bride={bride} color="rgba(212,175,55,0.9)" />
      <TapHint textColor="#D4AF37" pillBg="rgba(212,175,55,0.18)" visible={tapToOpen && animPhase === 'idle'} />
    </div>
  );
}
function ArtDecoPanel({ side, animPhase }) {
  const tx = animPhase === 'doorsOut' ? (side === 'left' ? '-100%' : '100%') : '0%';
  const bc = 'rgba(212,175,55,0.65)';
  return (
    <div style={{
      position: 'absolute', top: 0, [side]: 0,
      width: '50%', height: '100%',
      backgroundColor: '#0E0C18',
      borderRight: side === 'left' ? `1px solid ${bc}` : undefined,
      borderLeft: side === 'right' ? `1px solid ${bc}` : undefined,
      overflow: 'hidden',
      transform: `translateX(${tx})`,
      transition: 'transform 900ms cubic-bezier(0.77,0,0.18,1)',
    }}>
      {/* 아르데코 코너 브라켓 */}
      <div style={{ position: 'absolute', top: 18, left: 7, right: 7, bottom: 18, border: '1px solid rgba(212,175,55,0.38)' }}>
        <div style={{ position: 'absolute', top: 5, left: 5, width: 12, height: 12, borderTop: `1.5px solid ${bc}`, borderLeft: `1.5px solid ${bc}` }} />
        <div style={{ position: 'absolute', top: 5, right: 5, width: 12, height: 12, borderTop: `1.5px solid ${bc}`, borderRight: `1.5px solid ${bc}` }} />
        <div style={{ position: 'absolute', bottom: 5, left: 5, width: 12, height: 12, borderBottom: `1.5px solid ${bc}`, borderLeft: `1.5px solid ${bc}` }} />
        <div style={{ position: 'absolute', bottom: 5, right: 5, width: 12, height: 12, borderBottom: `1.5px solid ${bc}`, borderRight: `1.5px solid ${bc}` }} />
        <div style={{ position: 'absolute', top: '25%', bottom: '25%', left: '50%', width: 1, backgroundColor: 'rgba(212,175,55,0.22)' }} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 6. Garden (포레스트) — 다크 그린 패널 · 크리미 오벌 씰
// ══════════════════════════════════════════════════════
function GardenSeal({ groom, bride, tapToOpen, animPhase, sealScale = 1 }) {
  const sealOut = animPhase === 'sealOut' || animPhase === 'doorsOut';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: sealOut ? 0 : 1, transform: `scale(${sealOut ? 0.92 * sealScale : sealScale})`,
      transition: 'opacity 600ms ease, transform 600ms ease',
      pointerEvents: 'none',
    }}>
      {/* 크리미 오벌 씰 */}
      <div style={{
        width: 68, height: 48, borderRadius: 24, backgroundColor: '#F0EDE6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 6, position: 'relative',
        boxShadow: '0 4px 16px rgba(74,106,64,0.35)',
      }}>
        <div style={{ position: 'absolute', top: 4, left: 6, right: 6, bottom: 4, borderRadius: 20, border: '1px solid rgba(160,190,148,0.45)' }} />
        <span style={{ fontFamily: SERIF, fontSize: 20, color: '#283525', fontStyle: 'italic' }}>W</span>
      </div>
      <span style={{ fontSize: 8, letterSpacing: 3, color: 'rgba(200,225,188,0.55)', marginBottom: 4, fontFamily: SERIF }}>Wedding</span>
      <NamesRow groom={groom} bride={bride} color="rgba(200,225,188,0.92)" />
      <TapHint textColor="#C0E0B0" pillBg="rgba(185,215,170,0.2)" visible={tapToOpen && animPhase === 'idle'} />
    </div>
  );
}
function GardenPanel({ side, animPhase }) {
  const tx = animPhase === 'doorsOut' ? (side === 'left' ? '-100%' : '100%') : '0%';
  const bc = 'rgba(185,210,170,0.6)';
  return (
    <div style={{
      position: 'absolute', top: 0, [side]: 0,
      width: '50%', height: '100%',
      backgroundColor: '#283525',
      borderRight: side === 'left' ? '1px solid rgba(190,215,175,0.55)' : undefined,
      borderLeft: side === 'right' ? '1px solid rgba(190,215,175,0.55)' : undefined,
      overflow: 'hidden',
      transform: `translateX(${tx})`,
      transition: 'transform 900ms cubic-bezier(0.77,0,0.18,1)',
    }}>
      {/* 모서리 브라켓 + 중앙 원 */}
      <div style={{ position: 'absolute', top: 18, left: 7, right: 7, bottom: 18,
        border: '1px solid rgba(185,210,170,0.32)', borderRadius: 4, overflow: 'visible' }}>
        <div style={{ position: 'absolute', top: -1, left: -1, width: 10, height: 10, borderTop: `2px solid ${bc}`, borderLeft: `2px solid ${bc}`, borderTopLeftRadius: 3 }} />
        <div style={{ position: 'absolute', top: -1, right: -1, width: 10, height: 10, borderTop: `2px solid ${bc}`, borderRight: `2px solid ${bc}`, borderTopRightRadius: 3 }} />
        <div style={{ position: 'absolute', bottom: -1, left: -1, width: 10, height: 10, borderBottom: `2px solid ${bc}`, borderLeft: `2px solid ${bc}`, borderBottomLeftRadius: 3 }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderBottom: `2px solid ${bc}`, borderRight: `2px solid ${bc}`, borderBottomRightRadius: 3 }} />
        <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', border: '1px solid rgba(185,210,170,0.5)' }} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 7. Curtain — 하얀 시폰 커튼 · 씰 없음
// ══════════════════════════════════════════════════════
const CURTAIN_FOLDS = [
  { pct: '8%',  w: '3%', op: 0.07 }, { pct: '18%', w: '4%', op: 0.05 },
  { pct: '30%', w: '3%', op: 0.08 }, { pct: '44%', w: '4%', op: 0.06 },
  { pct: '57%', w: '3%', op: 0.07 }, { pct: '68%', w: '4%', op: 0.05 },
  { pct: '80%', w: '3%', op: 0.07 }, { pct: '90%', w: '3%', op: 0.05 },
];
function CurtainSeal({ groom, bride, tapToOpen, animPhase, sealScale = 1 }) {
  const sealOut = animPhase === 'sealOut' || animPhase === 'doorsOut';
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: sealOut ? 0 : 1, transform: `scale(${sealOut ? 0.92 * sealScale : sealScale})`,
      transition: 'opacity 600ms ease, transform 600ms ease',
      pointerEvents: 'none',
    }}>
      <span style={{ fontSize: 26, color: 'rgba(70,70,95,0.72)', fontStyle: 'italic',
        fontFamily: SERIF, fontWeight: 300, letterSpacing: 2, marginBottom: 8 }}>Wedding</span>
      <div style={{ width: 48, height: 1, backgroundColor: 'rgba(100,105,130,0.2)', marginBottom: 8 }} />
      <NamesRow groom={groom} bride={bride} color="rgba(70,70,95,0.65)" />
      <TapHint textColor="rgba(70,70,95,0.85)" pillBg="rgba(70,70,95,0.1)" visible={tapToOpen && animPhase === 'idle'} />
    </div>
  );
}
function CurtainPanel({ side, animPhase }) {
  const tx = animPhase === 'doorsOut' ? (side === 'left' ? '-100%' : '100%') : '0%';
  return (
    <div style={{
      position: 'absolute', top: 0, [side]: 0,
      width: '50%', height: '100%',
      backgroundColor: '#FAFAFE',
      borderRight: side === 'left' ? '1px solid rgba(210,212,220,0.5)' : undefined,
      borderLeft: side === 'right' ? '1px solid rgba(210,212,220,0.5)' : undefined,
      overflow: 'hidden',
      transform: `translateX(${tx})`,
      transition: 'transform 900ms cubic-bezier(0.77,0,0.18,1)',
    }}>
      {CURTAIN_FOLDS.map((f, i) => (
        <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: f.pct, width: f.w,
          backgroundColor: `rgba(160,165,175,${f.op})` }} />
      ))}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, backgroundColor: 'rgba(180,183,190,0.12)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, backgroundColor: 'rgba(200,203,210,0.08)' }} />
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 도어 설정 맵
// ══════════════════════════════════════════════════════
const DOOR_MAP = {
  grand:   { PanelComp: GrandPanel,   SealComp: GrandSeal,   sealDelay: 400 },
  classic: { PanelComp: ClassicPanel, SealComp: ClassicSeal, sealDelay: 0   },
  arch:    { PanelComp: ArchPanel,    SealComp: ArchSeal,    sealDelay: 0   },
  glass:   { PanelComp: GlassPanel,   SealComp: GlassSeal,   sealDelay: 0   },
  artdeco: { PanelComp: ArtDecoPanel, SealComp: ArtDecoSeal, sealDelay: 200 },
  garden:  { PanelComp: GardenPanel,  SealComp: GardenSeal,  sealDelay: 0   },
  curtain: { PanelComp: CurtainPanel, SealComp: CurtainSeal, sealDelay: 300 },
};

// ══════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════
export default function WeddingIntroOverlay({
  introId = 'grand',
  tapToOpen = false,
  groomName = '',
  brideName = '',
  onEnd,
}) {
  // animPhase: 'idle' → 'sealOut' → 'doorsOut' → 'done'
  const [animPhase, setAnimPhase] = useState('idle');
  const [sealScale, setSealScale] = useState(1);
  const timerRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1024) setSealScale(2.2);
      else if (w >= 768) setSealScale(1.8);
      else setSealScale(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const doorCfg = DOOR_MAP[introId] || DOOR_MAP.grand;
  const { PanelComp, SealComp, sealDelay } = doorCfg;

  const startOpen = () => {
    setAnimPhase('sealOut');
    timerRef.current = setTimeout(() => {
      setAnimPhase('doorsOut');
      timerRef.current = setTimeout(() => {
        setAnimPhase('done');
        onEnd?.();
      }, 950);
    }, 650 + sealDelay);
  };

  useEffect(() => {
    if (!tapToOpen) {
      timerRef.current = setTimeout(startOpen, 1200);
    }
    return () => clearTimeout(timerRef.current);
  }, []);

  const handleTap = () => {
    if (tapToOpen && animPhase === 'idle') startOpen();
  };

  if (animPhase === 'done') return null;

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 99999, overflow: 'hidden',
        cursor: tapToOpen && animPhase === 'idle' ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <PanelComp side="left"  animPhase={animPhase} />
      <PanelComp side="right" animPhase={animPhase} />
      <SealComp
        groom={groomName} bride={brideName}
        tapToOpen={tapToOpen} animPhase={animPhase}
        sealScale={sealScale}
      />
    </div>
  );
}
