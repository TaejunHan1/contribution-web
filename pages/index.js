import Head from 'next/head';

const heroImage = '/landing/generated-main/jeongdam-main-hero.png';
const workflowImage = '/landing/generated-main/jeongdam-main-workflow.png';
const weddingLinkImage = '/landing/generated-main/jeongdam-mobile-wedding-link.png';
const funeralLinkImage = '/landing/generated-main/jeongdam-mobile-funeral-link.png';

const paperSamples = [
  ['Minimal 01', '/studio/templates/minimal/minimal1/preview.png'],
  ['Minimal 02', '/studio/templates/minimal/minimal2/preview.png'],
  ['Minimal 03', '/studio/templates/minimal/minimal3/preview.png'],
  ['Minimal 04', '/studio/templates/minimal/minimal4/preview.png'],
  ['Minimal 05', '/studio/templates/minimal/minimal5/preview.png'],
  ['Minimal 06', '/studio/templates/minimal/minimal6/preview.png'],
];

const servicePillars = [
  ['초대와 안내', '모바일 청첩장과 부고장을 링크로 전달하고, 종이청첩장 preview까지 함께 준비합니다.'],
  ['현장 접수', '앱과 태블릿에서 방명록, 축의금·부의금, 식권 수량을 현장 흐름에 맞춰 기록합니다.'],
  ['행사 후 관리', '장부, 메시지, 미확정 내역, 상부상조 알림을 행사 후에도 다시 확인합니다.'],
];

const serviceDetails = [
  ['모바일 청첩장', '사진, 일정, 갤러리, 지도, 마음 전하기'],
  ['모바일 부고장', '고인 정보, 장례 일정, 빈소 안내, 조문 메시지'],
  ['종이청첩장 제작', '미니멀 preview, 인쇄용 레이아웃, PDF 제작 흐름'],
  ['앱·태블릿 접수', '방명록, 축의금·부의금, 식권 기록'],
  ['행사 장부', '참석자, 금액, 관계, 미확정 내역 검색'],
  ['상부상조 관리', '내 행사에 와준 사람의 새 경조사 확인'],
];

const featureStories = [
  {
    label: '01 MOBILE LINK',
    title: '모바일 청첩장과 부고장은 하객이 가장 먼저 보는 안내 화면입니다.',
    body: '사진, 일정, 지도, 갤러리, 마음 전하기를 모바일 화면에서 자연스럽게 확인하도록 구성하고, 부고장은 고인 정보와 장례 일정이 차분하게 전달되도록 나눕니다.',
    items: ['청첩장 링크', '부고장 링크', '갤러리·지도·메시지'],
  },
  {
    label: '02 PAPER',
    title: '종이청첩장 제작',
    body: '미니멀 preview를 보며 인쇄용 청첩장 디자인을 고르고, 예식 정보와 문구를 종이 레이아웃에 맞춰 정리합니다.',
    items: ['preview 샘플', '인쇄용 레이아웃', 'PDF 제작 흐름'],
  },
  {
    label: '03 RECEPTION',
    title: '앱·태블릿 접수',
    body: '현장에서는 앱과 태블릿으로 방명록, 축의금·부의금, 식권 수량을 빠르게 기록합니다.',
    items: ['태블릿 방명록', '금액 기록', '식권 정산'],
  },
  {
    label: '04 LEDGER',
    title: '행사 후 장부 관리',
    body: '참석자, 금액, 관계, 미확정 내역을 다시 검색하고 내 행사에 와준 사람의 다음 경조사도 챙깁니다.',
    items: ['참석자 검색', '미확정 내역', '상부상조 관리'],
  },
];

const steps = [
  ['01', '만들기', '앱에서 청첩장 또는 부고장을 만들고, 행사 정보를 정리합니다.'],
  ['02', '링크로 보여주기', '웹은 모바일 청첩장과 부고장 링크를 하객에게 보기 좋게 전달합니다.'],
  ['03', '태블릿으로 접수하기', '현장에서는 앱과 태블릿으로 이름, 금액, 식권을 차례대로 기록합니다.'],
  ['04', '관리하기', '행사 후 기록과 챙길 경조사를 다시 확인합니다.'],
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>정담 - 경조사 준비와 접수 관리</title>
        <meta
          name="description"
          content="정담은 모바일 청첩장과 부고장 링크, 앱·태블릿 접수, 축의금·부의금 기록, 식권 정산, 상부상조 관리를 연결하는 경조사 관리 서비스입니다."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="page">
        <header className="nav">
          <a className="brand" href="#top" aria-label="정담 홈">
            <img src="/landing/jeongdamlogo.png" alt="" />
            <span>정담</span>
          </a>
          <nav className="navLinks" aria-label="메인 메뉴">
            <a href="#service">서비스</a>
            <a href="#features">기능</a>
            <a href="#flow">흐름</a>
            <a href="#contact">문의</a>
          </nav>
          <a className="navCta" href="#contact">도입 문의</a>
        </header>

        <section
          className="hero"
          id="top"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(17, 24, 20, 0.9), rgba(17, 24, 20, 0.58), rgba(17, 24, 20, 0.06)), url(${heroImage})`,
          }}
        >
          <div className="heroCopy">
            <p className="eyebrow light">JEONGDAM</p>
            <h1>
              경조사의 시작부터
              <br />
              마지막 기록까지
              <br />
              정갈하게 이어집니다.
            </h1>
            <p>
              정담은 웹에서 모바일 청첩장과 부고장을 보여주고, 앱과 태블릿에서 현장 접수,
              축의금·부의금 장부, 식권 정산, 상부상조 관리를 이어가는 서비스입니다.
            </p>
            <div className="heroActions">
              <a className="primaryBtn" href="#service">서비스 보기</a>
              <a className="secondaryBtn" href="#contact">상담 문의</a>
            </div>
          </div>
        </section>

        <section className="introBand" id="service">
          <div className="introCopy">
            <p className="eyebrow">SERVICE</p>
            <h2>모바일 링크와 현장 접수를 각각 제 역할에 맞게.</h2>
            <p>
              정담은 하객에게 전달되는 모바일 청첩장과 부고장, 종이청첩장 제작,
              현장에서 쓰는 앱·태블릿 접수, 행사 후 장부 관리까지 필요한 흐름을 나눠서
              단정하게 연결합니다.
            </p>
          </div>
          <div className="serviceLayout">
            <div className="serviceRail">
              {servicePillars.map(([title, body], index) => (
                <article key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="serviceDetailPanel">
              <p>정담 구성</p>
              <div>
                {serviceDetails.map(([title, body]) => (
                  <section key={title}>
                    <h4>{title}</h4>
                    <span>{body}</span>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="showcase">
          <div className="linkPreviewGrid">
            <article>
              <img src={weddingLinkImage} alt="정담 모바일 청첩장 링크 이미지" />
              <div>
                <span>Wedding Link</span>
                <strong>모바일 청첩장</strong>
              </div>
            </article>
            <article>
              <img src={funeralLinkImage} alt="정담 모바일 부고장 링크 이미지" />
              <div>
                <span>Memorial Link</span>
                <strong>모바일 부고장</strong>
              </div>
            </article>
          </div>
          <div className="showcaseCopy">
            <p className="eyebrow">MOBILE WEB</p>
            <h2>모바일 청첩장과 부고장을 가장 먼저 만나는 화면.</h2>
            <p>
              청첩장 링크는 사진과 일정, 갤러리, 지도, 마음 전하기를 보여주고,
              부고장 링크는 고인 정보와 장례 일정, 빈소 안내를 차분하게 전달합니다.
              웹은 초대와 안내에 집중하고, 현장 접수는 앱과 태블릿에서 이어집니다.
            </p>
          </div>
        </section>

        <section className="paperSection">
          <div className="sectionHead">
            <p className="eyebrow">PAPER PREVIEW</p>
            <h2>종이청첩장 미리보기 샘플을 바로 확인합니다.</h2>
            <p>
              앱 안에 있는 미니멀 종이청첩장 preview들을 메인에서도 보여주어,
              모바일 청첩장과 인쇄용 청첩장을 함께 제작할 수 있다는 점을 분명하게 전달합니다.
            </p>
          </div>
          <div className="paperSlider" aria-label="종이청첩장 미리보기 자동 슬라이드">
            <div className="paperTrack">
              {[...paperSamples, ...paperSamples].map(([title, image], index) => (
                <article key={`${title}-${index}`} aria-hidden={index >= paperSamples.length}>
                  <img src={image} alt={index < paperSamples.length ? `${title} preview` : ''} />
                  <div>
                    <h3>{title}</h3>
                    <p>인쇄용 종이청첩장 디자인 샘플</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="features" id="features">
          <div className="featureIntro">
            <div className="sectionHead">
              <p className="eyebrow">FEATURES</p>
              <h2>정담이 실제 경조사 운영에서 맡는 일.</h2>
              <p>
                초대장을 예쁘게 보여주는 일과 현장에서 기록을 받는 일은 서로 다릅니다.
                정담은 모바일 링크, 종이 제작, 태블릿 접수, 행사 후 장부를 각각의 화면에
                맞춰 분리해서 다룹니다.
              </p>
            </div>
            <aside className="featureNote">
              <span>운영 기준</span>
              <strong>웹은 안내, 접수는 앱과 태블릿</strong>
              <p>
                하객이 여는 웹 링크는 청첩장과 부고장 안내에 집중하고,
                이름과 금액을 남기는 접수 흐름은 현장용 앱에서 처리합니다.
              </p>
            </aside>
          </div>
          <div className="featureStoryGrid">
            {featureStories.map((feature, index) => (
              <article className={index === 0 ? 'featureCard featureCardWide' : 'featureCard'} key={feature.title}>
                <span className="featureNumber">{feature.label}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
                <div className="featureTags">
                  {feature.items.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flow" id="flow">
          <div className="flowImage">
            <img src={workflowImage} alt="정담 경조사 운영 흐름 이미지" />
          </div>
          <div className="flowContent">
            <p className="eyebrow">FLOW</p>
            <h2>링크로 안내하고, 태블릿으로 접수하고, 앱에서 관리합니다.</h2>
            <div className="stepList">
              {steps.map(([num, title, body]) => (
                <article key={num}>
                  <span>{num}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="closing" id="contact">
          <p className="eyebrow">CONTACT</p>
          <h2>경조사 준비와 접수 운영을 더 단정하게 바꿔보세요.</h2>
          <p>
            모바일 청첩장과 부고장 링크, 앱·태블릿 접수, 장부 기록까지 실제 운영 흐름에
            맞춰 정담을 도입할 수 있습니다.
          </p>
          <a className="primaryBtn dark" href="mailto:contact@jeongdam.app">도입 문의하기</a>
        </section>
      </main>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(html) {
          scroll-behavior: smooth;
        }

        :global(html),
        :global(body),
        :global(#__next) {
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        .page {
          min-height: 100vh;
          color: #18201b;
          background: #fbfaf7;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          letter-spacing: 0;
          overflow-x: hidden;
        }

        .page :global(img) {
          max-width: 100%;
        }

        h1,
        h2,
        h3,
        p,
        a,
        span {
          margin-top: 0;
          word-break: keep-all;
          overflow-wrap: break-word;
          letter-spacing: 0;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 24px;
          padding: 15px 42px;
          background: rgba(251, 250, 247, 0.9);
          border-bottom: 1px solid rgba(24, 32, 27, 0.08);
          backdrop-filter: blur(18px);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: inherit;
          font-size: 19px;
          font-weight: 850;
          text-decoration: none;
        }

        .brand img {
          width: 36px;
          height: 36px;
          object-fit: contain;
        }

        .navLinks {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .navLinks a {
          color: #58645d;
          font-size: 14px;
          font-weight: 750;
          text-decoration: none;
        }

        .navLinks a:hover {
          color: #173d2c;
        }

        .navCta {
          justify-self: end;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 40px;
          padding: 0 18px;
          color: #fff;
          background: #183c2c;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 850;
          text-decoration: none;
        }

        .hero {
          display: flex;
          align-items: center;
          min-height: calc(100svh - 86px);
          padding: 80px 42px 104px;
          color: #fff;
          background-color: #17211b;
          background-position: center;
          background-size: cover;
        }

        .heroCopy {
          width: min(100%, 1120px);
          margin: 0 auto;
        }

        .eyebrow {
          margin-bottom: 14px;
          color: #6d876d;
          font-size: 13px;
          font-weight: 900;
        }

        .eyebrow.light {
          color: #d9bd8a;
        }

        h1 {
          max-width: 760px;
          margin-bottom: 26px;
          font-size: 68px;
          line-height: 1.08;
          font-weight: 850;
        }

        .heroCopy p:not(.eyebrow) {
          max-width: 650px;
          margin-bottom: 0;
          color: rgba(255, 255, 255, 0.82);
          font-size: 19px;
          line-height: 1.78;
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
          padding: 0 25px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 850;
          text-decoration: none;
        }

        .primaryBtn {
          color: #1b241f;
          background: #fff7e6;
          border: 1px solid rgba(255, 255, 255, 0.52);
        }

        .primaryBtn.dark {
          color: #fff;
          background: #183c2c;
          border-color: #183c2c;
        }

        .secondaryBtn {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.28);
        }

        .introBand {
          padding: 104px 42px 86px;
          background: #fbfaf7;
        }

        .introCopy,
        .sectionHead {
          width: min(100%, 1120px);
          margin: 0 auto 38px;
        }

        .introCopy h2,
        .showcaseCopy h2,
        .sectionHead h2,
        .flowContent h2,
        .closing h2 {
          margin-bottom: 20px;
          color: #1d2922;
          font-size: 48px;
          line-height: 1.18;
          font-weight: 850;
        }

        .introCopy p:not(.eyebrow),
        .showcaseCopy p,
        .closing p {
          max-width: 760px;
          color: #5c665f;
          font-size: 18px;
          line-height: 1.78;
        }

        .serviceLayout {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 22px;
          width: min(100%, 1120px);
          margin: 0 auto;
        }

        .serviceRail {
          display: grid;
          gap: 14px;
        }

        .serviceRail article {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 18px;
          align-items: start;
          padding: 24px;
          background: #fff;
          border: 1px solid rgba(25, 61, 45, 0.1);
          border-radius: 8px;
          box-shadow: 0 16px 44px rgba(25, 36, 30, 0.06);
        }

        .serviceRail article > span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          color: #fff;
          background: #183c2c;
          border-radius: 50%;
          font-size: 13px;
          font-weight: 900;
        }

        .serviceRail h3,
        .stepList h3 {
          margin-bottom: 12px;
          color: #1d3328;
          font-size: 23px;
          line-height: 1.25;
        }

        .serviceRail p,
        .stepList p {
          margin-bottom: 0;
          color: #657066;
          font-size: 16px;
          line-height: 1.68;
        }

        .serviceDetailPanel {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 100%;
          padding: 32px;
          color: #fff;
          background: #17251d;
          border-radius: 8px;
          box-shadow: 0 24px 70px rgba(25, 36, 30, 0.14);
        }

        .serviceDetailPanel > p {
          margin-bottom: 26px;
          color: #dfc896;
          font-size: 13px;
          font-weight: 900;
        }

        .serviceDetailPanel > div {
          display: grid;
          gap: 12px;
        }

        .serviceDetailPanel section {
          padding: 18px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        }

        .serviceDetailPanel section:last-child {
          border-bottom: 0;
        }

        .serviceDetailPanel h4 {
          margin: 0 0 7px;
          color: #fff;
          font-size: 19px;
          line-height: 1.25;
        }

        .serviceDetailPanel span {
          display: block;
          color: rgba(255, 255, 255, 0.68);
          font-size: 15px;
          line-height: 1.55;
        }

        .showcase {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          align-items: center;
          gap: 48px;
          padding: 96px 42px;
          background: linear-gradient(180deg, #f4f1ea 0%, #eef4ef 100%);
        }

        .linkPreviewGrid,
        .showcaseCopy {
          min-width: 0;
        }

        .linkPreviewGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: stretch;
          gap: 16px;
        }

        .linkPreviewGrid article {
          position: relative;
          overflow: hidden;
          min-height: 520px;
          border: 1px solid rgba(25, 61, 45, 0.12);
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 22px 60px rgba(25, 36, 30, 0.12);
        }

        .linkPreviewGrid article img {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 520px;
          object-fit: cover;
        }

        .linkPreviewGrid article div {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 18px;
          padding: 16px 18px;
          color: #1d2b23;
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(255, 255, 255, 0.72);
          border-radius: 8px;
          backdrop-filter: blur(14px);
        }

        .linkPreviewGrid span,
        .linkPreviewGrid strong {
          display: block;
        }

        .linkPreviewGrid span {
          color: #6b7c70;
          font-size: 12px;
          font-weight: 900;
        }

        .linkPreviewGrid strong {
          margin-top: 5px;
          font-size: 22px;
          line-height: 1.2;
        }

        .flowImage img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .showcaseCopy {
          max-width: 500px;
        }

        .paperSection {
          padding: 104px 42px;
          background: #fbfaf7;
        }

        .sectionHead p:not(.eyebrow) {
          max-width: 760px;
          margin-bottom: 0;
          color: #5c665f;
          font-size: 18px;
          line-height: 1.78;
        }

        .paperSlider {
          width: min(100%, 1120px);
          margin: 0 auto;
          overflow: hidden;
          border-radius: 8px;
          mask-image: linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%);
        }

        .paperTrack {
          display: flex;
          width: max-content;
          gap: 16px;
          animation: paperSlide 38s linear infinite;
        }

        .paperTrack article {
          flex: 0 0 260px;
          overflow: hidden;
          background: #fff;
          border: 1px solid rgba(24, 32, 27, 0.1);
          border-radius: 8px;
          box-shadow: 0 18px 52px rgba(25, 36, 30, 0.08);
        }

        .paperTrack img {
          display: block;
          width: 100%;
          aspect-ratio: 0.72;
          height: auto;
          object-fit: cover;
          object-position: center top;
          background: #f4f0e9;
        }

        .paperTrack div {
          padding: 18px 20px 20px;
        }

        .paperTrack h3 {
          margin-bottom: 10px;
          color: #1d3328;
          font-size: 22px;
          line-height: 1.25;
        }

        .paperTrack p {
          margin-bottom: 0;
          color: #657066;
          font-size: 15px;
          line-height: 1.65;
        }

        @keyframes paperSlide {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(-50% - 8px));
          }
        }

        .features {
          padding: 104px 42px;
          background: #f4f1ea;
        }

        .featureIntro {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          align-items: end;
          gap: 28px;
          width: min(100%, 1120px);
          margin: 0 auto 34px;
        }

        .featureIntro .sectionHead {
          width: auto;
          margin: 0;
        }

        .featureNote {
          padding: 25px 26px 27px;
          color: #fff;
          background: #183c2c;
          border-radius: 8px;
          box-shadow: 0 22px 60px rgba(25, 36, 30, 0.12);
        }

        .featureNote span,
        .featureNumber {
          display: block;
          margin-bottom: 14px;
          color: #b99a66;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 0;
        }

        .featureNote strong {
          display: block;
          margin-bottom: 13px;
          font-size: 22px;
          line-height: 1.25;
        }

        .featureNote p {
          margin-bottom: 0;
          color: rgba(255, 255, 255, 0.72);
          font-size: 15px;
          line-height: 1.68;
        }

        .featureStoryGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          width: min(100%, 1120px);
          margin: 0 auto;
        }

        .featureCard {
          display: flex;
          min-height: 300px;
          flex-direction: column;
          padding: 28px;
          background: #fff;
          border: 1px solid rgba(24, 32, 27, 0.1);
          border-radius: 8px;
          box-shadow: 0 18px 52px rgba(25, 36, 30, 0.07);
        }

        .featureCardWide {
          grid-column: span 2;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 251, 243, 0.92)),
            #fff;
        }

        .featureCard:nth-child(2) {
          background: #eef4ef;
        }

        .featureCard:nth-child(3) {
          background: #fffaf0;
        }

        .featureCard:nth-child(4) {
          background: #f8f8f4;
        }

        .featureCard h3 {
          margin-bottom: 14px;
          color: #1d3328;
          font-size: 25px;
          line-height: 1.25;
        }

        .featureCard p {
          margin-bottom: 0;
          color: #657066;
          font-size: 16px;
          line-height: 1.7;
        }

        .featureTags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: auto;
          padding-top: 26px;
        }

        .featureTags span {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 12px;
          color: #405148;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(24, 32, 27, 0.08);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
        }

        .flow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: stretch;
          gap: 0;
          background: #17251d;
          color: #fff;
        }

        .flowImage {
          min-height: 640px;
          overflow: hidden;
        }

        .flowContent {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 88px 54px;
        }

        .flowContent h2 {
          color: #fff;
        }

        .stepList {
          display: grid;
          gap: 16px;
          margin-top: 18px;
        }

        .stepList article {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 18px;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        }

        .stepList article:last-child {
          border-bottom: 0;
        }

        .stepList span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          color: #17251d;
          background: #dfc896;
          border-radius: 50%;
          font-size: 13px;
          font-weight: 900;
        }

        .stepList h3 {
          color: #fff;
        }

        .stepList p {
          color: rgba(255, 255, 255, 0.72);
        }

        .closing {
          padding: 118px 42px;
          text-align: center;
          background: #fbfaf7;
        }

        .closing h2,
        .closing p {
          max-width: 760px;
          margin-left: auto;
          margin-right: auto;
        }

        .closing .primaryBtn {
          margin-top: 18px;
        }

        @media (max-width: 1024px) {
          .nav {
            grid-template-columns: 1fr auto;
            padding: 14px 24px;
          }

          .navLinks {
            display: none;
          }

          .hero {
            min-height: calc(100svh - 80px);
            padding: 70px 24px 92px;
            background-position: center right 34%;
          }

          h1 {
            font-size: 52px;
          }

          .introCopy h2,
          .showcaseCopy h2,
          .sectionHead h2,
          .flowContent h2,
          .closing h2 {
            font-size: 39px;
          }

          .introBand,
          .paperSection,
          .features,
          .closing {
            padding-left: 24px;
            padding-right: 24px;
          }

          .serviceLayout {
            grid-template-columns: 1fr;
          }

          .showcase,
          .flow {
            grid-template-columns: 1fr;
          }

          .showcase {
            padding: 82px 24px;
          }

          .linkPreviewGrid {
            grid-template-columns: 1fr 1fr;
          }

          .showcaseCopy {
            max-width: none;
          }

          .flowImage {
            min-height: 420px;
          }

          .flowContent {
            padding: 72px 24px;
          }

          .paperTrack article {
            flex-basis: 238px;
          }

          .featureIntro {
            grid-template-columns: 1fr;
            align-items: start;
          }

          .featureStoryGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .featureCardWide {
            grid-column: span 2;
          }
        }

        @media (max-width: 640px) {
          .nav {
            padding: 12px 16px;
          }

          .brand img {
            width: 32px;
            height: 32px;
          }

          .navCta {
            min-height: 38px;
            padding: 0 14px;
            font-size: 13px;
          }

          .hero {
            min-height: calc(100svh - 72px);
            padding: 58px 18px 86px;
          }

          h1 {
            font-size: 40px;
          }

          .heroCopy p:not(.eyebrow),
          .introCopy p:not(.eyebrow),
          .showcaseCopy p,
          .closing p {
            font-size: 16px;
            line-height: 1.72;
          }

          .heroActions {
            flex-direction: column;
            width: min(100%, 260px);
          }

          .primaryBtn,
          .secondaryBtn {
            width: 100%;
          }

          .introBand,
          .paperSection,
          .features,
          .closing {
            padding: 68px 18px;
          }

          .introCopy h2,
          .showcaseCopy h2,
          .sectionHead h2,
          .flowContent h2,
          .closing h2 {
            font-size: 31px;
          }

          .serviceRail article,
          .featureCard {
            min-height: auto;
            padding: 24px;
          }

          .serviceRail article {
            grid-template-columns: 44px 1fr;
            gap: 14px;
          }

          .serviceDetailPanel {
            padding: 24px;
          }

          .showcase {
            padding: 68px 18px;
          }

          .linkPreviewGrid {
            grid-template-columns: 1fr;
          }

          .linkPreviewGrid article,
          .linkPreviewGrid article img {
            min-height: 330px;
          }

          .featureStoryGrid {
            grid-template-columns: 1fr;
          }

          .featureCardWide {
            grid-column: auto;
          }

          .paperTrack article {
            flex-basis: 218px;
          }

          .paperTrack img {
            aspect-ratio: 0.72;
          }

          .flowImage {
            min-height: 310px;
          }

          .flowContent {
            padding: 62px 18px;
          }

          .stepList article {
            grid-template-columns: 42px 1fr;
            gap: 14px;
          }

          .stepList span {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>
    </>
  );
}
