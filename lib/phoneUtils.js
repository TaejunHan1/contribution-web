export const normalizeKoreanPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('0082')) return `0${digits.slice(4)}`;
  if (digits.startsWith('82')) return `0${digits.slice(2)}`;
  if (digits.startsWith('10') && digits.length === 10) return `0${digits}`;
  return digits;
};

export const getPhoneLookupValues = (value) => {
  const normalized = normalizeKoreanPhone(value);
  return Array.from(new Set([value, normalized].filter(Boolean)));
};
