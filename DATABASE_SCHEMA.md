# 데이터베이스 스키마 문서

Supabase PostgreSQL 기반 경조사 앱 데이터베이스 스키마입니다.

## 테이블 목록

1. [users](#users) - 사용자 정보
2. [events](#events) - 통합 이벤트 정보 (레거시)
3. [wedding_events](#wedding_events) - 결혼식 이벤트
4. [funeral_events](#funeral_events) - 장례식 이벤트
5. [guest_book](#guest_book) - 방명록/축의금 기록
6. [event_messages](#event_messages) - 이벤트 메시지
7. [personal_schedules](#personal_schedules) - 개인 일정
8. [relation_types](#relation_types) - 관계 유형 코드
9. [sms_verifications](#sms_verifications) - SMS 인증

---

## users

사용자 계정 및 프로필 정보

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | PK |
| email | text | 이메일 |
| name | text | 이름 |
| phone | text | 휴대폰 번호 |
| phone_verified | boolean | 휴대폰 인증 여부 |
| provider | text | 로그인 제공자 (phone, google, kakao) |
| avatar_url | text | 프로필 이미지 URL |
| last_login_at | timestamptz | 마지막 로그인 시간 |
| subscription_type | text | 구독 유형 |
| subscription_start_date | timestamptz | 구독 시작일 |
| subscription_end_date | timestamptz | 구독 종료일 |
| max_wedding_events | integer | 최대 결혼식 이벤트 수 |
| max_funeral_events | integer | 최대 장례식 이벤트 수 |
| current_wedding_events | integer | 현재 결혼식 이벤트 수 |
| current_funeral_events | integer | 현재 장례식 이벤트 수 |
| push_notification_enabled | boolean | 푸시 알림 활성화 |
| push_token | text | 푸시 토큰 |
| notification_settings | jsonb | 알림 설정 |
| created_at | timestamptz | 생성일시 |
| updated_at | timestamptz | 수정일시 |

---

## events

통합 이벤트 테이블 (레거시 - wedding_events/funeral_events 사용 권장)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| event_type | text | 이벤트 유형 (wedding, funeral) |
| event_name | text | 이벤트 이름 |
| main_person_name | text | 주인공 이름 |
| event_date | date | 이벤트 날짜 |
| location | text | 장소 |
| detailed_address | text | 상세 주소 |
| template_style | text | 템플릿 스타일 |
| status | text | 상태 (active, completed, cancelled) |
| is_finalized | boolean | 확정 여부 |
| image_urls | text[] | 이미지 URL 배열 |
| family_relations | jsonb | 가족 관계 정보 |
| preset_amounts | jsonb | 사전 설정 금액 |
| custom_message | text | 커스텀 메시지 |
| allow_messages | boolean | 메시지 허용 |
| message_placeholder | text | 메시지 플레이스홀더 |
| additional_info | jsonb | 추가 정보 |
| created_at | timestamptz | 생성일시 |
| updated_at | timestamptz | 수정일시 |

### 결혼식 전용 필드 (events)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| bride_name | text | 신부 이름 |
| groom_name | text | 신랑 이름 |
| bride_father_name | text | 신부 부친 |
| bride_mother_name | text | 신부 모친 |
| groom_father_name | text | 신랑 부친 |
| groom_mother_name | text | 신랑 모친 |
| bride_contact | text | 신부 연락처 |
| groom_contact | text | 신랑 연락처 |
| ceremony_time | time | 예식 시간 |
| reception_time | time | 피로연 시간 |
| dress_code | text | 드레스 코드 |
| parking_info | text | 주차 정보 |

### 장례식 전용 필드 (events)
| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| deceased_age | integer | 향년 |
| deceased_gender | varchar | 성별 |
| death_date | date | 사망일 |
| casket_date | date | 입관일 |
| casket_time | time | 입관 시간 |
| burial_date | date | 발인일 |
| burial_time | time | 발인 시간 |
| burial_location | text | 장지 |
| secondary_burial_location | text | 봉안당 위치 |
| funeral_home | text | 장례식장 |
| funeral_director | text | 상주 |
| primary_contact | varchar | 주 연락처 |
| secondary_contact | varchar | 보조 연락처 |

---

## wedding_events

결혼식 전용 이벤트 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| event_name | text | 이벤트 이름 |
| groom_name | text | 신랑 이름 |
| bride_name | text | 신부 이름 |
| groom_father_name | text | 신랑 부친 |
| groom_mother_name | text | 신랑 모친 |
| bride_father_name | text | 신부 부친 |
| bride_mother_name | text | 신부 모친 |
| groom_contact | text | 신랑 연락처 |
| bride_contact | text | 신부 연락처 |
| event_date | date | 결혼식 날짜 |
| ceremony_time | time | 예식 시간 |
| reception_time | time | 피로연 시간 |
| location | text | 장소 |
| detailed_address | text | 상세 주소 |
| custom_message | text | 커스텀 메시지 |
| parking_info | text | 주차 정보 |
| allow_messages | boolean | 메시지 허용 |
| message_placeholder | text | 메시지 플레이스홀더 |
| additional_info | jsonb | 추가 정보 |
| status | text | 상태 |
| created_at | timestamptz | 생성일시 |
| updated_at | timestamptz | 수정일시 |

---

## funeral_events

장례식 전용 이벤트 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| event_name | text | 이벤트 이름 |
| deceased_name | text | 고인 성함 |
| deceased_age | integer | 향년 |
| deceased_gender | varchar | 성별 |
| death_date | date | 사망일 |
| event_date | date | 장례 날짜 |
| casket_date | date | 입관일 |
| casket_time | time | 입관 시간 |
| burial_date | date | 발인일 |
| burial_time | time | 발인 시간 |
| burial_location | text | 장지 |
| secondary_burial_location | text | 봉안당 위치 |
| funeral_home_address | text | 장례식장 주소 |
| detailed_address | text | 상세 주소 |
| funeral_home | text | 장례식장 |
| funeral_director | text | 장례지도사 |
| primary_contact | varchar | 주 연락처 |
| secondary_contact | varchar | 보조 연락처 |
| custom_message | text | 커스텀 메시지 |
| allow_messages | boolean | 메시지 허용 |
| message_placeholder | text | 메시지 플레이스홀더 |
| additional_info | jsonb | 추가 정보 |
| status | text | 상태 |
| created_at | timestamptz | 생성일시 |
| updated_at | timestamptz | 수정일시 |

---

## guest_book

방명록 및 축의금/조의금 기록 (핵심 테이블)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | PK |
| event_id | uuid | FK → events.id |
| guest_name | varchar | 하객 이름 |
| guest_phone | varchar | 하객 휴대폰 번호 |
| relation_category | varchar | 관계 분류 (groom/bride) |
| relation_detail | varchar | 상세 관계 (family, friend, colleague 등) |
| relation_to_deceased | varchar | 고인과의 관계 (장례용) |
| amount | integer | 축의금/조의금 금액 |
| amount_type | varchar | 금액 유형 |
| payment_method | varchar | 결제 방법 |
| message | text | 축하/조의 메시지 |
| message_type | varchar | 메시지 유형 |
| is_public | boolean | 공개 여부 |
| attending | boolean | 참석 여부 |
| companion_count | integer | 동행인 수 |
| meal_required | boolean | 식사 필요 |
| dietary_requirements | text | 식이 요구사항 |
| condolence_type | varchar | 조문 유형 (장례용) |
| visiting_time | timestamptz | 방문 예정 시간 |
| additional_info | jsonb | 추가 정보 |
| ip_address | inet | IP 주소 |
| user_agent | text | 브라우저 정보 |
| is_verified | boolean | 인증 여부 |
| verified_at | timestamptz | 인증 일시 |
| verified_by | uuid | 인증자 |
| created_at | timestamptz | 생성일시 |
| updated_at | timestamptz | 수정일시 |

---

## event_messages

이벤트 관련 메시지 (별도 저장용)

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | PK |
| event_id | uuid | FK → events.id |
| sender_name | varchar | 발신자 이름 |
| sender_phone | varchar | 발신자 휴대폰 |
| message | text | 메시지 내용 |
| message_type | varchar | 메시지 유형 |
| is_anonymous | boolean | 익명 여부 |
| created_at | timestamptz | 생성일시 |
| updated_at | timestamptz | 수정일시 |

---

## personal_schedules

개인 일정 관리

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | PK |
| user_id | uuid | FK → users.id |
| title | text | 일정 제목 |
| event_type | text | 일정 유형 |
| event_date | date | 일정 날짜 |
| location | text | 장소 |
| notes | text | 메모 |
| reminder_time | timestamptz | 알림 시간 |
| is_reminder_set | boolean | 알림 설정 여부 |
| created_at | timestamptz | 생성일시 |
| updated_at | timestamptz | 수정일시 |

---

## relation_types

관계 유형 코드 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | integer | PK |
| event_type | varchar | 이벤트 유형 (wedding, funeral) |
| category | varchar | 분류 (groom, bride, deceased) |
| detail | varchar | 상세 분류 코드 |
| display_name | varchar | 표시 이름 |
| sort_order | integer | 정렬 순서 |
| is_active | boolean | 활성화 여부 |

---

## sms_verifications

SMS 인증 기록

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | uuid | PK |
| phone | text | 휴대폰 번호 |
| verification_code | text | 인증 코드 |
| expires_at | timestamptz | 만료 시간 |
| is_verified | boolean | 인증 완료 여부 |
| attempts_count | integer | 시도 횟수 |
| twilio_sid | text | Twilio 메시지 SID |
| created_at | timestamptz | 생성일시 |
| updated_at | timestamptz | 수정일시 |

---

## 참고사항

### 삭제된 테이블
- ~~contributions~~ - `guest_book` 테이블로 통합됨 (2024년 삭제)

### 테이블 관계
```
users (1) ─────── (N) events
users (1) ─────── (N) wedding_events
users (1) ─────── (N) funeral_events
users (1) ─────── (N) personal_schedules

events (1) ────── (N) guest_book
events (1) ────── (N) event_messages
```

### 핵심 사용 테이블
- **축의금/조의금 기록**: `guest_book` 테이블 사용
- **방명록 메시지**: `guest_book.message` 필드 또는 `event_messages` 테이블
- **이벤트 정보**: `wedding_events`, `funeral_events` 권장 (또는 통합 `events`)
