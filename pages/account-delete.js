import Head from 'next/head';
import Link from 'next/link';

const serviceName = '정담';
const developerName = '정담';
const contact = '스마트패스 카카오톡 채널 (pf.kakao.com/_WsUuX)';
const effectiveDate = '2026년 5월 8일';

const requestSteps = [
  '정담 앱에서 사용한 휴대전화번호 또는 계정 식별 정보를 확인합니다.',
  `고객센터(${contact})로 계정 삭제 요청을 보냅니다.`,
  '본인 확인이 완료되면 계정 및 관련 데이터 삭제 절차를 진행합니다.',
  '삭제 처리는 요청 접수 및 본인 확인 완료 후 최대 30일 이내에 완료됩니다.',
];

const deletedData = [
  '회원 계정 정보: 휴대전화번호, 이름, 로그인 및 인증 관련 정보',
  '사용자가 생성한 청첩장, 부고장, 행사 정보, 이미지 및 입력 내용',
  '하객 접수, 방명록, 메시지 등 사용자가 앱에서 생성하거나 관리한 콘텐츠',
  '서비스 이용을 위해 저장된 앱 설정 및 알림 관련 정보',
];

const retainedData = [
  '전자상거래 등 관련 법령에 따라 보관이 필요한 거래, 결제, 환불, 분쟁 처리 기록은 법정 보관 기간 동안 분리 보관될 수 있습니다.',
  '부정 이용 방지, 보안, 오류 대응을 위한 접속 로그 및 기술 기록은 최대 90일 동안 보관될 수 있습니다.',
  '백업 데이터는 운영 안정성을 위해 일정 기간 보관될 수 있으며, 최대 30일 이내 순차적으로 삭제됩니다.',
];

function BulletList({ items }) {
  return (
    <ul className="bulletList">
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function AccountDeletePage() {
  return (
    <>
      <Head>
        <title>정담 계정 및 데이터 삭제 안내</title>
        <meta
          name="description"
          content="정담 앱 계정 삭제 요청 방법과 삭제 또는 보관되는 데이터 안내입니다."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main className="deletePage">
        <article className="deleteDoc">
          <Link className="brandLink" href="/">
            정담
          </Link>

          <header className="docHeader">
            <p className="eyebrow">Account & Data Deletion</p>
            <h1>{serviceName} 계정 및 데이터 삭제 안내</h1>
            <p>시행일: {effectiveDate}</p>
          </header>

          <p className="preamble">
            {developerName}은 이용자가 정담 앱 계정 및 관련 데이터의 삭제를 요청할 수 있도록
            아래 절차를 제공합니다. 계정 삭제를 요청하면 본인 확인 후 서비스 제공에 필요한
            계정 정보와 사용자가 생성한 데이터를 삭제합니다.
          </p>

          <section className="section">
            <h2>계정 삭제 요청 방법</h2>
            <BulletList items={requestSteps} />
            <div className="contactBox">
              <span>고객센터</span>
              <strong>{contact}</strong>
            </div>
          </section>

          <section className="section">
            <h2>삭제되는 데이터</h2>
            <BulletList items={deletedData} />
          </section>

          <section className="section">
            <h2>보관될 수 있는 데이터 및 기간</h2>
            <p>
              계정 삭제 후에도 법령 준수, 분쟁 대응, 보안 및 서비스 안정성을 위해 일부 정보는
              아래 기간 동안 별도 보관될 수 있으며, 목적 달성 또는 보관 기간 종료 후 삭제됩니다.
            </p>
            <BulletList items={retainedData} />
          </section>

          <section className="section">
            <h2>계정 삭제 없이 일부 데이터 삭제 요청</h2>
            <p>
              계정을 삭제하지 않고 특정 행사, 청첩장, 부고장, 방명록, 하객 접수 기록 등 일부
              데이터만 삭제하고 싶은 경우에도 같은 고객센터로 요청할 수 있습니다. 요청 내용과
              본인 확인이 완료되면 가능한 범위에서 해당 데이터를 삭제합니다.
            </p>
          </section>

          <p className="closing">이 안내는 {effectiveDate}부터 적용됩니다.</p>
        </article>
      </main>

      <style jsx>{`
        .deletePage {
          min-height: 100vh;
          background: #f6f8fb;
          color: #191f28;
          padding: 48px 20px 72px;
        }

        .deleteDoc {
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
          margin-bottom: 30px;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #3182f6;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        h1 {
          margin: 0 0 14px;
          font-size: 38px;
          line-height: 1.25;
          letter-spacing: 0;
        }

        h2 {
          margin: 0 0 14px;
          font-size: 22px;
          line-height: 1.35;
          letter-spacing: 0;
        }

        p {
          margin: 0;
          color: #4e5968;
          font-size: 16px;
          line-height: 1.8;
        }

        .preamble {
          margin-bottom: 34px;
        }

        .section {
          padding: 28px 0;
          border-top: 1px solid #edf0f2;
        }

        .section:first-of-type {
          border-top: 0;
          padding-top: 0;
        }

        .bulletList {
          margin: 14px 0 0;
          padding-left: 22px;
          color: #4e5968;
          font-size: 16px;
          line-height: 1.8;
        }

        .bulletList li + li {
          margin-top: 8px;
        }

        .contactBox {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 14px;
          align-items: center;
          margin-top: 20px;
          padding: 18px 20px;
          border-radius: 14px;
          background: #f2f7ff;
          border: 1px solid #d8e8ff;
          color: #1b64da;
        }

        .contactBox span {
          font-size: 14px;
          font-weight: 800;
        }

        .contactBox strong {
          font-size: 16px;
          word-break: break-word;
        }

        .closing {
          margin-top: 28px;
          padding-top: 24px;
          border-top: 1px solid #e5e8eb;
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .deletePage {
            padding: 24px 12px 48px;
          }

          .deleteDoc {
            border-radius: 16px;
            padding: 28px 22px;
          }

          h1 {
            font-size: 30px;
          }
        }
      `}</style>
    </>
  );
}
