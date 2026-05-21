import Head from 'next/head';
import Link from 'next/link';

const supportEmail = 'gksxowns12@gmail.com';
const kakaoChannelUrl = 'https://pf.kakao.com/_WsUuX';
const kakaoChannelLabel = '카카오톡 채널';
const serviceName = '정담';

const supportItems = [
  {
    title: '앱 이용 문의',
    body: '로그인, 행사 생성, 청첩장·부고장 제작, 하객·조문 접수 이용 중 문제가 생기면 문의해주세요.',
  },
  {
    title: '결제 및 크레딧 문의',
    body: '인앱 결제, 크레딧 충전, 결제 후 미반영, 환불 관련 확인이 필요한 경우 도와드립니다.',
  },
  {
    title: '계정 및 데이터 삭제',
    body: '계정 삭제, 개인정보 열람·정정·삭제 요청은 계정 삭제 안내 페이지에서 절차를 확인할 수 있습니다.',
  },
];

const faqItems = [
  {
    question: '결제했는데 크레딧이 바로 보이지 않아요.',
    answer:
      '앱을 완전히 종료한 뒤 다시 실행해보세요. 그래도 반영되지 않으면 결제 영수증 화면과 가입 휴대전화번호를 함께 보내주세요.',
  },
  {
    question: '청첩장이나 부고장 정보를 수정할 수 있나요?',
    answer:
      '내 행사 화면에서 진행 중인 경조사를 선택한 뒤 수정 가능한 항목을 확인할 수 있습니다. 수정 권한은 행사 생성자에게 제공됩니다.',
  },
  {
    question: '계정 삭제는 어떻게 요청하나요?',
    answer:
      '계정 삭제 안내 페이지의 절차에 따라 고객지원 이메일로 요청해주세요. 본인 확인 후 관련 데이터를 삭제합니다.',
  },
];

export default function SupportPage() {
  return (
    <>
      <Head>
        <title>정담 고객지원</title>
        <meta
          name="description"
          content="정담 앱 이용, 결제, 크레딧, 계정 및 데이터 삭제 관련 고객지원 안내입니다."
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main className="supportPage">
        <article className="supportDoc">
          <Link className="brandLink" href="/">
            정담
          </Link>

          <header className="hero">
            <p className="eyebrow">Support</p>
            <h1>{serviceName} 고객지원</h1>
            <p>
              앱 이용 중 불편한 점이나 결제·크레딧·계정 관련 문의가 있으면 아래
              고객지원 이메일로 연락해주세요.
            </p>
          </header>

          <section className="contactPanel" aria-label="고객지원 연락처">
            <div className="contactGrid">
              <div>
                <span>고객지원 이메일</span>
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </div>
              <div>
                <span>카카오톡 문의</span>
                <a href={kakaoChannelUrl} target="_blank" rel="noreferrer">
                  {kakaoChannelLabel}
                </a>
              </div>
            </div>
            <p>
              문의 시 가입 휴대전화번호, 사용 중인 기기, 문제가 발생한 화면과 상황을 함께
              보내주시면 더 빠르게 확인할 수 있습니다.
            </p>
          </section>

          <section className="section">
            <div className="sectionHead">
              <p className="eyebrow">Help Topics</p>
              <h2>도움이 필요한 항목</h2>
            </div>
            <div className="cardGrid">
              {supportItems.map(item => (
                <article className="supportCard" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="section">
            <div className="sectionHead">
              <p className="eyebrow">FAQ</p>
              <h2>자주 묻는 질문</h2>
            </div>
            <div className="faqList">
              {faqItems.map(item => (
                <article key={item.question}>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="linkSection" aria-label="정책 및 안내">
            <Link href="/privacy">개인정보 처리방침</Link>
            <Link href="/account-delete">계정 및 데이터 삭제 안내</Link>
          </section>
        </article>
      </main>

      <style jsx>{`
        .supportPage {
          min-height: 100vh;
          background: #f6f8fb;
          color: #191f28;
          padding: 48px 20px 72px;
        }

        .supportDoc {
          width: min(920px, 100%);
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e5e8eb;
          border-radius: 22px;
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

        .hero {
          padding-bottom: 30px;
          border-bottom: 1px solid #e5e8eb;
        }

        .eyebrow {
          margin: 0 0 9px;
          color: #3182f6;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        h1,
        h2,
        h3,
        p {
          margin-top: 0;
          letter-spacing: 0;
          word-break: keep-all;
        }

        h1 {
          margin-bottom: 14px;
          font-size: 38px;
          line-height: 1.25;
          font-weight: 900;
        }

        h2 {
          margin-bottom: 0;
          font-size: 24px;
          line-height: 1.35;
          font-weight: 850;
        }

        h3 {
          margin-bottom: 10px;
          font-size: 18px;
          line-height: 1.45;
          font-weight: 850;
        }

        p {
          color: #4e5968;
          font-size: 16px;
          line-height: 1.75;
        }

        .contactPanel {
          display: grid;
          gap: 18px;
          margin: 30px 0 8px;
          padding: 24px;
          border-radius: 18px;
          background: #f2f7ff;
          border: 1px solid #d8e8ff;
        }

        .contactGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .contactPanel span {
          display: block;
          margin-bottom: 8px;
          color: #1b64da;
          font-size: 14px;
          font-weight: 850;
        }

        .contactPanel a {
          color: #191f28;
          font-size: 24px;
          font-weight: 900;
          text-decoration: none;
          overflow-wrap: anywhere;
        }

        .contactPanel p {
          margin-bottom: 0;
        }

        .section {
          padding: 34px 0;
          border-bottom: 1px solid #edf0f2;
        }

        .sectionHead {
          margin-bottom: 18px;
        }

        .cardGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .supportCard {
          min-height: 180px;
          padding: 22px;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #eef1f4;
        }

        .supportCard p,
        .faqList p {
          margin-bottom: 0;
          font-size: 15px;
        }

        .faqList {
          display: grid;
          gap: 12px;
        }

        .faqList article {
          padding: 22px;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e5e8eb;
        }

        .linkSection {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding-top: 28px;
        }

        .linkSection a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 18px;
          border-radius: 12px;
          background: #191f28;
          color: #ffffff;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        @media (max-width: 760px) {
          .supportPage {
            padding: 24px 12px 48px;
          }

          .supportDoc {
            border-radius: 16px;
            padding: 28px 20px;
          }

          h1 {
            font-size: 30px;
          }

          .cardGrid {
            grid-template-columns: 1fr;
          }

          .contactGrid {
            grid-template-columns: 1fr;
          }

          .contactPanel a {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  );
}
