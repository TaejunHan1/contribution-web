import React, { useEffect, useMemo, useRef, useState } from 'react';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import ContributionModal from '../ContributionModal';
import CompletionModal from '../CompletionModal';
import styles from './BlushEditorialTemplate.module.css';

const ASSET = '/images/wedding';
const DEFAULT_IMAGES = [
  '/images/aa1.png', '/images/aa2.png', '/images/aa3.png', '/images/aa4.png',
  '/images/aa1.png', '/images/aa2.png', '/images/aa3.png', '/images/aa4.png',
];
const DAYS = ['SUN', 'M', 'T', 'W', 'T', 'F', 'SAT'];

const getImageSrc = (image) => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image.publicUrl || image.primaryUrl || image.uri || image.url || image.src || null;
};

const getImageKey = (image) => getImageSrc(image) || '';

const getAdditionalInfo = (eventData) => {
  const info = eventData.additional_info;
  if (!info) return {};
  if (typeof info === 'string') {
    try { return JSON.parse(info); } catch { return {}; }
  }
  return info;
};

const formatPhone = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone || '';
};

const formatKoreanTime = (time) => {
  const value = String(time || '').trim();
  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = hour < 12 ? '오전' : '오후';
  return `${period} ${hour % 12 || 12}시${minute > 0 ? ` ${minute}분` : ''}`;
};

const getGivenName = (name) => {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length > 1) return parts[parts.length - 1];
  if (/^[가-힣]{3,4}$/.test(trimmed)) return trimmed.slice(1);
  return trimmed;
};

const formatGuestbookDateTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace(/\.\s?/g, '. ').replace(/\s+/g, ' ').trim();
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
      all: normalized,
    };
  }

  return {
    main: DEFAULT_IMAGES.slice(0, 3),
    gallery: DEFAULT_IMAGES.slice(2),
    all: DEFAULT_IMAGES,
  };
};

const parentBgStyles = [
  styles.parentBg0,
  styles.parentBg1,
  styles.parentBg2,
  styles.parentBg3,
  styles.parentBg4,
  styles.parentBg5,
  styles.parentBg6,
  styles.parentBg7,
];

function NotebookTexture({ type = 'lined' }) {
  return (
    <div className={styles.noteTexture} aria-hidden="true">
      {type === 'grid' ? (
        <>
          {Array.from({ length: 13 }).map((_, index) => <i key={`gv-${index}`} className={styles.gridV} style={{ left: `${8 + index * 7.4}%` }} />)}
          {Array.from({ length: 12 }).map((_, index) => <i key={`gh-${index}`} className={styles.gridH} style={{ top: 26 + index * 28 }} />)}
        </>
      ) : (
        <>
          <i className={styles.noteMarginLine} />
          {Array.from({ length: 10 }).map((_, index) => <i key={`line-${index}`} className={styles.noteLine} style={{ top: 34 + index * 34 }} />)}
        </>
      )}
      <i className={styles.noteSmudge} />
    </div>
  );
}

function CalendarBlock({ year, month, day, dateTitle, timeStr }) {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  return (
    <section className={styles.calendarSection}>
      <img className={styles.calendarDoodles} src={`${ASSET}/blush-calendar-doodles.png`} alt="" />
      <div className={styles.calendarPaper}>
        <h2>{dateTitle}</h2>
        {timeStr ? <p>{timeStr}</p> : null}
        <div className={styles.calendarHead}>
          {DAYS.map((label, index) => <span key={`${label}${index}`}>{label}</span>)}
        </div>
        <div className={styles.calendarDays}>
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
      </div>
    </section>
  );
}

function AccountGroup({ title, people, open, onToggle, onCopy }) {
  if (!people.length) return null;
  return (
    <div className={styles.accountGroup}>
      <button type="button" className={styles.accountHeader} onClick={onToggle}>
        <span>{title}</span>
        <b>{open ? '닫기' : '보기'}</b>
      </button>
      {open ? (
        <div className={styles.accountBody}>
          {people.map((person, index) => (
            <div className={styles.accountPerson} key={`${person.name}-${index}`}>
              <strong>{person.role} · {person.name}</strong>
              {person.number ? (
                <button type="button" onClick={() => onCopy(person.number)}>
                  <span>{person.bank} {person.number}</span>
                  <em>복사</em>
                </button>
              ) : null}
              {person.contact ? <a href={`tel:${String(person.contact).replace(/\D/g, '')}`}>{formatPhone(person.contact)}</a> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function BlushEditorialTemplate({
  eventData = {},
  categorizedImages = {},
  allowMessages,
  messageSettings = {},
}) {
  const [viewer, setViewer] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [toast, setToast] = useState('');
  const [guestMessages, setGuestMessages] = useState([]);
  const [messagePage, setMessagePage] = useState(0);
  const [showGuestbookModal, setShowGuestbookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const toastTimerRef = useRef(null);

  const ai = useMemo(() => getAdditionalInfo(eventData), [eventData]);
  const imageGroups = useMemo(() => buildImageGroups(eventData, categorizedImages), [categorizedImages, eventData]);
  const mainImages = imageGroups.main?.length ? imageGroups.main : DEFAULT_IMAGES.slice(0, 3);
  const galleryImages = imageGroups.gallery?.length ? imageGroups.gallery : DEFAULT_IMAGES.slice(2);
  const coverImage = mainImages[0] || galleryImages[0] || DEFAULT_IMAGES[0];
  const letterImage = mainImages[1] || galleryImages[0] || coverImage;
  const secondLetterImage = galleryImages[1] || mainImages[1] || coverImage;

  const uniqueBgImages = [coverImage, letterImage, secondLetterImage, ...galleryImages, ...mainImages]
    .filter((image, index, images) => {
      const key = getImageKey(image);
      return key && images.findIndex((item) => getImageKey(item) === key) === index;
    });
  const parentBackgroundImages = Array.from(
    { length: parentBgStyles.length },
    (_, index) => uniqueBgImages[index % Math.max(uniqueBgImages.length, 1)] || coverImage
  ).filter(Boolean);

  const groomName = eventData.groomName || eventData.groom_name || '김민수';
  const brideName = eventData.brideName || eventData.bride_name || '이서연';
  const groomGivenName = getGivenName(groomName) || groomName;
  const brideGivenName = getGivenName(brideName) || brideName;
  const groomFatherName = eventData.groomFatherName || eventData.groom_father_name || '김현수';
  const groomMotherName = eventData.groomMotherName || eventData.groom_mother_name || '박미영';
  const brideFatherName = eventData.brideFatherName || eventData.bride_father_name || '이정호';
  const brideMotherName = eventData.brideMotherName || eventData.bride_mother_name || '최은정';
  const weddingDate = eventData.date || eventData.event_date;
  const dateObj = new Date(weddingDate || Date.now());
  const validDate = !Number.isNaN(dateObj.getTime());
  const calYear = validDate ? dateObj.getFullYear() : 2026;
  const calMonth = validDate ? dateObj.getMonth() + 1 : 5;
  const calDay = validDate ? dateObj.getDate() : 2;
  const titleDate = validDate ? dateObj : new Date(calYear, calMonth - 1, calDay);
  const dateLine = `${calYear}.${String(calMonth).padStart(2, '0')}.${String(calDay).padStart(2, '0')}`;
  const dateTitle = `${dateLine}. ${titleDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}`;
  const timeStr = formatKoreanTime(eventData.ceremonyTime || eventData.ceremony_time || '');
  const locName = eventData.hallName || eventData.hall_name || eventData.location || '웨딩홀';
  const locAddr = eventData.detailedAddress || eventData.detailed_address || eventData.address || '';
  const customMessage = eventData.customMessage || eventData.custom_message ||
    '나의 바람은,\n먼 훗날에도 우리가 서로의 삶에 섞여 있는 것\n그때도 눈이 마주치면 아무 이유 없이 웃어줄 수 있는 것.\n사랑한다는 말을 주저하지 않고 전할 수 있는 것.\n그리고 너의 평생에 내가 사는 것\n\n소중한 분들을 모시고 첫 시작을 함께하고자 합니다\n귀한 걸음 하시어 축복해주신다면\n더 없는 기쁨으로 간직하겠습니다.';

  const shouldShowReviews = allowMessages !== undefined ? allowMessages !== false : eventData?.allow_messages !== false;
  const displayMessages = guestMessages.filter((message) => message.content?.trim());
  const messagesPerPage = 3;
  const totalMessagePages = Math.max(1, Math.ceil(displayMessages.length / messagesPerPage));
  const pagedMessages = displayMessages.slice(messagePage * messagesPerPage, (messagePage + 1) * messagesPerPage);

  const accounts = {
    groom: [
      { role: '신랑', name: groomName, bank: ai.groom_bank_name || '', number: ai.groom_account_number || '', contact: eventData.groomContact || eventData.groom_contact || '' },
      { role: '신랑부', name: groomFatherName, bank: ai.groom_father_bank_name || '', number: ai.groom_father_account_number || '', contact: ai.groom_father_contact || '' },
      { role: '신랑모', name: groomMotherName, bank: ai.groom_mother_bank_name || '', number: ai.groom_mother_account_number || '', contact: ai.groom_mother_contact || '' },
    ].filter((person) => person.number || person.contact),
    bride: [
      { role: '신부', name: brideName, bank: ai.bride_bank_name || '', number: ai.bride_account_number || '', contact: eventData.brideContact || eventData.bride_contact || '' },
      { role: '신부부', name: brideFatherName, bank: ai.bride_father_bank_name || '', number: ai.bride_father_account_number || '', contact: ai.bride_father_contact || '' },
      { role: '신부모', name: brideMotherName, bank: ai.bride_mother_bank_name || '', number: ai.bride_mother_account_number || '', contact: ai.bride_mother_contact || '' },
    ].filter((person) => person.number || person.contact),
  };
  const hasAnyAccount = accounts.groom.length > 0 || accounts.bride.length > 0;

  const showToast = (message) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 1800);
  };

  const copyText = async (value, message = '복사되었습니다') => {
    try {
      await navigator.clipboard.writeText(String(value || '').replace(/-/g, ''));
      showToast(message);
    } catch {
      showToast('복사에 실패했습니다');
    }
  };

  const fetchGuestbook = async () => {
    if (!eventData?.id) return;
    try {
      const response = await fetch(`/api/get-guestbook?eventId=${eventData.id}`);
      const result = await response.json();
      if (result.success && result.messages) setGuestMessages(result.messages);
    } catch {}
  };

  useEffect(() => { fetchGuestbook(); }, [eventData?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => setMessagePage((page) => Math.min(page, totalMessagePages - 1)), [totalMessagePages]);

  const openViewer = (items, index) => {
    const srcs = items.map(getImageSrc).filter(Boolean);
    if (srcs.length) setViewer({ items: srcs, index: Math.max(0, index) });
  };
  const closeViewer = () => setViewer(null);
  const moveViewer = (direction) => {
    setViewer((prev) => {
      if (!prev?.items?.length) return prev;
      return { ...prev, index: (prev.index + direction + prev.items.length) % prev.items.length };
    });
  };

  const handleGuestbookSubmit = async (guestbook) => {
    const newMessage = {
      id: `temp-${Date.now()}`,
      from: guestbook.name || '익명',
      phone: guestbook.phone,
      date: formatGuestbookDateTime(new Date()),
      content: guestbook.message || '',
    };
    setGuestMessages((prev) => [newMessage, ...prev]);
    setTimeout(fetchGuestbook, 500);
  };

  const handleContributionSubmit = async (data) => {
    const response = await fetch('/api/submit-contribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error || '축의금 등록 실패');
    setCompletionData(data);
    setShowContributionModal(false);
    setTimeout(() => setShowCompletionModal(true), 260);
  };

  return (
    <div className={styles.root}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <h1>Save the Date</h1>
          <p className={styles.enNames}>{groomName} * {brideName}</p>
          <button type="button" className={styles.laceStage} onClick={() => openViewer([coverImage], 0)}>
            <img className={styles.lacePhoto} src={getImageSrc(coverImage)} alt="" />
            <img className={styles.laceFrame} src={`${ASSET}/blush-editorial-lace-frame.png`} alt="" />
          </button>
          <p className={styles.invitePink}>YOU&apos;RE INVITED TO OUR WEDDING</p>
          <p className={styles.heroInfo}>{dateLine} {timeStr}</p>
          <p className={styles.heroInfo}>{locName}</p>
          {locAddr ? <p className={styles.heroInfo}>{locAddr}</p> : null}
        </section>

        <section className={styles.paperWrap}>
          <div className={styles.letterPaper}>
            <img className={styles.letterPaperBg} src={`${ASSET}/blush-editorial-letter-paper.png`} alt="" />
            <p className={styles.handMessage}>
              {String(customMessage).split('\n').map((line, index) => (
                <React.Fragment key={`${line}-${index}`}>{line}<br /></React.Fragment>
              ))}
            </p>
            <button type="button" className={styles.letterLargePhoto} onClick={() => openViewer([letterImage], 0)}>
              <img src={getImageSrc(letterImage)} alt="" />
            </button>
            <button type="button" className={styles.letterSmallPhoto} onClick={() => openViewer([secondLetterImage], 0)}>
              <img src={getImageSrc(secondLetterImage)} alt="" />
            </button>
            <div className={styles.letterStamp}>
              <span>{groomName}</span>
              <b>{dateLine}</b>
              <span>{brideName}</span>
            </div>
          </div>
        </section>

        <section className={styles.parents}>
          {parentBackgroundImages.map((image, index) => (
            <img key={`parent-bg-${index}`} className={`${styles.parentBgPhoto} ${parentBgStyles[index]}`} src={getImageSrc(image)} alt="" />
          ))}
          <div className={styles.parentPinkVeil} />
          <div className={styles.parentWhiteWash} />

          <article className={styles.parentBlock}>
            <p className={styles.parentTitle}>{groomFatherName} & {groomMotherName}의 아들</p>
            <h2>신랑 {groomGivenName}</h2>
            <button type="button" className={`${styles.parentPhotoFrame} ${styles.parentPhotoLeft}`} onClick={() => openViewer([letterImage], 0)}>
              <img src={getImageSrc(letterImage)} alt="" />
            </button>
            <div className={`${styles.memoPaper} ${styles.memoLined} ${styles.memoLeft}`}>
              <NotebookTexture type="lined" />
              <i className={styles.tapeLeft} />
              <p>밝고 든든한 우리 {groomGivenName}야,<br />네가 웃으며 걸어온 시간마다<br />엄마 아빠는 참 고맙고 자랑스러웠단다.<br />이제는 서로의 손을 꼭 잡고<br />천천히, 오래 행복하게 살아가렴.<br />언제나 너희 편에서 응원할게.</p>
            </div>
          </article>

          <article className={styles.parentBlock}>
            <p className={styles.parentTitle}>{brideFatherName} & {brideMotherName}의 딸</p>
            <h2>신부 {brideGivenName}</h2>
            <button type="button" className={`${styles.parentPhotoFrame} ${styles.parentPhotoRight}`} onClick={() => openViewer([secondLetterImage], 0)}>
              <img src={getImageSrc(secondLetterImage)} alt="" />
            </button>
            <div className={`${styles.memoPaper} ${styles.memoGrid} ${styles.memoRight}`}>
              <NotebookTexture type="grid" />
              <i className={styles.tapeRight} />
              <p>사랑하는 우리 {brideGivenName}에게,<br />너의 다정한 마음이 새 보금자리에도<br />따뜻하게 번져가길 바란다.<br />서로 아껴주고 웃음 잃지 말고<br />오늘처럼 예쁘게 사랑하며 살아가렴.<br />엄마 아빠가 마음 다해 축복한다.</p>
            </div>
          </article>
        </section>

        <section className={styles.gallery}>
          {galleryImages.slice(0, 15).map((image, index) => (
            <button type="button" key={`${getImageSrc(image)}-${index}`} onClick={() => openViewer(galleryImages, index)}>
              <img src={getImageSrc(image)} alt={`gallery-${index + 1}`} />
            </button>
          ))}
        </section>

        <CalendarBlock year={calYear} month={calMonth} day={calDay} dateTitle={dateTitle} timeStr={timeStr} />

        {locName ? (
          <>
            <section className={styles.mapTitleSection}>
              <img src={`${ASSET}/blush-map-title.png`} alt="오시는 길" />
            </section>
            <section className={styles.location}>
              <div className={styles.mapBox}>
                <GoogleMapEmbed address={locAddr || locName} venueName={locName} height="270px" />
              </div>
              <div className={styles.addressRow}>
                <div>
                  <h3>{locName}</h3>
                  {locAddr ? <p>{locAddr}</p> : null}
                </div>
                {locAddr ? <button type="button" onClick={() => copyText(locAddr, '주소가 복사되었습니다')}>복사</button> : null}
              </div>
            </section>
          </>
        ) : null}

        {hasAnyAccount ? (
          <section className={styles.accounts}>
            <h2>마음 전하실 곳</h2>
            <AccountGroup title="신랑 측 계좌번호" people={accounts.groom} open={activeAccount === 'groom'} onToggle={() => setActiveAccount(activeAccount === 'groom' ? null : 'groom')} onCopy={copyText} />
            <AccountGroup title="신부 측 계좌번호" people={accounts.bride} open={activeAccount === 'bride'} onToggle={() => setActiveAccount(activeAccount === 'bride' ? null : 'bride')} onCopy={copyText} />
          </section>
        ) : null}

        {shouldShowReviews ? (
          <section className={styles.messages}>
            <h2>축하 메시지</h2>
            {pagedMessages.length ? pagedMessages.map((message) => (
              <article key={message.id || `${message.from}-${message.date}`} className={styles.messageCard}>
                <strong>{message.from || message.guestName || '익명'}</strong>
                <p>{message.content}</p>
              </article>
            )) : <p className={styles.emptyMessage}>첫 축하 메시지를 남겨주세요.</p>}
            {displayMessages.length > messagesPerPage ? (
              <div className={styles.pagination}>
                <button type="button" onClick={() => setMessagePage((page) => Math.max(0, page - 1))} disabled={messagePage === 0}>‹</button>
                <span>{messagePage + 1} / {totalMessagePages}</span>
                <button type="button" onClick={() => setMessagePage((page) => Math.min(totalMessagePages - 1, page + 1))} disabled={messagePage === totalMessagePages - 1}>›</button>
              </div>
            ) : null}
            <button type="button" className={styles.darkButton} onClick={() => setShowGuestbookModal(true)}>축하 메시지 남기기</button>
          </section>
        ) : null}

        <section className={styles.share}>
          <button type="button" className={styles.kakaoButton} onClick={() => setShowContributionModal(true)}>축의금 전달하기</button>
          <button type="button" className={styles.urlButton} onClick={() => copyText(typeof window !== 'undefined' ? window.location.href : '', '청첩장 주소가 복사되었습니다')}>청첩장 주소 복사하기</button>
          <p>ⓒ GyeongjoApp</p>
        </section>
      </main>

      {viewer ? (
        <div className={styles.viewer}>
          <button type="button" className={styles.viewerClose} onClick={closeViewer}>닫기</button>
          {viewer.items.length > 1 ? (
            <>
              <button type="button" className={`${styles.viewerNav} ${styles.viewerPrev}`} onClick={() => moveViewer(-1)}>‹</button>
              <button type="button" className={`${styles.viewerNav} ${styles.viewerNext}`} onClick={() => moveViewer(1)}>›</button>
            </>
          ) : null}
          <img src={viewer.items[viewer.index]} alt="" />
          <div className={styles.viewerCounter}>{viewer.index + 1} / {viewer.items.length}</div>
        </div>
      ) : null}

      {toast ? <div className={styles.toast}>{toast}</div> : null}

      <GuestbookModal
        isOpen={showGuestbookModal}
        onClose={() => setShowGuestbookModal(false)}
        onSubmit={handleGuestbookSubmit}
        eventId={eventData.id}
        eventType="wedding"
        groomName={groomName}
        brideName={brideName}
        placeholder={messageSettings?.placeholder || '축하 메시지를 입력해주세요'}
      />
      <EditGuestbookModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingMessage(null); }}
        message={editingMessage}
        onUpdate={fetchGuestbook}
        onDelete={fetchGuestbook}
      />
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSubmit={handleContributionSubmit}
        eventId={eventData.id}
        eventType="wedding"
        groomName={groomName}
        brideName={brideName}
      />
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => { setShowCompletionModal(false); setCompletionData(null); }}
        contributionData={completionData}
        eventType="wedding"
        groomName={groomName}
        brideName={brideName}
      />
    </div>
  );
}
