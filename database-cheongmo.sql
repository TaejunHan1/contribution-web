-- 청첩장 모임(청모) 생성, 입장, 참여자 가입

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS cheongmo_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  host_name TEXT NOT NULL,
  partner_name TEXT,
  host_phone TEXT,
  host_verification_id UUID REFERENCES sms_verifications(id) ON DELETE SET NULL,
  message TEXT,
  access_type TEXT NOT NULL DEFAULT 'password' CHECK (access_type IN ('password', 'phone_list')),
  password_hash TEXT,
  allowed_phones JSONB NOT NULL DEFAULT '[]'::jsonb,
  phone_collection TEXT NOT NULL DEFAULT 'none' CHECK (phone_collection IN ('optional', 'none')),
  selected_months JSONB NOT NULL DEFAULT '[]'::jsonb,
  location_mode TEXT NOT NULL DEFAULT 'host_decides' CHECK (location_mode IN ('host_decides', 'ask_guests')),
  location_label TEXT,
  venue_name TEXT,
  venue_address TEXT,
  meeting_time TEXT,
  vote_deadline_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cheongmo_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cheongmo_event_id UUID NOT NULL REFERENCES cheongmo_events(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  memo TEXT,
  available_dates JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_regions JSONB NOT NULL DEFAULT '[]'::jsonb,
  entry_method TEXT NOT NULL DEFAULT 'password',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cheongmo_responses_event_phone_unique
  ON cheongmo_responses(cheongmo_event_id, guest_phone)
  WHERE guest_phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cheongmo_events_slug ON cheongmo_events(slug);
CREATE INDEX IF NOT EXISTS idx_cheongmo_events_host_phone ON cheongmo_events(host_phone);
CREATE INDEX IF NOT EXISTS idx_cheongmo_responses_event_id ON cheongmo_responses(cheongmo_event_id);
CREATE INDEX IF NOT EXISTS idx_cheongmo_responses_phone ON cheongmo_responses(guest_phone);

-- 기존 초안 테이블을 이미 만든 경우 필요한 마이그레이션
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS host_phone TEXT;
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS host_verification_id UUID REFERENCES sms_verifications(id) ON DELETE SET NULL;
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS access_type TEXT NOT NULL DEFAULT 'password';
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS allowed_phones JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS phone_collection TEXT NOT NULL DEFAULT 'none';
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS selected_months JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS location_mode TEXT NOT NULL DEFAULT 'host_decides';
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS location_label TEXT;
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS venue_name TEXT;
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS venue_address TEXT;
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS meeting_time TEXT;
ALTER TABLE cheongmo_events ADD COLUMN IF NOT EXISTS vote_deadline_at TIMESTAMPTZ;
ALTER TABLE cheongmo_responses ADD COLUMN IF NOT EXISTS memo TEXT;
ALTER TABLE cheongmo_responses ADD COLUMN IF NOT EXISTS available_dates JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE cheongmo_responses ADD COLUMN IF NOT EXISTS suggested_regions JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE cheongmo_responses ADD COLUMN IF NOT EXISTS entry_method TEXT NOT NULL DEFAULT 'password';

ALTER TABLE cheongmo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheongmo_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active cheongmo events" ON cheongmo_events;
CREATE POLICY "Anyone can view active cheongmo events" ON cheongmo_events
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Service role can manage cheongmo events" ON cheongmo_events;
CREATE POLICY "Service role can manage cheongmo events" ON cheongmo_events
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage cheongmo responses" ON cheongmo_responses;
CREATE POLICY "Service role can manage cheongmo responses" ON cheongmo_responses
  FOR ALL USING (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION update_cheongmo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cheongmo_events_updated_at ON cheongmo_events;
CREATE TRIGGER update_cheongmo_events_updated_at
  BEFORE UPDATE ON cheongmo_events
  FOR EACH ROW
  EXECUTE FUNCTION update_cheongmo_updated_at();

DROP TRIGGER IF EXISTS update_cheongmo_responses_updated_at ON cheongmo_responses;
CREATE TRIGGER update_cheongmo_responses_updated_at
  BEFORE UPDATE ON cheongmo_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_cheongmo_updated_at();

NOTIFY pgrst, 'reload schema';
