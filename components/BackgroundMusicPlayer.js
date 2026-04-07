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
    if (!filename) return;
    const audio = new Audio(`/music/${filename}`);
    audio.loop = true;
    audio.volume = 0.6;
    audioRef.current = audio;

    // 자동 재생 시도
    const tryAutoPlay = () => {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {
          // 브라우저 정책상 자동재생 차단 시 — 사용자 첫 클릭 때 재시도
          const onFirstInteraction = () => {
            audio.play().then(() => setPlaying(true)).catch(() => {});
            document.removeEventListener('click', onFirstInteraction);
            document.removeEventListener('touchstart', onFirstInteraction);
          };
          document.addEventListener('click', onFirstInteraction);
          document.addEventListener('touchstart', onFirstInteraction);
        });
    };
    tryAutoPlay();

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [filename]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  };

  if (!filename) return null;

  return (
    <button
      onClick={toggle}
      title={playing ? '음악 끄기' : '음악 켜기'}
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9998,
        width: 48,
        height: 48,
        borderRadius: 24,
        border: 'none',
        background: playing ? '#3182F6' : 'rgba(0,0,0,0.55)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.25s ease, transform 0.15s ease',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      {/* SVG 음표 아이콘 — 재생 중: 이중 음표, 정지: 단일 음표 */}
      {playing ? (
        <svg width="20" height="20" viewBox="0 0 512 512" fill="white">
          <path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7l0 72 0 264c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L448 147 192 223.8l0 208.2c0 44.2-43 80-96 80S0 476.2 0 432s43-80 96-80c11.2 0 22 1.6 32 4.6L128 200l0-72c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 384 512" fill="white">
          <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
        </svg>
      )}
    </button>
  );
}
