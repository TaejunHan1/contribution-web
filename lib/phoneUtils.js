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
  const original = String(value || '').trim();
  const digits = original.replace(/\D/g, '');
  const lookupValues = [original, digits, normalized];

  if (normalized?.startsWith('0')) {
    const withoutLeadingZero = normalized.slice(1);
    lookupValues.push(`+82${withoutLeadingZero}`);
    lookupValues.push(`82${withoutLeadingZero}`);
  }

  return Array.from(new Set(lookupValues.filter(Boolean)));
};
