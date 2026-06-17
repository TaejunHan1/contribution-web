// pages/api/template-data.js - 템플릿용 이벤트 데이터 API
import { createClient } from '@supabase/supabase-js';

// 환경변수 체크
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 환경변수 체크:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  urlPrefix: supabaseUrl?.substring(0, 20) + '...',
  keyPrefix: supabaseServiceKey?.substring(0, 10) + '...'
});

// 서비스 키로 RLS 우회
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

const parseJsonField = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Supabase Admin 클라이언트 체크
  if (!supabaseAdmin) {
    console.error('❌ Supabase Admin client not initialized');
    return res.status(500).json({ 
      message: '서버 설정 오류가 발생했습니다. 관리자에게 문의하세요.',
      debug: 'Service key not configured'
    });
  }

  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({
      message: 'eventId가 필요합니다.'
    });
  }

  try {
    console.log('🔍 이벤트 조회 시작:', eventId);
    
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('status', 'active')
      .single();

    if (eventError) {
      console.error('❌ 이벤트 조회 에러:', eventError);
      if (eventError.code === 'PGRST116') {
        return res.status(404).json({ 
          message: '존재하지 않는 경조사입니다.',
          debug: `Event not found: ${eventId}`
        });
      }
      return res.status(500).json({ 
        message: '이벤트 확인 중 오류가 발생했습니다.',
        error: eventError.message
      });
    }

    if (!eventData) {
      return res.status(404).json({ 
        message: '경조사를 찾을 수 없습니다.',
        debug: `Event ID: ${eventId}`
      });
    }

    console.log('✅ 이벤트 조회 성공:', {
      event_name: eventData.event_name,
      event_type: eventData.event_type,
      status: eventData.status
    });

    const additionalInfo = parseJsonField(eventData.additional_info, {});
    const imageUrls = parseJsonField(eventData.image_urls, []);
    const familyRelations = parseJsonField(eventData.family_relations, []);
    const presetAmounts = parseJsonField(eventData.preset_amounts, {});
    const condolenceAccounts = parseJsonField(eventData.condolence_accounts, []);

    // 템플릿 표시용 공개 데이터 반환
    const templateData = {
      id: eventData.id,
      public_slug: eventData.public_slug,
      event_name: eventData.event_name,
      event_type: eventData.event_type,
      event_date: eventData.event_date,
      ceremony_time: eventData.ceremony_time,
      reception_time: eventData.reception_time,
      location: eventData.location,
      detailed_address: eventData.detailed_address,
      funeral_home: eventData.funeral_home,
      groom_name: eventData.groom_name,
      bride_name: eventData.bride_name,
      groom_contact: eventData.groom_contact,
      bride_contact: eventData.bride_contact,
      groom_father_name: eventData.groom_father_name,
      groom_mother_name: eventData.groom_mother_name,
      bride_father_name: eventData.bride_father_name,
      bride_mother_name: eventData.bride_mother_name,
      primary_contact: eventData.primary_contact,
      secondary_contact: eventData.secondary_contact,
      family_relations: familyRelations,
      preset_amounts: presetAmounts,
      allow_messages: eventData.allow_messages,
      message_placeholder: eventData.message_placeholder,
      main_person_name: eventData.main_person_name,
      dress_code: eventData.dress_code,
      parking_info: eventData.parking_info,
      love_temperature: eventData.love_temperature,
      deceased_age: eventData.deceased_age,
      birth_date: eventData.birth_date,
      age_calculation_method: eventData.age_calculation_method,
      death_date: eventData.death_date,
      death_time: eventData.death_time,
      deceased_gender: eventData.deceased_gender,
      religious_rite: eventData.religious_rite,
      funeral_method: eventData.funeral_method,
      casket_date: eventData.casket_date,
      casket_time: eventData.casket_time,
      burial_date: eventData.burial_date,
      burial_time: eventData.burial_time,
      burial_location: eventData.burial_location,
      secondary_burial_location: eventData.secondary_burial_location,
      funeral_director: eventData.funeral_director,
      visitation_type: eventData.visitation_type,
      visitation_note: eventData.visitation_note,
      parking_transport_info: eventData.parking_transport_info,
      condolence_accounts: condolenceAccounts,
      custom_message: eventData.custom_message,
      template_style: eventData.template_style,
      image_urls: imageUrls,
      additional_info: additionalInfo
    };

    res.status(200).json({ 
      success: true, 
      data: templateData
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
