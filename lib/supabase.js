import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // 웹에서는 세션을 유지하지 않음 (부조만 하는 용도)
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'jeongdam-contribution-web',
    },
  },
});

// 경조사 정보 조회 (공개 정보만)
export const getEventDetails = async (eventId) => {
  try {
    console.log('🔍 경조사 정보 조회:', eventId);
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        event_type,
        event_name,
        main_person_name,
        event_date,
        location,
        detailed_address,
        allow_messages,
        message_placeholder,
        preset_amounts,
        family_relations,
        status,
        
        groom_name,
        bride_name,
        
        deceased_age,
        death_date,
        deceased_gender,
        funeral_home,
        primary_contact,
        secondary_contact,
        
        additional_info
      `)
      .eq('id', eventId)
      .eq('status', 'active') // 활성 상태인 것만
      .single();

    if (error) {
      console.error('❌ 경조사 조회 오류:', error);
      throw error;
    }

    if (!data) {
      throw new Error('경조사를 찾을 수 없습니다.');
    }

    console.log('✅ 경조사 조회 성공:', data.event_name);
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ getEventDetails error:', error);
    return { 
      success: false, 
      error: error.message || '경조사 정보를 불러올 수 없습니다.' 
    };
  }
};

// 부조금 추가
export const addContribution = async (contributionData) => {
  try {
    console.log('💰 부조금 추가 시도:', {
      eventId: contributionData.event_id,
      amount: contributionData.amount,
      contributorName: contributionData.contributor_name
    });

    const { data, error } = await supabase
      .from('contributions')
      .insert([{
        event_id: contributionData.event_id,
        contributor_name: contributionData.contributor_name,
        amount: contributionData.amount,
        relation_to: contributionData.relation_to || null,
        notes: contributionData.notes || null,
        is_confirmed: false,
        is_manual_entry: false, // 웹에서 입력된 것은 QR 스캔으로 간주
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ 부조금 추가 오류:', error);
      throw error;
    }

    console.log('✅ 부조금 추가 성공:', data.id);
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ addContribution error:', error);
    return { 
      success: false, 
      error: error.message || '부조금 등록에 실패했습니다.' 
    };
  }
};

// 메시지 추가 (조문/축하)
export const addEventMessage = async (messageData) => {
  try {
    console.log('📝 메시지 추가 시도:', {
      eventId: messageData.event_id,
      senderName: messageData.sender_name,
      messageType: messageData.message_type
    });

    const { data, error } = await supabase
      .from('event_messages')
      .insert([{
        event_id: messageData.event_id,
        sender_name: messageData.sender_name,
        sender_phone: messageData.sender_phone || null,
        message: messageData.message,
        message_type: messageData.message_type,
        is_anonymous: messageData.is_anonymous || false,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ 메시지 추가 오류:', error);
      throw error;
    }

    console.log('✅ 메시지 추가 성공:', data.id);
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ addEventMessage error:', error);
    return { 
      success: false, 
      error: error.message || '메시지 등록에 실패했습니다.' 
    };
  }
};

// 금액 포맷팅 유틸리티
export const formatAmount = (amount) => {
  if (!amount || amount === 0) return '0원';
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
};

// 날짜 포맷팅 유틸리티
export const formatDate = (dateString) => {
  if (!dateString) return '날짜 미정';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
};

// 시간 포맷팅 유틸리티
export const formatTime = (timeString) => {
  if (!timeString) return '시간 미정';
  
  if (typeof timeString === 'string' && timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const isPM = hour >= 12;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${isPM ? '오후' : '오전'} ${displayHour}:${minutes}`;
  }
  
  const date = new Date(timeString);
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};