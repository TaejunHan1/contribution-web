const KOREAN_ROMAN_MAP = {
  가: 'ga', 강: 'kang', 경: 'kyung', 고: 'ko', 광: 'kwang', 구: 'koo',
  규: 'kyu', 기: 'ki', 김: 'kim', 나: 'na', 남: 'nam', 노: 'noh',
  다: 'da', 동: 'dong', 라: 'ra', 리: 'ri', 린: 'rin', 민: 'min',
  박: 'park', 배: 'bae', 백: 'baek', 병: 'byung', 빈: 'bin', 상: 'sang',
  서: 'seo', 선: 'sun', 성: 'sung', 석: 'seok', 솔: 'sol', 송: 'song',
  수: 'soo', 신: 'shin', 아: 'ah', 안: 'ahn', 양: 'yang', 연: 'yun',
  영: 'young', 오: 'oh', 용: 'yong', 우: 'woo', 원: 'won', 유: 'yoo',
  윤: 'yoon', 은: 'eun', 이: 'lee', 인: 'in', 임: 'lim', 장: 'jang',
  재: 'jae', 전: 'jeon', 정: 'jung', 주: 'joo', 준: 'jun', 지: 'ji',
  진: 'jin', 차: 'cha', 철: 'chul', 최: 'choi', 태: 'tae', 하: 'ha',
  한: 'han', 혜: 'hye', 현: 'hyun', 호: 'ho', 홍: 'hong', 황: 'hwang',
  희: 'hee', 훈: 'hoon',
};

const stripKoreanFamilyName = (name) => {
  const compactName = String(name || '').replace(/\s/g, '');
  return /^[가-힣]+$/.test(compactName) && compactName.length >= 3
    ? compactName.slice(1)
    : compactName;
};

export const romanizeKoreanName = (name) => {
  const givenName = stripKoreanFamilyName(name);
  return [...givenName]
    .map(char => KOREAN_ROMAN_MAP[char] || char)
    .join('');
};

export const slugify = (value) => String(value || '')
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-{2,}/g, '-');

export const buildWeddingSlugBase = ({ groomName, brideName, fallbackId }) => {
  const groomSlug = slugify(romanizeKoreanName(groomName));
  const brideSlug = slugify(romanizeKoreanName(brideName));
  const coupleSlug = [groomSlug, brideSlug].filter(Boolean).join('-');

  if (coupleSlug) return coupleSlug;
  return slugify(String(fallbackId || '').slice(0, 8)) || 'wedding';
};

export const buildSlugCandidate = (baseSlug, index) => (
  index <= 1 ? baseSlug : `${baseSlug}-${index}`
);
