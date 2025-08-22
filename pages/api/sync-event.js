// pages/api/sync-event.js - 앱에서 웹으로 이벤트 동기화
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!supabaseAdmin) {
    console.error('❌ Supabase Admin client not initialized');
    return res.status(500).json({ 
      message: '서버 설정 오류가 발생했습니다.',
      debug: 'Service key not configured'
    });
  }

  try {
    const eventData = req.body;
    
    console.log('🔄 이벤트 동기화 요청:', {
      id: eventData.id,
      event_name: eventData.event_name,
      event_type: eventData.event_type
    });

    // 필수 필드 검증
    if (!eventData.id || !eventData.event_name) {
      return res.status(400).json({
        success: false,
        message: 'ID와 이벤트명은 필수입니다.'
      });
    }

    // 기존 이벤트가 있는지 확인
    const { data: existingEvent, error: checkError } = await supabaseAdmin
      .from('events')
      .select('id, status')
      .eq('id', eventData.id)
      .single();

    let result;
    
    if (existingEvent) {
      // 기존 이벤트 업데이트
      console.log('🔄 기존 이벤트 업데이트:', eventData.id);
      
      const { data, error } = await supabaseAdmin
        .from('events')
        .update({
          event_name: eventData.event_name,
          event_type: eventData.event_type || 'wedding',
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
          template_style: eventData.template_style,
          status: eventData.status || 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', eventData.id)
        .select()
        .single();

      if (error) {
        console.error('❌ 이벤트 업데이트 에러:', error);
        return res.status(500).json({
          success: false,
          message: '이벤트 업데이트 중 오류가 발생했습니다.',
          error: error.message
        });
      }

      result = data;
      
    } else {
      // 새 이벤트 생성
      console.log('🆕 새 이벤트 생성:', eventData.id);
      
      const { data, error } = await supabaseAdmin
        .from('events')
        .insert([{
          id: eventData.id,
          event_name: eventData.event_name,
          event_type: eventData.event_type || 'wedding',
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
          template_style: eventData.template_style || 'modern',
          status: eventData.status || 'active',
          user_id: 'synced-from-app', // 앱에서 동기화된 것 표시
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ 이벤트 생성 에러:', error);
        return res.status(500).json({
          success: false,
          message: '이벤트 생성 중 오류가 발생했습니다.',
          error: error.message
        });
      }

      result = data;
    }

    console.log('✅ 이벤트 동기화 성공:', {
      id: result.id,
      event_name: result.event_name,
      action: existingEvent ? 'updated' : 'created'
    });

    res.status(200).json({
      success: true,
      message: existingEvent ? '이벤트가 업데이트되었습니다.' : '이벤트가 생성되었습니다.',
      data: result,
      action: existingEvent ? 'updated' : 'created'
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: error.message
    });
  }
}