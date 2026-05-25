const IMAGE_CATEGORIES = ['main', 'gallery', 'groom', 'bride'];
const URL_FIELDS = [
  'publicUrl',
  'primaryUrl',
  'uri',
  'url',
  'src',
  'originalUri',
  'downloadURL',
];

const isPlainObject = value => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

export const parseJsonField = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const unwrapImageValue = (value, depth = 0) => {
  if (value === null || value === undefined || depth > 8) return value;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';

    const looksLikeJson = /^[{\["]/.test(trimmed);
    if (looksLikeJson) {
      try {
        return unwrapImageValue(JSON.parse(trimmed), depth + 1);
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  if (Array.isArray(value)) {
    return value.map(item => unwrapImageValue(item, depth + 1));
  }

  if (!isPlainObject(value)) return value;

  let normalized = { ...value };

  URL_FIELDS.forEach(field => {
    if (!(field in normalized)) return;
    const unwrapped = unwrapImageValue(normalized[field], depth + 1);
    normalized[field] = unwrapped;

    if (isPlainObject(unwrapped)) {
      normalized = {
        ...unwrapped,
        ...normalized,
      };
    }
  });

  return normalized;
};

const isRenderableWebUri = value => {
  if (typeof value !== 'string') return false;
  const uri = value.trim();
  if (!uri) return false;
  if (/^(file:|ph:|assets-library:)/i.test(uri)) return false;
  if (/^\/var\//i.test(uri)) return false;
  return /^(https?:\/\/|data:image\/|blob:|\/)/i.test(uri);
};

export const resolveImageUri = (image, options = {}, depth = 0) => {
  if (image === null || image === undefined || depth > 8) return null;

  const value = unwrapImageValue(image);
  if (typeof value === 'string') {
    return isRenderableWebUri(value) ? value : null;
  }

  if (!isPlainObject(value)) return null;

  for (const field of URL_FIELDS) {
    const resolved = resolveImageUri(value[field], options, depth + 1);
    if (resolved) return resolved;
  }

  const storagePath = value.storagePath || value.fullPath || value.path;
  if (storagePath && typeof options.resolveStoragePath === 'function') {
    const resolved = options.resolveStoragePath(storagePath);
    if (isRenderableWebUri(resolved)) return resolved;
  }

  return null;
};

const getSearchText = value => {
  const image = unwrapImageValue(value);
  if (typeof image === 'string') return image;
  if (!isPlainObject(image)) return '';

  return [
    image.category,
    image.id,
    image.name,
    image.fileName,
    image.filename,
    image.storagePath,
    image.fullPath,
    image.path,
    ...URL_FIELDS.map(field => image[field]).filter(item => typeof item === 'string'),
  ].filter(Boolean).join(' ').toLowerCase();
};

export const inferImageCategory = (image, fallback = 'main') => {
  const value = unwrapImageValue(image);
  if (isPlainObject(value) && IMAGE_CATEGORIES.includes(value.category)) {
    return value.category;
  }

  const text = getSearchText(value);
  if (/(^|[_\-/])main([_\-.]|$)/.test(text)) return 'main';
  if (/(^|[_\-/])gallery([_\-.]|$)/.test(text)) return 'gallery';
  if (/(^|[_\-/])groom([_\-.]|$)/.test(text)) return 'groom';
  if (/(^|[_\-/])bride([_\-.]|$)/.test(text)) return 'bride';
  return IMAGE_CATEGORIES.includes(fallback) ? fallback : 'main';
};

const getImageIdentity = image => (
  image?.uri ||
  image?.publicUrl ||
  image?.primaryUrl ||
  image?.storagePath ||
  image?.fullPath ||
  image?.path ||
  image?.id ||
  ''
);

export const dedupeImages = images => {
  const seen = new Set();
  return (images || []).filter(image => {
    const key = getImageIdentity(image);
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const extractBatchKey = image => {
  const value = unwrapImageValue(image);
  const raw = [
    value?.eventId,
    value?.event_id,
    value?.storagePath,
    value?.fullPath,
    value?.path,
    value?.uri,
    value?.publicUrl,
    value?.primaryUrl,
    value?.url,
  ].filter(Boolean).join(' ');

  const tempMatch = raw.match(/temp_[A-Za-z0-9_-]+/);
  if (tempMatch) return tempMatch[0];

  const eventMatch = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (eventMatch) return eventMatch[0];

  return 'direct';
};

const getBatchTime = key => {
  const match = String(key || '').match(/temp_(\d{10,})/);
  return match ? Number(match[1]) || 0 : 0;
};

export const selectBestImageBatch = images => {
  const list = dedupeImages(images);
  if (list.length <= 1) return list;

  const groups = list.reduce((acc, image) => {
    const key = extractBatchKey(image);
    if (!acc[key]) acc[key] = [];
    acc[key].push(image);
    return acc;
  }, {});

  const entries = Object.entries(groups);
  if (entries.length <= 1) return list;

  const scored = entries.map(([key, group]) => {
    const counts = group.reduce((acc, image) => {
      const category = inferImageCategory(image, image.category);
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const score =
      (counts.main ? 10000 : 0) +
      Math.min(counts.gallery || 0, 30) * 100 +
      group.length +
      getBatchTime(key) / 10000000000000;

    return { key, group, score };
  }).sort((a, b) => b.score - a.score);

  return scored[0]?.group || list;
};

export const normalizeImageItem = (item, index = 0, options = {}) => {
  const unwrapped = unwrapImageValue(item);
  const uri = resolveImageUri(unwrapped, options);
  if (!uri) return null;

  const base = isPlainObject(unwrapped) ? unwrapped : {};
  const category = inferImageCategory(base, options.fallbackCategory || 'main');
  const id = base.id || base.name || `${category}-${index}`;

  return {
    ...base,
    id,
    category,
    categoryLabel: base.categoryLabel,
    uri,
    publicUrl: uri,
    primaryUrl: uri,
  };
};

export const normalizeImageList = (images, options = {}) => (
  dedupeImages(
    (Array.isArray(images) ? images : [])
      .map((image, index) => normalizeImageItem(image, index, options))
      .filter(Boolean)
  )
);

const enforceWeddingImageLimits = grouped => {
  const mainKeys = new Set(grouped.main.map(getImageIdentity));
  const galleryWithoutMain = grouped.gallery.filter(image => !mainKeys.has(getImageIdentity(image)));

  return {
    ...grouped,
    main: grouped.main.slice(0, 1),
    gallery: galleryWithoutMain.slice(0, grouped.main.length > 0 ? 29 : 30),
  };
};

export const buildCategorizedImagesFromList = (images, options = {}) => {
  const normalized = selectBestImageBatch(
    normalizeImageList(images, {
      ...options,
      fallbackCategory: options.fallbackCategory || 'gallery',
    })
  );

  const grouped = {
    main: [],
    gallery: [],
    groom: [],
    bride: [],
    all: [],
  };

  normalized.forEach(image => {
    const category = inferImageCategory(image, image.category || 'gallery');
    const item = { ...image, category };
    if (grouped[category]) grouped[category].push(item);
    grouped.all.push(item);
  });

  const limited = enforceWeddingImageLimits({
    main: dedupeImages(grouped.main),
    gallery: dedupeImages(grouped.gallery),
    groom: dedupeImages(grouped.groom),
    bride: dedupeImages(grouped.bride),
    all: dedupeImages(grouped.all),
  });

  return {
    ...limited,
    all: dedupeImages([
      ...limited.main,
      ...limited.gallery,
      ...limited.groom,
      ...limited.bride,
      ...grouped.all,
    ]),
  };
};

export const normalizeCategorizedImages = (categorizedImages, options = {}) => {
  const source = unwrapImageValue(categorizedImages);
  if (!isPlainObject(source)) {
    return { main: [], gallery: [], groom: [], bride: [], all: [] };
  }

  const grouped = {
    main: normalizeImageList(source.main, { ...options, fallbackCategory: 'main' }),
    gallery: normalizeImageList(source.gallery, { ...options, fallbackCategory: 'gallery' }),
    groom: normalizeImageList(source.groom, { ...options, fallbackCategory: 'groom' }),
    bride: normalizeImageList(source.bride, { ...options, fallbackCategory: 'bride' }),
    all: normalizeImageList(source.all, { ...options, fallbackCategory: 'gallery' }),
  };

  if (
    grouped.main.length === 0 &&
    grouped.gallery.length === 0 &&
    grouped.groom.length === 0 &&
    grouped.bride.length === 0 &&
    grouped.all.length > 0
  ) {
    return buildCategorizedImagesFromList(grouped.all, options);
  }

  const limited = enforceWeddingImageLimits({
    ...grouped,
    main: dedupeImages(grouped.main),
    gallery: dedupeImages(grouped.gallery),
    groom: dedupeImages(grouped.groom),
    bride: dedupeImages(grouped.bride),
  });

  return {
    ...limited,
    all: dedupeImages([
      ...limited.main,
      ...limited.gallery,
      ...limited.groom,
      ...limited.bride,
      ...grouped.all,
    ]),
  };
};

export const hasCategorizedImages = categorizedImages => (
  ['main', 'gallery', 'groom', 'bride', 'all'].some(
    category => Array.isArray(categorizedImages?.[category]) && categorizedImages[category].length > 0
  )
);

export const flattenCategorizedImages = categorizedImages => (
  dedupeImages([
    ...(categorizedImages?.main || []),
    ...(categorizedImages?.gallery || []),
    ...(categorizedImages?.groom || []),
    ...(categorizedImages?.bride || []),
    ...(categorizedImages?.all || []),
  ])
);
