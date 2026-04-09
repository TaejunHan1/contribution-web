// components/BackgroundMusicPlayer.js
import { useState, useEffect, useRef } from 'react';

const TRACK_MAP = {
  track1:  'hitslab-wedding-wedding-trailer-music-269139.mp3',
  track2:  'krasnoshchok-wedding-romantic-love-music-409293.mp3',
  track3:  'paulyudin-wedding-485932.mp3',
  track4:  'paulyudin-wedding-music-valentines-day-182505.mp3',
  track5:  'prettyjohn1-wedding-487335.mp3',
  track6:  'starostin-wedding-wedding-music-345462.mp3',
  track7:  'the_mountain-wedding-455512.mp3',
  track8:  'the_mountain-wedding-487025.mp3',
  track9:  'The_Velvet_Punch.mp3',
  track10: 'u_3m10w313je-wedding-joy-189888.mp3',
  track11: 'viacheslavstarostin-romantic-wedding-background-music-357203.mp3',
};

export default function BackgroundMusicPlayer({ trackId }) {
  const filename = TRACK_MAP[trackId];
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !filename) return;

    audio.volume = 0.6;
    audio.loop = true;

    // 전역 함수로 등록 → WelcomeChoiceModal 버튼 클릭 시 직접 호출 (확실한 유저 제스처)
    window.__gyeongjo_play = () => {
      if (!audioRef.current) return;
      const a = audioRef.current;
      a.muted = false;
      if (a.paused) {
        a.play().then(() => setPlaying(true)).catch(() => {});
      } else {
        setPlaying(true);
      }
      delete window.__gyeongjo_play;
    };

    // 1) 소리 있는 재생 먼저 시도 (링크 클릭 진입 시 허용됨)
    audio.muted = false;
    audio.play()
      .then(() => {
        setPlaying(true);
        delete window.__gyeongjo_play; // 이미 재생 중이면 전역 함수 불필요
      })
      .catch(() => {
        // 2) 차단됨 → muted로 미리 로딩만
        audio.muted = true;
        audio.play().catch(() => {});
      });

    return () => { delete window.__gyeongjo_play; };
  }, [filename]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.muted = false;
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  if (!filename) return null;

  return (
    <>
      <audio ref={audioRef} src={`/music/${filename}`} style={{ display: 'none' }} />

      <style>{`
        @keyframes bar1 { 0%,100%{height:3px} 50%{height:9px} }
        @keyframes bar2 { 0%,100%{height:7px} 40%{height:2px} 70%{height:10px} }
        @keyframes bar3 { 0%,100%{height:5px} 30%{height:10px} 65%{height:3px} }
        @keyframes bar4 { 0%,100%{height:4px} 45%{height:8px} 80%{height:2px} }
        .mbtn-wrap { position:fixed; top:16px; right:16px; z-index:999999; }
        .mbtn {
          width:40px; height:40px; border-radius:50%; border:none; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          background:rgba(255,255,255,0.92);
          box-shadow:0 3px 14px rgba(0,0,0,0.18);
          backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
          transition:transform 0.18s ease, box-shadow 0.2s ease;
          position:relative;
        }
        .mbtn:hover { transform:scale(1.1); box-shadow:0 5px 20px rgba(0,0,0,0.22); }
        .mbtn:active { transform:scale(0.95); }
        .mbtn-ring {
          position:absolute; inset:0; border-radius:50%;
          border:2px solid rgba(49,130,246,0.4);
          animation:mbtn-pulse 1.6s ease-out infinite;
          pointer-events:none;
        }
        @keyframes mbtn-pulse { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.6);opacity:0} }
        .eq { display:flex; align-items:flex-end; gap:2px; height:12px; }
        .eq span { width:3px; border-radius:1.5px; background:#555; transition:background .25s; }
        .mbtn.on .eq span { background:#3182F6; }
        .b1 { animation:bar1 0.9s ease-in-out infinite; }
        .b2 { animation:bar2 0.75s ease-in-out infinite; }
        .b3 { animation:bar3 0.85s ease-in-out infinite; }
        .b4 { animation:bar4 0.7s ease-in-out infinite; }
        .paused { animation-play-state:paused !important; height:4px !important; }
      `}</style>

      <div className="mbtn-wrap">
        <button className={`mbtn${playing ? ' on' : ''}`} onClick={toggle} title={playing ? '음악 끄기' : '음악 켜기'}>
          {playing && <span className="mbtn-ring" />}
          <span className="eq">
            <span className={`b1${playing ? '' : ' paused'}`} />
            <span className={`b2${playing ? '' : ' paused'}`} />
            <span className={`b3${playing ? '' : ' paused'}`} />
            <span className={`b4${playing ? '' : ' paused'}`} />
          </span>
        </button>
      </div>
    </>
  );
}
