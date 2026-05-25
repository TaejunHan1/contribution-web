import { useEffect } from 'react';

const ASSET = '/studio/elements';
const PHOTO_FRAME_SOURCES = {
  background2: `${ASSET}/background2.png`,
  background3: `${ASSET}/background3.png`,
  background4: `${ASSET}/background4.png`,
  background5: `${ASSET}/background5.png`,
  background6: `${ASSET}/background6.png`,
  background7: `${ASSET}/background7.png`,
  background8: `${ASSET}/background8.png`,
  background9: `${ASSET}/background9.png`,
  background10: `${ASSET}/background10.png`,
  background11: `${ASSET}/background11.png`,
  background12: `${ASSET}/background12.png`,
  background13: `${ASSET}/background13.png`,
  backround4: `${ASSET}/backround4.png`,
};

const TARGET_SELECTORS = [
  'div[class*="heroInner"]',
  'div[class*="coverPhotoWrap"]',
  'button[class*="mainPhotoButton"]',
  'div[class*="heroImageContainer"]',
  'div[class*="mainPhotoContainer"]',
  'div[class*="heroPhotoContainer"]',
  'div[class*="heroPhotoWrap"]',
  'div[class*="mainImageContainer"]',
  'div[class*="photoFrame"]',
];

const parseAdditionalInfo = eventData => {
  const additionalInfo = eventData?.additional_info || eventData?.additionalInfo || {};
  if (typeof additionalInfo !== 'string') return additionalInfo || {};

  try {
    return JSON.parse(additionalInfo);
  } catch {
    return {};
  }
};

const getPhotoFrame = eventData => {
  const additionalInfo = parseAdditionalInfo(eventData);
  const frame = additionalInfo.photo_frame || additionalInfo.photoFrame || eventData?.photo_frame || eventData?.photoFrame;
  const id = frame?.id || frame?.key;
  if (!id || !PHOTO_FRAME_SOURCES[id]) return null;

  return {
    id,
    src: PHOTO_FRAME_SOURCES[id],
    scale: Number(frame.scale) || 0.78,
    offsetX: Number(frame.offsetX) || 0,
    offsetY: Number(frame.offsetY) || 0,
  };
};

const pickFrameTarget = () => {
  const candidates = TARGET_SELECTORS
    .flatMap(selector => Array.from(document.querySelectorAll(selector)))
    .filter(element => element instanceof HTMLElement)
    .filter(element => !element.closest('[data-jeongdam-image-viewer="true"]'))
    .map(element => {
      const rect = element.getBoundingClientRect();
      const area = rect.width * rect.height;
      const visible =
        rect.width >= 160 &&
        rect.height >= 160 &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight * 1.25;

      return {
        element,
        rect,
        area,
        score: (visible ? 100000000 : 0) + area - Math.max(rect.top, 0) * 120,
      };
    })
    .filter(candidate => candidate.area > 0);

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.element || null;
};

const applyPhotoFrame = frame => {
  const target = pickFrameTarget();
  if (!target) return null;

  target.querySelectorAll('[data-jeongdam-photo-frame="true"]').forEach(node => node.remove());

  const previousPosition = target.style.position;
  const computedPosition = window.getComputedStyle(target).position;
  if (computedPosition === 'static') {
    target.style.position = 'relative';
  }

  const layer = document.createElement('div');
  layer.setAttribute('data-jeongdam-photo-frame', 'true');
  layer.style.position = 'absolute';
  layer.style.inset = '0';
  layer.style.zIndex = '1000';
  layer.style.display = 'flex';
  layer.style.alignItems = 'center';
  layer.style.justifyContent = 'center';
  layer.style.pointerEvents = 'none';

  const image = document.createElement('img');
  image.src = frame.src;
  image.alt = '';
  image.draggable = false;
  image.style.width = `${frame.scale * 100}%`;
  image.style.height = `${frame.scale * 100}%`;
  image.style.maxWidth = 'none';
  image.style.objectFit = 'contain';
  image.style.transform = `translate(${frame.offsetX}px, ${frame.offsetY}px)`;
  image.style.pointerEvents = 'none';
  image.style.userSelect = 'none';
  image.style.webkitUserDrag = 'none';

  layer.appendChild(image);
  target.appendChild(layer);

  return () => {
    layer.remove();
    if (computedPosition === 'static') {
      target.style.position = previousPosition;
    }
  };
};

export default function PhotoFramePortal({ eventData = {}, disabled = false }) {
  const frame = disabled ? null : getPhotoFrame(eventData);
  const frameKey = frame
    ? `${frame.id}:${frame.scale}:${frame.offsetX}:${frame.offsetY}`
    : '';

  useEffect(() => {
    if (!frame) return undefined;

    let cleanup = null;
    let timeoutId = null;
    let attempts = 0;

    const mount = () => {
      cleanup?.();
      cleanup = applyPhotoFrame(frame);
      attempts += 1;
      if (!cleanup && attempts < 12) {
        timeoutId = window.setTimeout(mount, 120);
      }
    };

    timeoutId = window.setTimeout(mount, 0);

    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-jeongdam-photo-frame="true"]')) return;
      mount();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      observer.disconnect();
      cleanup?.();
      document.querySelectorAll('[data-jeongdam-photo-frame="true"]').forEach(node => node.remove());
    };
  }, [frameKey]);

  return null;
}
