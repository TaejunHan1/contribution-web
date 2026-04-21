-- ============================================================================
-- 사랑 온도 (실시간 공유 카운터)
-- 여러 하객이 동시에 터치해도 서버 원자적 증가로 안전
-- ============================================================================

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS love_temperature numeric(5,1) NOT NULL DEFAULT 36.5;

COMMENT ON COLUMN events.love_temperature IS '하객들이 터치해서 올리는 사랑 온도 (36.5 ~ 100.0)';

-- 음수/초과 방지
ALTER TABLE events
  DROP CONSTRAINT IF EXISTS events_love_temperature_range;
ALTER TABLE events
  ADD CONSTRAINT events_love_temperature_range
  CHECK (love_temperature >= 36.5 AND love_temperature <= 100);

-- 원자적 증가 RPC (0.1씩, 100 초과 방지)
CREATE OR REPLACE FUNCTION increment_love_temperature(p_event_id uuid)
RETURNS TABLE (new_temperature numeric) LANGUAGE plpgsql AS $$
DECLARE
  v_new numeric;
BEGIN
  UPDATE events
     SET love_temperature = LEAST(love_temperature + 0.1, 100)
   WHERE id = p_event_id
  RETURNING love_temperature INTO v_new;
  RETURN QUERY SELECT v_new;
END;
$$;

-- events 테이블 realtime publication 포함 확인 (이미 포함돼 있으면 에러 무시)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE events;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
