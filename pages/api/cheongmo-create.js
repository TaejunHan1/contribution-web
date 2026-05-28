import { normalizeKoreanPhone } from '../../lib/phoneUtils';
import {
  createSlug,
  createSupabaseClient,
  hashPassword,
  normalizeAllowedPhoneEntries,
  normalizePhoneList,
} from '../../lib/cheongmoUtils';

const sanitizeText = (value, maxLength = 300) =>
  String(value || '')
    .trim()
    .slice(0, maxLength);
const normalizePassword = value =>
  String(value || '').replace(/[^A-Za-z0-9]/g, '');

const createUniqueSlug = async supabase => {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const slug = createSlug();
    const { data } = await supabase
      .from('cheongmo_events')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (!data) return slug;
  }

  throw new Error('청모 링크 생성에 실패했습니다.');
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    hostName,
    partnerName,
    hostPhone,
    hostVerified,
    accessType,
    password,
    allowedPhones,
    selectedMonths,
    locationMode,
    locationLabel,
    venueName,
    venueAddress,
    meetingTime,
    voteDeadlineDate,
    title,
    message,
  } = req.body;

  const normalizedHostPhone = normalizeKoreanPhone(hostPhone);
  const normalizedPassword = normalizePassword(password);

  if (!hostName || !normalizedHostPhone || !hostVerified) {
    return res
      .status(400)
      .json({ success: false, error: '주최자 인증 정보가 필요합니다.' });
  }

  if (!['password', 'phone_list'].includes(accessType)) {
    return res
      .status(400)
      .json({ success: false, error: '입장 방식이 올바르지 않습니다.' });
  }

  if (
    accessType === 'password' &&
    !/^[A-Za-z0-9]{4,}$/.test(normalizedPassword)
  ) {
    return res.status(400).json({
      success: false,
      error: '모임 비밀번호는 영문/숫자 4자리 이상이어야 합니다.',
    });
  }
  const normalizedVoteDeadlineDate = sanitizeText(voteDeadlineDate, 10);
  const voteDeadlineAt =
    accessType === 'password' &&
    /^\d{4}-\d{2}-\d{2}$/.test(normalizedVoteDeadlineDate)
      ? `${normalizedVoteDeadlineDate}T23:59:59+09:00`
      : null;

  if (accessType === 'password' && !voteDeadlineAt) {
    return res.status(400).json({
      success: false,
      error: '투표 마감일을 선택해주세요.',
    });
  }
  if (voteDeadlineAt && new Date(voteDeadlineAt).getTime() < Date.now()) {
    return res.status(400).json({
      success: false,
      error: '마감일은 오늘 이후로 선택해주세요.',
    });
  }

  const normalizedAllowedPhoneEntries =
    normalizeAllowedPhoneEntries(allowedPhones);
  const normalizedAllowedPhones = normalizePhoneList(allowedPhones);
  if (accessType === 'phone_list' && normalizedAllowedPhones.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: '입장 허용 번호가 필요합니다.' });
  }

  const months = Array.isArray(selectedMonths)
    ? selectedMonths.slice(0, 3).sort()
    : [];
  if (months.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: '모임 예정 달을 선택해주세요.' });
  }

  try {
    const supabase = await createSupabaseClient();

    const { data: verificationData, error: verificationError } = await supabase
      .from('sms_verifications')
      .select('id')
      .eq('phone', normalizedHostPhone)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (verificationError || !verificationData) {
      return res.status(400).json({
        success: false,
        error: '주최자 휴대폰 인증이 완료되지 않았습니다.',
      });
    }

    const slug = await createUniqueSlug(supabase);
    const finalTitle =
      sanitizeText(title, 120) || `${sanitizeText(hostName, 60)} 청첩장 모임`;
    const finalMessage =
      sanitizeText(message, 500) ||
      `${sanitizeText(hostName, 60)}님 안녕하세요. 결혼식 전에 고마운 분들과 따뜻하게 밥 한 끼 나누고 싶어요.`;

    const { data, error } = await supabase
      .from('cheongmo_events')
      .insert([
        {
          slug,
          title: finalTitle,
          host_name: sanitizeText(hostName, 80),
          partner_name: sanitizeText(partnerName, 80) || null,
          host_phone: normalizedHostPhone,
          host_verification_id: verificationData.id,
          message: finalMessage,
          access_type: accessType,
          password_hash:
            accessType === 'password' ? hashPassword(normalizedPassword) : null,
          allowed_phones:
            accessType === 'phone_list' ? normalizedAllowedPhoneEntries : [],
          phone_collection: 'none',
          selected_months: months,
          location_mode:
            locationMode === 'ask_guests' ? 'ask_guests' : 'host_decides',
          location_label: sanitizeText(locationLabel, 160) || null,
          venue_name: sanitizeText(venueName, 160) || null,
          venue_address: sanitizeText(venueAddress, 240) || null,
          meeting_time: sanitizeText(meetingTime, 120) || null,
          vote_deadline_at: voteDeadlineAt,
          status: 'active',
        },
      ])
      .select('id, slug, title')
      .single();

    if (error) throw error;

    const origin = req.headers.origin || `https://${req.headers.host}`;
    return res.status(200).json({
      success: true,
      data: {
        id: data.id,
        slug: data.slug,
        title: data.title,
        url: `${origin}/cheongmo/${data.slug}`,
        password: accessType === 'password' ? normalizedPassword : null,
        voteDeadlineAt,
      },
    });
  } catch (error) {
    console.error('청모 생성 API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '청첩장 모임 생성 중 오류가 발생했습니다.',
    });
  }
}
