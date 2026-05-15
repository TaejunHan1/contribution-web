import React, { useEffect, useMemo, useRef, useState } from 'react';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import styles from './FuneralNoticeTemplate.module.css';

const ASSET = '/funeral';
const DEFAULT_PHOTO = '/funeral/templates/oldface.png';

const PHOTO_FRAMES = {
  'funeral-template-modern-card': `${ASSET}/templates/funeral-template-modern-card.png`,
  'funeral-template-editorial-timeline': `${ASSET}/templates/funeral-template-editorial-timeline.png`,
  'funeral-template-paper-letter': `${ASSET}/templates/funeral-template-paper-letter.png`,
  'funeral-template-certificate': `${ASSET}/templates/funeral-template-certificate.png`,
  'funeral-template-classic-flower': `${ASSET}/templates/funeral-template-classic-flower.png`,
};

const FRAME_ASPECTS = {
  'funeral-template-modern-card': 1024 / 1535,
  'funeral-template-editorial-timeline': 941 / 1672,
  'funeral-template-paper-letter': 941 / 1672,
  'funeral-template-certificate': 941 / 1672,
  'funeral-template-classic-flower': 1024 / 1535,
};

const getAdditionalInfo = eventData => {
  const value = eventData?.additional_info || eventData?.additionalInfo || {};
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return value || {};
};

const getImageSrc = image => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image.publicUrl || image.primaryUrl || image.uri || image.url || image.src || null;
};

const normalizeImages = (eventData, categorizedImages) => {
  if (categorizedImages && Object.keys(categorizedImages).length > 0) return categorizedImages;

  const grouped = { main: [], gallery: [], all: [] };
  const push = image => {
    const item = typeof image === 'string'
      ? { uri: image, category: 'main' }
      : { ...image, uri: getImageSrc(image), category: image?.category || 'main' };
    if (!item.uri) return;
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
    grouped.all.push(item);
  };

  if (Array.isArray(eventData?.processedImages)) eventData.processedImages.forEach(push);
  if (grouped.all.length === 0 && Array.isArray(eventData?.image_urls)) eventData.image_urls.forEach(push);
  if (grouped.all.length === 0) {
    const ai = getAdditionalInfo(eventData);
    Object.values(ai.categorized_images || {}).flat().forEach(push);
  }

  return grouped;
};

const toDate = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = value => {
  const date = toDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
};

const formatDateShort = value => {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = value => {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return raw;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = hour < 12 ? '오전' : '오후';
  return `${period} ${hour % 12 || 12}시${minute ? ` ${minute}분` : ''}`;
};

const formatPhone = phone => {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone || '';
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
  const frame = ai.photo_frame || ai.photoFrame || {};
  const key = frame.key || frame.id || 'funeral-template-modern-card';
  return {
    key,
    src: PHOTO_FRAMES[key] || PHOTO_FRAMES['funeral-template-modern-card'],
    aspect: FRAME_ASPECTS[key] || FRAME_ASPECTS['funeral-template-modern-card'],
  };
};

const getPhotoTransform = ai => {
  const layout = ai.main_photo_layout || ai.mainPhotoLayout || {};
  const scale = Number(layout.scale);
  const x = Number(layout.translateX);
  const y = Number(layout.translateY);
  return {
    transform: `translate(${Number.isFinite(x) ? x * 0.18 : 0}px, ${Number.isFinite(y) ? y * 0.18 : 0}px) scale(${Number.isFinite(scale) ? scale : 1})`,
  };
};

const getFamilyMembers = eventData => {
  const ai = getAdditionalInfo(eventData);
  const list = eventData.familyMembers || eventData.family_members || ai.family_members || [];
  return Array.isArray(list) ? list.filter(member => member?.names) : [];
};

const getAccounts = eventData => {
  const ai = getAdditionalInfo(eventData);
  const list = eventData.condolenceAccounts || eventData.condolence_accounts || ai.condolence_accounts || [];
  return Array.isArray(list)
    ? list.map(account => ({
      bank: account.bank_name || account.bankName || '',
      number: account.account_number || account.accountNumber || '',
      owner: account.owner_name || account.ownerName || '',
    })).filter(account => account.bank || account.number || account.owner)
    : [];
};

function Section({ icon, label, title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        {icon ? <img src={`${ASSET}/icons/${icon}`} alt="" /> : null}
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <img className={styles.divider} src={`${ASSET}/elements/funeral-divider-flower.png`} alt="" />
      {children}
    </section>
  );
}

function PhotoFrame({ image, eventData, ai }) {
  const frame = getPhotoFrame(ai);
  return (
    <button type="button" className={styles.photoFrame} style={{ aspectRatio: frame.aspect }} aria-label="고인 사진">
      <img className={styles.memorialPhoto} src={image || DEFAULT_PHOTO} alt="" style={getPhotoTransform(ai)} />
      <img className={styles.photoFrameImage} src={frame.src} alt="" />
      <div className={styles.photoCaption}>
        <strong>故 {eventData.main_person_name || eventData.deceasedName || '고인'}</strong>
        <span>{getMemorialPeriod(eventData)}</span>
      </div>
    </button>
  );
}

const getMemorialPeriod = eventData => {
  const birth = formatDateShort(eventData.birth_date || eventData.birthDate);
  const death = formatDateShort(eventData.death_date || eventData.deathDate);
  if (birth && death) return `${birth} - ${death}`;
  return death || birth || '';
};

export default function FuneralNoticeTemplate({ eventData = {}, categorizedImages = {}, allowMessages, messageSettings = {} }) {
  const [guestMessages, setGuestMessages] = useState([]);
  const [showGuestbookModal, setShowGuestbookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);

  const ai = useMemo(() => getAdditionalInfo(eventData), [eventData]);
  const images = useMemo(() => normalizeImages(eventData, categorizedImages), [categorizedImages, eventData]);
  const mainImage = getImageSrc(images.main?.[0]) || getImageSrc(images.all?.[0]);
  const deceasedName = eventData.main_person_name || eventData.deceasedName || '고인';
  const deceasedAge = eventData.deceased_age || eventData.deceasedAge;
  const familyMembers = getFamilyMembers(eventData);
  const accounts = getAccounts(eventData);
  const shouldShowMessages = allowMessages !== undefined ? allowMessages !== false : eventData.allow_messages !== false;
  const templateStyle = eventData.template_style || 'modern-card';
  const variantClass = styles[`variant_${templateStyle.replace(/-/g, '_')}`] || styles.variant_modern_card;
  const funeralHome = eventData.funeral_home || eventData.funeralHome || ai.funeral_home || eventData.location || '';
  const funeralAddress = eventData.location || eventData.funeralAddress || ai.funeral_address || '';
  const detailedAddress = eventData.detailed_address || eventData.detailedAddress || '';
  const customMessage = eventData.custom_message || eventData.customMessage || ai.custom_message ||
    '황망한 마음으로 삼가 알려드립니다.\n고인의 마지막 길에 따뜻한 위로와 마음을 전해주시면 감사하겠습니다.';

  const scheduleItems = [
    { label: '별세', date: eventData.death_date || eventData.deathDate, time: eventData.death_time || eventData.deathTime, icon: 'icon-schedule.png' },
    { label: '입관', date: eventData.casket_date || eventData.casketDate || ai.casket_date, time: eventData.casket_time || eventData.casketTime || ai.casket_time, icon: 'icon-casket.png' },
    { label: '발인', date: eventData.burial_date || eventData.burialDate, time: eventData.burial_time || eventData.burialTime, icon: 'icon-procession.png' },
    { label: '장지', text: eventData.burial_location || eventData.burialLocation || ai.burial_location, icon: 'icon-burial.png' },
  ].filter(item => item.date || item.time || item.text);

  const guideItems = [
    eventData.religious_rite || ai.religious_rite,
    eventData.funeral_method || ai.funeral_method,
    eventData.visitation_note || ai.visitation_note,
    eventData.parking_transport_info || ai.parking_transport_info,
  ].filter(Boolean);

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

  const displayMessages = guestMessages.filter(message => (message.content || message.message || '').trim());

  return (
    <div className={`${styles.root} ${variantClass}`}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <img className={styles.hanjiBg} src={`${ASSET}/elements/funeral-bg-hanji.png`} alt="" />
          <img className={styles.heroBranch} src={`${ASSET}/elements/funeral-host-branch.png`} alt="" />
          <img className={styles.heroFlower} src={`${ASSET}/elements/funeral-account-flower.png`} alt="" />
          <p className={styles.eyebrow}>삼가 고인의 명복을 빕니다</p>
          <PhotoFrame image={mainImage} eventData={eventData} ai={ai} />
          <div className={styles.heroText}>
            <span>訃告</span>
            <h1>故 {deceasedName}</h1>
            {deceasedAge ? <p>향년 {deceasedAge}세</p> : null}
            <em>{formatDate(eventData.death_date || eventData.deathDate)}</em>
          </div>
        </section>

        <Section icon="icon-family-message.png" label="MESSAGE" title="상주의 말">
          <p className={styles.messageText}>{customMessage}</p>
        </Section>

        {familyMembers.length > 0 && (
          <Section icon="icon-host.png" label="HOST" title="상주">
            <div className={styles.familyGrid}>
              {familyMembers.map((member, index) => (
                <div className={styles.familyItem} key={`${member.relation}-${member.names}-${index}`}>
                  <span>{member.relation}</span>
                  <strong>{member.names}</strong>
                </div>
              ))}
            </div>
          </Section>
        )}

        {scheduleItems.length > 0 && (
          <Section icon="icon-schedule.png" label="SCHEDULE" title="장례 일정">
            <div className={styles.scheduleList}>
              {scheduleItems.map((item, index) => (
                <div className={styles.scheduleItem} key={`${item.label}-${index}`}>
                  <div className={styles.scheduleIcon}><img src={`${ASSET}/icons/${item.icon}`} alt="" /></div>
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.text || [formatDate(item.date), formatTime(item.time)].filter(Boolean).join(' ')}</strong>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section icon="icon-location.png" label="PLACE" title="빈소 안내">
          <div className={styles.placeCard}>
            <strong>{funeralHome || '장례식장'}</strong>
            {detailedAddress ? <span>{detailedAddress}</span> : null}
            {funeralAddress ? <p>{funeralAddress}</p> : null}
            {eventData.primary_contact ? (
              <a href={`tel:${String(eventData.primary_contact).replace(/\D/g, '')}`}>상주 연락처 {formatPhone(eventData.primary_contact)}</a>
            ) : null}
          </div>
          {funeralAddress ? (
            <div className={styles.mapWrap}>
              <GoogleMapEmbed address={funeralAddress} venueName={funeralHome} height="240px" />
            </div>
          ) : null}
        </Section>

        {guideItems.length > 0 && (
          <Section icon="icon-guidance.png" label="GUIDE" title="조문 안내">
            <div className={styles.guideList}>
              {guideItems.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
            </div>
          </Section>
        )}

        {accounts.length > 0 && (
          <Section icon="icon-condolence-account.png" label="ACCOUNT" title="부의금 계좌">
            <div className={styles.accountList}>
              {accounts.map((account, index) => (
                <button type="button" className={styles.accountItem} key={`${account.number}-${index}`} onClick={() => copyAccount(account.number)}>
                  <span>{account.owner}</span>
                  <strong>{account.bank} {account.number}</strong>
                  <em>복사</em>
                </button>
              ))}
            </div>
          </Section>
        )}

        {shouldShowMessages && (
          <Section icon="icon-guestbook.png" label="GUESTBOOK" title="조문 메시지">
            <div className={styles.messageList}>
              {displayMessages.length > 0 ? displayMessages.slice(0, 8).map((message, index) => (
                <article key={message.id || index}>
                  <strong>{message.from || message.sender_name || message.guest_name || '익명'}</strong>
                  <p>{message.content || message.message}</p>
                </article>
              )) : (
                <p className={styles.emptyText}>아직 남겨진 조문 메시지가 없습니다.</p>
              )}
            </div>
            <button type="button" className={styles.primaryButton} onClick={() => setShowGuestbookModal(true)}>
              조문 메시지 남기기
            </button>
          </Section>
        )}

        <section className={styles.actionSection}>
          <a href={`/contribute/${eventData.id}`}>부의금 전달하기</a>
          <button type="button" onClick={() => setShowGuestbookModal(true)}>조문 메시지</button>
        </section>
      </main>

      {toast ? <div className={styles.toast}>{toast}</div> : null}

      <GuestbookModal
        isOpen={showGuestbookModal}
        onClose={() => setShowGuestbookModal(false)}
        onSubmit={handleGuestbookSubmit}
        eventData={eventData}
      />
      <EditGuestbookModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingMessage(null); }}
        message={editingMessage}
        onUpdate={fetchGuestbook}
        onDelete={fetchGuestbook}
      />
    </div>
  );
}
