import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public', 'landing', 'main-redesign');
const gyeongjoHanjiCover =
  '/Users/admin/Documents/GitHub/GyeongjoApp/assets/event-card-covers/cover-hanji-gold.png';

const fontFamily =
  'Apple SD Gothic Neo, Pretendard, Noto Sans KR, Arial, sans-serif';
const blue = '#3182f6';
const ink = '#191f28';
const muted = '#6b7684';

const source = fileName => path.join(out, fileName);
const asset = (...parts) => path.join(root, 'public', ...parts);
const svgBuffer = svg => Buffer.from(svg);

const esc = value =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const textLines = (
  lines,
  { x, y, size, fill, weight = 700, anchor = 'middle', gap = 1.28 }
) =>
  lines
    .map(
      (lineText, index) => `
        <text x="${x}" y="${y + index * size * gap}" text-anchor="${anchor}"
          font-size="${size}" font-weight="${weight}" font-family="${fontFamily}"
          fill="${fill}">${esc(lineText)}</text>`
    )
    .join('');

const writeSvgPng = async (name, svg, width, height) => {
  await sharp(svgBuffer(svg), { density: 2 })
    .resize(width, height)
    .png()
    .toFile(source(name));
};

const roundedPhoto = async (
  fileName,
  width,
  height,
  radius,
  position = 'center'
) => {
  const img = await sharp(source(fileName))
    .resize(width, height, { fit: 'cover', position })
    .ensureAlpha()
    .toBuffer();
  const mask = svgBuffer(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" rx="${radius}" fill="#fff"/>
    </svg>
  `);
  return sharp(img).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
};

const weddingPortraitCrop = async () => {
  const width = 760;
  const height = 560;
  const resized = await sharp(source('wedding-couple-source.png'))
    .resize({ width })
    .ensureAlpha()
    .toBuffer();
  const mask = svgBuffer(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" rx="44" fill="#fff"/>
    </svg>
  `);
  return sharp(resized)
    .extract({ left: 0, top: 260, width, height })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
};

async function ensureSourceAssets() {
  if (existsSync(gyeongjoHanjiCover)) {
    await copyFile(gyeongjoHanjiCover, source('wedding-link-cover-source.png'));
  }
}

async function createWeddingLinkCover() {
  await sharp(source('wedding-link-cover-source.png'))
    .resize(640, 370, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(source('wedding-link-cover.png'));
}

async function createFuneralLinkCover() {
  await writeSvgPng(
    'funeral-link-cover.png',
    `
      <svg width="640" height="390" viewBox="0 0 640 390" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="paper" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset="1" stop-color="#f3f5f8"/>
          </linearGradient>
          <linearGradient id="seal" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#8b9099"/>
            <stop offset="1" stop-color="#4f5663"/>
          </linearGradient>
          <filter id="shadow" x="-25%" y="-25%" width="150%" height="160%">
            <feDropShadow dx="0" dy="20" stdDeviation="14" flood-color="#253045" flood-opacity=".18"/>
          </filter>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14"/>
          </filter>
        </defs>
        <rect width="640" height="390" fill="transparent"/>
        <g filter="url(#shadow)">
          <rect x="80" y="74" width="480" height="240" rx="18" fill="url(#paper)" stroke="#dfe5ee" stroke-width="2"/>
          <path d="M84 78 L320 222 L556 78" fill="none" stroke="#d9e0eb" stroke-width="2"/>
          <path d="M84 310 L274 181 L320 222 L366 181 L556 310" fill="none" stroke="#d9e0eb" stroke-width="2"/>
          <circle cx="320" cy="198" r="42" fill="#f9fafb" opacity=".9" filter="url(#soft)"/>
          <text x="320" y="210" text-anchor="middle" font-size="43" font-weight="900"
            font-family="${fontFamily}" fill="url(#seal)">訃告</text>
        </g>
      </svg>
    `,
    640,
    390
  );
}

function bottomNav(labels, y) {
  const itemWidth = 840 / labels.length;
  return labels
    .map((label, index) => {
      const cx = itemWidth * index + itemWidth / 2;
      return `
        <rect x="${cx - 35}" y="${y}" width="70" height="70" rx="22" fill="#f7f9fc"/>
        <circle cx="${cx}" cy="${y + 31}" r="13" fill="none" stroke="#5f6875" stroke-width="3"/>
        <text x="${cx}" y="${y + 98}" text-anchor="middle" font-size="26" font-weight="800"
          font-family="${fontFamily}" fill="#434c59">${esc(label)}</text>
      `;
    })
    .join('');
}

async function createWeddingPhone() {
  const width = 840;
  const height = 1500;
  const photo = await weddingPortraitCrop();
  const overlay = svgBuffer(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0"/>
          <stop offset=".72" stop-color="#fff" stop-opacity=".82"/>
          <stop offset="1" stop-color="#fff" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect x="40" y="420" width="760" height="230" fill="url(#fade)"/>
      <text x="110" y="118" font-size="25" font-weight="800" font-family="${fontFamily}" fill="#fff">Preview</text>
      <text x="728" y="118" font-size="34" font-weight="900" font-family="${fontFamily}" fill="#fff" text-anchor="middle">•••</text>
      ${textLines(['한태준 & 강지연'], { x: 420, y: 725, size: 50, fill: '#3a302b', weight: 900 })}
      ${textLines(['2026.08.09 일요일 오후 12:30'], { x: 420, y: 806, size: 28, fill: '#6f655e', weight: 800 })}
      ${textLines(['정담웨딩홀 2층 그랜드룸'], { x: 420, y: 864, size: 26, fill: '#7e756d', weight: 700 })}
      <rect x="92" y="924" width="656" height="194" rx="34" fill="#fff" stroke="#e9eef5" stroke-width="2"/>
      ${textLines(['소중한 분들을 초대합니다'], { x: 420, y: 989, size: 31, fill: '#29313d', weight: 900 })}
      ${textLines(['서로의 계절이 되어줄 두 사람이', '따뜻한 약속을 시작합니다.'], {
        x: 420,
        y: 1046,
        size: 25,
        fill: '#707986',
        weight: 700,
        gap: 1.42,
      })}
      ${bottomNav(['일정', '위치', '갤러리', '공유'], 1236)}
    </svg>
  `);

  await sharp({
    create: { width, height, channels: 4, background: '#fafcff' },
  })
    .composite([
      { input: photo, left: 40, top: 70 },
      { input: overlay, left: 0, top: 0 },
    ])
    .png()
    .toFile(source('wedding-phone-screen.png'));
}

async function createFuneralPhone() {
  const width = 840;
  const height = 1500;
  const flower = await sharp(source('memorial-flower-source.png'))
    .resize(width, 760, { fit: 'cover', position: 'top' })
    .modulate({ brightness: 1.05, saturation: 0.82 })
    .ensureAlpha()
    .toBuffer();
  const overlay = svgBuffer(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#fff" opacity=".48"/>
      <rect x="0" y="630" width="${width}" height="${height - 630}" fill="#fafbfc"/>
      <rect x="76" y="450" width="688" height="562" rx="44" fill="#fff" opacity=".95" stroke="#e5ebf3" stroke-width="2"/>
      ${textLines(['故 이 상 원 님'], { x: 420, y: 586, size: 48, fill: '#30343c', weight: 900 })}
      ${textLines(['부고'], { x: 420, y: 665, size: 42, fill: '#30343c', weight: 900 })}
      ${textLines(['삼가 고인의 명복을 빕니다.'], { x: 420, y: 749, size: 27, fill: '#68707c', weight: 700 })}
      ${textLines(['빈소', '서울아산병원 장례식장 3호실'], { x: 420, y: 835, size: 28, fill: '#4e5663', weight: 800, gap: 1.45 })}
      ${textLines(['발인', '2026년 05월 25일 (월) 08:30'], { x: 420, y: 955, size: 26, fill: '#656d79', weight: 700, gap: 1.45 })}
      ${bottomNav(['조문록', '오시는 길', '연락하기', '공유하기'], 1236)}
    </svg>
  `);

  await sharp({
    create: { width, height, channels: 4, background: '#f9fafc' },
  })
    .composite([
      { input: flower, left: 0, top: 0 },
      { input: overlay, left: 0, top: 0 },
    ])
    .png()
    .toFile(source('funeral-phone-screen.png'));
}

async function createObjectAssets() {
  await writeSvgPng(
    'tablet-reception.png',
    `
      <svg width="640" height="520" viewBox="0 0 640 520" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="glass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset="1" stop-color="#dcecff"/>
          </linearGradient>
          <linearGradient id="frame" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#2d3440"/>
            <stop offset="1" stop-color="#111821"/>
          </linearGradient>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="22" stdDeviation="18" flood-color="#1c2c46" flood-opacity=".26"/>
          </filter>
        </defs>
        <rect width="640" height="520" fill="transparent"/>
        <g filter="url(#shadow)">
          <rect x="126" y="64" width="388" height="286" rx="38" fill="url(#frame)"/>
          <rect x="154" y="92" width="332" height="220" rx="24" fill="url(#glass)"/>
          <rect x="204" y="128" width="210" height="24" rx="12" fill="#eef5ff"/>
          <rect x="204" y="176" width="32" height="92" rx="10" fill="#bfddff"/>
          <rect x="260" y="142" width="32" height="126" rx="10" fill="#8ec5ff"/>
          <rect x="316" y="190" width="32" height="78" rx="10" fill="#5aa1fa"/>
          <rect x="372" y="118" width="32" height="150" rx="10" fill="#3182f6"/>
          <circle cx="448" cy="142" r="18" fill="#d9eaff"/>
        </g>
        <path d="M286 348 H354 L376 428 H264 Z" fill="#cbd7e6"/>
        <rect x="206" y="416" width="228" height="44" rx="22" fill="#e4ebf4"/>
      </svg>
    `,
    640,
    520
  );

  await writeSvgPng(
    'ledger-book.png',
    `
      <svg width="520" height="520" viewBox="0 0 520 520" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="book" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#66b4ff"/>
            <stop offset="1" stop-color="#1769d6"/>
          </linearGradient>
          <linearGradient id="edge" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#0e58bd"/>
            <stop offset="1" stop-color="#07449e"/>
          </linearGradient>
          <filter id="shadow" x="-35%" y="-30%" width="170%" height="170%">
            <feDropShadow dx="0" dy="24" stdDeviation="18" flood-color="#143e80" flood-opacity=".24"/>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <rect x="156" y="70" width="224" height="360" rx="28" fill="url(#book)"/>
          <path d="M156 98 C156 82 170 70 186 70 H214 V430 H186 C170 430 156 416 156 400Z" fill="url(#edge)"/>
          <rect x="200" y="70" width="24" height="360" fill="#74b9ff"/>
          <rect x="238" y="230" width="94" height="70" rx="26" fill="#fff" opacity=".9"/>
          <path d="M254 264 C254 246 276 240 286 258 C296 240 318 246 316 264 C314 284 286 296 286 296 C286 296 256 284 254 264Z" fill="none" stroke="#f0bb83" stroke-width="7" stroke-linecap="round"/>
          <rect x="382" y="116" width="26" height="236" rx="13" fill="#cfe4ff" opacity=".8"/>
        </g>
      </svg>
    `,
    520,
    520
  );

  await writeSvgPng(
    'mutual-aid-people.png',
    `
      <svg width="560" height="500" viewBox="0 0 560 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mint" cx=".35" cy=".22" r=".9">
            <stop offset="0" stop-color="#b5f4e2"/>
            <stop offset="1" stop-color="#5bcaa7"/>
          </radialGradient>
          <radialGradient id="mint2" cx=".35" cy=".22" r=".9">
            <stop offset="0" stop-color="#d3fbef"/>
            <stop offset="1" stop-color="#83dfc7"/>
          </radialGradient>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="#22604c" flood-opacity=".2"/>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <circle cx="280" cy="112" r="44" fill="url(#mint2)"/>
          <circle cx="190" cy="158" r="40" fill="url(#mint)"/>
          <circle cx="370" cy="158" r="40" fill="url(#mint)"/>
          <circle cx="280" cy="198" r="42" fill="#b3f1df"/>
          <rect x="102" y="206" width="176" height="138" rx="58" fill="#72d8ba"/>
          <rect x="282" y="206" width="176" height="138" rx="58" fill="#67c9aa"/>
          <rect x="186" y="244" width="188" height="152" rx="72" fill="url(#mint2)"/>
          <rect x="342" y="274" width="86" height="74" rx="28" fill="#fff" opacity=".94"/>
          <path d="M360 309 C358 290 379 286 386 303 C394 286 416 291 414 309 C412 330 386 343 386 343 C386 343 362 330 360 309Z" fill="none" stroke="#58c9a4" stroke-width="7" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    560,
    500
  );

  await sharp(asset('studio', 'elements', '4-white-peony-single.png'))
    .resize(360, 360, { fit: 'contain' })
    .png()
    .toFile(source('service-flower.png'));

  await writeSvgPng(
    'soft-petals.png',
    `
      <svg width="520" height="260" viewBox="0 0 520 260" xmlns="http://www.w3.org/2000/svg">
        <g fill="#fff" fill-opacity=".92" stroke="#eadfce" stroke-width="2">
          <ellipse cx="62" cy="128" rx="31" ry="14" transform="rotate(-28 62 128)"/>
          <ellipse cx="152" cy="82" rx="26" ry="12" transform="rotate(22 152 82)"/>
          <ellipse cx="246" cy="166" rx="29" ry="13" transform="rotate(-12 246 166)"/>
          <ellipse cx="350" cy="94" rx="24" ry="11" transform="rotate(28 350 94)"/>
          <ellipse cx="438" cy="150" rx="27" ry="12" transform="rotate(-36 438 150)"/>
        </g>
      </svg>
    `,
    520,
    260
  );
}

async function main() {
  await mkdir(out, { recursive: true });
  await ensureSourceAssets();
  await createWeddingLinkCover();
  await createFuneralLinkCover();
  await createWeddingPhone();
  await createFuneralPhone();
  await createObjectAssets();
  console.log(`generated main redesign assets in ${out}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
