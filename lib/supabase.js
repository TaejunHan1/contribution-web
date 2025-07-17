// lib/supabase.js - 토스 스타일 Supabase 헬퍼
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 환경변수에 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 웹에서는 세션 유지 불필요
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 응답 형태 표준화
const createResponse = (success, data = null, error = null) => ({
  success,
  data,
  error,
});

// 에러 메시지 한국어화
const getKoreanErrorMessage = (error) => {
  const errorMessages = {
    'Row not found': '해당 경조사를 찾을 수 없습니다.',
    'Network error': '네트워크 연결을 확인해주세요.',
    'Invalid input': '입력 정보가 올바르지 않습니다.',
    'Permission denied': '접근 권한이 없습니다.',
    'Rate limit exceeded': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    'Service unavailable': '서비스가 일시적으로 이용할 수 없습니다.',
  };

  // PostgreSQL 에러 코드별 메시지
  const postgresErrors = {
    '23505': '이미 등록된 정보입니다.',
    '23503': '참조된 데이터가 존재하지 않습니다.',
    '23514': '입력 값이 올바르지 않습니다.',
    '42P01': '시스템 오류가 발생했습니다.',
  };

  if (error?.code && postgresErrors[error.code]) {
    return postgresErrors[error.code];
  }

  if (error?.message && errorMessages[error.message]) {
    return errorMessages[error.message];
  }

  // 기본 에러 메시지
  return error?.message || '알 수 없는 오류가 발생했습니다.';
};

// ===========================================
// 경조사 관련 함수들
// ===========================================

/**
 * 경조사 상세 정보 조회
 * @param {string} eventId - 경조사 ID
 * @returns {Object} 경조사 정보
 */
export const getEventDetails = async (eventId) => {
  try {
    if (!eventId || typeof eventId !== 'string') {
      return createResponse(false, null, '올바른 경조사 ID를 입력해주세요.');
    }

    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        event_name,
        event_type,
        event_date,
        ceremony_time,
        location,
        detailed_address,
        funeral_home,
        primary_contact,
        secondary_contact,
        family_relations,
        preset_amounts,
        allow_messages,
        message_placeholder,
        status,
        created_at
      `)
      .eq('id', eventId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Event fetch error:', error);
      return createResponse(false, null, getKoreanErrorMessage(error));
    }

    if (!data) {
      return createResponse(false, null, '경조사를 찾을 수 없습니다.');
    }

    // 날짜가 과거인지 확인 (부고는 예외)
    if (data.event_type !== 'funeral') {
      const eventDate = new Date(data.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        return createResponse(false, null, '종료된 경조사입니다.');
      }
    }

    return createResponse(true, data);
  } catch (error) {
    console.error('getEventDetails error:', error);
    return createResponse(false, null, '경조사 정보를 불러오는 중 오류가 발생했습니다.');
  }
};

// ===========================================
// 부조 관련 함수들
// ===========================================

/**
 * 부조 등록
 * @param {Object} contributionData - 부조 데이터
 * @returns {Object} 등록 결과
 */
export const addContribution = async (contributionData) => {
  try {
    const {
      event_id,
      contributor_name,
      amount,
      relation_to = null,
      notes = null,
    } = contributionData;

    // 필수 필드 검증
    if (!event_id || !contributor_name || !amount) {
      return createResponse(false, null, '필수 정보를 모두 입력해주세요.');
    }

    // 금액 검증
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1000) {
      return createResponse(false, null, '부조금은 1,000원 이상 입력해주세요.');
    }

    // 이름 길이 검증
    if (contributor_name.length > 50) {
      return createResponse(false, null, '성함은 50자 이내로 입력해주세요.');
    }

    // 노트 길이 검증
    if (notes && notes.length > 500) {
      return createResponse(false, null, '메시지는 500자 이내로 입력해주세요.');
    }

    // 경조사 존재 여부 확인
    const eventCheck = await getEventDetails(event_id);
    if (!eventCheck.success) {
      return eventCheck;
    }

    // 부조 등록
    const { data, error } = await supabase
      .from('contributions')
      .insert([
        {
          event_id,
          contributor_name: contributor_name.trim(),
          amount: numAmount,
          relation_to: relation_to?.trim() || null,
          notes: notes?.trim() || null,
          is_confirmed: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Contribution insert error:', error);
      return createResponse(false, null, getKoreanErrorMessage(error));
    }

    return createResponse(true, data);
  } catch (error) {
    console.error('addContribution error:', error);
    return createResponse(false, null, '부조 등록 중 오류가 발생했습니다.');
  }
};

/**
 * 부조 목록 조회
 * @param {string} eventId - 경조사 ID
 * @param {Object} options - 조회 옵션
 * @returns {Object} 부조 목록
 */
export const getContributions = async (eventId, options = {}) => {
  try {
    const {
      limit = 50,
      offset = 0,
      orderBy = 'created_at',
      ascending = false,
    } = options;

    if (!eventId) {
      return createResponse(false, null, '경조사 ID가 필요합니다.');
    }

    let query = supabase
      .from('contributions')
      .select(`
        id,
        contributor_name,
        amount,
        relation_to,
        notes,
        is_confirmed,
        created_at
      `)
      .eq('event_id', eventId)
      .order(orderBy, { ascending })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Contributions fetch error:', error);
      return createResponse(false, null, getKoreanErrorMessage(error));
    }

    return createResponse(true, {
      contributions: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('getContributions error:', error);
    return createResponse(false, null, '부조 목록을 불러오는 중 오류가 발생했습니다.');
  }
};

/**
 * 부조 통계 조회
 * @param {string} eventId - 경조사 ID
 * @returns {Object} 부조 통계
 */
export const getContributionStats = async (eventId) => {
  try {
    if (!eventId) {
      return createResponse(false, null, '경조사 ID가 필요합니다.');
    }

    const { data, error } = await supabase
      .from('contributions')
      .select('amount')
      .eq('event_id', eventId);

    if (error) {
      console.error('Stats fetch error:', error);
      return createResponse(false, null, getKoreanErrorMessage(error));
    }

    const contributions = data || [];
    const totalAmount = contributions.reduce((sum, item) => sum + item.amount, 0);
    const totalCount = contributions.length;
    const averageAmount = totalCount > 0 ? Math.round(totalAmount / totalCount) : 0;

    return createResponse(true, {
      totalAmount,
      totalCount,
      averageAmount,
    });
  } catch (error) {
    console.error('getContributionStats error:', error);
    return createResponse(false, null, '통계를 불러오는 중 오류가 발생했습니다.');
  }
};

// ===========================================
// 메시지 관련 함수들
// ===========================================

/**
 * 이벤트 메시지 등록
 * @param {Object} messageData - 메시지 데이터
 * @returns {Object} 등록 결과
 */
export const addEventMessage = async (messageData) => {
  try {
    const {
      event_id,
      sender_name,
      message,
      message_type = 'congratulation',
      is_anonymous = false,
    } = messageData;

    // 필수 필드 검증
    if (!event_id || !sender_name || !message) {
      return createResponse(false, null, '필수 정보를 모두 입력해주세요.');
    }

    // 메시지 길이 검증
    if (message.length > 500) {
      return createResponse(false, null, '메시지는 500자 이내로 입력해주세요.');
    }

    // 이름 길이 검증
    if (sender_name.length > 50) {
      return createResponse(false, null, '성함은 50자 이내로 입력해주세요.');
    }

    const { data, error } = await supabase
      .from('event_messages')
      .insert([
        {
          event_id,
          sender_name: sender_name.trim(),
          message: message.trim(),
          message_type,
          is_anonymous,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Message insert error:', error);
      return createResponse(false, null, getKoreanErrorMessage(error));
    }

    return createResponse(true, data);
  } catch (error) {
    console.error('addEventMessage error:', error);
    return createResponse(false, null, '메시지 등록 중 오류가 발생했습니다.');
  }
};

// ===========================================
// 유틸리티 함수들
// ===========================================

/**
 * 금액 포맷팅 (한국 통화 형식)
 * @param {number} amount - 금액
 * @returns {string} 포맷된 금액
 */
export const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return '0원';
  
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * 날짜 포맷팅 (한국 형식)
 * @param {string|Date} date - 날짜
 * @returns {string} 포맷된 날짜
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

/**
 * 시간 포맷팅 (한국 형식)
 * @param {string} time - 시간 (HH:mm 형식)
 * @returns {string} 포맷된 시간
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  try {
    // HH:mm 형식을 Date 객체로 변환
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time;
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return new Intl.DateTimeFormat('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Time formatting error:', error);
    return time;
  }
};

/**
 * 상대 시간 포맷팅 (방금, 1분 전, 1시간 전 등)
 * @param {string|Date} date - 날짜
 * @returns {string} 상대 시간
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) return '방금';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    
    return formatDate(date);
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '';
  }
};

/**
 * 텍스트 자르기 (말줄임표 추가)
 * @param {string} text - 텍스트
 * @param {number} maxLength - 최대 길이
 * @returns {string} 잘린 텍스트
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * 전화번호 포맷팅
 * @param {string} phoneNumber - 전화번호
 * @returns {string} 포맷된 전화번호
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phoneNumber;
};

/**
 * 실시간 구독 설정 (앱에서 사용)
 * @param {string} eventId - 경조사 ID
 * @param {Function} callback - 콜백 함수
 * @returns {Object} 구독 객체
 */
export const subscribeToContributions = (eventId, callback) => {
  if (!eventId || typeof callback !== 'function') {
    console.error('Invalid parameters for subscription');
    return null;
  }

  try {
    const subscription = supabase
      .channel(`contributions_${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contributions',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          callback('INSERT', payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contributions',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          callback('UPDATE', payload.new);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return subscription;
  } catch (error) {
    console.error('Subscription error:', error);
    return null;
  }
};

// ===========================================
// 에러 처리 및 로깅
// ===========================================

/**
 * 에러 로깅
 * @param {string} context - 에러 발생 컨텍스트
 * @param {Error} error - 에러 객체
 * @param {Object} metadata - 추가 메타데이터
 */
export const logError = (context, error, metadata = {}) => {
  const errorInfo = {
    context,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    url: typeof window !== 'undefined' ? window.location.href : 'Server',
    ...metadata,
  };

  console.error('Application Error:', errorInfo);

  // 프로덕션에서는 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // 예: Sentry, LogRocket 등으로 전송
  }
};

/**
 * API 요청 재시도 래퍼
 * @param {Function} fn - 실행할 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} delay - 재시도 간격 (ms)
 * @returns {Promise} 결과
 */
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // 지수 백오프
    }
  }
};

export default supabase;