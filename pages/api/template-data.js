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

export default async function handler(req, res) {
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

    // 템플릿 표시용 필요한 데이터만 반환
    const templateData = {
      id: eventData.id,
      event_name: eventData.event_name,
      event_type: eventData.event_type,
      event_date: eventData.event_date,
      ceremony_time: eventData.ceremony_time,
      location: eventData.location,
      detailed_address: eventData.detailed_address,
      groom_name: eventData.groom_name,
      bride_name: eventData.bride_name,
      groom_father_name: eventData.groom_father_name,
      groom_mother_name: eventData.groom_mother_name,
      bride_father_name: eventData.bride_father_name,
      bride_mother_name: eventData.bride_mother_name,
      primary_contact: eventData.primary_contact,
      secondary_contact: eventData.secondary_contact,
      custom_message: eventData.custom_message,
      template_style: eventData.template_style
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