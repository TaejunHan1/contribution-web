// pages/api/ai-budget.js — AI 예산 계산 프록시 (DeepSeek)
// - 앱 번들에서 DeepSeek API 키 제거 목적
// - 호출 직전 consume_ai_credit RPC 로 첫 회 무료 / 크레딧 차감
// - DeepSeek 호출 실패 시 refund_ai_credit 으로 되돌림
import { createClient } from '@supabase/supabase-js';

const FEATURE = 'budget';
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'method_not_allowed' });
  }

  const { userId, prompt, systemPrompt } = req.body || {};

  if (!userId) {
    return res.status(400).json({ success: false, error: 'missing_user_id' });
  }
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ success: false, error: 'missing_prompt' });
  }

  // DeepSeek 키가 서버에 없으면 즉시 실패 (차감 전에)
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('[ai-budget] DEEPSEEK_API_KEY missing');
    return res.status(500).json({ success: false, error: 'server_misconfigured' });
  }

  // ── 1) 크레딧 소비 ──
  let usedFree = false;
  let balance = 0;
  try {
    const { data, error } = await supabaseAdmin.rpc('consume_ai_credit', {
      p_user_id: userId,
      p_feature: FEATURE,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.success) {
      return res.status(row?.error === 'insufficient_balance' ? 402 : 400).json({
        success: false,
        error: row?.error || 'credit_failed',
        balance: row?.new_balance ?? 0,
      });
    }
    usedFree = !!row.used_free;
    balance = row.new_balance ?? 0;
  } catch (e) {
    console.error('[ai-budget] consume_ai_credit error', e);
    return res.status(500).json({ success: false, error: 'credit_rpc_failed' });
  }

  // ── 2) DeepSeek 호출 ──
  try {
    const r = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'GyeongjoApp/1.0',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          systemPrompt
            ? { role: 'system', content: systemPrompt }
            : {
                role: 'system',
                content:
                  '당신은 한국의 결혼식·장례식 예산 계산을 도와주는 AI 어시스턴트입니다. 응답은 반드시 요청된 JSON 형식으로만 작성합니다.',
              },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.3,
        top_p: 0.9,
      }),
    });

    if (!r.ok) {
      const bodyText = await r.text().catch(() => '');
      console.error('[ai-budget] deepseek error', r.status, bodyText.slice(0, 300));
      // 크레딧 환불
      await supabaseAdmin.rpc('refund_ai_credit', {
        p_user_id: userId,
        p_feature: FEATURE,
        p_was_free: usedFree,
        p_reason: `deepseek_${r.status}`,
      });
      return res.status(502).json({ success: false, error: 'ai_upstream_error', status: r.status });
    }

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    if (!content) {
      await supabaseAdmin.rpc('refund_ai_credit', {
        p_user_id: userId,
        p_feature: FEATURE,
        p_was_free: usedFree,
        p_reason: 'empty_response',
      });
      return res.status(502).json({ success: false, error: 'ai_empty_response' });
    }

    return res.status(200).json({
      success: true,
      content,
      usedFree,
      balance,
    });
  } catch (e) {
    console.error('[ai-budget] network error', e);
    await supabaseAdmin.rpc('refund_ai_credit', {
      p_user_id: userId,
      p_feature: FEATURE,
      p_was_free: usedFree,
      p_reason: 'network_error',
    });
    return res.status(500).json({ success: false, error: 'ai_network_error' });
  }
}
