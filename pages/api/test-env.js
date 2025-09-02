// pages/api/test-env.js - 환경변수 테스트용 API
export default async function handler(req, res) {
  console.log('모든 환경 변수:', Object.keys(process.env));
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  return res.status(200).json({
    supabaseUrl: supabaseUrl || '환경변수 없음',
    supabaseServiceKey: supabaseServiceKey ? '설정됨 (길이: ' + supabaseServiceKey.length + ')' : '환경변수 없음',
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
  });
}