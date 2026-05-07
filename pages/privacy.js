import Head from 'next/head';
import Link from 'next/link';

const effectiveDate = '2026년 4월 22일';
const serviceName = '정담';
const contact = '스마트패스 카카오톡 채널 (pf.kakao.com/_WsUuX)';

const sections = [
  {
    title: '1. 수집하는 개인정보 항목',
    body: [
      '회사는 회원가입, 서비스 제공, 고객 문의 처리 등을 위해 다음과 같은 최소한의 개인정보를 수집합니다.',
    ],
    groups: [
      {
        title: '필수 항목',
        items: ['휴대전화번호 (SMS 인증 및 서비스 식별)', '이름 (청첩장·부고장 표시)', '통신사 정보 (SMS 인증 시)'],
      },
      {
        title: '이용자가 직접 입력하는 정보',
        items: [
          '경조사 정보 (예식일, 장소, 주소, 시간, 사진)',
          '혼주·가족 정보 (이름, 전화번호, 계좌번호) — 청첩장에 표시될 항목에 한함',
          '방명록 메시지 및 하객 정보 (하객이 직접 입력)',
          '카메라 또는 사진 접근 권한을 통해 사용자가 선택하거나 촬영한 이미지',
        ],
      },
      {
        title: '자동 수집 항목',
        items: [
          '기기 정보 (OS, 앱 버전, 기기 식별자)',
          '서비스 이용 기록, 접속 로그, 오류 로그',
          '결제 내역 (유료 서비스 이용 시, 결제 승인 번호만 보관하며 카드/계좌 정보는 수집하지 않음)',
        ],
      },
    ],
  },
  {
    title: '2. 개인정보의 수집 및 이용 목적',
    items: [
      '회원 식별 및 본인 확인, 로그인 유지',
      '디지털 청첩장·부고장 생성 및 공유',
      '부조금·축의금 기록 및 카카오 알림톡 발송',
      '방명록·메시지 수집 및 전달',
      '카메라·사진 권한을 통한 청첩장·부고장 이미지 등록',
      '고객 문의 응대 및 공지사항 전달',
      '서비스 품질 개선, 부정 이용 방지, 통계 분석',
    ],
  },
  {
    title: '3. 개인정보의 보유 및 이용기간',
    body: [
      '원칙적으로 회원 탈퇴 시 또는 수집·이용 목적 달성 후에는 해당 정보를 지체 없이 파기합니다. 다만, 관련 법령에 따라 일정 기간 보관해야 하는 정보는 다음과 같이 예외적으로 보관합니다.',
    ],
    items: [
      '계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)',
      '대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)',
      '소비자 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)',
      '접속 로그 및 IP 정보: 3개월 (통신비밀보호법)',
    ],
  },
  {
    title: '4. 개인정보의 제3자 제공 및 처리위탁',
    body: [
      '회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자가 사전에 동의한 경우 또는 법령에 따른 요청이 있는 경우에는 예외로 합니다.',
      '원활한 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.',
    ],
    items: [
      'Twilio Inc. — SMS 인증 발송',
      'Supabase Inc. — 데이터베이스 및 인증 서버',
      '솔라피(Solapi) — 카카오 알림톡 발송 대행',
      'Apple Inc. / Google LLC — 인앱결제 처리',
    ],
  },
  {
    title: '5. 이용자의 권리와 행사 방법',
    body: [
      `이용자는 개인정보 열람·정정·삭제, 처리 정지, 회원 탈퇴를 요청할 수 있습니다. 권리 행사는 서비스 내 메뉴 또는 고객센터(${contact})를 통해 요청할 수 있으며, 회사는 지체 없이 조치하겠습니다.`,
    ],
  },
  {
    title: '6. 개인정보의 파기 절차 및 방법',
    items: [
      '전자적 파일 형태의 정보: 복구 및 재생이 불가능한 방법으로 영구 삭제합니다.',
      '종이 문서: 분쇄기로 분쇄하거나 소각하여 파기합니다.',
      '법령에 따라 보관이 필요한 정보는 별도 DB 또는 별도 저장소에 분리 보관 후 보관 기간 종료 시 파기합니다.',
    ],
  },
  {
    title: '7. 개인정보의 안전성 확보 조치',
    items: [
      '관리적 조치: 내부관리계획 수립·시행, 담당자 교육',
      '기술적 조치: 개인정보 암호화, HTTPS 전송 암호화, 접근 권한 관리, 접속 기록 보관',
      '물리적 조치: 서버 및 자료 보관 접근 통제',
    ],
  },
  {
    title: '8. 쿠키 및 유사 기술',
    body: [
      '모바일 앱에서는 웹 쿠키를 사용하지 않으나, 서비스 품질 향상 및 맞춤형 서비스 제공을 위해 기기 식별자 및 로컬 저장소를 이용할 수 있으며, 이용자는 기기 설정을 통해 이를 관리할 수 있습니다.',
    ],
  },
  {
    title: '9. 만 14세 미만 아동의 개인정보',
    body: [
      '회사는 만 14세 미만 아동의 회원가입을 허용하지 않으며, 서비스 이용 과정에서 만 14세 미만 아동의 개인정보가 수집되지 않도록 노력합니다.',
    ],
  },
  {
    title: '10. 개인정보 보호책임자',
    items: [`연락처: ${contact}`],
  },
  {
    title: '11. 권익 침해 구제 방법',
    items: [
      '개인정보 침해신고센터: 국번 없이 118 (privacy.kisa.or.kr)',
      '개인정보 분쟁조정위원회: 1833-6972 (kopico.go.kr)',
      '대검찰청 사이버수사과: 국번 없이 1301 (spo.go.kr)',
      '경찰청 사이버수사국: 국번 없이 182 (ecrm.cyber.go.kr)',
    ],
  },
  {
    title: '12. 개인정보 처리방침의 변경',
    body: [
      '이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우 시행 7일 전부터 서비스 내 공지를 통해 고지합니다.',
    ],
  },
];

function BulletList({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="bulletList">
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>정담 개인정보 처리방침</title>
        <meta
          name="description"
          content="정담 앱의 개인정보 수집, 이용, 보관, 파기 및 이용자 권리에 관한 개인정보 처리방침입니다."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main className="privacyPage">
        <article className="privacyDoc">
          <Link className="brandLink" href="/">
            정담
          </Link>
          <header className="docHeader">
            <p className="eyebrow">Privacy Policy</p>
            <h1>{serviceName} 개인정보 처리방침</h1>
            <p>시행일: {effectiveDate}</p>
          </header>

          <p className="preamble">
            {serviceName}(이하 &quot;회사&quot;)은 이용자의 개인정보를 중요시하며,
            『정보통신망 이용촉진 및 정보보호 등에 관한 법률』, 『개인정보
            보호법』을 준수하고 있습니다. 회사는 본 개인정보 처리방침을 통해
            이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고
            있으며, 개인정보 보호를 위해 어떠한 조치가 취해지고 있는지
            알려드립니다.
          </p>

          {sections.map(section => (
            <section className="section" key={section.title}>
              <h2>{section.title}</h2>
              {section.body?.map(text => (
                <p key={text}>{text}</p>
              ))}
              {section.groups?.map(group => (
                <div className="group" key={group.title}>
                  <h3>{group.title}</h3>
                  <BulletList items={group.items} />
                </div>
              ))}
              <BulletList items={section.items} />
            </section>
          ))}

          <p className="closing">이 방침은 {effectiveDate}부터 적용됩니다.</p>
        </article>
      </main>

      <style jsx>{`
        .privacyPage {
          min-height: 100vh;
          background: #f6f8fb;
          color: #191f28;
          padding: 48px 20px 72px;
        }

        .privacyDoc {
          width: min(880px, 100%);
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e5e8eb;
          border-radius: 20px;
          padding: 44px;
          box-shadow: 0 18px 45px rgba(25, 31, 40, 0.08);
        }

        .brandLink {
          display: inline-flex;
          color: #3182f6;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          margin-bottom: 28px;
        }

        .docHeader {
          border-bottom: 1px solid #e5e8eb;
          padding-bottom: 28px;
          margin-bottom: 28px;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #3182f6;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }

        h1 {
          margin: 0 0 12px;
          font-size: 34px;
          line-height: 1.25;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .docHeader p:last-child,
        .section p,
        .preamble,
        .closing {
          color: #4e5968;
          font-size: 15px;
          line-height: 1.8;
          word-break: keep-all;
        }

        .preamble {
          background: #f8fafc;
          border-radius: 14px;
          padding: 20px;
          margin: 0 0 30px;
        }

        .section {
          padding: 26px 0;
          border-bottom: 1px solid #eef1f4;
        }

        .section h2 {
          margin: 0 0 12px;
          font-size: 20px;
          line-height: 1.45;
          font-weight: 850;
        }

        .group {
          margin-top: 18px;
        }

        .group h3 {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 800;
          color: #333d4b;
        }

        .bulletList {
          margin: 10px 0 0;
          padding-left: 20px;
          color: #4e5968;
        }

        .bulletList li {
          margin: 6px 0;
          font-size: 15px;
          line-height: 1.7;
        }

        .closing {
          margin: 30px 0 0;
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .privacyPage {
            padding: 24px 12px 48px;
          }

          .privacyDoc {
            border-radius: 16px;
            padding: 26px 20px;
          }

          h1 {
            font-size: 27px;
          }
        }
      `}</style>
    </>
  );
}
