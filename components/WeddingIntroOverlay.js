// components/WeddingIntroOverlay.js
// 앱의 WeddingIntroSelectModal 도어 인트로를 웹 CSS로 1:1 포팅
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  KOREAN_MARRIAGE_FILL_PATHS,
  KOREAN_MARRIAGE_FILL_TRANSLATE,
  KOREAN_MARRIAGE_MASK_STROKE_GROUPS,
  KOREAN_MARRIAGE_MASK_TRANSLATE,
  KOREAN_MARRIAGE_SCRIPT_COLOR,
  KOREAN_MARRIAGE_SCRIPT_VIEWBOX,
} from './introPaths/koreanMarriageScriptPaths';
import {
  WELCOME_WEDDING_DOT_COLOR,
  WELCOME_WEDDING_DOT_FILL,
  WELCOME_WEDDING_DOT_STROKE,
  WELCOME_WEDDING_SCRIPT_COLOR,
  WELCOME_WEDDING_SCRIPT_VIEWBOX,
  WELCOME_WEDDING_STROKE_PATHS,
} from './introPaths/welcomeWeddingScriptPaths';
import {
  INVITE_GUESTS_FILL_PATHS,
  INVITE_GUESTS_FILL_TRANSLATE,
  INVITE_GUESTS_MASK_STROKE_GROUPS,
  INVITE_GUESTS_MASK_TRANSLATE,
  INVITE_GUESTS_SCRIPT_COLOR,
  INVITE_GUESTS_SCRIPT_VIEWBOX,
} from './introPaths/inviteGuestsScriptPaths';

const SERIF = '"Playfair Display", Georgia, "Noto Serif KR", serif';
const IntroOptionsContext = createContext({ isLargeTapHint: false });
const TEXT_INTRO_IDS = new Set([
  'happily-script',
  'korean-marriage-script',
  'welcome-wedding-script',
  'invite-guests-script',
]);
const TEXT_INTRO_AUTO_CLOSE_DELAY = 1050;

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
  const { isLargeTapHint } = useContext(IntroOptionsContext);
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
      padding: isLargeTapHint ? '10px 18px' : '6px 14px',
      backgroundColor: pillBg,
      borderRadius: isLargeTapHint ? 999 : 20,
      border: `${isLargeTapHint ? 1 : 0.5}px solid ${textColor}`,
      opacity: pulse ? 0.25 : 1,
      transform: `scale(${pulse ? 0.93 : 1})`,
      transition: 'opacity 850ms ease, transform 850ms ease',
      boxShadow: isLargeTapHint ? '0 12px 28px rgba(0,0,0,0.18)' : undefined,
    }}>
      <span style={{
        fontSize: isLargeTapHint ? 14 : 11,
        letterSpacing: isLargeTapHint ? 2.7 : 2.5,
        color: textColor,
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

function useLockBodyScroll(active) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [active]);
}

function TextIntroTapHint({ ready }) {
  if (!ready) return null;
  return (
    <div className="textIntroHintWrap" aria-hidden="true">
      <div className="textIntroTapMark">
        <span className="textIntroTapRing" />
        <span className="textIntroTapDot" />
      </div>
      <div className="textIntroHintGuide">화면을 터치해 주세요</div>
      <div className="textIntroHintPill">초대장 열기</div>
    </div>
  );
}

function MaskedStrokeFillText({
  viewBox,
  color,
  fillPaths,
  fillTranslate,
  strokeGroups,
  maskTranslate,
  widthClass,
  durationPerStroke = 42,
  minStrokeDuration = 18,
  maxStrokeDuration = 58,
  strokeWidth = 7.5,
  dashLength = 900,
  maskId,
}) {
  let cursor = 0;
  return (
    <svg
      className={`textIntroSvg ${widthClass}`}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          x="-2000"
          y="-2000"
          width="4000"
          height="4000"
        >
          <rect x="-2000" y="-2000" width="4000" height="4000" fill="black" />
          <g transform={`translate(${maskTranslate.x} ${maskTranslate.y})`}>
            {strokeGroups.map((group, groupIndex) => (
              <g key={groupIndex}>
                {group.map((d, strokeIndex) => {
                  const duration = Math.min(
                    maxStrokeDuration,
                    Math.max(minStrokeDuration, d.length * durationPerStroke * 0.01)
                  );
                  const delay = cursor;
                  cursor += duration;
                  return (
                    <path
                      key={`${groupIndex}-${strokeIndex}`}
                      d={d}
                      fill="none"
                      stroke="white"
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={dashLength}
                      strokeDashoffset={dashLength}
                      style={{
                        animation: `textIntroDraw ${duration}ms linear ${delay}ms forwards`,
                      }}
                    />
                  );
                })}
              </g>
            ))}
          </g>
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <g transform={`translate(${fillTranslate.x} ${fillTranslate.y})`}>
          {fillPaths.map((d, index) => (
            <path key={index} d={d} fill={color} />
          ))}
        </g>
      </g>
    </svg>
  );
}

function WelcomeStrokeText() {
  let delay = 0;
  return (
    <svg
      className="textIntroSvg textIntroWelcomeSvg"
      viewBox={WELCOME_WEDDING_SCRIPT_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {WELCOME_WEDDING_STROKE_PATHS.map((item, index) => {
        const duration = Math.min(1500, Math.max(640, item.len * 0.92));
        const currentDelay = delay;
        delay += 360;
        return (
          <path
            key={index}
            d={item.d}
            transform={`translate(${item.tx} ${item.ty})`}
            fill="none"
            stroke={WELCOME_WEDDING_SCRIPT_COLOR}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={item.len}
            strokeDashoffset={item.len}
            style={{
              animation: `textIntroDraw ${duration}ms cubic-bezier(.42,0,.58,1) ${currentDelay}ms forwards`,
            }}
          />
        );
      })}
      <path
        d={WELCOME_WEDDING_DOT_FILL.d}
        transform={`translate(${WELCOME_WEDDING_DOT_FILL.tx} ${WELCOME_WEDDING_DOT_FILL.ty})`}
        fill={WELCOME_WEDDING_DOT_COLOR}
        opacity="0"
        style={{
          animation: `textIntroDot 160ms ease ${delay + 120}ms forwards`,
        }}
      />
      <path
        d={WELCOME_WEDDING_DOT_STROKE.d}
        transform={`translate(${WELCOME_WEDDING_DOT_STROKE.tx} ${WELCOME_WEDDING_DOT_STROKE.ty})`}
        fill="none"
        stroke={WELCOME_WEDDING_SCRIPT_COLOR}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={WELCOME_WEDDING_DOT_STROKE.len}
        strokeDashoffset={WELCOME_WEDDING_DOT_STROKE.len}
        style={{
          animation: `textIntroDraw 180ms ease ${delay}ms forwards`,
        }}
      />
    </svg>
  );
}

function HappilyText() {
  return (
    <div className="textIntroHappilyBlock" aria-hidden="true">
      <div className="textIntroHappilyLine textIntroHappilyOne">Happily</div>
      <div className="textIntroHappilyLine textIntroHappilyTwo">ever after</div>
    </div>
  );
}

function InviteGuestsText({ maskId }) {
  return (
    <MaskedStrokeFillText
      viewBox={INVITE_GUESTS_SCRIPT_VIEWBOX}
      color={INVITE_GUESTS_SCRIPT_COLOR}
      fillPaths={INVITE_GUESTS_FILL_PATHS}
      fillTranslate={INVITE_GUESTS_FILL_TRANSLATE}
      strokeGroups={INVITE_GUESTS_MASK_STROKE_GROUPS}
      maskTranslate={INVITE_GUESTS_MASK_TRANSLATE}
      widthClass="textIntroInviteSvg"
      durationPerStroke={7}
      minStrokeDuration={16}
      maxStrokeDuration={46}
      strokeWidth={7.5}
      maskId={maskId}
    />
  );
}

function TextIntroOverlay({ introId, tapToOpen, onEnd }) {
  const [ready, setReady] = useState(false);
  const [closing, setClosing] = useState(false);
  const [done, setDone] = useState(false);
  const closeTimerRef = useRef(null);
  const doneTimerRef = useRef(null);
  const readyRef = useRef(false);
  const closingRef = useRef(false);
  const doneRef = useRef(false);
  const maskIdRef = useRef(`textIntroMask-${Math.random().toString(36).slice(2)}`);
  const readyDelay =
    introId === 'welcome-wedding-script'
      ? 4300
      : introId === 'happily-script'
        ? 4000
        : introId === 'invite-guests-script'
          ? 3400
          : 3200;

  useLockBodyScroll(!done);

  const finishIntro = () => {
    if (closingRef.current || doneRef.current) return;
    closingRef.current = true;
    setClosing(true);
    doneTimerRef.current = setTimeout(() => {
      doneRef.current = true;
      setDone(true);
      onEnd?.();
    }, 520);
  };

  const close = () => {
    if (!readyRef.current) return;
    finishIntro();
  };

  useEffect(() => {
    const readyTimer = setTimeout(() => {
      readyRef.current = true;
      setReady(true);
      if (!tapToOpen) {
        closeTimerRef.current = setTimeout(finishIntro, TEXT_INTRO_AUTO_CLOSE_DELAY);
      }
    }, readyDelay);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(closeTimerRef.current);
      clearTimeout(doneTimerRef.current);
    };
  }, []);

  if (done) return null;

  const content =
    introId === 'happily-script' ? (
      <HappilyText />
    ) : introId === 'korean-marriage-script' ? (
      <MaskedStrokeFillText
        viewBox={KOREAN_MARRIAGE_SCRIPT_VIEWBOX}
        color={KOREAN_MARRIAGE_SCRIPT_COLOR}
        fillPaths={KOREAN_MARRIAGE_FILL_PATHS}
        fillTranslate={KOREAN_MARRIAGE_FILL_TRANSLATE}
        strokeGroups={KOREAN_MARRIAGE_MASK_STROKE_GROUPS}
        maskTranslate={KOREAN_MARRIAGE_MASK_TRANSLATE}
        widthClass="textIntroKoreanSvg"
        durationPerStroke={9.5}
        minStrokeDuration={20}
        maxStrokeDuration={56}
        maskId={`${maskIdRef.current}-korean`}
      />
    ) : introId === 'welcome-wedding-script' ? (
      <WelcomeStrokeText />
    ) : (
      <InviteGuestsText maskId={`${maskIdRef.current}-invite`} />
    );

  return (
    <div
      className={`textIntroOverlay ${closing ? 'textIntroClosing' : ''}`}
      onClick={ready ? close : undefined}
      role={ready ? 'button' : undefined}
      tabIndex={ready ? 0 : undefined}
      onKeyDown={event => {
        if (ready && (event.key === 'Enter' || event.key === ' ')) close();
      }}
    >
      <div className="textIntroBackdrop" />
      <div className="textIntroStage">{content}</div>
      {tapToOpen && <TextIntroTapHint ready={ready} />}
      <style jsx>{`
        .textIntroOverlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          overflow: hidden;
          user-select: none;
          cursor: ${ready ? 'pointer' : 'default'};
          touch-action: none;
        }
        .textIntroBackdrop {
          position: absolute;
          inset: 0;
          background: #000;
          opacity: 0;
          animation: textIntroDimIn 520ms ease forwards;
        }
        .textIntroStage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateY(-34px);
          opacity: 0;
          animation: textIntroContentIn 680ms ease 80ms forwards;
          pointer-events: none;
        }
        .textIntroClosing .textIntroBackdrop {
          animation: textIntroDimOut 520ms ease forwards;
        }
        .textIntroClosing .textIntroStage {
          animation: textIntroContentOut 420ms ease forwards;
        }
        .textIntroSvg {
          display: block;
          overflow: visible;
          filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.16));
        }
        .textIntroKoreanSvg {
          width: min(70vw, 430px);
          max-width: calc(100vw - 48px);
        }
        .textIntroWelcomeSvg {
          width: min(82vw, 560px);
          max-width: calc(100vw - 40px);
        }
        .textIntroInviteSvg {
          width: min(74vw, 470px);
          max-width: calc(100vw - 48px);
        }
        .textIntroHappilyBlock {
          width: min(94vw, 760px);
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: rotate(-2deg);
        }
        .textIntroHappilyLine {
          width: 100%;
          text-align: center;
          color: #d779d8;
          font-family: AAutoSignature, "Snell Roundhand", "Apple Chancery", cursive;
          font-size: clamp(58px, 14.5vw, 132px);
          line-height: 0.92;
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
          clip-path: inset(0 100% 0 0);
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.18);
        }
        .textIntroHappilyOne {
          animation: textIntroRevealLine 1700ms cubic-bezier(.2,.74,.2,1) 760ms forwards;
        }
        .textIntroHappilyTwo {
          margin-top: clamp(-22px, -2vw, -10px);
          animation: textIntroRevealLine 2100ms cubic-bezier(.2,.74,.2,1) 2550ms forwards;
        }
        @media (max-width: 430px) {
          .textIntroHappilyLine {
            font-size: clamp(48px, 15.4vw, 72px);
          }
          .textIntroKoreanSvg {
            width: calc(100vw - 44px);
          }
          .textIntroInviteSvg {
            width: calc(100vw - 34px);
          }
          .textIntroWelcomeSvg {
            width: calc(100vw - 24px);
          }
        }
      `}</style>
      <style jsx global>{`
        @keyframes textIntroDimIn {
          from { opacity: 0; }
          to { opacity: 0.58; }
        }
        @keyframes textIntroDimOut {
          from { opacity: 0.58; }
          to { opacity: 0; }
        }
        @keyframes textIntroContentIn {
          from { opacity: 0; transform: translateY(-24px); }
          to { opacity: 1; transform: translateY(-34px); }
        }
        @keyframes textIntroContentOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes textIntroDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes textIntroDot {
          to { opacity: 1; }
        }
        @keyframes textIntroRevealLine {
          to { clip-path: inset(0 0 0 0); }
        }
        .textIntroClosing .textIntroHintWrap {
          animation: textIntroContentOut 420ms ease forwards;
        }
        .textIntroHintWrap {
          position: fixed;
          left: 50%;
          bottom: max(62px, calc(env(safe-area-inset-bottom) + 44px));
          z-index: 100000;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: min(240px, calc(100vw - 56px));
          opacity: 0;
          pointer-events: none;
          transform: translateX(-50%);
          animation: textIntroHintFloat 1240ms ease-in-out infinite;
        }
        .textIntroTapMark {
          position: relative;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          margin-bottom: 9px;
        }
        .textIntroTapRing {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          border: 1.5px solid rgba(255, 255, 255, 0.74);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.14);
        }
        .textIntroTapDot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #d779d8;
          box-shadow: 0 0 12px rgba(215, 121, 216, 0.95);
        }
        .textIntroHintGuide {
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.92);
          font-size: 12px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: 0.4px;
          text-align: center;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
          white-space: nowrap;
        }
        .textIntroHintPill {
          min-width: 118px;
          padding: 10px 22px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.42);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: 1.2px;
          text-align: center;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.32);
          backdrop-filter: blur(8px);
        }
        @keyframes textIntroHintPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.38; transform: scale(0.96); }
        }
        @keyframes textIntroHintFloat {
          0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          50% { opacity: 0.42; transform: translateX(-50%) translateY(4px) scale(0.96); }
        }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════
export default function WeddingIntroOverlay({
  introId = 'grand',
  tapToOpen = false,
  groomName = '',
  brideName = '',
  isLargeTapHint = false,
  onEnd,
}) {
  if (TEXT_INTRO_IDS.has(introId)) {
    const textIntroTapToOpen = true;

    return (
      <TextIntroOverlay
        introId={introId}
        tapToOpen={textIntroTapToOpen}
        onEnd={onEnd}
      />
    );
  }

  return (
    <DoorIntroOverlay
      introId={introId}
      tapToOpen={tapToOpen}
      groomName={groomName}
      brideName={brideName}
      isLargeTapHint={isLargeTapHint}
      onEnd={onEnd}
    />
  );
}

function DoorIntroOverlay({
  introId = 'grand',
  tapToOpen = false,
  groomName = '',
  brideName = '',
  isLargeTapHint = false,
  onEnd,
}) {
  // animPhase: 'idle' → 'sealOut' → 'doorsOut' → 'done'
  const [animPhase, setAnimPhase] = useState('idle');
  const [sealScale, setSealScale] = useState(1);
  const timerRef = useRef(null);

  useLockBodyScroll(animPhase !== 'done');

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
    <IntroOptionsContext.Provider value={{ isLargeTapHint }}>
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
    </IntroOptionsContext.Provider>
  );
}
