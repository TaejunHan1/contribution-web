import React, { useEffect, useMemo, useRef, useState } from 'react';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import ContributionModal from '../ContributionModal';
import CompletionModal from '../CompletionModal';
import WelcomeChoiceModal from '../WelcomeChoiceModal';
import styles from './PhotoBookTemplate.module.css';

const ASSET = '/studio/elements';
const APP_DEFAULT_IMAGES = [
  '/images/aa1.png', '/images/aa2.png', '/images/aa3.png', '/images/aa1.png', '/images/aa2.png',
  '/images/aa3.png', '/images/aa1.png', '/images/aa2.png', '/images/aa3.png', '/images/aa1.png',
  '/images/aa2.png', '/images/aa3.png', '/images/aa1.png', '/images/aa2.png', '/images/aa3.png',
  '/images/aa1.png', '/images/aa2.png', '/images/aa3.png', '/images/aa1.png', '/images/aa2.png',
];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
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

const getImageSrc = image => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image.publicUrl || image.primaryUrl || image.uri || image.url || image.src || null;
};

const getAdditionalInfo = eventData => {
  if (!eventData.additional_info) return {};
  if (typeof eventData.additional_info === 'string') {
    try { return JSON.parse(eventData.additional_info); } catch { return {}; }
  }
  return eventData.additional_info || {};
};

const formatPhone = phone => {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone || '';
};

const formatKoreanTime = time => {
  const value = String(time || '').trim();
  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return value;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = hour < 12 ? '오전' : '오후';
  return `${period} ${hour % 12 || 12}시${minute > 0 ? ` ${minute}분` : ''}`;
};

const formatGuestbookDateTime = dateValue => {
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

const getPhotoFrame = ai => {
  const frame = ai?.photo_frame || ai?.photoFrame;
  const id = frame?.id || frame?.key;
  if (!id || !PHOTO_FRAME_SOURCES[id]) return null;
  return {
    src: PHOTO_FRAME_SOURCES[id],
    scale: Number(frame.scale) || 0.78,
    offsetX: Number(frame.offsetX) || 0,
    offsetY: Number(frame.offsetY) || 0,
  };
};

function Section({ label, title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionLabel}>{label}</div>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <img className={styles.sectionDivider} src={`${ASSET}/17-divider-leaves-horizontal.png`} alt="" draggable={false} />
      {children}
    </section>
  );
}

function PhotoFrameOverlay({ frame }) {
  if (!frame?.src) return null;
  const scale = frame.scale || 0.78;
  return (
    <div className={styles.coverFrameLayer} aria-hidden="true">
      <img
        className={styles.coverFrameOverlay}
        src={frame.src}
        alt=""
        draggable={false}
        style={{
          width: `${scale * 100}%`,
          height: `${scale * 100}%`,
          transform: `translate(${frame.offsetX}px, ${frame.offsetY}px)`,
        }}
      />
    </div>
  );
}

function AccountBlock({ title, people, open, onToggle, onCopy }) {
  if (!people.length) return null;
  return (
    <div className={styles.accountCard}>
      <button type="button" className={styles.accountHeader} onClick={onToggle}>
        <span>{title}</span>
        <b>{open ? '닫기' : '보기'}</b>
      </button>
      {open ? (
        <div className={styles.accountBody}>
          {people.map((person, index) => (
            <div className={styles.personCard} key={`${person.name}-${index}`}>
              <strong>{person.name}</strong>
              {person.number ? (
                <button type="button" className={styles.personRow} onClick={() => onCopy(person.number)}>
                  <span>{person.bank} {person.number}</span>
                  <em>복사</em>
                </button>
              ) : null}
              {person.contact ? (
                <a className={styles.personRow} href={`tel:${person.contact.replace(/\D/g, '')}`}>
                  <span>{formatPhone(person.contact)}</span>
                  <em>전화</em>
                </a>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PhotoBookTemplate({
  eventData = {},
  categorizedImages = {},
  allowMessages,
  messageSettings = {},
}) {
  const [introVisible, setIntroVisible] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [viewer, setViewer] = useState(null);
  const [activeAccount, setActiveAccount] = useState(null);
  const [toast, setToast] = useState('');
  const [guestMessages, setGuestMessages] = useState([]);
  const [showGuestbookModal, setShowGuestbookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showWelcomeChoice, setShowWelcomeChoice] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [myContribution, setMyContribution] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const toastTimerRef = useRef(null);

  const ai = useMemo(() => getAdditionalInfo(eventData), [eventData]);
  const groomName = eventData.groomName || eventData.groom_name || '신랑';
  const brideName = eventData.brideName || eventData.bride_name || '신부';
  const weddingDate = eventData.date || eventData.event_date;
  const wd = new Date(weddingDate || Date.now());
  const validDate = !Number.isNaN(wd.getTime());
  const calYear = validDate ? wd.getFullYear() : 2026;
  const calMonth = validDate ? wd.getMonth() + 1 : 1;
  const calDay = validDate ? wd.getDate() : 1;
  const firstDow = new Date(calYear, calMonth - 1, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const dateLine = `${calYear}.${String(calMonth).padStart(2, '0')}.${String(calDay).padStart(2, '0')}`;
  const timeStr = formatKoreanTime(eventData.ceremonyTime || eventData.ceremony_time || '');
  const introDateText = timeStr ? `${dateLine}  ${timeStr}` : dateLine;
  const locName = eventData.hallName || eventData.hall_name || eventData.location || '';
  const locAddr = eventData.detailedAddress || eventData.detailed_address || eventData.address || '';
  const customMessage = eventData.customMessage || eventData.custom_message ||
    '서로가 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며\n걸어가고자 합니다.\n\n소중한 분들의 축복 속에서\n새로운 시작을 함께하고 싶습니다.';

  const defaultImages = useMemo(() => ({
    main: APP_DEFAULT_IMAGES.slice(0, 2),
    gallery: APP_DEFAULT_IMAGES.slice(2, 10),
    groom: [APP_DEFAULT_IMAGES[0]],
    bride: [APP_DEFAULT_IMAGES[1]],
    all: APP_DEFAULT_IMAGES,
  }), []);

  const processedImages = useMemo(() => {
    if (categorizedImages && Object.keys(categorizedImages).length > 0) return categorizedImages;
    if (eventData?.processedImages?.length > 0) {
      const grouped = { main: [], gallery: [], groom: [], bride: [], all: [] };
      eventData.processedImages.forEach(img => {
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
    if (eventData.image_urls?.length > 0) {
      const normalized = eventData.image_urls.map(img => (
        typeof img === 'string'
          ? { uri: img, category: 'main' }
          : { uri: img.publicUrl || img.primaryUrl || img.uri || img.url, category: img.category || 'main' }
      ));
      return {
        main: normalized.filter(img => img.category === 'main'),
        gallery: normalized.filter(img => img.category === 'gallery'),
      };
    }
    return defaultImages;
  }, [categorizedImages, defaultImages, eventData.image_urls, eventData?.processedImages]);

  const mainImages = processedImages.main?.length ? processedImages.main : defaultImages.main;
  const galleryImages = processedImages.gallery?.length ? processedImages.gallery : defaultImages.gallery;
  const mainImage = getImageSrc(mainImages[0]);
  const galleryItems = galleryImages.map(getImageSrc).filter(Boolean);
  const selectedPhotoFrame = useMemo(() => getPhotoFrame(ai), [ai]);
  const shouldShowReviews = allowMessages !== undefined ? allowMessages !== false : eventData?.allow_messages !== false;

  const accounts = {
    groom: [
      { name: groomName, bank: ai.groom_bank_name || '', number: ai.groom_account_number || '', contact: eventData.groomContact || eventData.groom_contact || '' },
      { name: eventData.groomFatherName || eventData.groom_father_name || '신랑 아버님', bank: ai.groom_father_bank_name || '', number: ai.groom_father_account_number || '', contact: ai.groom_father_contact || '' },
      { name: eventData.groomMotherName || eventData.groom_mother_name || '신랑 어머님', bank: ai.groom_mother_bank_name || '', number: ai.groom_mother_account_number || '', contact: ai.groom_mother_contact || '' },
    ].filter(person => person.number || person.contact),
    bride: [
      { name: brideName, bank: ai.bride_bank_name || '', number: ai.bride_account_number || '', contact: eventData.brideContact || eventData.bride_contact || '' },
      { name: eventData.brideFatherName || eventData.bride_father_name || '신부 아버님', bank: ai.bride_father_bank_name || '', number: ai.bride_father_account_number || '', contact: ai.bride_father_contact || '' },
      { name: eventData.brideMotherName || eventData.bride_mother_name || '신부 어머님', bank: ai.bride_mother_bank_name || '', number: ai.bride_mother_account_number || '', contact: ai.bride_mother_contact || '' },
    ].filter(person => person.number || person.contact),
  };
  const hasAnyAccount = accounts.groom.length > 0 || accounts.bride.length > 0;

  const showToast = message => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 1800);
  };

  const copyAccount = async value => {
    try {
      await navigator.clipboard.writeText((value || '').replace(/-/g, ''));
      showToast('계좌번호가 복사되었습니다');
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

  useEffect(() => {
    if (!eventData?.id) return undefined;
    const key = `arrival_checked_${eventData.id}`;
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && !localStorage.getItem(key)) setShowWelcomeChoice(true);
    }, 1400);
    return () => clearTimeout(timer);
  }, [eventData?.id]);

  useEffect(() => {
    [mainImage, ...galleryItems.slice(0, 6), '/studio/references/mobile-wedding-intro-reference-1-fast.jpg']
      .filter(Boolean)
      .forEach(src => {
        const img = new Image();
        img.src = src;
      });
  }, [galleryItems, mainImage]);

  const openIntro = () => {
    setContentVisible(true);
    setTimeout(() => setIntroVisible(false), 520);
  };

  const openViewer = (group, index) => {
    const items = group === 'main' ? mainImages.map(getImageSrc).filter(Boolean) : galleryItems;
    if (!items.length) return;
    setViewer({ items, index: Math.max(0, Math.min(index, items.length - 1)) });
  };
  const closeViewer = () => setViewer(null);
  const moveViewer = direction => {
    setViewer(prev => {
      if (!prev?.items?.length) return prev;
      return { ...prev, index: (prev.index + direction + prev.items.length) % prev.items.length };
    });
  };

  const handleGuestbookSubmit = async guestbook => {
    const newMessage = {
      id: `temp-${Date.now()}`,
      from: guestbook.name || '익명',
      phone: guestbook.phone,
      date: formatGuestbookDateTime(new Date()),
      content: guestbook.message || '',
    };
    setGuestMessages(prev => [newMessage, ...prev]);
    setTimeout(fetchGuestbook, 500);
  };

  const handleContributionSubmit = async data => {
    const response = await fetch('/api/submit-contribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.error || '축의금 등록 실패');
    if (typeof window !== 'undefined') localStorage.setItem(`arrival_checked_${eventData?.id}`, 'true');
    setCompletionData(data);
    setMyContribution({ ...data, amount: data.contributionAmount });
    setShowContributionModal(false);
    setIsEditMode(false);
    setTimeout(() => setShowCompletionModal(true), 260);
  };

  const displayMessages = guestMessages.filter(message => message.content?.trim());

  return (
    <div className={styles.root}>
      <main className={`${styles.page} ${contentVisible ? styles.pageVisible : ''}`}>
        <section className={styles.hero}>
          <button type="button" className={styles.coverPhotoCard} onClick={() => openViewer('main', 0)}>
            {mainImage ? <img src={mainImage} alt="" className={styles.coverPhoto} /> : null}
            <PhotoFrameOverlay frame={selectedPhotoFrame} />
          </button>
          <div className={styles.coverMeta}>
            <img className={styles.coverBouquetDecor} src={`${ASSET}/32-wedding-watercolor-bouquet-ornament.png`} alt="" />
            <img className={styles.coverHeelsDecor} src={`${ASSET}/34-wedding-bridal-heels-veil-ornament.png`} alt="" />
            <div className={styles.coverMetaInner}>
              <div className={styles.coverLabelWrap}>
                <span />
                <b>Wedding Invitation</b>
                <span />
              </div>
              <div className={styles.coverNameBlock}>
                <strong>{groomName}</strong>
                <img src={`${ASSET}/31-wedding-ornament-rings-ribbon.png`} alt="" />
                <strong>{brideName}</strong>
              </div>
              <p>{dateLine}</p>
            </div>
          </div>
        </section>

        <Section label="Invitation" title="초대합니다">
          <div className={styles.invitationPanel}>
            <img className={styles.invitationTopDecor} src={`${ASSET}/1-eucalyptus-branch-top-right.png`} alt="" />
            <img className={styles.invitationBottomDecor} src={`${ASSET}/2-white-flowers-bottom-left.png`} alt="" />
            <p className={styles.invitationText}>
              {String(customMessage).split('\n').map((line, index) => (
                <React.Fragment key={`${line}-${index}`}>{line}<br /></React.Fragment>
              ))}
            </p>
            <div className={styles.signatureRow}>
              <span>{groomName}</span>
              <b>·</b>
              <span>{brideName}</span>
            </div>
          </div>
        </Section>

        <Section label="Wedding Day" title="결혼식 일정">
          <div className={styles.datePanel}>
            <img className={styles.dateCornerDecor} src={`${ASSET}/19-corner-ornament.png`} alt="" />
            <img className={styles.dateFlowerDecor} src={`${ASSET}/6-babies-breath-small.png`} alt="" />
            <div className={styles.dateSummary}>
              <strong>{dateLine}</strong>
              <p>
                <span>{timeStr}</span>
                {locName ? <b>·</b> : null}
                {locName ? <span>{locName}</span> : null}
              </p>
            </div>
            <div className={styles.calendar}>
              <div className={styles.calendarHeader}>
                {DAYS.map((d, i) => <span key={`${d}${i}`}>{d}</span>)}
              </div>
              <div className={styles.calendarGrid}>
                {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  return <span key={day} className={day === calDay ? styles.selectedDay : ''}>{day}</span>;
                })}
              </div>
            </div>
          </div>
        </Section>

        <Section label="Gallery" title="사진첩">
          <div className={styles.galleryGrid}>
            {galleryItems.slice(0, 12).map((src, index) => (
              <button type="button" key={`${src}-${index}`} onClick={() => openViewer('gallery', index)}>
                <img src={src} alt={`gallery-${index + 1}`} />
              </button>
            ))}
          </div>
        </Section>

        {locName ? (
          <Section label="Location" title="오시는 길">
            <div className={styles.locationCard}>
              <h3>{locName}</h3>
              {locAddr ? <p>{locAddr}</p> : null}
            </div>
            <div className={styles.mapBox}>
              <GoogleMapEmbed address={locAddr || locName} venueName={locName} height="230px" />
            </div>
          </Section>
        ) : null}

        {hasAnyAccount ? (
          <Section label="Gift" title="마음 전하기">
            <AccountBlock title="신랑측 계좌" people={accounts.groom} open={activeAccount === 'groom'} onToggle={() => setActiveAccount(activeAccount === 'groom' ? null : 'groom')} onCopy={copyAccount} />
            <AccountBlock title="신부측 계좌" people={accounts.bride} open={activeAccount === 'bride'} onToggle={() => setActiveAccount(activeAccount === 'bride' ? null : 'bride')} onCopy={copyAccount} />
          </Section>
        ) : null}

        {shouldShowReviews ? (
          <Section label="Messages" title="축하 메시지">
            <div className={styles.messageActions}>
              <button type="button" onClick={() => setShowGuestbookModal(true)}>축하 메시지 남기기</button>
            </div>
            <div className={styles.messages}>
              {displayMessages.slice(0, 4).map(message => (
                <article key={message.id} className={styles.messageCard}>
                  <strong>{message.from || message.guestName || '익명'}</strong>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>
          </Section>
        ) : null}

        <footer className={styles.footer}>{groomName} & {brideName}</footer>
      </main>

      {introVisible ? (
        <div className={styles.introLayer}>
          <button type="button" className={styles.introTouch} onClick={openIntro}>
            <img className={styles.introReferenceImage} src="/studio/references/mobile-wedding-intro-reference-1-fast.jpg" alt="" />
            <div className={styles.introContent}>
              <div className={styles.introNames}>
                <strong>{groomName}</strong>
                <b>&</b>
                <strong>{brideName}</strong>
              </div>
              <p>{introDateText}</p>
              <span>청첩장 열기<i /></span>
            </div>
          </button>
        </div>
      ) : null}

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

      <WelcomeChoiceModal
        isOpen={showWelcomeChoice}
        onClose={() => setShowWelcomeChoice(false)}
        onSelectGuestbook={() => { setShowWelcomeChoice(false); setShowGuestbookModal(true); }}
        onSelectContribution={() => { setShowWelcomeChoice(false); setShowContributionModal(true); }}
        eventType="wedding"
      />
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
        onClose={() => { setShowContributionModal(false); setIsEditMode(false); }}
        onSubmit={handleContributionSubmit}
        eventId={eventData.id}
        eventType="wedding"
        groomName={groomName}
        brideName={brideName}
        existingData={isEditMode ? myContribution : null}
      />
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => { setShowCompletionModal(false); setCompletionData(null); }}
        contributionData={completionData}
        eventType="wedding"
        groomName={groomName}
        brideName={brideName}
        isEditMode={isEditMode}
      />
    </div>
  );
}
