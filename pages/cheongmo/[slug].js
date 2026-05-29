import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import styles from './cheongmo.module.css';

const appStoreUrl =
  'https://apps.apple.com/us/app/%EC%A0%95%EB%8B%B4/id6771705756';

const fallbackGathering = {
  id: null,
  slug: 'sample',
  title: '민준 · 소연 청첩장 모임',
  host_name: '민준',
  partner_name: '소연',
  message: '결혼식 전에 고마운 분들과 따뜻하게 밥 한 끼 나누고 싶어요.',
  access_type: 'password',
  allowed_phones: [],
  selected_months: ['2026-06', '2026-07'],
  location_mode: 'host_decides',
  location_label: '성수 또는 강남',
  venue_name: '',
  venue_address: '',
  meeting_time: '평일 저녁 또는 주말 점심',
  vote_deadline_at: null,
  participants: [],
};

const normalizePhone = value => String(value || '').replace(/\D/g, '');
const isKoreanMobilePhone = value => /^010\d{8}$/.test(normalizePhone(value));
const koreanHolidays = {
  '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날',
  '2026-05-25': '대체공휴일',
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

const getStorageKey = slug => `cheongmo:entry:${slug}`;
const getCheongmoApiUrl = slug =>
  `/api/cheongmo?slug=${encodeURIComponent(slug)}&_=${Date.now()}`;

const getDateOptions = months => {
  if (!Array.isArray(months)) return [];

  return months.slice().sort().flatMap(monthValue => {
    const [year, month] = String(monthValue).split('-').map(Number);
    if (!year || !month) return [];

    const lastDate = new Date(year, month, 0).getDate();
    return Array.from({ length: lastDate }, (_, index) => {
      const day = index + 1;
      const date = new Date(year, month - 1, day);
      const value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        value,
        monthLabel: `${month}월`,
        day,
        weekday: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
        weekend: date.getDay() === 0 || date.getDay() === 6,
      };
    });
  });
};

const getMonthCalendars = months => {
  if (!Array.isArray(months)) return [];

  return months
    .slice()
    .sort()
    .map(monthValue => {
      const [year, month] = String(monthValue).split('-').map(Number);
      if (!year || !month) return null;

      const firstDay = new Date(year, month - 1, 1);
      const lastDate = new Date(year, month, 0).getDate();
      const days = [];

      for (let index = 0; index < firstDay.getDay(); index += 1) {
        days.push(null);
      }

      for (let day = 1; day <= lastDate; day += 1) {
        const date = new Date(year, month - 1, day);
        const value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        days.push({
          value,
          day,
          weekday: date.getDay(),
          holiday: koreanHolidays[value],
        });
      }

      return {
        value: monthValue,
        title: `${year}년 ${month}월`,
        days,
      };
    })
    .filter(Boolean);
};

const isDateInMonths = (date, months) => {
  if (!Array.isArray(months) || months.length === 0) return true;
  return months.includes(String(date || '').slice(0, 7));
};

const filterDatesByMonths = (dates, months) =>
  Array.isArray(dates)
    ? dates.filter(date => isDateInMonths(date, months))
    : [];

const normalizeParticipantForMonths = (person, months) =>
  person
    ? {
        ...person,
        availableDates: filterDatesByMonths(person.availableDates, months),
        suggestedRegions: person.suggestedRegions || [],
      }
    : null;

const getDateSummary = (participants, months) => {
  const counts = new Map();
  (participants || []).forEach(person => {
    filterDatesByMonths(person.availableDates, months).forEach(date => {
      const list = counts.get(date) || [];
      list.push(person.guestName);
      counts.set(date, list);
    });
  });
  return counts;
};

const getRegionSummary = participants => {
  const counts = new Map();
  (participants || []).forEach(person => {
    (person.suggestedRegions || []).forEach(region => {
      const list = counts.get(region) || [];
      list.push(person.guestName);
      counts.set(region, list);
    });
  });
  return Array.from(counts.entries())
    .map(([name, names]) => ({ name, count: names.length, names }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

const formatDateLabel = value => {
  const [year, month, day] = String(value || '').split('-').map(Number);
  if (!year || !month || !day) return value;
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][
    new Date(year, month - 1, day).getDay()
  ];
  return `${month}월 ${day}일 (${weekday})`;
};

const formatDeadlineLabel = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).formatToParts(date);
  const getPart = type => parts.find(part => part.type === type)?.value || '';
  return `${getPart('month')}월 ${getPart('day')}일 (${getPart('weekday')})`;
};

const getExpectedGuestCount = gathering => {
  if (!gathering) return 0;
  if (Number.isFinite(Number(gathering.expected_guest_count))) {
    return Number(gathering.expected_guest_count);
  }
  if (
    gathering.access_type === 'phone_list' &&
    Array.isArray(gathering.allowed_phones)
  ) {
    return gathering.allowed_phones.length;
  }
  return 0;
};

const hasResponseContent = person =>
  Boolean(person?.availableDates?.length || person?.suggestedRegions?.length);

const isPastDeadline = value => {
  if (!value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time < Date.now();
};

const getDateLeaders = (dateSummary, participantCount) =>
  Array.from(dateSummary.entries())
    .map(([date, names]) => ({
      date,
      names,
      count: names.length,
      finalized: participantCount > 0 && names.length === participantCount,
    }))
    .sort((a, b) => b.count - a.count || a.date.localeCompare(b.date));

const getCandidateLabel = ({ count, index, expectedCount, respondedCount }) => {
  if (expectedCount > 0 && respondedCount >= expectedCount) {
    if (count === expectedCount) return '확정';
    if (count > expectedCount / 2) return '확정 예정';
  }
  if (expectedCount > 0 && count > expectedCount / 2) return '확정 예정';
  if (index === 0 && count > 1) return '유력';
  return `${count}명`;
};

const CHEONGMO_OG_IMAGE_PATH = '/cheongmo/invitation2-og.png';
const DEFAULT_SITE_URL = 'https://jeongdamm.com';

const getSiteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, '');

const CheongmoMetaHead = ({ title, description, url }) => {
  const siteUrl = getSiteUrl();
  const imageUrl = `${siteUrl}${CHEONGMO_OG_IMAGE_PATH}`;
  const pageTitle = title || '정담 청첩장 모임 초대가 도착했어요';
  const pageDescription =
    description ||
    '가능한 날짜와 모임 장소를 정담 청첩장 모임에서 함께 확인해주세요.';
  const pageUrl = url || `${siteUrl}/cheongmo`;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta key="description" name="description" content={pageDescription} />
      <meta key="og:title" property="og:title" content={pageTitle} />
      <meta
        key="og:description"
        property="og:description"
        content={pageDescription}
      />
      <meta key="og:type" property="og:type" content="website" />
      <meta key="og:site_name" property="og:site_name" content="정담" />
      <meta key="og:locale" property="og:locale" content="ko_KR" />
      <meta key="og:url" property="og:url" content={pageUrl} />
      <meta key="og:image" property="og:image" content={imageUrl} />
      <meta
        key="og:image:secure_url"
        property="og:image:secure_url"
        content={imageUrl}
      />
      <meta key="og:image:width" property="og:image:width" content="1200" />
      <meta key="og:image:height" property="og:image:height" content="630" />
      <meta
        key="og:image:alt"
        property="og:image:alt"
        content="정담 청첩장 모임 초대 이미지"
      />
      <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter:title" name="twitter:title" content={pageTitle} />
      <meta
        key="twitter:description"
        name="twitter:description"
        content={pageDescription}
      />
      <meta key="twitter:image" name="twitter:image" content={imageUrl} />
    </Head>
  );
};

export default function CheongmoParticipantPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [gathering, setGathering] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entryToken, setEntryToken] = useState('');
  const [entryValue, setEntryValue] = useState('');
  const [guestName, setGuestName] = useState('');
  const [participant, setParticipant] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [regionSuggestions, setRegionSuggestions] = useState([]);
  const [regionInput, setRegionInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [activeMonthIndex, setActiveMonthIndex] = useState(0);
  const [entrySuccessSheetOpen, setEntrySuccessSheetOpen] = useState(false);
  const [entrySuccessPhase, setEntrySuccessPhase] = useState('success');
  const [saveSuccessSheetOpen, setSaveSuccessSheetOpen] = useState(false);
  const participantRef = useRef(null);
  const isEditingResponseRef = useRef(false);
  const entryTokenRef = useRef('');
  const entrySuccessTimerRef = useRef(null);
  const entryNameInputRef = useRef(null);
  const roomRevealTimerRef = useRef(null);
  const saveSuccessTimerRef = useRef(null);
  const slugValue = typeof slug === 'string' ? slug : '';
  const metaUrl = slugValue
    ? `${getSiteUrl()}/cheongmo/${encodeURIComponent(slugValue)}`
    : `${getSiteUrl()}/cheongmo`;

  useEffect(() => {
    participantRef.current = participant;
  }, [participant]);

  useEffect(() => {
    isEditingResponseRef.current = isEditingResponse;
  }, [isEditingResponse]);

  useEffect(() => {
    entryTokenRef.current = entryToken;
  }, [entryToken]);

  useEffect(
    () => () => {
      if (entrySuccessTimerRef.current) {
        clearTimeout(entrySuccessTimerRef.current);
      }
      if (roomRevealTimerRef.current) {
        clearTimeout(roomRevealTimerRef.current);
      }
      if (saveSuccessTimerRef.current) {
        clearTimeout(saveSuccessTimerRef.current);
      }
    },
    []
  );

  const openEntrySuccessSheet = useCallback(() => {
    if (entrySuccessTimerRef.current) {
      clearTimeout(entrySuccessTimerRef.current);
    }
    setEntrySuccessPhase('success');
    setEntrySuccessSheetOpen(true);
    entrySuccessTimerRef.current = setTimeout(() => {
      setEntrySuccessPhase('name');
    }, 1650);
  }, []);

  useEffect(() => {
    if (entrySuccessSheetOpen && entrySuccessPhase === 'name') {
      entryNameInputRef.current?.focus();
    }
  }, [entrySuccessPhase, entrySuccessSheetOpen]);

  const revealParticipantRoom = useCallback(nextParticipant => {
    if (roomRevealTimerRef.current) {
      clearTimeout(roomRevealTimerRef.current);
    }
    roomRevealTimerRef.current = setTimeout(() => {
      setEntrySuccessSheetOpen(false);
      setParticipant(nextParticipant);
    }, 320);
  }, []);

  const openSaveSuccessSheet = useCallback(() => {
    if (saveSuccessTimerRef.current) {
      clearTimeout(saveSuccessTimerRef.current);
    }
    setSaveSuccessSheetOpen(true);
    saveSuccessTimerRef.current = setTimeout(() => {
      setSaveSuccessSheetOpen(false);
    }, 1800);
  }, []);

  const syncGatheringFromServer = useCallback(
    data => {
      if (!data) return;

      setGathering(data);

      const currentParticipant = participantRef.current;
      if (!currentParticipant?.id || isEditingResponseRef.current) return;

      const serverParticipant = (data.participants || []).find(
        item => item.id === currentParticipant.id
      );
      if (!serverParticipant) return;

      const nextParticipant = normalizeParticipantForMonths(
        serverParticipant,
        data.selected_months
      );

      setParticipant(nextParticipant);
      setGuestName(nextParticipant.guestName || '');
      setAvailableDates(nextParticipant.availableDates);
      setRegionSuggestions(nextParticipant.suggestedRegions);

      if (data.slug) {
        const saved = JSON.parse(
          window.localStorage.getItem(getStorageKey(data.slug)) || '{}'
        );
        window.localStorage.setItem(
          getStorageKey(data.slug),
          JSON.stringify({
            ...saved,
            entryToken: saved.entryToken || entryTokenRef.current,
            participant: nextParticipant,
          })
        );
      }
    },
    []
  );

  const fetchLatestGathering = useCallback(async () => {
    if (!slug) return null;

    const response = await fetch(getCheongmoApiUrl(slug), {
      cache: 'no-store',
    });
    const result = await response.json();

    if (response.ok && result.success) {
      syncGatheringFromServer(result.data);
      return result.data;
    }

    throw new Error(result.error || '청모 정보를 불러오지 못했습니다.');
  }, [slug, syncGatheringFromServer]);

  useEffect(() => {
    if (!slug) return;

    const loadGathering = async () => {
      try {
        setLoading(true);
        const response = await fetch(getCheongmoApiUrl(slug), {
          cache: 'no-store',
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          if (slug === 'sample') {
            setGathering(fallbackGathering);
            const saved = window.localStorage.getItem(getStorageKey(slug));
            if (saved) {
              const parsed = JSON.parse(saved);
              setEntryToken(parsed.entryToken || 'sample-token');
              setParticipant(parsed.participant || null);
              setGuestName(parsed.participant?.guestName || '');
              setAvailableDates(
                filterDatesByMonths(
                  parsed.participant?.availableDates,
                  fallbackGathering.selected_months
                )
              );
              setRegionSuggestions(parsed.participant?.suggestedRegions || []);
              setIsEditingResponse(!hasResponseContent(parsed.participant));
            }
            return;
          }
          throw new Error(result.error || '청모 정보를 불러오지 못했습니다.');
        }

        syncGatheringFromServer(result.data);
        const saved = window.localStorage.getItem(getStorageKey(slug));
        if (saved) {
          const parsed = JSON.parse(saved);
          const storedParticipant = parsed.participant || null;
          const serverParticipant = (result.data.participants || []).find(
            item => item.id === storedParticipant?.id
          );
          const nextParticipant = normalizeParticipantForMonths(
            serverParticipant || storedParticipant,
            result.data.selected_months
          );
          setEntryToken(parsed.entryToken || '');
          setParticipant(nextParticipant);
          setGuestName(nextParticipant?.guestName || '');
          setAvailableDates(nextParticipant?.availableDates || []);
          setRegionSuggestions(nextParticipant?.suggestedRegions || []);
          setIsEditingResponse(!hasResponseContent(nextParticipant));
          window.localStorage.setItem(
            getStorageKey(slug),
            JSON.stringify({
              ...parsed,
              participant: nextParticipant,
            })
          );
        }
      } catch (error) {
        toast.error(error.message);
        setGathering(null);
      } finally {
        setLoading(false);
      }
    };

    loadGathering();
  }, [slug, syncGatheringFromServer]);

  useEffect(() => {
    if (!slug || !gathering?.id || gathering.slug === 'sample') return;

    let refreshTimer = null;
    let cancelled = false;

    const refreshGathering = async () => {
      try {
        if (!cancelled) {
          await fetchLatestGathering();
        }
      } catch (error) {
        console.error('청모 실시간 갱신 오류:', error);
      }
    };

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(refreshGathering, 120);
    };

    const channel = supabase?.channel
      ? supabase
          .channel(`cheongmo-responses:${gathering.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cheongmo_responses',
              filter: `cheongmo_event_id=eq.${gathering.id}`,
            },
            scheduleRefresh
          )
          .subscribe()
      : null;

    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchLatestGathering, gathering?.id, gathering?.slug, slug]);

  const locked = useMemo(() => !entryToken, [entryToken]);
  const entryReady = useMemo(() => {
    if (!gathering) return false;
    if (gathering.access_type === 'phone_list') {
      return isKoreanMobilePhone(entryValue);
    }
    return entryValue.trim().length > 0;
  }, [entryValue, gathering]);
  const monthCalendars = useMemo(
    () => getMonthCalendars(gathering?.selected_months),
    [gathering]
  );
  useEffect(() => {
    if (activeMonthIndex > Math.max(monthCalendars.length - 1, 0)) {
      setActiveMonthIndex(0);
    }
  }, [activeMonthIndex, monthCalendars.length]);
  const dateOptions = useMemo(
    () => getDateOptions(gathering?.selected_months),
    [gathering]
  );
  const visibleMonth = monthCalendars[activeMonthIndex] || monthCalendars[0];
  const dateSummary = useMemo(
    () =>
      getDateSummary(
        gathering?.participants,
        visibleMonth ? [visibleMonth.value] : gathering?.selected_months
      ),
    [gathering, visibleMonth]
  );
  const regionSummary = useMemo(
    () => getRegionSummary(gathering?.participants),
    [gathering]
  );
  const regionCandidates = useMemo(() => {
    const candidates = new Map();
    regionSummary.forEach((region, index) => {
      candidates.set(region.name, { ...region, order: index });
    });
    regionSuggestions.forEach(regionName => {
      const existing = candidates.get(regionName);
      if (existing) {
        const alreadyCounted = existing.names.includes(participant?.guestName);
        candidates.set(regionName, {
          ...existing,
          count: existing.count + (alreadyCounted ? 0 : 1),
          names: alreadyCounted
            ? existing.names
            : [...existing.names, participant?.guestName].filter(Boolean),
        });
        return;
      }
      candidates.set(regionName, {
        name: regionName,
        count: 1,
        names: [participant?.guestName].filter(Boolean),
        order: regionSummary.length,
      });
    });
    return Array.from(candidates.values()).sort(
      (a, b) => b.count - a.count || a.order - b.order || a.name.localeCompare(b.name)
    );
  }, [participant, regionSummary, regionSuggestions]);
  const maxRegionVoteCount = useMemo(
    () => Math.max(1, ...regionCandidates.map(region => region.count)),
    [regionCandidates]
  );
  const expectedGuestCount = useMemo(
    () => getExpectedGuestCount(gathering),
    [gathering]
  );
  const respondedCount = useMemo(
    () =>
      (gathering?.participants || []).filter(person =>
        hasResponseContent(person)
      ).length,
    [gathering]
  );
  const isPasswordDeadlineClosed =
    gathering?.access_type === 'password' && isPastDeadline(gathering.vote_deadline_at);
  const isPhoneListVotingClosed =
    gathering?.access_type === 'phone_list' &&
    expectedGuestCount > 0 &&
    respondedCount >= expectedGuestCount;
  const isVotingClosed = isPasswordDeadlineClosed || isPhoneListVotingClosed;
  const voteDeadlineLabel =
    gathering?.access_type === 'password'
      ? formatDeadlineLabel(gathering.vote_deadline_at)
      : '';
  const votingClosedMessage = isPasswordDeadlineClosed
    ? '투표 마감일이 지나 의견 수정이 종료됐어요.'
    : '초대된 인원이 모두 투표해 의견 수정이 종료됐어요.';
  const dateLeaders = useMemo(
    () =>
      getDateLeaders(
        dateSummary,
        expectedGuestCount && respondedCount >= expectedGuestCount
          ? expectedGuestCount
          : 0
      ),
    [dateSummary, expectedGuestCount, respondedCount]
  );
  const maxDateVoteCount = useMemo(
    () => Math.max(1, ...dateLeaders.map(item => item.count)),
    [dateLeaders]
  );
  const savedParticipants = useMemo(
    () =>
      (gathering?.participants || []).filter(person =>
        hasResponseContent(person)
      ),
    [gathering]
  );
  const participantNames = useMemo(
    () =>
      (gathering?.participants || [])
        .map(person => person.guestName)
        .filter(Boolean),
    [gathering]
  );
  const visibleAvailableDates = useMemo(
    () =>
      filterDatesByMonths(
        availableDates,
        visibleMonth ? [visibleMonth.value] : gathering?.selected_months
      ),
    [availableDates, gathering, visibleMonth]
  );
  const topDateCandidates = useMemo(
    () =>
      dateLeaders.slice(0, 4).map((item, index) => ({
        ...item,
        status: getCandidateLabel({
          count: item.count,
          index,
          expectedCount: expectedGuestCount,
          respondedCount,
        }),
      })),
    [dateLeaders, expectedGuestCount, respondedCount]
  );
  const roomParticipantCount = gathering?.participants?.length || 1;
  const roomExpectedCount = expectedGuestCount || roomParticipantCount;
  const roomTopDate = topDateCandidates[0] || null;
  const roomTopRegion = regionCandidates[0] || null;
  const hostLocationTitle =
    gathering?.venue_name ||
    gathering?.location_label ||
    gathering?.venue_address ||
    '장소 확인 중';
  const hostLocationDetails = [
    gathering?.venue_name && gathering?.location_label !== gathering.venue_name
      ? gathering?.location_label
      : '',
    gathering?.venue_address &&
    gathering?.venue_address !== gathering?.location_label
      ? gathering?.venue_address
      : '',
    gathering?.meeting_time,
  ].filter(Boolean);
  const hostMapQuery = [
    gathering?.venue_name,
    gathering?.venue_address || gathering?.location_label,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
  const hostMapLinks = hostMapQuery
    ? [
        {
          brand: 'naver',
          href: `https://map.naver.com/p/search/${encodeURIComponent(
            hostMapQuery
          )}`,
          icon: 'N',
          label: '네이버지도',
        },
        {
          brand: 'tmap',
          href: `tmap://search?name=${encodeURIComponent(hostMapQuery)}`,
          icon: 'T',
          label: 'TMAP',
        },
        {
          brand: 'kakao',
          href: `https://map.kakao.com/link/search/${encodeURIComponent(
            hostMapQuery
          )}`,
          icon: '',
          label: '카카오맵',
        },
      ]
    : [];
  const roomTopDateProgress = roomTopDate
    ? Math.max(
        10,
        Math.min(100, Math.round((roomTopDate.count / roomExpectedCount) * 100))
      )
    : 0;
  const enterGathering = async () => {
    if (!gathering) return;

    if (gathering.slug === 'sample') {
      setEntryToken('sample-token');
      openEntrySuccessSheet();
      window.localStorage.setItem(
        getStorageKey(gathering.slug),
        JSON.stringify({
          entryToken: 'sample-token',
        })
      );
      return;
    }

    const value =
      gathering.access_type === 'phone_list'
        ? normalizePhone(entryValue)
        : entryValue.trim();

    if (!value) {
      toast.error(
        gathering.access_type === 'phone_list'
          ? '휴대폰 번호를 입력해주세요.'
          : '모임 비밀번호를 입력해주세요.'
      );
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/cheongmo-enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: gathering.slug,
          accessType: gathering.access_type,
          value,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success)
        throw new Error(result.error || '입장할 수 없습니다.');

      if (result.data.participant) {
        setParticipant(result.data.participant);
        setGuestName(result.data.participant.guestName || '');
        setAvailableDates(
          filterDatesByMonths(
            result.data.participant.availableDates,
            gathering.selected_months
          )
        );
        setRegionSuggestions(result.data.participant.suggestedRegions || []);
        setIsEditingResponse(!hasResponseContent(result.data.participant));
        setGathering(prev =>
          prev
            ? {
                ...prev,
                participants: [
                  ...(prev.participants || []).filter(
                    item => item.id !== result.data.participant.id
                  ),
                  result.data.participant,
                ],
              }
            : prev
        );
      }

      setEntryToken(result.data.entryToken);
      window.localStorage.setItem(
        getStorageKey(gathering.slug),
        JSON.stringify({
          entryToken: result.data.entryToken,
          accessType: gathering.access_type,
          accessPhone: gathering.access_type === 'phone_list' ? value : null,
          participant: result.data.participant || null,
        })
      );
      if (result.data.participant) {
        toast.success('입장했습니다.');
      } else {
        openEntrySuccessSheet();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const joinGathering = async () => {
    if (!guestName.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }

    if (gathering.slug === 'sample') {
      const nextParticipant = {
        id: 'sample',
        guestName: guestName.trim(),
        availableDates,
        suggestedRegions: regionSuggestions,
      };
      setIsEditingResponse(false);
      window.localStorage.setItem(
        getStorageKey(gathering.slug),
        JSON.stringify({
          entryToken,
          participant: nextParticipant,
        })
      );
      toast.success('샘플 가입이 완료되었습니다.');
      revealParticipantRoom(nextParticipant);
      return;
    }

    try {
      setSubmitting(true);
      const saved = JSON.parse(
        window.localStorage.getItem(getStorageKey(gathering.slug)) || '{}'
      );
      const response = await fetch('/api/cheongmo-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: gathering.slug,
          entryToken,
          participantId: saved.participant?.id || null,
          guestName: guestName.trim(),
          availableDates,
          suggestedRegions: regionSuggestions,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success)
        throw new Error(result.error || '가입에 실패했습니다.');

      const nextParticipant = {
        id: result.data.id,
        guestName: result.data.guestName,
        availableDates: filterDatesByMonths(
          result.data.availableDates,
          gathering.selected_months
        ),
        suggestedRegions: result.data.suggestedRegions || [],
      };
      setAvailableDates(nextParticipant.availableDates);
      setRegionSuggestions(nextParticipant.suggestedRegions);
      setIsEditingResponse(false);
      setGathering(prev =>
        prev
          ? {
              ...prev,
              participants: [
                ...(prev.participants || []).filter(
                  item => item.id !== nextParticipant.id
                ),
                nextParticipant,
              ],
            }
          : prev
      );
      const latestResponse = await fetch(getCheongmoApiUrl(gathering.slug), {
        cache: 'no-store',
      });
      const latestResult = await latestResponse.json();
      if (latestResponse.ok && latestResult.success) {
        setGathering(latestResult.data);
      }
      window.localStorage.setItem(
        getStorageKey(gathering.slug),
        JSON.stringify({
          ...saved,
          entryToken,
          participant: nextParticipant,
        })
      );
      toast.success('청첩장 모임에 가입했습니다.');
      revealParticipantRoom(nextParticipant);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailableDate = date => {
    if (!isEditingResponse) return;
    if (isVotingClosed) {
      toast.error(votingClosedMessage);
      return;
    }
    setAvailableDates(prev =>
      prev.includes(date) ? prev.filter(item => item !== date) : [...prev, date]
    );
  };

  const addRegionSuggestion = () => {
    const value = regionInput.trim();
    if (!isEditingResponse) return;
    if (isVotingClosed) {
      toast.error(votingClosedMessage);
      return;
    }
    if (!value) {
      toast.error('추천할 지역을 입력해주세요.');
      return;
    }
    if (regionSuggestions.includes(value)) {
      toast.error('이미 추가한 지역입니다.');
      return;
    }
    setRegionSuggestions(prev => [...prev, value]);
    setRegionInput('');
  };

  const saveCommunityResponse = async () => {
    if (!participant) return;
    if (isVotingClosed) {
      toast.error(votingClosedMessage);
      setIsEditingResponse(false);
      return;
    }

    if (gathering.slug === 'sample') {
      const nextParticipant = {
        ...participant,
        availableDates: filterDatesByMonths(
          availableDates,
          gathering.selected_months
        ),
        suggestedRegions: regionSuggestions,
      };
      setParticipant(nextParticipant);
      setIsEditingResponse(false);
      window.localStorage.setItem(
        getStorageKey(gathering.slug),
        JSON.stringify({
          entryToken,
          participant: nextParticipant,
        })
      );
      openSaveSuccessSheet();
      return;
    }

    try {
      setSubmitting(true);
      const saved = JSON.parse(
        window.localStorage.getItem(getStorageKey(gathering.slug)) || '{}'
      );
      const response = await fetch('/api/cheongmo-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: gathering.slug,
          entryToken,
          participantId: participant.id,
          guestName: participant.guestName,
          availableDates,
          suggestedRegions: regionSuggestions,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success)
        throw new Error(result.error || '응답 저장에 실패했습니다.');

      const nextParticipant = {
        id: result.data.id,
        guestName: result.data.guestName,
        availableDates: filterDatesByMonths(
          result.data.availableDates,
          gathering.selected_months
        ),
        suggestedRegions: result.data.suggestedRegions || [],
      };
      setParticipant(nextParticipant);
      setAvailableDates(nextParticipant.availableDates);
      setRegionSuggestions(nextParticipant.suggestedRegions);
      setIsEditingResponse(false);
      setGathering(prev =>
        prev
          ? {
              ...prev,
              participants: [
                ...(prev.participants || []).filter(
                  item => item.id !== nextParticipant.id
                ),
                nextParticipant,
              ],
            }
          : prev
      );
      const latestResponse = await fetch(getCheongmoApiUrl(gathering.slug), {
        cache: 'no-store',
      });
      const latestResult = await latestResponse.json();
      if (latestResponse.ok && latestResult.success) {
        setGathering(latestResult.data);
      }
      window.localStorage.setItem(
        getStorageKey(gathering.slug),
        JSON.stringify({
          ...saved,
          entryToken,
          participant: nextParticipant,
        })
      );
      openSaveSuccessSheet();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const shareGathering = async () => {
    const shareUrl = metaUrl || `${getSiteUrl()}/cheongmo/${gathering.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: gathering.title,
          text: '청첩장 모임에 참여해주세요.',
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success('청모 링크를 복사했어요.');
    } catch (error) {
      if (error?.name !== 'AbortError') {
        toast.error('공유 링크를 준비하지 못했어요.');
      }
    }
  };

  if (loading) {
    return (
      <>
        <CheongmoMetaHead url={metaUrl} />
        <div className={styles.loadingBox}>
          <div>청첩장 모임을 불러오고 있어요.</div>
        </div>
      </>
    );
  }

  if (!gathering) {
    return (
      <>
        <CheongmoMetaHead url={metaUrl} />
        <div className={styles.errorBox}>
          <div>
            <h1>청모를 찾을 수 없습니다.</h1>
            <p>공유받은 링크가 맞는지 다시 확인해주세요.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <CheongmoMetaHead
        title={`${gathering.title} - 정담 청첩장 모임`}
        description="청첩장 모임에 입장하고 가능한 날짜와 장소 의견을 남겨주세요."
        url={metaUrl}
      />

      <main className={styles.page}>
        <div className={styles.shell}>
          {participant ? (
              <section className={`${styles.communityRoom} ${styles.roomEnterFade}`}>
              <section className={styles.roomAppHero}>
                <div className={styles.roomAppHeroContent}>
                  <div className={styles.roomAppHeroText}>
                    <div className={styles.roomHeroBrandRow}>
                      <button
                        className={styles.roomIntroLogoButton}
                        type="button"
                        aria-label="정담 메인으로 이동"
                        onClick={() => router.push('/')}
                      >
                        <Image
                          src="/cheongmo/cheongmo-home-logo-pill.png"
                          alt="정담"
                          width={2073}
                          height={758}
                          priority
                        />
                      </button>
                      <button
                        className={styles.roomShareButton}
                        type="button"
                        aria-label="청모 링크 공유하기"
                        onClick={shareGathering}
                      >
                        <Image
                          src="/cheongmo/cheongmo-share-icon.svg"
                          alt=""
                          width={28}
                          height={28}
                        />
                      </button>
                    </div>
                    <h1>{gathering.title}</h1>
                    <p>{participant.guestName}님, 함께 일정을 맞추고 있어요</p>
                    <div className={styles.roomStatusPills}>
                      <span>
                        <Image
                          src="/cheongmo/room-insight-people.png"
                          alt=""
                          width={20}
                          height={20}
                        />
                        {roomParticipantCount}명이 참여했어요
                      </span>
                      <span>
                        <Image
                          src="/cheongmo/room-status-sync.png"
                          alt=""
                          width={20}
                          height={20}
                        />
                        일정 조율중
                      </span>
                      {voteDeadlineLabel && (
                        <span>
                          <Image
                            src="/cheongmo/date-calendar-icon.svg"
                            alt=""
                            width={20}
                            height={20}
                          />
                          {voteDeadlineLabel}까지 투표
                        </span>
                      )}
                    </div>
                  </div>
                  <Image
                    className={styles.roomHeroObject}
                    src="/cheongmo/cheongmo-room-hero-object.png"
                    alt=""
                    width={1536}
                    height={1024}
                    priority
                  />
                </div>

                <div className={styles.roomDownloadActions}>
                  <a
                    className={styles.cheongmoAppStoreAction}
                    href={appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className={styles.cheongmoStoreIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" role="img">
                        <path d="M16.55 12.25c-.02-2.38 1.95-3.52 2.04-3.58-1.12-1.64-2.85-1.87-3.46-1.89-1.47-.15-2.88.86-3.62.86-.75 0-1.9-.84-3.13-.82-1.6.02-3.08.93-3.9 2.36-1.67 2.9-.43 7.18 1.19 9.53.8 1.14 1.74 2.42 2.98 2.37 1.2-.05 1.65-.77 3.1-.77 1.44 0 1.85.77 3.11.75 1.29-.02 2.1-1.16 2.87-2.31.92-1.33 1.29-2.62 1.31-2.69-.03-.01-2.46-.95-2.49-3.81ZM14.17 5.22c.65-.78 1.08-1.86.96-2.95-.93.04-2.09.62-2.76 1.4-.6.69-1.13 1.8-.99 2.86 1.05.08 2.13-.53 2.79-1.31Z" />
                      </svg>
                    </span>
                    <span>
                      <small>Download</small>
                      <strong>App Store</strong>
                    </span>
                  </a>
                  <button
                    className={styles.cheongmoPlayStoreAction}
                    type="button"
                    onClick={() => toast('현재 베타테스터만 진행중입니다.')}
                  >
                    <span className={styles.cheongmoStoreIcon} aria-hidden="true">
                      <svg viewBox="0 0 24 24" role="img">
                        <path d="M4.5 3.65c-.32.26-.5.68-.5 1.22v14.26c0 .54.18.96.5 1.22l8.08-8.35L4.5 3.65Zm9.15 7.25 2.42-2.5L6.53 3.05l7.12 7.85Zm0 2.2-7.12 7.85 9.54-5.35-2.42-2.5Zm1.08-1.1 2.95 3.05 2.23-1.25c1.46-.82 1.46-2.78 0-3.6l-2.23-1.25L14.73 12Z" />
                      </svg>
                    </span>
                    <span>
                      <small>Beta</small>
                      <strong>Google Play</strong>
                    </span>
                  </button>
                </div>
              </section>

              <section
                className={`${styles.roomBriefingCard} ${
                  gathering.location_mode === 'host_decides'
                    ? styles.hostLocationBriefingCard
                    : ''
                }`}
              >
                <div className={styles.roomBriefingHeader}>
                  <span>조율 브리핑</span>
                  <strong>
                    {isVotingClosed
                      ? '투표 종료'
                      : isEditingResponse
                      ? '수정 중'
                      : '저장 완료'}
                  </strong>
                </div>

                <article
                  className={`${styles.roomBriefingRow} ${styles.roomParticipantBriefingRow}`}
                >
                  <span className={styles.insightIcon}>
                    <Image
                      src="/cheongmo/room-insight-people.png"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </span>
                  <div>
                    <em>참여</em>
                    <strong>
                      {roomParticipantCount}
                      {expectedGuestCount ? ` / ${expectedGuestCount}` : ''}
                    </strong>
                    <div className={styles.miniParticipants}>
                      {participantNames.map(name => (
                        <span key={name}>{name}</span>
                      ))}
                    </div>
                  </div>
                </article>

                <article className={styles.roomBriefingRow}>
                  <span className={styles.insightIcon}>
                    <Image
                      src="/cheongmo/room-insight-chart.png"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </span>
                  <div>
                    <em>가장 유력한 날짜</em>
                    <strong>
                      {roomTopDate ? formatDateLabel(roomTopDate.date) : '집계 전'}
                    </strong>
                    <div className={styles.briefingProgressLine}>
                      <div className={styles.insightProgress}>
                        <i style={{ width: `${roomTopDateProgress}%` }} />
                      </div>
                      <p>
                        {roomTopDate
                          ? `${roomTopDate.count}명 선택`
                          : '저장된 일정 없음'}
                      </p>
                    </div>
                  </div>
                </article>

                <article
                  className={`${styles.roomBriefingRow} ${styles.roomHostBriefingRow}`}
                >
                  <span className={styles.insightIcon}>
                    <Image
                      src="/cheongmo/room-insight-pin.png"
                      alt=""
                      width={24}
                      height={24}
                    />
                  </span>
                  {gathering.location_mode === 'ask_guests' ? (
                    <div>
                      <em>가장 유력한 지역</em>
                      <strong>{roomTopRegion?.name || '모으는 중'}</strong>
                      <p>
                        {roomTopRegion
                          ? `${roomTopRegion.count}명이 가장 많이 선택했어요`
                          : '지역을 제안해주세요'}
                      </p>
                    </div>
                  ) : (
                    <div className={styles.hostLocationContent}>
                      <em>모임 장소</em>
                      <strong>{hostLocationTitle}</strong>
                      {hostLocationDetails.length > 0 && (
                        <div className={styles.topRegionChips}>
                          {hostLocationDetails.slice(0, 2).map(item => (
                            <span key={item}>{item}</span>
                          ))}
                        </div>
                      )}
                      {hostMapLinks.length > 0 && (
                        <div className={styles.hostMapLinks}>
                          {hostMapLinks.map(link => (
                            <a
                              className={`${styles.hostMapButton} ${
                                styles[`hostMapButton${link.brand}`]
                              }`}
                              href={link.href}
                              key={link.label}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <span aria-hidden="true">{link.icon}</span>
                              <b>{link.label}</b>
                            </a>
                          ))}
                        </div>
                      )}
                      <p>주최자가 정한 모임 장소예요</p>
                    </div>
                  )}
                </article>
              </section>

              <nav className={styles.roomSegmentTabs} aria-label="청모 섹션">
                <a href="#cheongmo-dates">
                  <span className={styles.roomTabCalendarIcon} aria-hidden="true" />
                  날짜
                </a>
                {gathering.location_mode === 'ask_guests' && (
                  <a href="#cheongmo-regions">
                    <Image
                      src="/cheongmo/room-insight-pin.png"
                      alt=""
                      width={20}
                      height={20}
                    />
                    지역
                  </a>
                )}
                <a href="#cheongmo-participants">
                  <Image
                    src="/cheongmo/room-insight-people.png"
                    alt=""
                    width={20}
                    height={20}
                  />
                  참여자
                </a>
              </nav>

              <section className={styles.communityMain}>
                  <div
                    className={`${styles.communitySection} ${styles.dateAppSection}`}
                    id="cheongmo-dates"
                  >
                    <div className={styles.communitySectionHeader}>
                      <div>
                        <Image
                          alt=""
                          aria-hidden="true"
                          className={styles.sectionIcon}
                          src="/cheongmo/date-calendar-icon.svg"
                          width={44}
                          height={44}
                        />
                        <h2>
                          {isVotingClosed
                            ? '가능한 날짜 투표가 종료됐어요'
                            : isEditingResponse
                            ? '가능한 날짜에 투표해주세요'
                            : '가능한 날짜 투표 현황'}
                        </h2>
                        <p className={styles.subcopy}>
                          {isVotingClosed
                            ? votingClosedMessage
                            : voteDeadlineLabel
                            ? `${voteDeadlineLabel}까지 편한 날짜를 선택해주세요`
                            : '편한 날짜를 고르면 모두의 선택과 함께 보여요'}
                        </p>
                      </div>
                      <strong>
                        {isVotingClosed
                          ? '투표 종료'
                          : isEditingResponse
                          ? `${availableDates.length}개 선택`
                          : '저장 완료'}
                      </strong>
                    </div>
                    {visibleAvailableDates.length > 0 && (
                      <div className={styles.mySelectionStrip}>
                        <span>내가 선택한 날짜</span>
                        <div>
                          {visibleAvailableDates
                            .slice()
                            .sort()
                            .map(date => (
                              <em key={date}>{formatDateLabel(date)}</em>
                            ))}
                        </div>
                      </div>
                    )}
                    <div className={styles.voteCalendarRail}>
                      {visibleMonth && (
                        <article
                          className={styles.voteCalendar}
                          key={visibleMonth.value}
                        >
                          <header>
                            <button
                              type="button"
                              disabled={activeMonthIndex === 0}
                              onClick={() =>
                                setActiveMonthIndex(index =>
                                  Math.max(index - 1, 0)
                                )
                              }
                            >
                              ‹
                            </button>
                            <strong>{visibleMonth.title}</strong>
                            <button
                              type="button"
                              disabled={
                                activeMonthIndex >= monthCalendars.length - 1
                              }
                              onClick={() =>
                                setActiveMonthIndex(index =>
                                  Math.min(
                                    index + 1,
                                    Math.max(monthCalendars.length - 1, 0)
                                  )
                                )
                              }
                            >
                              ›
                            </button>
                          </header>
                          <div className={styles.voteWeekHeader}>
                            {['일', '월', '화', '수', '목', '금', '토'].map(
                              day => (
                                <span key={day}>{day}</span>
                              )
                            )}
                          </div>
                          <div className={styles.voteCalendarGrid}>
                            {visibleMonth.days.map((day, index) => {
                              if (!day) {
                                return (
                                  <i
                                    key={`blank-${visibleMonth.value}-${index}`}
                                  />
                                );
                              }

                              const names = dateSummary.get(day.value) || [];
                              const alreadyCounted = names.includes(
                                participant.guestName
                              );
                              const selected = availableDates.includes(
                                day.value
                              );
                              const displayCount =
                                names.length + (selected && !alreadyCounted ? 1 : 0);
                              const finalized =
                                displayCount > 0 &&
                                displayCount ===
                                  expectedGuestCount &&
                                respondedCount >= expectedGuestCount;
                              return (
                                <button
                                  className={`${styles.voteDay} ${
                                    selected ? styles.selectedVoteDay : ''
                                  } ${
                                    finalized ? styles.finalVoteDay : ''
                                  } ${
                                    day.weekday === 0 || day.holiday
                                      ? styles.redVoteDay
                                      : ''
                                  } ${
                                    day.weekday === 6 ? styles.blueVoteDay : ''
                                  }`}
                                  key={day.value}
                                  type="button"
                                  disabled={!isEditingResponse || isVotingClosed}
                                  title={
                                    names.length > 0
                                      ? names.join(', ')
                                      : day.holiday || '선택한 사람이 없습니다.'
                                  }
                                  onClick={() => toggleAvailableDate(day.value)}
                                >
                                  <span>{day.day}</span>
                                  <small>
                                    {day.holiday ||
                                      (displayCount > 0
                                        ? `${displayCount}명`
                                        : '')}
                                  </small>
                                </button>
                              );
                            })}
                          </div>
                        </article>
                      )}
                    </div>
                    <div className={styles.dateResultBoard}>
                      <div className={styles.resultHeader}>
                        <Image
                          alt=""
                          aria-hidden="true"
                          className={styles.dateLeaderIcon}
                          src="/cheongmo/date-leader-icon.png"
                          width={32}
                          height={32}
                        />
                        <strong>득표 높은 날짜</strong>
                      </div>
                      {dateLeaders.length > 0 ? (
                        dateLeaders.slice(0, 3).map((item, index) => {
                          const label = getCandidateLabel({
                            count: item.count,
                            index,
                            expectedCount: expectedGuestCount,
                            respondedCount,
                          });
                          const status =
                            label.endsWith('명') && index === 1 && item.count > 1
                              ? '경합'
                              : label.endsWith('명')
                                ? ''
                                : label;
                          const progress = Math.max(
                            16,
                            Math.round((item.count / maxDateVoteCount) * 100)
                          );
                          return (
                            <div
                              className={`${styles.dateResultItem} ${
                                item.finalized ? styles.finalDateResult : ''
                              }`}
                              key={item.date}
                            >
                              <i>{index + 1}</i>
                              <div className={styles.dateResultContent}>
                                <div className={styles.dateResultLine}>
                                  <strong>{formatDateLabel(item.date)}</strong>
                                  <p>{item.names.join(', ')}</p>
                                  <span>{item.count}명</span>
                                  {status && <em>{status}</em>}
                                </div>
                                <div className={styles.dateResultProgress}>
                                  <b style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className={styles.emptyResult}>
                          아직 날짜 의견이 없습니다.
                        </p>
                      )}
                    </div>
                    <div className={styles.dateVoterBoard} id="cheongmo-participants">
                      <div className={styles.resultHeader}>
                        <Image
                          alt=""
                          aria-hidden="true"
                          className={styles.dateLeaderIcon}
                          src="/cheongmo/room-insight-people.png"
                          width={32}
                          height={32}
                        />
                        <strong>참여자별 선택 날짜</strong>
                      </div>
                      {savedParticipants.length > 0 ? (
                        <div className={styles.dateVoterList}>
                          {savedParticipants.map(person => {
                            const dates = filterDatesByMonths(
                              person.availableDates,
                              visibleMonth
                                ? [visibleMonth.value]
                                : gathering?.selected_months
                            );
                            return (
                              <article
                                className={styles.dateVoterItem}
                                data-initial={(person.guestName || '?').slice(0, 1)}
                                key={person.id || person.guestName}
                              >
                                <strong>{person.guestName}</strong>
                                <div>
                                  {dates.length > 0 ? (
                                    dates
                                      .slice()
                                      .sort()
                                      .map(date => (
                                        <span key={date}>
                                          {formatDateLabel(date)}
                                        </span>
                                      ))
                                  ) : (
                                    <em>이번 달 선택 없음</em>
                                  )}
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      ) : (
                        <p className={styles.emptyResult}>
                          아직 날짜를 선택한 사람이 없습니다.
                        </p>
                      )}
                    </div>
                  </div>

                  {gathering.location_mode === 'ask_guests' && (
                    <div className={styles.regionOpinionSection} id="cheongmo-regions">
                      <div className={styles.regionTitle}>
                        <Image
                          alt=""
                          aria-hidden="true"
                          className={styles.regionTitleIcon}
                          src="/cheongmo/region-title-pin.png"
                          width={64}
                          height={64}
                        />
                        <div>
                          <h2>지역 의견</h2>
                          <p>만나기 편한 지역을 같이 정해요</p>
                        </div>
                      </div>

                      <div className={styles.selectedRegionPanel}>
                        <div>
                          <strong>내가 선택한 지역</strong>
                          <div className={styles.selectedRegionChips}>
                            {regionSuggestions.length > 0 ? (
                              regionSuggestions.map(region => (
                                <button
                                  key={region}
                                  type="button"
                                  disabled={!isEditingResponse || isVotingClosed}
                                  onClick={() =>
                                    setRegionSuggestions(prev =>
                                      prev.filter(item => item !== region)
                                    )
                                  }
                                >
                                  {region}
                                  <span>×</span>
                                </button>
                              ))
                            ) : (
                              <em>아직 선택한 지역이 없습니다</em>
                            )}
                          </div>
                        </div>
                        <Image
                          alt=""
                          aria-hidden="true"
                          className={styles.regionMapImage}
                          src="/cheongmo/region-map-pin.png"
                          width={180}
                          height={130}
                        />
                      </div>

                      <div className={styles.regionAddPanel}>
                        <div className={styles.regionAddRow}>
                          <input
                            className={styles.input}
                            value={regionInput}
                            onChange={event =>
                              setRegionInput(event.target.value)
                            }
                            placeholder="지역 이름 입력"
                          />
                          <button
                            className={`${styles.button} ${styles.inlineButton}`}
                            type="button"
                            disabled={!isEditingResponse || isVotingClosed}
                            onClick={addRegionSuggestion}
                          >
                            후보 추가
                          </button>
                        </div>
                        <p>예: 강남역, 성수, 홍대입구</p>
                      </div>

                      <div className={styles.regionCandidateHeader}>
                        <h3>지역 후보</h3>
                        <span>복수 선택 가능</span>
                      </div>

                      <div className={styles.regionCandidateList}>
                        {regionCandidates.length > 0 ? (
                          regionCandidates.map((region, index) => {
                            const selected = regionSuggestions.includes(
                              region.name
                            );
                            const status = getCandidateLabel({
                              count: region.count,
                              index,
                              expectedCount: expectedGuestCount,
                              respondedCount,
                            });
                            const regionStatus =
                              index === 0 ? '가장 유력' : status;
                            const progress = Math.max(
                              8,
                              Math.round(
                                (region.count / maxRegionVoteCount) * 100
                              )
                            );
                            return (
                              <button
                                className={`${styles.regionCandidateCard} ${
                                  selected ? styles.selectedRegionCandidate : ''
                                }`}
                                key={region.name}
                                type="button"
                                disabled={!isEditingResponse || isVotingClosed}
                                onClick={() =>
                                  setRegionSuggestions(prev =>
                                    prev.includes(region.name)
                                      ? prev.filter(item => item !== region.name)
                                      : [...prev, region.name]
                                  )
                                }
                              >
                                <span className={styles.regionCheck}>
                                  {selected ? '✓' : ''}
                                </span>
                                <div className={styles.regionCandidateBody}>
                                  <div className={styles.regionCandidateName}>
                                    <strong>{region.name}</strong>
                                    <em
                                      className={
                                        index === 0 ? styles.regionTopBadge : ''
                                      }
                                    >
                                      {regionStatus}
                                    </em>
                                  </div>
                                  <div className={styles.regionCandidateMeta}>
                                    <strong>{region.count}명</strong>
                                    <small>
                                      {region.names.length > 0
                                        ? region.names.join(', ')
                                        : '아직 선택한 사람이 없어요'}
                                    </small>
                                  </div>
                                  <div className={styles.regionProgressTrack}>
                                    <i style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                                <b>{selected ? '선택됨' : '선택하기'}</b>
                              </button>
                            );
                          })
                        ) : (
                          <p className={styles.emptyRegionCandidate}>
                            아직 모인 지역 후보가 없습니다.
                          </p>
                        )}
                      </div>

                      <div className={styles.regionNotice}>
                        <Image
                          alt=""
                          aria-hidden="true"
                          className={styles.regionShieldIcon}
                          src="/cheongmo/region-shield-check.png"
                          width={56}
                          height={56}
                        />
                        <p>
                          선택한 지역은 저장 후
                          <strong> 모두에게 바로 반영돼요</strong>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className={styles.communityActionBar}>
                    <div className={styles.communityActionControls}>
                      {isVotingClosed ? (
                        <>
                          <button
                            className={`${styles.button} ${styles.wideButton}`}
                            type="button"
                            disabled
                          >
                            투표 종료
                          </button>
                          <p>{votingClosedMessage}</p>
                        </>
                      ) : isEditingResponse ? (
                        <>
                          <button
                            className={`${styles.button} ${styles.wideButton}`}
                            type="button"
                            disabled={submitting}
                            onClick={saveCommunityResponse}
                          >
                            {submitting ? '저장 중' : '내 의견 저장'}
                          </button>
                          <p>저장 후 모두에게 바로 반영돼요</p>
                        </>
                      ) : (
                        <>
                          <button
                            className={`${styles.button} ${styles.wideButton}`}
                            type="button"
                            onClick={() => setIsEditingResponse(true)}
                          >
                            내 의견 수정하기
                          </button>
                          <p>수정 후 다시 저장해주세요</p>
                        </>
                      )}
                    </div>
                  </div>
              </section>
            </section>
          ) : (
            <>
              {locked || entrySuccessSheetOpen ? (
                <section className={styles.entryGate}>
                  <div className={styles.entryGateBrand}>
                    <Image
                      className={styles.entryGateBrandLogo}
                      src="/cheongmo/cheongmo-home-logo-pill.png"
                      alt="JEONGDAM 정담"
                      width={2073}
                      height={758}
                      priority
                    />
                    <strong className={styles.entryGateBrandText}>
                      정담 청첩장 모임
                    </strong>
                  </div>
                  <h1>초대 확인이 필요해요</h1>
                  <p className={styles.entryGateLead}>
                    모임 정보를 보려면 먼저 입장 정보를 확인해주세요.
                  </p>
                  <div className={styles.entryGateLinks}>
                    <Link href="/">정담 소개</Link>
                    <Link href="/cheongmo/new">모임 만들기</Link>
                  </div>
                  <div className={styles.entryGateIllustration} aria-hidden="true">
                    <Image
                      src="/cheongmo/cheongmo-entry-lock-illustration.png"
                      alt=""
                      width={900}
                      height={900}
                      priority
                    />
                  </div>

                  <div className={styles.entryGateDownloadActions}>
                    <a
                      className={styles.cheongmoAppStoreAction}
                      href={appStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className={styles.cheongmoStoreIcon} aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img">
                          <path d="M16.55 12.25c-.02-2.38 1.95-3.52 2.04-3.58-1.12-1.64-2.85-1.87-3.46-1.89-1.47-.15-2.88.86-3.62.86-.75 0-1.9-.84-3.13-.82-1.6.02-3.08.93-3.9 2.36-1.67 2.9-.43 7.18 1.19 9.53.8 1.14 1.74 2.42 2.98 2.37 1.2-.05 1.65-.77 3.1-.77 1.44 0 1.85.77 3.11.75 1.29-.02 2.1-1.16 2.87-2.31.92-1.33 1.29-2.62 1.31-2.69-.03-.01-2.46-.95-2.49-3.81ZM14.17 5.22c.65-.78 1.08-1.86.96-2.95-.93.04-2.09.62-2.76 1.4-.6.69-1.13 1.8-.99 2.86 1.05.08 2.13-.53 2.79-1.31Z" />
                        </svg>
                      </span>
                      <span>
                        <small>Download on the</small>
                        <strong>App Store</strong>
                      </span>
                    </a>
                    <button
                      className={styles.cheongmoPlayStoreAction}
                      type="button"
                      onClick={() => toast('현재 베타테스터만 진행중입니다.')}
                    >
                      <span className={styles.cheongmoStoreIcon} aria-hidden="true">
                        <svg viewBox="0 0 24 24" role="img">
                          <path d="M4.5 3.65c-.32.26-.5.68-.5 1.22v14.26c0 .54.18.96.5 1.22l8.08-8.35L4.5 3.65Zm9.15 7.25 2.42-2.5L6.53 3.05l7.12 7.85Zm0 2.2-7.12 7.85 9.54-5.35-2.42-2.5Zm1.08-1.1 2.95 3.05 2.23-1.25c1.46-.82 1.46-2.78 0-3.6l-2.23-1.25L14.73 12Z" />
                        </svg>
                      </span>
                      <span>
                        <small>GET IT ON</small>
                        <strong>Google Play</strong>
                      </span>
                    </button>
                  </div>

                  <section className={styles.entryGatePanel}>
                    <div className={styles.entryGatePanelTitle}>
                      <span aria-hidden="true">
                        <Image
                          src="/cheongmo/entry-lock-icon.svg"
                          alt=""
                          width={48}
                          height={48}
                        />
                      </span>
                      <strong>
                        {gathering.access_type === 'phone_list'
                          ? '휴대폰 번호'
                          : '모임 비밀번호'}
                      </strong>
                    </div>
                    <div className={styles.entryGateInputRow}>
                      <input
                        id="entryValue"
                        className={styles.entryGateInput}
                        type={
                          gathering.access_type === 'password'
                            ? 'password'
                            : 'tel'
                        }
                        inputMode={
                          gathering.access_type === 'phone_list'
                            ? 'tel'
                            : 'text'
                        }
                        value={entryValue}
                        maxLength={
                          gathering.access_type === 'phone_list' ? 11 : undefined
                        }
                        onChange={event =>
                          setEntryValue(
                            gathering.access_type === 'phone_list'
                              ? normalizePhone(event.target.value).slice(0, 11)
                              : event.target.value
                          )
                        }
                        onKeyDown={event => {
                          if (event.key !== 'Enter' || submitting || !entryReady) {
                            return;
                          }
                          event.preventDefault();
                          enterGathering();
                        }}
                        placeholder={
                          gathering.access_type === 'phone_list'
                            ? '휴대폰 번호를 입력해주세요'
                            : '비밀번호를 입력해주세요'
                        }
                      />
                      <button
                        className={styles.entryGateInputAction}
                        type="button"
                        aria-label="입장하기"
                        disabled={submitting || !entryReady}
                        onClick={enterGathering}
                      >
                        →
                      </button>
                    </div>
                    <p>
                      <span aria-hidden="true">
                        <Image
                          src="/cheongmo/entry-shield-icon.svg"
                          alt=""
                          width={44}
                          height={44}
                        />
                      </span>
                      초대받은 분만 입장할 수 있어요.
                    </p>
                  </section>
                </section>
              ) : (
                <section className={`${styles.entryGate} ${styles.entryGateReady}`}>
                  <div className={styles.entryGateBrand}>
                    <Image
                      className={styles.entryGateBrandLogo}
                      src="/cheongmo/cheongmo-home-logo-pill.png"
                      alt="JEONGDAM 정담"
                      width={2073}
                      height={758}
                      priority
                    />
                    <strong
                      className={`${styles.entryGateBrandText} ${styles.entryGateReadyBrandText}`}
                    >
                      입장 확인 완료
                    </strong>
                  </div>
                  <h1>이제 이름만 알려주세요</h1>
                  <p className={styles.entryGateLead}>
                    확인이 끝났어요. 모임에서 사용할 이름만 입력하면 바로 참여해요.
                  </p>
                  <div className={styles.entryGateLinks}>
                    <Link href="/">정담 소개</Link>
                    <Link href="/cheongmo/new">모임 만들기</Link>
                  </div>
                  <div className={styles.entryGateIllustration} aria-hidden="true">
                    <Image
                      src="/cheongmo/cheongmo-room-hero-object.png"
                      alt=""
                      width={1536}
                      height={1024}
                      priority
                    />
                  </div>

                  <section
                    className={`${styles.entryGatePanel} ${styles.entryGateReadyPanel}`}
                  >
                    <div className={styles.entryGatePanelTitle}>
                      <span
                        className={styles.entryGateReadyPanelIcon}
                        aria-hidden="true"
                      >
                        <Image
                          src="/cheongmo/entry-shield-icon.svg"
                          alt=""
                          width={44}
                          height={44}
                        />
                      </span>
                      <strong>참여자 이름</strong>
                    </div>
                    <div className={styles.entryGateInputRow}>
                      <input
                        id="guestName"
                        className={styles.entryGateInput}
                        value={guestName}
                        onChange={event => setGuestName(event.target.value)}
                        onKeyDown={event => {
                          if (
                            event.key !== 'Enter' ||
                            submitting ||
                            !guestName.trim()
                          ) {
                            return;
                          }
                          event.preventDefault();
                          joinGathering();
                        }}
                        placeholder="이름을 입력해주세요"
                      />
                      <button
                        className={styles.entryGateInputAction}
                        type="button"
                        aria-label="모임 참여하기"
                        disabled={submitting || !guestName.trim()}
                        onClick={joinGathering}
                      >
                        →
                      </button>
                    </div>
                    <p>
                      <span aria-hidden="true">
                        <Image
                          src="/cheongmo/entry-shield-icon.svg"
                          alt=""
                          width={44}
                          height={44}
                        />
                      </span>
                      이 이름으로 청모에 참여해요.
                    </p>
                  </section>
                </section>
              )}
              {entrySuccessSheetOpen && !participant && (
                <div className={styles.entrySuccessOverlay} role="presentation">
                  <section
                    className={styles.entrySuccessSheet}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="entry-success-title"
                  >
                    <span className={styles.entrySuccessHandle} aria-hidden="true" />
                    <div
                      className={`${styles.entrySuccessState} ${
                        entrySuccessPhase === 'success'
                          ? styles.entrySuccessStateActive
                          : styles.entrySuccessStateDone
                      }`}
                    >
                      <div className={styles.entrySuccessVisual} aria-hidden="true">
                        <span className={styles.entrySuccessRipple} />
                        <span className={styles.entrySuccessRipple} />
                        {Array.from({ length: 8 }).map((_, index) => (
                          <i key={index} />
                        ))}
                        <div className={styles.entrySuccessCircle}>
                          <span>✓</span>
                        </div>
                      </div>
                      <div className={styles.entrySuccessText}>
                        <h2 id="entry-success-title">확인됐어요</h2>
                        <p>이제 모임에서 사용할 이름만 알려주세요.</p>
                      </div>
                    </div>
                    <form
                      className={`${styles.entryNameSheetForm} ${
                        entrySuccessPhase === 'name'
                          ? styles.entryNameSheetFormActive
                          : ''
                      }`}
                      onSubmit={event => {
                        event.preventDefault();
                        if (submitting || !guestName.trim()) return;
                        joinGathering();
                      }}
                    >
                      <div className={styles.entryNameSheetHeader}>
                        <span aria-hidden="true">✓</span>
                        <div>
                          <strong>참여자 이름</strong>
                          <p>모임 안에서 보여질 이름이에요.</p>
                        </div>
                      </div>
                      <div className={styles.entryGateInputRow}>
                        <input
                          ref={entryNameInputRef}
                          className={styles.entryGateInput}
                          value={guestName}
                          onChange={event => setGuestName(event.target.value)}
                          placeholder="이름을 입력해주세요"
                          autoComplete="name"
                          disabled={entrySuccessPhase !== 'name'}
                          tabIndex={entrySuccessPhase === 'name' ? 0 : -1}
                        />
                        <button
                          className={styles.entryGateInputAction}
                          type="submit"
                          aria-label="모임 참여하기"
                          disabled={
                            entrySuccessPhase !== 'name' ||
                            submitting ||
                            !guestName.trim()
                          }
                        >
                          →
                        </button>
                      </div>
                    </form>
                  </section>
                </div>
              )}
            </>
          )}
          {saveSuccessSheetOpen && participant && (
            <div className={styles.entrySuccessOverlay} role="presentation">
              <section
                className={`${styles.entrySuccessSheet} ${styles.saveSuccessSheet}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="save-success-title"
              >
                <span className={styles.entrySuccessHandle} aria-hidden="true" />
                <div
                  className={`${styles.entrySuccessState} ${styles.entrySuccessStateActive}`}
                >
                  <div className={styles.entrySuccessVisual} aria-hidden="true">
                    <span className={styles.entrySuccessRipple} />
                    <span className={styles.entrySuccessRipple} />
                    {Array.from({ length: 8 }).map((_, index) => (
                      <i key={index} />
                    ))}
                    <div className={styles.entrySuccessCircle}>
                      <span>✓</span>
                    </div>
                  </div>
                  <div className={styles.entrySuccessText}>
                    <h2 id="save-success-title">저장되었습니다</h2>
                    <p>모임에 내 의견이 반영됐어요.</p>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
