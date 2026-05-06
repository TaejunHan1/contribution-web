import Head from 'next/head';

const heroImage = '/landing/generated/hero-scene-v2.png';
const overviewImage = '/landing/generated/service-overview-scene-v4.png';
const invitationImage = '/landing/generated/invitation-studio-scene-v3.png';
const receptionImage = '/landing/generated/reception-operation-scene-v3.png';
const dashboardImage = '/landing/generated/owner-dashboard-scene-v3.png';
const paperImage = '/landing/generated/problem-scene-v2.png';

const featureItems = [
  ['모바일 청첩장', '사진, 음악, 지도, 방명록을 담은 초대 링크를 만들 수 있습니다.'],
  ['종이 청첩장', 'A6 인쇄용 청첩장을 편집하고 PDF로 내보낼 수 있습니다.'],
  ['태블릿 방명록', '하객이 종이 대신 태블릿에 이름을 쓰면 접수 기록이 생성됩니다.'],
  ['축의금 입력', '접수자가 금액, 관계, 신랑측·신부측, 미확정 여부를 바로 저장합니다.'],
  ['식권 정산', '식권이 몇 장 나갔는지 행사 중에도 흐름을 확인합니다.'],
  ['행사 후 검색', '누가 얼마를 했는지, 어떤 기록이 미확정인지 빠르게 찾습니다.'],
];

const flowItems = [
  ['01', '하객은 이름을 씁니다', '종이 방명록처럼 익숙한 방식이라 어르신도 어렵지 않습니다.'],
  ['02', '접수자는 금액과 식권을 입력합니다', '봉투, 식권, 관계 정보를 같은 화면에서 정리합니다.'],
  ['03', '주최자는 실시간으로 확인합니다', '행사 중 합계와 미확정 내역을 바로 보고, 행사 후에도 검색합니다.'],
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>정담 - 결혼식 접수와 축의금 관리를 태블릿으로</title>
        <meta
          name="description"
          content="정담은 모바일 청첩장, 종이 청첩장 제작, 태블릿 방명록, 축의금과 식권 실시간 정산을 제공하는 결혼식 접수 관리 서비스입니다."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="page">
        <header className="nav">
          <a className="brand" href="#top" aria-label="정담 홈">
            <img src="/landing/jeongdamlogo.png" alt="" />
            <span>
              <strong>정담</strong>
              <small>청첩장부터 접수와 정산까지</small>
            </span>
          </a>
          <nav className="navLinks" aria-label="메인 메뉴">
            <a href="#problem">문제</a>
            <a href="#flow">접수 흐름</a>
            <a href="#features">기능</a>
            <a href="#contact">도입</a>
          </nav>
          <a className="navCta" href="#contact">도입 상담</a>
        </header>

        <section className="hero" id="top">
          <div className="heroCopy">
            <p className="eyebrow">대한민국 결혼식 접수대 그대로</p>
            <h1>
              종이 방명록처럼 쓰고,
              <br />
              축의금과 식권은
              <br />
              바로 정리합니다.
            </h1>
            <p className="lead">
              정담은 결혼식장에서 하객이 태블릿에 이름을 쓰고, 접수자가 축의금과
              식권을 입력하면 주최자가 실시간으로 기록을 확인하는 서비스입니다.
            </p>
            <div className="heroActions">
              <a className="primaryBtn" href="#contact">도입 상담하기</a>
              <a className="secondaryBtn" href="#flow">접수 흐름 보기</a>
            </div>
            <div className="proofRow">
              <div>
                <strong>방명록</strong>
                <span>태블릿 이름 작성</span>
              </div>
              <div>
                <strong>축의금</strong>
                <span>금액·관계 기록</span>
              </div>
              <div>
                <strong>식권</strong>
                <span>수량 실시간 정리</span>
              </div>
            </div>
          </div>
          <div className="heroVisual">
            <img src={heroImage} alt="결혼식 접수대에 놓인 태블릿 방명록" />
            <div className="statusPanel">
              <span>오늘 접수 현황</span>
              <strong>기록이 실시간으로 정리 중</strong>
              <div className="statusBars" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        </section>

        <section className="problemBand" id="problem">
          <div className="sectionIntro">
            <p className="eyebrow">왜 바꿔야 할까요</p>
            <h2>
              종이 방명록은 익숙하지만,
              <br />
              정산은 늘 번거롭습니다.
            </h2>
          </div>
          <div className="problemGrid">
            <article>
              <span>01</span>
              <h3>손글씨를 다시 읽어야 합니다</h3>
              <p>행사 후 봉투와 방명록을 다시 대조해야 합니다.</p>
            </article>
            <article>
              <span>02</span>
              <h3>축의금 합계가 늦게 보입니다</h3>
              <p>현장 기록이 흩어져 최종 금액 확인이 늦어집니다.</p>
            </article>
            <article>
              <span>03</span>
              <h3>식권 수량도 따로 세야 합니다</h3>
              <p>나간 식권 수량을 메모와 기억에 의존하게 됩니다.</p>
            </article>
          </div>
        </section>

        <section className="splitSection">
          <div className="splitImage">
            <img src={overviewImage} alt="정담 서비스 전체 흐름을 보여주는 태블릿과 청첩장" />
          </div>
          <div className="splitCopy">
            <p className="eyebrow">정담이 하는 일</p>
            <h2>예식 준비와 당일 접수를 하나의 흐름으로 묶습니다.</h2>
            <p>
              모바일 청첩장과 종이 청첩장을 준비하고, 예식 당일에는 태블릿 방명록으로
              접수합니다. 축의금, 식권, 하객 기록은 관리자 화면에서 바로 정리됩니다.
            </p>
            <div className="miniList">
              <span>청첩장 제작</span>
              <span>태블릿 접수</span>
              <span>실시간 정산</span>
              <span>행사 후 기록</span>
            </div>
          </div>
        </section>

        <section className="flowSection" id="flow">
          <div className="sectionIntro centered">
            <p className="eyebrow">접수 흐름</p>
            <h2>하객에게는 익숙하게, 주최자에게는 정확하게.</h2>
            <p>
              QR을 스캔하게 하지 않습니다. 실제 결혼식장의 종이 방명록 흐름을 태블릿으로
              옮겨 접수대 운영 방식을 바꾸지 않고 기록만 자동화합니다.
            </p>
          </div>
          <div className="flowGrid">
            {flowItems.map(([num, title, body]) => (
              <article key={num}>
                <span>{num}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="productRows">
          <article className="productRow">
            <div>
              <p className="eyebrow">청첩장 제작</p>
              <h2>모바일과 종이 청첩장을 함께 준비합니다.</h2>
              <p>
                초대 링크, 사진, 음악, 지도 구성부터 인쇄용 종이 청첩장 PDF까지 한 곳에서
                준비할 수 있습니다.
              </p>
            </div>
            <img src={invitationImage} alt="모바일과 종이 청첩장을 제작하는 화면" />
          </article>
          <article className="productRow reverse">
            <div>
              <p className="eyebrow">예식 당일</p>
              <h2>접수대에서는 태블릿만 두면 됩니다.</h2>
              <p>
                하객은 이름을 쓰고, 접수자는 축의금과 식권 수량을 저장합니다. 신랑측과
                신부측 구분, 미확정 기록까지 현장에서 바로 남깁니다.
              </p>
            </div>
            <img src={receptionImage} alt="예식장 접수대의 태블릿 방명록과 식권" />
          </article>
          <article className="productRow">
            <div>
              <p className="eyebrow">관리자 화면</p>
              <h2>주최자는 지금 상황과 행사 후 기록을 바로 봅니다.</h2>
              <p>
                참석자 목록, 축의금 합계, 식권 수량, 미확정 내역을 한 화면에서 확인하고
                나중에 이름으로 다시 검색할 수 있습니다.
              </p>
            </div>
            <img src={dashboardImage} alt="축의금과 식권 기록을 보여주는 관리자 대시보드" />
          </article>
        </section>

        <section className="features" id="features">
          <div className="sectionIntro">
            <p className="eyebrow">기능 구성</p>
            <h2>결혼식 접수에 필요한 기능만 촘촘하게 담았습니다.</h2>
          </div>
          <div className="featureGrid">
            {featureItems.map(([title, body]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="compare">
          <div className="compareImage">
            <img src={paperImage} alt="종이 방명록과 계산기, 봉투가 놓인 접수대" />
          </div>
          <div className="compareTable">
            <p className="eyebrow">종이 방명록과 비교</p>
            <h2>기존 접수대의 익숙함은 남기고, 정리 방식만 바꿉니다.</h2>
            <div className="compareRows">
              <div>
                <span>종이 방명록</span>
                <strong>행사 후 손으로 대조</strong>
              </div>
              <div>
                <span>정담</span>
                <strong>입력 즉시 기록 생성</strong>
              </div>
              <div>
                <span>종이 식권 메모</span>
                <strong>나중에 수량 재계산</strong>
              </div>
              <div>
                <span>정담 식권</span>
                <strong>현장에서 수량 저장</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div>
            <p className="eyebrow">도입 문의</p>
            <h2>정담으로 결혼식 접수 문화를 바꿔보세요.</h2>
            <p>
              종이 방명록의 익숙함은 유지하고, 축의금과 식권 기록은 실시간으로 관리하는
              접수 시스템을 준비합니다.
            </p>
          </div>
          <a className="primaryBtn" href="mailto:contact@jeongdam.app">도입 상담하기</a>
        </section>
      </main>

      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }

        :global(*) {
          box-sizing: border-box;
        }

        :global(html),
        :global(body),
        :global(#__next) {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        .page {
          width: 100%;
          max-width: 100vw;
          min-height: 100vh;
          background: #f7f2e9;
          color: #24231f;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          overflow-x: hidden;
        }

        .page :global(img) {
          max-width: 100%;
        }

        .heroCopy,
        .splitCopy,
        .compareTable,
        .contact > div,
        .sectionIntro,
        .productRow > div {
          min-width: 0;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 24px;
          max-width: 1180px;
          margin: 0 auto;
          padding: 18px 24px;
          background: rgba(247, 242, 233, 0.86);
          backdrop-filter: blur(18px);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: inherit;
          text-decoration: none;
        }

        .brand img {
          width: 38px;
          height: 38px;
          object-fit: contain;
          background: #fff;
          border-radius: 6px;
        }

        .brand strong {
          display: block;
          font-size: 20px;
          line-height: 1;
        }

        .brand small {
          display: block;
          margin-top: 5px;
          font-size: 12px;
          color: #716b60;
          white-space: nowrap;
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px;
          border: 1px solid rgba(36, 35, 31, 0.09);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.68);
        }

        .navLinks a {
          padding: 10px 18px;
          color: #5f5a51;
          font-size: 14px;
          font-weight: 650;
          text-decoration: none;
          border-radius: 999px;
        }

        .navLinks a:hover {
          color: #20392d;
          background: #fff;
        }

        .navCta {
          justify-self: end;
          padding: 13px 22px;
          color: #fff;
          background: #1d3a2d;
          border-radius: 999px;
          font-weight: 750;
          text-decoration: none;
          box-shadow: 0 12px 30px rgba(29, 58, 45, 0.18);
        }

        .hero {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          align-items: center;
          gap: 56px;
          max-width: 1180px;
          margin: 0 auto;
          padding: 76px 24px 92px;
        }

        .eyebrow {
          margin: 0 0 18px;
          color: #6f8a68;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        h1,
        h2,
        h3,
        p {
          word-break: keep-all;
          overflow-wrap: break-word;
        }

        h1 {
          margin: 0;
          font-size: clamp(44px, 5vw, 66px);
          line-height: 1.08;
          letter-spacing: 0;
        }

        .lead {
          max-width: 560px;
          margin: 28px 0 0;
          color: #625d54;
          font-size: 19px;
          line-height: 1.72;
          font-weight: 520;
        }

        .heroActions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 34px;
        }

        .primaryBtn,
        .secondaryBtn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 24px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
        }

        .primaryBtn {
          color: #fff;
          background: #1d3a2d;
          box-shadow: 0 18px 40px rgba(29, 58, 45, 0.22);
        }

        .secondaryBtn {
          color: #1d3a2d;
          background: #ffffff;
          border: 1px solid rgba(29, 58, 45, 0.12);
        }

        .proofRow {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 46px;
        }

        .proofRow div {
          padding: 18px 16px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(36, 35, 31, 0.08);
          border-radius: 8px;
        }

        .proofRow strong,
        .proofRow span {
          display: block;
        }

        .proofRow strong {
          font-size: 18px;
        }

        .proofRow span {
          margin-top: 7px;
          color: #6f675c;
          font-size: 13px;
          font-weight: 650;
        }

        .heroVisual {
          position: relative;
          min-height: 560px;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 38px 90px rgba(49, 39, 25, 0.16);
          background: #eee5d7;
        }

        .heroVisual img,
        .splitImage img,
        .productRow img,
        .compareImage img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .statusPanel {
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 28px;
          padding: 22px;
          color: #243228;
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 8px;
          backdrop-filter: blur(18px);
        }

        .statusPanel span {
          display: block;
          color: #6e7f65;
          font-size: 13px;
          font-weight: 800;
        }

        .statusPanel strong {
          display: block;
          margin-top: 8px;
          font-size: 22px;
        }

        .statusBars {
          display: grid;
          gap: 8px;
          margin-top: 18px;
        }

        .statusBars i {
          display: block;
          height: 8px;
          border-radius: 999px;
          background: #78906c;
        }

        .statusBars i:nth-child(2) {
          width: 78%;
          background: #d4b48d;
        }

        .statusBars i:nth-child(3) {
          width: 56%;
          background: #a98d73;
        }

        .problemBand,
        .flowSection,
        .features {
          padding: 100px 24px;
        }

        .problemBand {
          background: #243228;
          color: #fff;
        }

        .sectionIntro {
          max-width: 1180px;
          margin: 0 auto 42px;
        }

        .sectionIntro.centered {
          max-width: 760px;
          text-align: center;
        }

        .sectionIntro h2,
        .splitCopy h2,
        .productRow h2,
        .compareTable h2,
        .contact h2 {
          margin: 0;
          font-size: clamp(34px, 4vw, 54px);
          line-height: 1.12;
          letter-spacing: 0;
        }

        .sectionIntro p:not(.eyebrow),
        .splitCopy p,
        .productRow p,
        .compareTable p,
        .contact p {
          color: #665f55;
          font-size: 18px;
          line-height: 1.75;
        }

        .problemBand .sectionIntro p:not(.eyebrow) {
          color: rgba(255, 255, 255, 0.7);
        }

        .problemGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          max-width: 1180px;
          margin: 0 auto;
        }

        .problemGrid article {
          min-height: 250px;
          padding: 28px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
        }

        .problemGrid span,
        .flowGrid span {
          color: #d1b187;
          font-weight: 900;
        }

        .problemGrid h3,
        .flowGrid h3,
        .featureGrid h3 {
          margin: 28px 0 12px;
          font-size: 24px;
          line-height: 1.25;
        }

        .problemGrid p {
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          font-size: 16px;
          line-height: 1.7;
        }

        .splitSection,
        .compare {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: 64px;
          align-items: center;
          max-width: 1180px;
          margin: 0 auto;
          padding: 110px 24px;
        }

        .splitImage,
        .compareImage {
          aspect-ratio: 1.2 / 1;
          overflow: hidden;
          border-radius: 24px;
          box-shadow: 0 28px 70px rgba(49, 39, 25, 0.13);
        }

        .miniList {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 28px;
        }

        .miniList span {
          padding: 14px 16px;
          background: #fff;
          border: 1px solid rgba(36, 35, 31, 0.08);
          border-radius: 8px;
          font-weight: 800;
        }

        .flowSection {
          background: #fffaf2;
        }

        .flowGrid,
        .featureGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          max-width: 1180px;
          margin: 0 auto;
        }

        .flowGrid article,
        .featureGrid article {
          padding: 30px;
          background: #fff;
          border: 1px solid rgba(36, 35, 31, 0.08);
          border-radius: 8px;
          box-shadow: 0 18px 50px rgba(49, 39, 25, 0.06);
        }

        .flowGrid p,
        .featureGrid p {
          color: #6b645a;
          font-size: 16px;
          line-height: 1.7;
        }

        .productRows {
          max-width: 1180px;
          margin: 0 auto;
          padding: 100px 24px;
        }

        .productRow {
          display: grid;
          grid-template-columns: 0.82fr 1.18fr;
          gap: 56px;
          align-items: center;
          padding: 46px 0;
          border-top: 1px solid rgba(36, 35, 31, 0.12);
        }

        .productRow.reverse {
          grid-template-columns: 1.18fr 0.82fr;
        }

        .productRow.reverse div {
          order: 2;
        }

        .productRow.reverse img {
          order: 1;
        }

        .productRow img {
          aspect-ratio: 1.55 / 1;
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(49, 39, 25, 0.12);
        }

        .features {
          background: #eef1e8;
        }

        .featureGrid {
          grid-template-columns: repeat(2, 1fr);
        }

        .featureGrid article {
          box-shadow: none;
        }

        .featureGrid h3 {
          margin-top: 0;
        }

        .compare {
          grid-template-columns: 0.95fr 1.05fr;
        }

        .compareRows {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 32px;
        }

        .compareRows div {
          padding: 20px;
          background: #fff;
          border: 1px solid rgba(36, 35, 31, 0.08);
          border-radius: 8px;
        }

        .compareRows span,
        .compareRows strong {
          display: block;
        }

        .compareRows span {
          color: #7b7164;
          font-size: 13px;
          font-weight: 800;
        }

        .compareRows strong {
          margin-top: 9px;
          font-size: 18px;
        }

        .contact {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          max-width: 1180px;
          margin: 0 auto;
          padding: 84px 24px 110px;
          border-top: 1px solid rgba(36, 35, 31, 0.12);
        }

        .contact > div {
          max-width: 760px;
        }

        @media (max-width: 900px) {
          .nav {
            display: flex;
            justify-content: space-between;
            padding: 12px 16px;
            max-width: 100vw;
          }

          .navLinks {
            display: none;
          }

          .brand small {
            display: none;
          }

          .navCta {
            padding: 11px 16px;
            font-size: 13px;
          }

          .hero,
          .splitSection,
          .compare,
          .productRow,
          .productRow.reverse {
            grid-template-columns: 1fr;
          }

          .hero {
            gap: 34px;
            padding: 44px 18px 64px;
          }

          h1 {
            font-size: 35px;
            line-height: 1.13;
          }

          .lead {
            font-size: 17px;
            max-width: 100%;
          }

          .proofRow,
          .problemGrid,
          .flowGrid,
          .featureGrid,
          .compareRows {
            grid-template-columns: 1fr;
          }

          .heroVisual {
            min-height: 480px;
            border-radius: 22px;
          }

          .problemBand,
          .flowSection,
          .features,
          .productRows,
          .splitSection,
          .compare {
            padding: 72px 18px;
          }

          .productRow,
          .productRow.reverse {
            gap: 28px;
          }

          .productRow.reverse div,
          .productRow.reverse img {
            order: initial;
          }

          .contact {
            flex-direction: column;
            align-items: flex-start;
            padding: 72px 18px 90px;
          }

          .primaryBtn,
          .secondaryBtn {
            width: 100%;
            max-width: 100%;
          }
        }

        @media (max-width: 520px) {
          .navCta {
            display: none;
          }

          h2,
          .sectionIntro h2,
          .splitCopy h2,
          .productRow h2,
          .compareTable h2,
          .contact h2 {
            font-size: 32px;
            line-height: 1.18;
          }

          h1,
          h2,
          h3,
          p {
            word-break: break-all;
            overflow-wrap: anywhere;
          }

          .hero,
          .problemBand,
          .flowSection,
          .features,
          .productRows,
          .splitSection,
          .compare,
          .contact {
            width: 100%;
            max-width: 100vw;
          }

          .heroCopy,
          .heroActions,
          .proofRow,
          .proofRow div,
          .heroVisual,
          .sectionIntro,
          .problemGrid,
          .problemGrid article,
          .flowGrid,
          .flowGrid article,
          .featureGrid,
          .featureGrid article,
          .splitCopy,
          .productRow > div,
          .compareTable,
          .contact > div {
            width: 100%;
            max-width: calc(100vw - 36px);
          }

          .lead,
          .problemGrid p,
          .flowGrid p,
          .featureGrid p,
          .productRow p,
          .splitCopy p,
          .compareTable p {
            font-size: 15px;
            line-height: 1.72;
          }

          .heroVisual {
            min-height: 390px;
          }

          .statusPanel {
            left: 16px;
            right: 16px;
            bottom: 16px;
          }

          .miniList {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
