import React, { useEffect, useMemo, useRef, useState } from 'react';
import GoogleMapEmbed from '../MapComponent';
import styles from './YozmStyleTemplate.module.css';

const ASSET = '/images/wedding';
const DEFAULT_IMAGES = [
  '/images/aa1.png', '/images/aa2.png', '/images/aa3.png', '/images/aa4.png',
  '/images/aa1.png', '/images/aa2.png', '/images/aa3.png', '/images/aa4.png',
  '/images/aa1.png', '/images/aa2.png', '/images/aa3.png', '/images/aa4.png',
];
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const getImageSrc = (image) => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image.publicUrl || image.primaryUrl || image.uri || image.url || image.src || null;
};

const getImageKey = (image) => getImageSrc(image) || '';

const uniqueImages = (images) => {
  const seen = new Set();
  return images.filter((image) => {
    const key = getImageKey(image);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const getAdditionalInfo = (eventData) => {
  const info = eventData.additional_info;
  if (!info) return {};
  if (typeof info === 'string') {
    try { return JSON.parse(info); } catch { return {}; }
  }
  return info;
};

const buildImageGroups = (eventData, categorizedImages) => {
  if (categorizedImages && Object.keys(categorizedImages).length > 0) return categorizedImages;

  if (eventData?.processedImages?.length > 0) {
    const grouped = { main: [], gallery: [], groom: [], bride: [], all: [] };
    eventData.processedImages.forEach((img) => {
      const item = {
        uri: img.primaryUrl || img.publicUrl || img.uri || img.url,
        publicUrl: img.publicUrl || img.primaryUrl,
        category: img.category || 'main',
      };
      if (item.category && grouped[item.category]) grouped[item.category].push(item);
      grouped.all.push(item);
    });
    return grouped;
  }

  if (eventData?.image_urls?.length > 0) {
    const normalized = eventData.image_urls.map((img) => (
      typeof img === 'string'
        ? { uri: img, category: 'main' }
        : { uri: img.publicUrl || img.primaryUrl || img.uri || img.url, category: img.category || 'main' }
    ));
    return {
      main: normalized.filter((img) => img.category === 'main'),
      gallery: normalized.filter((img) => img.category === 'gallery'),
      groom: normalized.filter((img) => img.category === 'groom'),
      bride: normalized.filter((img) => img.category === 'bride'),
      all: normalized,
    };
  }

  return {
    main: DEFAULT_IMAGES.slice(0, 4),
    gallery: DEFAULT_IMAGES.slice(3),
    groom: [DEFAULT_IMAGES[2]],
    bride: [DEFAULT_IMAGES[3]],
    all: DEFAULT_IMAGES,
  };
};

const getGivenName = (name) => {
  const text = String(name || '').trim();
  if (!text) return '';
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1];
  if (/^[가-힣]{3,4}$/.test(text)) return text.slice(1);
  return text;
};

const getEnglishDay = (date) => {
  if (!date || Number.isNaN(date.getTime())) return 'SUN';
  return DAYS[date.getDay()];
};

const formatKoreanDate = (value) => {
  const date = new Date(value || Date.now());
  const valid = !Number.isNaN(date.getTime());
  const target = valid ? date : new Date(2026, 3, 1);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return {
    date: target,
    year: target.getFullYear(),
    month: target.getMonth() + 1,
    day: target.getDate(),
    korean: `${target.getFullYear()}년 ${target.getMonth() + 1}월 ${target.getDate()}일 ${dayNames[target.getDay()]}요일`,
    englishDay: getEnglishDay(target),
  };
};

const formatKoreanTime = (time) => {
  const value = String(time || '').trim();
  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return value || '오후 12시';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = hour < 12 ? '오전' : '오후';
  return `${period} ${hour % 12 || 12}시${minute > 0 ? ` ${minute}분` : ''}`;
};

const formatPhone = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone || '';
};

function OvalLabel({ children, dark = false }) {
  return (
    <div className={`${styles.oval} ${dark ? styles.ovalDark : ''}`}>
      <span>{children}</span>
    </div>
  );
}

function EnvelopeCard({ dateLine, dayLabel, timeStr, locName }) {
  return (
    <section className={styles.envelopeCard}>
      <img src={`${ASSET}/yozm-envelope.png`} alt="" />
      <p className={styles.envelopeSmall}>YOU'RE INVITED TO</p>
      <h2>Our Wedding</h2>
      <p className={styles.envelopeDate}>{dateLine}. {dayLabel}</p>
      <p className={styles.envelopeTime}>{timeStr}</p>
      <p className={styles.envelopePlace}>{locName}</p>
    </section>
  );
}

function MemoLines({ text, align = 'right' }) {
  return (
    <div className={styles.memoLines}>
      {String(text || '').split('\n').filter(Boolean).map((line, index) => (
        <span
          key={`${line}-${index}`}
          className={align === 'left' ? styles.memoLeft : styles.memoRight}
          style={{ transform: `rotate(${index % 2 === 0 ? -2 : 1.5}deg)` }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}

function ParentBlock({ title, nameLine, photo, sticker, stickerRight, message, onOpen }) {
  return (
    <article className={styles.parentBlock}>
      <h3>{title}</h3>
      <button type="button" className={styles.parentPhoto} onClick={onOpen}>
        <img src={getImageSrc(photo)} alt="" />
        <span>{nameLine}</span>
      </button>
      <div className={`${styles.childSticker} ${stickerRight ? styles.childStickerRight : ''}`}>
        <img src={getImageSrc(sticker)} alt="" />
      </div>
      <MemoLines text={message} align={stickerRight ? 'left' : 'right'} />
    </article>
  );
}

function CalendarBlock({ year, month, day, dateLine, dayLabel, timeStr }) {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <section className={styles.calendar}>
      <h2>{dateLine}. {dayLabel}</h2>
      <p>{timeStr}</p>
      <div className={styles.calendarHead}>
        {DAYS.map((label) => <span key={label}>{label}</span>)}
      </div>
      <div className={styles.calendarGrid}>
        {Array.from({ length: firstDow }).map((_, index) => <span key={`blank-${index}`} />)}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const current = index + 1;
          return (
            <span key={current} className={current === day ? styles.selectedDay : ''}>
              {current}
            </span>
          );
        })}
      </div>
    </section>
  );
}

export default function YozmStyleTemplate({
  eventData = {},
  categorizedImages = {},
  allowMessages,
}) {
  const [viewer, setViewer] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);
  const ai = useMemo(() => getAdditionalInfo(eventData), [eventData]);
  const imageGroups = useMemo(() => buildImageGroups(eventData, categorizedImages), [categorizedImages, eventData]);
  const mainImages = imageGroups.main?.length ? imageGroups.main : DEFAULT_IMAGES.slice(0, 4);
  const galleryImages = imageGroups.gallery?.length ? imageGroups.gallery : DEFAULT_IMAGES.slice(3);
  const orderedImages = uniqueImages([...mainImages, ...galleryImages, ...(imageGroups.all || []), ...DEFAULT_IMAGES].filter(Boolean));
  const pickImage = (index, fallback = DEFAULT_IMAGES[0]) => orderedImages[index % Math.max(orderedImages.length, 1)] || fallback;

  const coverImage = pickImage(0);
  const coupleImage = pickImage(1, coverImage);
  const groomParentImage = pickImage(2, coupleImage);
  const groomChildImage = imageGroups.groom?.[0] && getImageKey(imageGroups.groom[0]) !== getImageKey(groomParentImage)
    ? imageGroups.groom[0]
    : pickImage(3, groomParentImage);
  const brideParentImage = pickImage(4, groomChildImage);
  const brideChildImage = imageGroups.bride?.[0] && getImageKey(imageGroups.bride[0]) !== getImageKey(brideParentImage)
    ? imageGroups.bride[0]
    : pickImage(5, brideParentImage);
  const storyImageOne = pickImage(6, coverImage);
  const storyImageTwo = pickImage(7, coupleImage);

  const groomName = eventData.groomName || eventData.groom_name || '안재진';
  const brideName = eventData.brideName || eventData.bride_name || '권정은';
  const groomGivenName = getGivenName(groomName) || groomName;
  const brideGivenName = getGivenName(brideName) || brideName;
  const groomFather = eventData.groomFatherName || eventData.groom_father_name || '안정환';
  const groomMother = eventData.groomMotherName || eventData.groom_mother_name || '유은희';
  const brideFather = eventData.brideFatherName || eventData.bride_father_name || '권세광';
  const brideMother = eventData.brideMotherName || eventData.bride_mother_name || '정순분';
  const weddingDate = formatKoreanDate(eventData.date || eventData.event_date);
  const timeStr = formatKoreanTime(eventData.ceremonyTime || eventData.ceremony_time);
  const dateLine = `${weddingDate.year}.${String(weddingDate.month).padStart(2, '0')}.${String(weddingDate.day).padStart(2, '0')}`;
  const locName = eventData.hallName || eventData.hall_name || eventData.location || '웨딩피치홀';
  const locAddr = eventData.detailedAddress || eventData.detailed_address || eventData.address || '서울시 마포구 서교동 123-12';
  const subwayInfo = ai.subway_info || eventData.subwayInfo || eventData.subway_info || '';
  const busInfo = ai.bus_info || eventData.busInfo || eventData.bus_info || '';
  const shouldShowMessages = allowMessages !== undefined ? allowMessages !== false : eventData?.allow_messages !== false;

  const accounts = {
    groom: [
      { role: '신랑', name: groomName, bank: ai.groom_bank_name, number: ai.groom_account_number, contact: eventData.groomContact || eventData.groom_contact },
      { role: '신랑부', name: groomFather, bank: ai.groom_father_bank_name, number: ai.groom_father_account_number, contact: ai.groom_father_contact },
      { role: '신랑모', name: groomMother, bank: ai.groom_mother_bank_name, number: ai.groom_mother_account_number, contact: ai.groom_mother_contact },
    ].filter((item) => item.number || item.contact),
    bride: [
      { role: '신부', name: brideName, bank: ai.bride_bank_name, number: ai.bride_account_number, contact: eventData.brideContact || eventData.bride_contact },
      { role: '신부부', name: brideFather, bank: ai.bride_father_bank_name, number: ai.bride_father_account_number, contact: ai.bride_father_contact },
      { role: '신부모', name: brideMother, bank: ai.bride_mother_bank_name, number: ai.bride_mother_account_number, contact: ai.bride_mother_contact },
    ].filter((item) => item.number || item.contact),
  };
  const hasAccounts = accounts.groom.length > 0 || accounts.bride.length > 0;

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const showToast = (message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 1800);
  };

  const copyText = async (value, message = '복사되었습니다') => {
    try {
      await navigator.clipboard.writeText(String(value || ''));
      showToast(message);
    } catch {
      showToast('복사에 실패했습니다');
    }
  };

  const openViewer = (items, index = 0) => {
    const srcs = items.map(getImageSrc).filter(Boolean);
    if (srcs.length) setViewer({ items: srcs, index });
  };

  const moveViewer = (direction) => {
    setViewer((prev) => {
      if (!prev?.items?.length) return prev;
      return { ...prev, index: (prev.index + direction + prev.items.length) % prev.items.length };
    });
  };

  const renderAccounts = (title, list) => {
    if (!list.length) return null;
    return (
      <div className={styles.accountGroup}>
        <h3>{title}</h3>
        {list.map((person, index) => (
          <div className={styles.accountRow} key={`${person.role}-${index}`}>
            <div>
              {person.number ? <strong>{person.bank} {person.number}</strong> : null}
              <span>{person.role}{person.name ? ` · ${person.name}` : ''}</span>
              {person.contact ? <span>{formatPhone(person.contact)}</span> : null}
            </div>
            {person.number ? (
              <button type="button" onClick={() => copyText(person.number, '계좌번호가 복사되었습니다')}>
                복사하기
              </button>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.root}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <img src={getImageSrc(coverImage)} alt="" />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}>
            <p>YOU&apos;RE INVITED TO</p>
            <h1>Our Wedding</h1>
            <h2>{dateLine}. {weddingDate.englishDay} {timeStr.replace('오전 ', '').replace('오후 ', '')}</h2>
            <h3>{locName}</h3>
          </div>
        </section>

        <section className={styles.saveSection}>
          <OvalLabel>SAVE THE DATE</OvalLabel>
          <p>{weddingDate.korean} {timeStr}<br />{locName}<br />{locAddr}</p>
        </section>

        <section className={styles.envelopeSection}>
          <EnvelopeCard dateLine={dateLine} dayLabel={weddingDate.englishDay} timeStr={timeStr} locName={locName} />
        </section>

        <section className={styles.coupleSection}>
          <h2>{groomName}  {brideName}</h2>
          <button type="button" onClick={() => openViewer([coupleImage])}>
            <img src={getImageSrc(coupleImage)} alt="" />
          </button>
        </section>

        <section className={styles.parents}>
          <ParentBlock
            title="Groom's Parents"
            nameLine={`${groomFather} & ${groomMother}의\n아들 ${groomGivenName}`}
            photo={groomParentImage}
            sticker={groomChildImage}
            onOpen={() => openViewer([groomParentImage])}
            message={`사랑하는 아들 ${groomGivenName}\n대견하고 멋지게 커주어 고맙고\n지금 마음처럼 늘 서로 아끼며\n가정을 소중히 가꾸어 가길 기원한다.`}
          />
          <ParentBlock
            title="Bride's Parents"
            nameLine={`${brideFather} & ${brideMother}의\n딸 ${brideGivenName}`}
            photo={brideParentImage}
            sticker={brideChildImage}
            stickerRight
            onOpen={() => openViewer([brideParentImage])}
            message={`예쁜 우리 딸 ${brideGivenName}\n너의 다정함이 새 가정에도 피어나길\n서로 웃으며 기대어 살아가길\n엄마 아빠가 마음 다해 응원한다.`}
          />
        </section>

        <section className={styles.story}>
          <p className={styles.storyTop}>언제나 날 웃게하는<br />사랑스러운 사람.<br />내 삶에 머물러줘 고마워요.<br />지금처럼 평생 내 곁에<br />함께 해줘요!</p>
          <button type="button" onClick={() => openViewer([storyImageOne])}>
            <img src={getImageSrc(storyImageOne)} alt="" />
          </button>
          <p className={styles.storyBottom}>나의 귀엽고 소중한 청춘,<br />처음 본 순간부터 지금까지<br />내 가슴은 너로 가득 차있어.<br />함께 늙고 싶은 사람, 사랑해요</p>
          <button type="button" onClick={() => openViewer([storyImageTwo])}>
            <img src={getImageSrc(storyImageTwo)} alt="" />
          </button>
        </section>

        <section className={styles.gallery}>
          {orderedImages.slice(0, 15).map((image, index) => (
            <button
              type="button"
              key={`${getImageSrc(image)}-${index}`}
              className={index % 5 === 0 ? styles.wideTile : ''}
              onClick={() => openViewer(orderedImages.slice(0, 15), index)}
            >
              <img src={getImageSrc(image)} alt="" />
            </button>
          ))}
        </section>

        <CalendarBlock
          year={weddingDate.year}
          month={weddingDate.month}
          day={weddingDate.day}
          dateLine={dateLine}
          dayLabel={weddingDate.englishDay}
          timeStr={timeStr}
        />

        <section className={styles.mapTitle}>
          <img src={`${ASSET}/blush-map-title.png`} alt="오시는 길" />
        </section>
        <section className={styles.location}>
          <div className={styles.mapBox}>
            <GoogleMapEmbed address={locAddr || locName} venueName={locName} height="314px" />
          </div>
          <div className={styles.addressRow}>
            <div>
              <h2>{locName}</h2>
              <p>{locAddr}</p>
            </div>
            <button type="button" onClick={() => copyText(locAddr, '주소가 복사되었습니다')}>복사하기</button>
          </div>
          {subwayInfo ? <p className={styles.transport}>🚃 지하철<br />{subwayInfo}</p> : null}
          {busInfo ? <p className={styles.transport}>🚌 버스<br />{busInfo}</p> : null}
        </section>

        {hasAccounts ? (
          <section className={styles.accounts}>
            <OvalLabel dark>마음 전하실 곳</OvalLabel>
            {renderAccounts('🤵🏻 신랑 측 계좌번호', accounts.groom)}
            {renderAccounts('👰🏻 신부 측 계좌번호', accounts.bride)}
          </section>
        ) : null}

        {shouldShowMessages ? (
          <section className={styles.messages}>
            <h2>축하 메시지</h2>
            <p>두 분의 새로운 시작을 진심으로 축하합니다.</p>
          </section>
        ) : null}

        <section className={styles.footer}>
          <button type="button" className={styles.kakaoButton} onClick={() => copyText(`${groomName} & ${brideName}\n${dateLine} ${timeStr}\n${locName}`, '청첩장 정보가 복사되었습니다')}>
            카카오톡 공유하기
          </button>
          <button type="button" className={styles.darkButton} onClick={() => copyText(typeof window !== 'undefined' ? window.location.href : '', '청첩장 주소가 복사되었습니다')}>
            청첩장 주소 복사하기
          </button>
          <p>©weddingpeach</p>
        </section>
      </main>

      {viewer ? (
        <div className={styles.viewer}>
          <button type="button" className={styles.viewerClose} onClick={() => setViewer(null)}>닫기</button>
          {viewer.items.length > 1 ? (
            <>
              <button type="button" className={`${styles.viewerNav} ${styles.viewerPrev}`} onClick={() => moveViewer(-1)}>‹</button>
              <button type="button" className={`${styles.viewerNav} ${styles.viewerNext}`} onClick={() => moveViewer(1)}>›</button>
            </>
          ) : null}
          <img src={viewer.items[viewer.index]} alt="" />
        </div>
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}
    </div>
  );
}
