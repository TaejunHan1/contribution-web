// pages/api/ai-money.js — AI 축의금 추천 프록시 (DeepSeek)
// - 앱에서 DeepSeek API 키 제거 목적
// - consume_ai_credit('money') → DeepSeek → 실패 시 refund_ai_credit
import { createClient } from '@supabase/supabase-js';

const FEATURE = 'money';
const COST = 3;                   // 1회 호출당 크레딧 차감량
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

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('[ai-money] DEEPSEEK_API_KEY missing');
    return res.status(500).json({ success: false, error: 'server_misconfigured' });
  }

  // 1) 크레딧 소비
  let usedFree = false;
  let balance = 0;
  try {
    const { data, error } = await supabaseAdmin.rpc('consume_ai_credit', {
      p_user_id: userId,
      p_feature: FEATURE,
      p_cost: COST,
    });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.success) {
      return res.status(row?.error === 'insufficient_balance' ? 402 : 400).json({
        success: false,
        error: row?.error || 'credit_failed',
        balance: row?.new_balance ?? 0,
        cost: COST,
      });
    }
    usedFree = !!row.used_free;
    balance = row.new_balance ?? 0;
  } catch (e) {
    console.error('[ai-money] consume_ai_credit error', e);
    return res.status(500).json({ success: false, error: 'credit_rpc_failed' });
  }

  // 2) DeepSeek 호출
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
                  '당신은 한국의 축의금·조의금 문화에 능통한 AI 어시스턴트입니다. 관계와 경제 상황을 고려해 현실적인 금액을 JSON 으로만 답합니다.',
              },
          { role: 'user', content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.2,
        top_p: 0.9,
      }),
    });

    if (!r.ok) {
      const bodyText = await r.text().catch(() => '');
      console.error('[ai-money] deepseek error', r.status, bodyText.slice(0, 300));
      await supabaseAdmin.rpc('refund_ai_credit', {
        p_user_id: userId,
        p_feature: FEATURE,
        p_was_free: usedFree,
        p_cost: COST,
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
        p_cost: COST,
        p_reason: 'empty_response',
      });
      return res.status(502).json({ success: false, error: 'ai_empty_response' });
    }

    return res.status(200).json({
      success: true,
      content,
      usedFree,
      balance,
      cost: COST,
    });
  } catch (e) {
    console.error('[ai-money] network error', e);
    await supabaseAdmin.rpc('refund_ai_credit', {
      p_user_id: userId,
      p_feature: FEATURE,
      p_was_free: usedFree,
      p_cost: COST,
      p_reason: 'network_error',
    });
    return res.status(500).json({ success: false, error: 'ai_network_error' });
  }
}
