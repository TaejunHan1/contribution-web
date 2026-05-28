import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './cheongmo.module.css';

const stepCount = 11;
const verificationSeconds = 5 * 60;

const normalizePhone = value => String(value || '').replace(/\D/g, '');
const isKoreanMobilePhone = value => /^010\d{8}$/.test(normalizePhone(value));
const formatKoreanMobilePhone = value => {
  const digits = normalizePhone(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};
const normalizePassword = value =>
  String(value || '').replace(/[^A-Za-z0-9]/g, '');
const formatDateValue = date =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
const formatKoreanDateLabel = value => {
  if (!value) return '';
  const [year, month, day] = String(value).split('-').map(Number);
  if (!year || !month || !day) return value;
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][
    new Date(year, month - 1, day).getDay()
  ];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
};

const koreanHolidays = {
  '2026-06-03': '지방선거',
  '2026-06-06': '현충일',
  '2026-07-17': '제헌절',
  '2026-08-15': '광복절',
  '2026-08-17': '대체공휴일',
  '2026-09-24': '추석 연휴',
  '2026-09-25': '추석',
  '2026-09-26': '추석 연휴',
  '2026-10-03': '개천절',
  '2026-10-05': '대체공휴일',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',
  '2027-01-01': '신정',
  '2027-02-06': '설 연휴',
  '2027-02-07': '설날',
  '2027-02-08': '설 연휴',
  '2027-02-09': '대체공휴일',
  '2027-03-01': '삼일절',
  '2027-05-05': '어린이날',
  '2027-05-13': '부처님오신날',
};

const messageSamples = [
  '결혼식 전에 고마운 분들과 편하게 식사 자리를 갖고 싶습니다. 가능한 일정을 남겨주시면 맞춰보겠습니다.',
  '청첩장을 직접 전해드리며 식사 대접을 하고 싶습니다. 참석 가능한 날짜를 선택해주시면 감사하겠습니다.',
  '결혼을 앞두고 감사한 마음을 전하고자 작은 자리를 마련하고 싶습니다. 편한 일정을 알려주시면 좋겠습니다.',
  '오랜만에 얼굴 보고 식사하며 이야기 나누는 자리를 갖고 싶습니다. 가능한 날짜를 선택해주시면 감사하겠습니다.',
  '결혼 소식을 직접 전하고 감사 인사를 드리고 싶어 식사 자리를 준비하고 있습니다.',
  '부담 없는 식사 자리로 인사드리고 싶습니다. 참석 가능한 일정을 편하게 남겨주시면 감사하겠습니다.',
  '청첩장도 전해드리고 감사한 마음도 나누고 싶어 모임을 준비하고 있습니다.',
  '결혼식 전에 꼭 한번 뵙고 인사드리고 싶습니다. 가능한 날짜를 선택해주시면 감사하겠습니다.',
  '소중한 분들과 조용히 식사하는 자리를 준비하고 있습니다. 일정 맞춰 함께 뵙겠습니다.',
  '늘 응원해주신 마음에 감사드리며, 결혼 전 식사 자리로 인사드리고 싶습니다.',
];

const StepCue = ({ icon, label }) => (
  <div className={styles.stepCue}>
    <span className={styles.softIcon}>{icon}</span>
    <strong>{label}</strong>
  </div>
);

const getKoreaToday = () => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return new Date(`${formatter.format(new Date())}T00:00:00`);
};

const getKoreaTodayValue = () => formatDateValue(getKoreaToday());

const addDaysToKoreaToday = days => {
  const date = getKoreaToday();
  date.setDate(date.getDate() + days);
  return formatDateValue(date);
};

const buildMonthOptions = () => {
  const today = getKoreaToday();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today);
  end.setFullYear(end.getFullYear() + 1);

  const months = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const value = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    months.push({
      value,
      title: `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`,
      sub:
        cursor.getFullYear() === today.getFullYear() &&
        cursor.getMonth() === today.getMonth()
          ? '이번 달'
          : '후보 달',
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
};

const getMonthDays = value => {
  const [year, month] = value.split('-').map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const days = [];

  for (let index = 0; index < firstDay.getDay(); index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const date = new Date(year, month - 1, day);
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({
      day,
      dateKey,
      weekday: date.getDay(),
      holiday: koreanHolidays[dateKey],
    });
  }

  return days;
};

export default function NewCheongmoPage() {
  const monthOptions = useMemo(buildMonthOptions, []);
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [allowedPhoneNameInput, setAllowedPhoneNameInput] = useState('');
  const [allowedPhoneInput, setAllowedPhoneInput] = useState('');
  const [codeSecondsLeft, setCodeSecondsLeft] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [activeMonth, setActiveMonth] = useState('');
  const [placeSearching, setPlaceSearching] = useState(false);
  const [placeResults, setPlaceResults] = useState([]);
  const [form, setForm] = useState({
    title: '',
    hostName: '',
    hostPhone: '',
    code: '',
    hostVerified: false,
    accessType: 'password',
    password: '',
    voteDeadlineDate: addDaysToKoreaToday(7),
    allowedPhones: [],
    selectedMonths: [],
    locationMode: 'host_decides',
    locationLabel: '',
    venueName: '',
    venueAddress: '',
    meetingTime: '',
    message: '',
  });

  const updateForm = patch => setForm(prev => ({ ...prev, ...patch }));

  useEffect(() => {
    if (codeSecondsLeft <= 0 || form.hostVerified) return undefined;

    const timer = window.setInterval(() => {
      setCodeSecondsLeft(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [codeSecondsLeft, form.hostVerified]);

  const verificationTime = useMemo(() => {
    const minutes = Math.floor(codeSecondsLeft / 60);
    const seconds = String(codeSecondsLeft % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [codeSecondsLeft]);
  const hostPhoneReady = isKoreanMobilePhone(form.hostPhone);
  const allowedPhoneReady =
    allowedPhoneNameInput.trim().length > 0 &&
    isKoreanMobilePhone(allowedPhoneInput);

  const changeStep = nextStep => {
    setFading(true);
    setTimeout(() => {
      setStep(nextStep);
      setFading(false);
    }, 260);
  };

  const sendHostCode = async () => {
    const cleanPhone = normalizePhone(form.hostPhone);
    if (!/^010\d{8}$/.test(cleanPhone)) {
      toast.error('휴대폰 번호는 010 포함 11자리로 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || '인증번호 발송에 실패했습니다.');
      }
      updateForm({ hostPhone: cleanPhone, code: '', hostVerified: false });
      setCodeSent(true);
      setCodeSecondsLeft(verificationSeconds);
      toast.success('주최자 인증번호를 보냈습니다.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyHostCode = async () => {
    if (!/^\d{6}$/.test(form.code)) {
      toast.error('6자리 인증번호를 입력해주세요.');
      return;
    }
    if (codeSent && codeSecondsLeft <= 0 && !form.hostVerified) {
      toast.error('인증 시간이 만료되었습니다. 인증번호를 다시 받아주세요.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.hostPhone, code: form.code }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || '인증에 실패했습니다.');
      }
      updateForm({ hostVerified: true });
      setCodeSecondsLeft(0);
      toast.success('주최자 인증이 완료되었습니다.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 1 && !form.title.trim()) {
      toast.error('청첩장 모임 이름을 입력해주세요.');
      return;
    }
    if (step === 2) {
      if (!form.hostName.trim()) {
        toast.error('주최자 이름을 입력해주세요.');
        return;
      }
      if (!hostPhoneReady) {
        toast.error('휴대폰 번호는 010 포함 11자리로 입력해주세요.');
        return;
      }
      updateForm({ hostPhone: normalizePhone(form.hostPhone) });
    }
    if (step === 3) {
      if (!form.hostVerified) {
        toast.error('주최자 휴대폰 인증을 완료해주세요.');
        return;
      }
    }
    if (step === 4 && form.selectedMonths.length === 0) {
      toast.error('모임 예정 달을 하나 이상 선택해주세요.');
      return;
    }
    if (step === 5) {
      if (
        form.accessType === 'password' &&
        !/^[A-Za-z0-9]{4,}$/.test(form.password)
      ) {
        toast.error('모임 비밀번호는 4자리 이상으로 설정해주세요.');
        return;
      }
      if (form.accessType === 'phone_list' && form.allowedPhones.length === 0) {
        toast.error('입장을 허용할 휴대폰 번호를 하나 이상 추가해주세요.');
        return;
      }
    }
    if (step === 5) {
      changeStep(form.accessType === 'password' ? 6 : 7);
      return;
    }
    if (step === 6) {
      if (form.accessType !== 'password') {
        changeStep(7);
        return;
      }
      if (!form.voteDeadlineDate) {
        toast.error('투표 마감일을 선택해주세요.');
        return;
      }
      if (form.voteDeadlineDate < getKoreaTodayValue()) {
        toast.error('마감일은 오늘 이후로 선택해주세요.');
        return;
      }
    }
    if (
      step === 8 &&
      form.locationMode === 'host_decides' &&
      !form.locationLabel.trim()
    ) {
      toast.error('주로 만날 지역을 입력해주세요.');
      return;
    }

    if (step === 7 && form.locationMode === 'ask_guests') {
      changeStep(9);
      return;
    }

    changeStep(Math.min(step + 1, stepCount - 1));
  };

  const prev = () => {
    if (step === 7 && form.accessType === 'phone_list') {
      changeStep(5);
      return;
    }
    if (step === 9 && form.locationMode === 'ask_guests') {
      changeStep(7);
      return;
    }

    changeStep(Math.max(step - 1, 0));
  };

  const toggleMonth = value => {
    const exists = form.selectedMonths.includes(value);
    const nextSelectedMonths = exists
      ? form.selectedMonths.filter(month => month !== value)
      : [...form.selectedMonths, value];
    if (!exists && form.selectedMonths.length >= 3) {
      toast.error('최대 3개의 달만 선택할 수 있어요.');
      return;
    }
    updateForm({ selectedMonths: nextSelectedMonths });
    setActiveMonth(
      exists ? nextSelectedMonths[nextSelectedMonths.length - 1] || '' : value
    );
  };

  const addAllowedPhone = () => {
    const name = allowedPhoneNameInput.trim();
    const cleanPhone = normalizePhone(allowedPhoneInput);
    if (!name) {
      toast.error('참여자 이름을 입력해주세요.');
      return;
    }
    if (!/^010\d{8}$/.test(cleanPhone)) {
      toast.error('휴대폰 번호는 010 포함 11자리로 입력해주세요.');
      return;
    }
    if (form.allowedPhones.some(item => item.phone === cleanPhone)) {
      toast.error('이미 추가된 번호입니다.');
      return;
    }
    updateForm({
      allowedPhones: [...form.allowedPhones, { name, phone: cleanPhone }],
    });
    setAllowedPhoneNameInput('');
    setAllowedPhoneInput('');
  };

  const searchAddress = async () => {
    const query = [form.venueName, form.venueAddress]
      .map(value => String(value || '').trim())
      .filter(Boolean)
      .join(' ');

    if (query.length < 2) {
      toast.error('매장명이나 주소를 2글자 이상 입력해주세요.');
      return;
    }

    try {
      setPlaceSearching(true);
      const response = await fetch(
        `/api/place-search?query=${encodeURIComponent(query)}`
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || '장소 검색에 실패했습니다.');
      }

      setPlaceResults(result.data || []);
      if (!result.data?.length) {
        toast.error('검색 결과가 없습니다. 주소나 매장명을 바꿔보세요.');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPlaceSearching(false);
    }
  };

  const selectPlace = place => {
    const address = place.roadAddress || place.address || '';
    updateForm({
      venueName: place.name || form.venueName,
      venueAddress: address,
      locationLabel: address || place.name || form.locationLabel,
    });
    setPlaceResults([]);
  };

  const createGathering = async () => {
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        title: form.title.trim(),
        password: normalizePassword(form.password),
        voteDeadlineDate:
          form.accessType === 'password' ? form.voteDeadlineDate : null,
        message:
          form.message.trim() ||
          `${form.hostName}님 안녕하세요. 결혼식 전에 고마운 분들과 따뜻하게 밥 한 끼 나누고 싶어요.`,
      };

      const response = await fetch('/api/cheongmo-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || '청모 생성에 실패했습니다.');
      }
      setCreated(result.data);
      window.localStorage.setItem(
        `cheongmo:host:${result.data.slug}`,
        JSON.stringify({
          slug: result.data.slug,
          hostPhone: form.hostPhone,
          createdAt: new Date().toISOString(),
        })
      );
      toast.success('청첩장 모임을 만들었습니다.');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!created?.url) return;
    await navigator.clipboard.writeText(created.url);
    toast.success('링크를 복사했습니다.');
  };

  const renderCardHeader = () => (
    <div className={styles.tdsCardHeader}>
      <button
        className={styles.tdsBackButton}
        type="button"
        aria-label="뒤로가기"
        onClick={() => window.history.back()}
      />
      <Link className={styles.tdsLogoButton} href="/cheongmo">
        <Image
          src="/cheongmo/jeongdam-card-logo.png"
          alt="정담"
          width={112}
          height={76}
          priority
        />
      </Link>
      <span aria-hidden="true" />
    </div>
  );

  const renderProgressBars = currentStep => (
    <div className={styles.tdsProgressMini} aria-hidden="true">
      {Array.from({ length: stepCount }).map((_, index) =>
        index <= currentStep ? <span key={index} /> : <i key={index} />
      )}
    </div>
  );

  const renderStep = () => {
    if (created) {
      return (
        <div className={`${styles.onboardingContent} ${styles.resultContent}`}>
          <StepCue icon="🎉" label="CREATED" />
          <h1>청첩장 모임이 만들어졌어요.</h1>
          <p>
            링크를 카카오톡에 공유하면 참여자는 설정한 방식으로 입장하고 이름만
            입력해 가입할 수 있어요.
          </p>
          <div className={styles.createdBox}>
            <strong>{created.title}</strong>
            <div className={styles.linkBox}>
              <span>공유 링크</span>
              <code>{created.url}</code>
            </div>
            {created.password && (
              <div className={styles.linkBox}>
                <span>모임 비밀번호</span>
                <code>{created.password}</code>
              </div>
            )}
          </div>
          <div className={styles.buttonRow}>
            <button className={styles.button} type="button" onClick={copyLink}>
              링크 복사
            </button>
            <Link
              className={`${styles.button} ${styles.secondaryButton}`}
              href={`/cheongmo/${created.slug}`}
            >
              참여자 화면 보기
            </Link>
          </div>
        </div>
      );
    }

    if (step === 0) {
      return (
        <div className={`${styles.onboardingContent} ${styles.tdsStartContent}`}>
          <div className={styles.tdsStartCard}>
            {renderCardHeader()}
            {renderProgressBars(0)}
            <div className={styles.tdsStartCopy}>
              <h1>청첩장 모임을 만들어볼까요?</h1>
              <p>친구들과 만나는 날을 함께 정해보세요.</p>
            </div>
            <div className={styles.tdsDiningScene} aria-hidden="true">
              <Image
                className={styles.tdsDiningImage}
                src="/cheongmo/cheongmo-dining-table-object.png"
                alt=""
                width={520}
                height={520}
                priority
              />
            </div>
            <div className={styles.tdsStartButtonWrap}>
              <button className={styles.tdsStartButton} type="button" onClick={next}>
                <span>모임 만들기 시작</span>
                <b aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className={`${styles.onboardingContent} ${styles.tdsNameStep}`}>
          <div className={styles.tdsNameBadge}>
            <span aria-hidden="true">💌</span>
            <strong>CHEONGMO</strong>
          </div>
          <h1>청첩장 모임 이름을 정해주세요.</h1>
          <p>친구들이 링크를 열었을 때 가장 먼저 보게 될 이름입니다.</p>
          <div className={styles.tdsNameField}>
            <input
              className={`${styles.bigInput} ${styles.tdsNameInput}`}
              value={form.title}
              onChange={event => updateForm({ title: event.target.value })}
              placeholder="예: 민준 · 소연 청첩장 모임"
              autoFocus
            />
          </div>
          <div className={styles.tdsNameChips} aria-label="모임 이름 빠른 선택">
            {['신랑측 친구들', '신부측 친구들', '전체 모임'].map(option => (
              <button
                className={
                  form.title === option ? styles.selectedNameChip : ''
                }
                key={option}
                type="button"
                onClick={() => updateForm({ title: option })}
              >
                <i aria-hidden="true" />
                {option}
              </button>
            ))}
          </div>
          <div className={styles.tdsNameIllustration} aria-hidden="true">
            <Image
              src="/cheongmo/cheongmo-title-illustration.png"
              alt=""
              width={900}
              height={600}
              priority
            />
          </div>
          <div className={`${styles.buttonRow} ${styles.tdsNameButtonRow}`}>
            <button
              className={`${styles.button} ${styles.tdsNameNextButton}`}
              type="button"
              onClick={next}
            >
              다음
            </button>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className={`${styles.onboardingContent} ${styles.tdsHostStep}`}>
          <h1>
            <span>{form.hostName || '주최자'}님,</span>
            <span>안녕하세요 👋</span>
          </h1>
          <p>
            먼저 주최자 이름과 휴대폰 번호를 확인할게요. 인증번호는 다음
            화면에서 받을 수 있어요.
          </p>
          <div className={styles.tdsHostFields}>
            <div className={styles.tdsHostField}>
              <label htmlFor="hostName">
                주최자 이름
              </label>
              <input
                id="hostName"
                className={styles.tdsHostInput}
                value={form.hostName}
                onChange={event => updateForm({ hostName: event.target.value })}
                placeholder="이름을 입력해주세요"
              />
            </div>
            <div className={styles.tdsHostField}>
              <label htmlFor="hostPhone">
                주최자 휴대폰 번호
              </label>
              <input
                id="hostPhone"
                className={styles.tdsHostInput}
                inputMode="tel"
                maxLength={13}
                value={formatKoreanMobilePhone(form.hostPhone)}
                onChange={event => {
                  updateForm({
                    hostPhone: normalizePhone(event.target.value).slice(0, 11),
                    code: '',
                    hostVerified: false,
                  });
                  setCodeSent(false);
                  setCodeSecondsLeft(0);
                }}
                placeholder="휴대폰 번호를 입력해주세요"
              />
            </div>
          </div>
          <div className={styles.tdsHostHint}>
            <span aria-hidden="true">i</span>
            <strong>010으로 시작하는 휴대폰 번호 11자리를 입력해주세요.</strong>
          </div>
          <div className={`${styles.buttonRow} ${styles.tdsHostButtonRow}`}>
            <button
              className={styles.tdsHostNextButton}
              type="button"
              disabled={!form.hostName.trim() || !hostPhoneReady}
              onClick={next}
            >
              다음
            </button>
            <button
              className={styles.tdsHostPrevButton}
              type="button"
              onClick={prev}
            >
              이전
            </button>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className={styles.onboardingContent}>
          <StepCue icon="🔐" label="VERIFY" />
          <h1>휴대폰 인증을 진행할게요.</h1>
          <p>
            아래 번호로 인증번호를 받은 뒤 6자리를 입력하면 다음 단계로
            넘어갑니다.
          </p>
          <div className={styles.formStack}>
            <div className={styles.verificationFlow}>
              <div className={styles.readonlyPhoneCard}>
                <span>인증할 번호</span>
                <strong>{form.hostPhone}</strong>
              </div>
              <button
                className={`${styles.button} ${styles.wideButton}`}
                type="button"
                disabled={submitting || form.hostVerified}
                onClick={sendHostCode}
              >
                {codeSent && !form.hostVerified
                  ? '인증번호 다시 받기'
                  : form.hostVerified
                    ? '인증 완료'
                    : '인증번호 받기'}
              </button>
              {(codeSent || form.hostVerified) && (
                <div className={styles.codeFlow}>
                  <div className={styles.codeFlowHeader}>
                    <strong>인증번호 입력</strong>
                    <span>
                      {form.hostVerified
                        ? '완료'
                        : codeSecondsLeft > 0
                          ? verificationTime
                          : '만료'}
                    </span>
                  </div>
                  <div className={styles.inlineFields}>
                    <input
                      id="code"
                      className={styles.input}
                      inputMode="numeric"
                      maxLength={6}
                      value={form.code}
                      disabled={form.hostVerified}
                      onChange={event =>
                        updateForm({
                          code: event.target.value.replace(/\D/g, ''),
                        })
                      }
                      placeholder="6자리 숫자"
                    />
                    <button
                      className={`${styles.button} ${styles.inlineButton}`}
                      type="button"
                      disabled={
                        submitting ||
                        form.hostVerified ||
                        !codeSent ||
                        codeSecondsLeft <= 0 ||
                        form.code.length !== 6
                      }
                      onClick={verifyHostCode}
                    >
                      확인
                    </button>
                  </div>
                  <div
                    className={`${styles.verifyStatus} ${
                      form.hostVerified ? styles.verified : ''
                    } ${
                      codeSent && codeSecondsLeft <= 0 ? styles.expired : ''
                    }`}
                  >
                    <span>
                      {form.hostVerified
                        ? '인증이 완료되었습니다.'
                        : codeSecondsLeft > 0
                          ? '문자로 받은 인증번호를 입력해주세요.'
                          : '인증 시간이 만료되었습니다. 다시 받아주세요.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.buttonRow}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              type="button"
              onClick={prev}
            >
              이전
            </button>
            <button
              className={styles.button}
              type="button"
              disabled={!form.hostVerified}
              onClick={next}
            >
              다음
            </button>
          </div>
        </div>
      );
    }

    if (step === 5) {
      return (
        <div className={styles.onboardingContent}>
          <StepCue icon="🔒" label="SECURITY" />
          <h1>친구들은 어떻게 입장할까요?</h1>
          <p>
            링크가 카카오톡 안에서 열려도 흔들리지 않는 입장 방식을 정합니다.
          </p>
          <div className={styles.choiceGrid}>
            <label className={styles.choice}>
              <input
                type="radio"
                checked={form.accessType === 'password'}
                onChange={() => updateForm({ accessType: 'password' })}
              />
              <span>
                <b>모임 비밀번호</b>
                <small>비밀번호를 아는 사람만 입장하고, 다음 단계에서 마감일을 정합니다.</small>
              </span>
            </label>
            <label className={styles.choice}>
              <input
                type="radio"
                checked={form.accessType === 'phone_list'}
                onChange={() => updateForm({ accessType: 'phone_list' })}
              />
              <span>
                <b>휴대폰 번호 입장</b>
                <small>미리 넣어둔 번호만 입장하고, 모두 투표하면 자동 종료됩니다.</small>
              </span>
            </label>
          </div>
          {form.accessType === 'password' ? (
            <div className={styles.singleField}>
              <input
                className={styles.bigInput}
                value={form.password}
                onChange={event =>
                  updateForm({
                    password: normalizePassword(event.target.value),
                  })
                }
                placeholder="영문/숫자 4자리 이상"
              />
              <p className={styles.fieldHint}>
                한글, 공백, 특수문자는 사용할 수 없습니다.
              </p>
              <div className={styles.deadlineNotice}>
                <span aria-hidden="true">⏱</span>
                <strong>비밀번호 입장은 참여 인원을 알 수 없어 마감일을 직접 정해요.</strong>
              </div>
            </div>
          ) : (
            <div className={styles.formStack}>
              <div className={styles.deadlineNotice}>
                <span aria-hidden="true">✅</span>
                <strong>휴대폰번호 입장은 추가한 친구 전원이 투표하면 자동으로 종료돼요.</strong>
              </div>
              <div className={styles.allowedGuestFields}>
                <input
                  className={styles.input}
                  value={allowedPhoneNameInput}
                  onChange={event =>
                    setAllowedPhoneNameInput(event.target.value)
                  }
                  placeholder="이름"
                />
                <input
                  className={styles.input}
                  inputMode="tel"
                  maxLength={11}
                  value={allowedPhoneInput}
                  onChange={event =>
                    setAllowedPhoneInput(
                      normalizePhone(event.target.value).slice(0, 11)
                    )
                  }
                  placeholder="01012345678"
                />
                <button
                  className={`${styles.button} ${styles.inlineButton}`}
                  type="button"
                  disabled={!allowedPhoneReady}
                  onClick={addAllowedPhone}
                >
                  추가
                </button>
              </div>
              <div className={styles.allowedGuestSummary}>
                <span>입장 허용 인원</span>
                <strong>{form.allowedPhones.length}명</strong>
              </div>
              <div className={styles.phoneList}>
                {form.allowedPhones.length > 0 ? (
                  form.allowedPhones.map(guest => (
                    <div className={styles.phonePill} key={guest.phone}>
                      <span>
                        <b>{guest.name}</b>
                        <small>{guest.phone}</small>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateForm({
                            allowedPhones: form.allowedPhones.filter(
                              item => item.phone !== guest.phone
                            ),
                          })
                        }
                      >
                        삭제
                      </button>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyPhoneList}>
                    입장 가능한 친구를 추가해주세요.
                  </div>
                )}
              </div>
            </div>
          )}
          <div className={styles.buttonRow}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              type="button"
              onClick={prev}
            >
              이전
            </button>
            <button className={styles.button} type="button" onClick={next}>
              다음
            </button>
          </div>
        </div>
      );
    }

    if (step === 4) {
      const previewMonthValue =
        activeMonth ||
        form.selectedMonths[form.selectedMonths.length - 1] ||
        monthOptions[0]?.value;
      const previewMonth = monthOptions.find(
        month => month.value === previewMonthValue
      );
      const previewDays = previewMonthValue
        ? getMonthDays(previewMonthValue)
        : [];

      return (
        <div className={`${styles.onboardingContent} ${styles.tdsMonthStep}`}>
          <div className={styles.tdsMonthHeader}>
            <div>
              <h1>몇 월쯤 만날까요?</h1>
              <p>최대 3개의 달을 선택할 수 있어요.</p>
            </div>
            <strong>{form.selectedMonths.length}/3</strong>
          </div>
          <div className={styles.tdsMonthPicker}>
            <div className={styles.tdsMonthCards}>
              {monthOptions.map(month => {
                const selected = form.selectedMonths.includes(month.value);
                const [year, monthNumber] = month.value.split('-');
                return (
                  <button
                    className={`${styles.tdsMonthCard} ${
                      selected ? styles.selectedTdsMonthCard : ''
                    } ${
                      previewMonthValue === month.value
                        ? styles.activeTdsMonthCard
                        : ''
                    }`}
                    key={month.value}
                    type="button"
                    onClick={() => toggleMonth(month.value)}
                  >
                    <span>{Number(monthNumber)}월</span>
                    <strong>{year}</strong>
                  </button>
                );
              })}
            </div>
            <div className={styles.tdsSelectedMonthTray}>
              {form.selectedMonths.length > 0 ? (
                form.selectedMonths.map(value => {
                  const [year, month] = String(value).split('-');
                  return (
                    <button
                      className={`${styles.tdsSelectedMonthChip} ${
                        previewMonthValue === value
                          ? styles.activeSelectedMonthChip
                          : ''
                      }`}
                      key={value}
                      type="button"
                      onClick={() => toggleMonth(value)}
                    >
                      {year}. {Number(month)}월 <span>×</span>
                    </button>
                  );
                })
              ) : (
                <span className={styles.tdsSelectedMonthEmpty}>
                  달을 선택해주세요
                </span>
              )}
            </div>
            {previewMonth && (
              <section className={styles.tdsMonthCalendarPreview}>
                <div className={styles.tdsMonthCalendarHeader}>
                  <span>{previewMonth.sub}</span>
                  <strong>{previewMonth.title}</strong>
                </div>
                <div className={styles.tdsMonthWeekHeader} aria-hidden="true">
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className={styles.tdsMonthCalendarGrid}>
                  {previewDays.map((day, index) =>
                    day ? (
                      <button
                        className={`${styles.tdsMonthCalendarDay} ${
                          day.weekday === 0 ? styles.sunday : ''
                        } ${day.weekday === 6 ? styles.saturday : ''} ${
                          day.holiday ? styles.holiday : ''
                        }`}
                        key={day.dateKey}
                        type="button"
                        title={
                          day.holiday || `${previewMonth.title} ${day.day}일`
                        }
                      >
                        <span>{day.day}</span>
                      </button>
                    ) : (
                      <i key={`blank-${previewMonthValue}-${index}`} />
                    )
                  )}
                </div>
              </section>
            )}
          </div>
          <div className={styles.buttonRow}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              type="button"
              onClick={prev}
            >
              이전
            </button>
            <button className={styles.button} type="button" onClick={next}>
              다음
            </button>
          </div>
        </div>
      );
    }

    if (step === 6) {
      return (
        <div className={styles.onboardingContent}>
          <StepCue icon="⏰" label="DEADLINE" />
          <h1>투표 마감일은 언제로 할까요?</h1>
          <p>
            비밀번호 입장은 참여 인원을 미리 알 수 없어서, 정해둔 날짜가 지나면
            의견을 마감하는 방식이 좋아요.
          </p>
          <div className={styles.deadlinePicker}>
            <input
              className={styles.bigInput}
              type="date"
              min={getKoreaTodayValue()}
              value={form.voteDeadlineDate}
              onChange={event =>
                updateForm({ voteDeadlineDate: event.target.value })
              }
            />
            <div className={styles.deadlineQuickButtons}>
              {[3, 5, 7, 10].map(days => {
                const value = addDaysToKoreaToday(days);
                return (
                  <button
                    className={
                      form.voteDeadlineDate === value
                        ? styles.selectedDeadlineQuick
                        : ''
                    }
                    key={days}
                    type="button"
                    onClick={() => updateForm({ voteDeadlineDate: value })}
                  >
                    {days}일 뒤
                  </button>
                );
              })}
            </div>
            <div className={styles.deadlineNotice}>
              <span aria-hidden="true">🔒</span>
              <strong>
                {form.voteDeadlineDate
                  ? `${formatKoreanDateLabel(form.voteDeadlineDate)}까지 투표를 받을게요.`
                  : '마감일을 선택해주세요.'}
              </strong>
            </div>
          </div>
          <div className={styles.buttonRow}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              type="button"
              onClick={prev}
            >
              이전
            </button>
            <button className={styles.button} type="button" onClick={next}>
              다음
            </button>
          </div>
        </div>
      );
    }

    if (step === 7) {
      return (
        <div className={styles.onboardingContent}>
          <StepCue icon="📍" label="AREA" />
          <h1>어느 지역에서 주로 만날까요?</h1>
          <p>
            정해둔 곳이 있으면 입력하고, 아니면 친구들에게 의견을 받아볼 수
            있어요.
          </p>
          <div className={styles.choiceGrid}>
            <label className={styles.choice}>
              <input
                type="radio"
                checked={form.locationMode === 'host_decides'}
                onChange={() => updateForm({ locationMode: 'host_decides' })}
              />
              <span>
                <b>제가 정할게요</b>
                <small>다음 단계에서 지역, 매장, 시간을 입력합니다.</small>
              </span>
            </label>
            <label className={styles.choice}>
              <input
                type="radio"
                checked={form.locationMode === 'ask_guests'}
                onChange={() => updateForm({ locationMode: 'ask_guests' })}
              />
              <span>
                <b>의견을 들어볼게요</b>
                <small>추후 지역 투표로 이어질 수 있습니다.</small>
              </span>
            </label>
          </div>
          <div className={styles.modeExplain}>
            <span>{form.locationMode === 'host_decides' ? '📍' : '🗳️'}</span>
            <strong>
              {form.locationMode === 'host_decides'
                ? '장소를 정해두면 친구들은 바로 확인할 수 있어요.'
                : '친구들에게 지역 의견을 받은 뒤 장소를 정할 수 있어요.'}
            </strong>
          </div>
          <div className={styles.buttonRow}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              type="button"
              onClick={prev}
            >
              이전
            </button>
            <button className={styles.button} type="button" onClick={next}>
              다음
            </button>
          </div>
        </div>
      );
    }

    if (step === 8) {
      return (
        <div className={styles.onboardingContent}>
          <StepCue icon="🏙️" label="PLACE" />
          <h1>어디에서 만날지 알려주세요.</h1>
          <p>
            정확한 매장이 아니어도 괜찮아요. 우선 만날 지역만 정해도 됩니다.
          </p>
          <div className={styles.formStack}>
            <div className={styles.inlineFields}>
              <input
                className={styles.input}
                value={form.venueAddress}
                onChange={event =>
                  updateForm({
                    venueAddress: event.target.value,
                    locationLabel: event.target.value,
                  })
                }
                placeholder="주소를 검색하거나 직접 입력해주세요"
              />
              <button
                className={`${styles.button} ${styles.inlineButton} ${styles.secondaryButton}`}
                type="button"
                disabled={placeSearching}
                onClick={searchAddress}
              >
                {placeSearching ? '검색 중' : '장소 검색'}
              </button>
            </div>
            {placeResults.length > 0 && (
              <div className={styles.placeResultList}>
                {placeResults.map(place => {
                  const address = place.roadAddress || place.address;
                  return (
                    <button
                      className={styles.placeResultItem}
                      key={place.id}
                      type="button"
                      onClick={() => selectPlace(place)}
                    >
                      <span>
                        <strong>{place.name}</strong>
                        {place.category && <small>{place.category}</small>}
                      </span>
                      {address && <em>{address}</em>}
                      {place.phone && <b>{place.phone}</b>}
                    </button>
                  );
                })}
              </div>
            )}
            <div className={styles.grid2}>
              <input
                className={styles.input}
                value={form.venueName}
                onChange={event =>
                  updateForm({ venueName: event.target.value })
                }
                placeholder="매장 이름"
              />
              <input
                className={styles.input}
                value={form.meetingTime}
                onChange={event =>
                  updateForm({ meetingTime: event.target.value })
                }
                placeholder="만날 시간"
              />
            </div>
          </div>
          <div className={styles.buttonRow}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              type="button"
              onClick={prev}
            >
              이전
            </button>
            <button className={styles.button} type="button" onClick={next}>
              다음
            </button>
          </div>
        </div>
      );
    }

    if (step === 9) {
      return (
        <div className={styles.onboardingContent}>
          <StepCue icon="💬" label="MESSAGE" />
          <h1>친구들에게 어떤 문구로 보여줄까요?</h1>
          <p>비워두면 자연스러운 기본 문구로 만들어둘게요.</p>
          <div className={styles.messageComposer}>
            <div className={styles.sampleMessageGrid}>
              {messageSamples.map((sample, index) => (
                <button
                  className={`${styles.sampleMessage} ${
                    form.message === sample ? styles.selectedSampleMessage : ''
                  }`}
                  key={sample}
                  type="button"
                  onClick={() => updateForm({ message: sample })}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{sample}</strong>
                </button>
              ))}
            </div>
            <textarea
              className={`${styles.bigInput} ${styles.bigTextarea}`}
              value={form.message}
              onChange={event => updateForm({ message: event.target.value })}
              placeholder={`${form.hostName || '주최자'}님 안녕하세요. 결혼식 전에 고마운 분들과 따뜻하게 밥 한 끼 나누고 싶어요.`}
            />
          </div>
          <div className={styles.buttonRow}>
            <button
              className={`${styles.button} ${styles.secondaryButton}`}
              type="button"
              onClick={prev}
            >
              이전
            </button>
            <button className={styles.button} type="button" onClick={next}>
              다음
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.onboardingContent}>
        <StepCue icon="✅" label="REVIEW" />
        <h1>이대로 만들까요?</h1>
        <p>만든 뒤 링크와 비밀번호를 카카오톡으로 공유하면 됩니다.</p>
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span>모임 이름</span>
            <strong>{form.title}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>주최자</span>
            <strong>{form.hostName}</strong>
          </div>
          <div className={styles.summaryItem}>
            <span>입장 방식</span>
            <strong>
              {form.accessType === 'password'
                ? '모임 비밀번호'
                : `${form.allowedPhones.length}개 허용 번호`}
            </strong>
          </div>
          <div className={styles.summaryItem}>
            <span>마감 방식</span>
            <strong>
              {form.accessType === 'password'
                ? `${formatKoreanDateLabel(form.voteDeadlineDate)} 마감`
                : '전원 투표 완료 시 자동 종료'}
            </strong>
          </div>
          <div className={styles.summaryItem}>
            <span>예정 달</span>
            <strong>{form.selectedMonths.join(', ')}</strong>
          </div>
        </div>
        <div className={styles.buttonRow}>
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            type="button"
            onClick={prev}
          >
            이전
          </button>
          <button
            className={styles.button}
            type="button"
            disabled={submitting}
            onClick={createGathering}
          >
            {submitting ? '만드는 중' : '모임 만들기'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>청첩장 모임 만들기 - 정담</title>
        <meta
          name="description"
          content="정담에서 청첩장 모임을 만들고 친구들과 안전하게 공유하세요."
        />
      </Head>
      <main
        className={`${styles.page} ${styles.onboardingPage} ${
          !created && step === 0 ? styles.tdsStartPage : ''
        }`}
      >
        <section
          className={`${styles.onboardingStage} ${fading ? styles.fadeOut : styles.fadeIn}`}
        >
          {!created && step === 0 ? (
            renderStep()
          ) : (
            <div className={`${styles.onboardingContent} ${styles.tdsFlowContent}`}>
              <div
                className={`${styles.tdsStartCard} ${styles.tdsFlowCard} ${
                  !created && step === 1 ? styles.tdsNameCard : ''
                }`}
              >
                {renderCardHeader()}
                {renderProgressBars(created ? stepCount - 1 : step)}
                <div className={styles.tdsFlowBody}>{renderStep()}</div>
              </div>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
