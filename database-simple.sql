-- 기존 뷰들 모두 삭제
DROP VIEW IF EXISTS guest_book_stats;
DROP VIEW IF EXISTS guest_book_relation_stats;
DROP VIEW IF EXISTS public_guest_messages;
DROP VIEW IF EXISTS user_guest_history;

-- guest_book 테이블만 생성
CREATE TABLE IF NOT EXISTS guest_book (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    message TEXT NOT NULL,
    contribution_amount INTEGER,
    relationship TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_id UUID REFERENCES sms_verifications(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 설정
ALTER TABLE guest_book ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage guest book" ON guest_book
    FOR ALL USING (auth.role() = 'service_role');