import {
  createSupabaseClient,
  verifyEntryToken,
} from '../../lib/cheongmoUtils';
import { normalizeKoreanPhone } from '../../lib/phoneUtils';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, entryToken, participantId } = req.body || {};
  const tokenPayload = verifyEntryToken(entryToken);
  if (!slug || !participantId || !tokenPayload || tokenPayload.slug !== slug) {
    return res.status(403).json({
      success: false,
      error: '삭제 권한을 확인할 수 없습니다.',
    });
  }

  try {
    const supabase = await createSupabaseClient();
    const { data: gathering, error: gatheringError } = await supabase
      .from('cheongmo_events')
      .select('id, slug, host_phone')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (gatheringError) throw gatheringError;
    if (!gathering) {
      return res
        .status(404)
        .json({ success: false, error: '청모 정보를 찾을 수 없습니다.' });
    }

    const hostPhone = normalizeKoreanPhone(gathering.host_phone);
    const tokenPhone = normalizeKoreanPhone(tokenPayload.phone);
    if (!hostPhone || hostPhone !== tokenPhone) {
      return res.status(403).json({
        success: false,
        error: '주최자만 참여자를 삭제할 수 있습니다.',
      });
    }

    const { error: deleteError } = await supabase
      .from('cheongmo_responses')
      .delete()
      .eq('id', participantId)
      .eq('cheongmo_event_id', gathering.id);

    if (deleteError) throw deleteError;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('청모 참여자 삭제 API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '참여자 삭제 중 오류가 발생했습니다.',
    });
  }
}
