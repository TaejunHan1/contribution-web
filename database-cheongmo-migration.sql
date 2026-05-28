-- 기존 청모 테이블 마이그레이션 전용
-- Supabase SQL Editor에서 이 파일만 실행해도 됩니다.

ALTER TABLE cheongmo_responses
  ADD COLUMN IF NOT EXISTS available_dates JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE cheongmo_responses
  ADD COLUMN IF NOT EXISTS suggested_regions JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE cheongmo_responses
  ADD COLUMN IF NOT EXISTS memo TEXT;

ALTER TABLE cheongmo_responses
  ADD COLUMN IF NOT EXISTS entry_method TEXT NOT NULL DEFAULT 'password';

ALTER TABLE cheongmo_events
  ADD COLUMN IF NOT EXISTS vote_deadline_at TIMESTAMPTZ;

DROP POLICY IF EXISTS "Anyone can view active cheongmo events" ON cheongmo_events;
CREATE POLICY "Anyone can view active cheongmo events" ON cheongmo_events
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Service role can manage cheongmo events" ON cheongmo_events;
CREATE POLICY "Service role can manage cheongmo events" ON cheongmo_events
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage cheongmo responses" ON cheongmo_responses;
CREATE POLICY "Service role can manage cheongmo responses" ON cheongmo_responses
  FOR ALL USING (auth.role() = 'service_role');

NOTIFY pgrst, 'reload schema';
