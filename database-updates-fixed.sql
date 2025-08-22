-- Database Updates for Guest Book System (수정된 버전)
-- 방명록 시스템을 위한 데이터베이스 업데이트

-- 1. sms_verifications 테이블에 필요한 컬럼만 추가 (name 제외)
ALTER TABLE sms_verifications 
ADD COLUMN IF NOT EXISTS verification_code TEXT,
ADD COLUMN IF NOT EXISTS attempts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- 2. 기존 code 컬럼이 있다면 verification_code로 데이터 복사
UPDATE sms_verifications 
SET verification_code = code 
WHERE verification_code IS NULL AND code IS NOT NULL;

-- 3. guest_book 테이블 생성 (웹 방명록용)
CREATE TABLE IF NOT EXISTS guest_book (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID, -- 이벤트 ID (나중에 이벤트와 연결할 때 사용)
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL, -- 핸드폰번호 (사용자 연결용)
    message TEXT NOT NULL,
    contribution_amount INTEGER, -- 부조금 액수
    relationship TEXT, -- 관계 (친구, 가족 등)
    is_verified BOOLEAN DEFAULT false, -- SMS 인증 여부
    verification_id UUID REFERENCES sms_verifications(id), -- SMS 인증 연결
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. guest_book_stats 테이블 (통계용)
CREATE TABLE IF NOT EXISTS guest_book_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID,
    guest_phone TEXT NOT NULL,
    total_contributions INTEGER DEFAULT 0, -- 총 부조 횟수
    total_amount INTEGER DEFAULT 0, -- 총 부조 금액
    first_contribution_date TIMESTAMP WITH TIME ZONE,
    last_contribution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, guest_phone)
);

-- 5. guest_book_relation_stats 테이블 (관계별 통계)
CREATE TABLE IF NOT EXISTS guest_book_relation_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID,
    relationship TEXT NOT NULL,
    guest_count INTEGER DEFAULT 0,
    total_amount INTEGER DEFAULT 0,
    average_amount INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, relationship)
);

-- 6. public_guest_messages 테이블 (공개 메시지)
CREATE TABLE IF NOT EXISTS public_guest_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_book_id UUID REFERENCES guest_book(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_guest_book_phone ON guest_book(guest_phone);
CREATE INDEX IF NOT EXISTS idx_guest_book_event_id ON guest_book(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_book_created_at ON guest_book(created_at);
CREATE INDEX IF NOT EXISTS idx_guest_book_stats_phone ON guest_book_stats(guest_phone);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_verification_code ON sms_verifications(verification_code);

-- 8. RLS 정책 설정
ALTER TABLE guest_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_book_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_book_relation_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_guest_messages ENABLE ROW LEVEL SECURITY;

-- 방명록은 누구나 볼 수 있지만, 추가는 인증된 경우에만
CREATE POLICY "Anyone can view guest book entries" ON guest_book
    FOR SELECT USING (true);

CREATE POLICY "Verified users can insert guest book entries" ON guest_book
    FOR INSERT WITH CHECK (is_verified = true);

CREATE POLICY "Anyone can view public messages" ON public_guest_messages
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Service role can manage all guest book data" ON guest_book
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage guest book stats" ON guest_book_stats
    FOR ALL USING (auth.role() = 'service_role');

-- 9. 트리거 함수 (updated_at 자동 업데이트)
CREATE TRIGGER update_guest_book_updated_at BEFORE UPDATE ON guest_book
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guest_book_stats_updated_at BEFORE UPDATE ON guest_book_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. 사용자-방명록 연결을 위한 뷰 (나중에 사용자가 가입할 때 활용)
CREATE OR REPLACE VIEW user_guest_history AS
SELECT 
    gb.guest_phone,
    gb.guest_name,
    gb.contribution_amount,
    gb.message,
    gb.relationship,
    gb.created_at,
    'guest_book' as source_type
FROM guest_book gb
WHERE gb.is_verified = true
ORDER BY gb.created_at DESC;

-- 방명록 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_guest_book_stats(p_event_id UUID, p_guest_phone TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO guest_book_stats (event_id, guest_phone, total_contributions, total_amount, first_contribution_date, last_contribution_date)
    SELECT 
        COALESCE(p_event_id, uuid_generate_v4()),
        p_guest_phone,
        COUNT(*),
        COALESCE(SUM(contribution_amount), 0),
        MIN(created_at),
        MAX(created_at)
    FROM guest_book 
    WHERE guest_phone = p_guest_phone
    ON CONFLICT (event_id, guest_phone) 
    DO UPDATE SET
        total_contributions = EXCLUDED.total_contributions,
        total_amount = EXCLUDED.total_amount,
        last_contribution_date = EXCLUDED.last_contribution_date,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;