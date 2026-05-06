import Head from 'next/head';

const imageVersion = '20260506-photo-landing-v4';

const sections = [
  {
    id: 'top',
    src: `/landing/final/nav-final.png?v=${imageVersion}`,
    alt: '정담 내비게이션',
    kind: 'nav',
  },
  {
    id: 'hero',
    src: `/landing/final/hero-final.png?v=${imageVersion}`,
    mobileSrc: `/landing/final/hero-mobile-final.png?v=${imageVersion}`,
    alt: '정담은 종이 방명록처럼 쓰고 축의금과 식권은 자동 정리하는 예식장 접수 서비스입니다',
  },
  {
    id: 'features',
    src: `/landing/final/features-final.png?v=${imageVersion}`,
    mobileSrc: `/landing/final/features-mobile-final.png?v=${imageVersion}`,
    alt: '정담 기능 소개: 모바일 청첩장, 종이 청첩장, 태블릿 방명록, 행사 관리, 영수증 기록, 식권 정산',
  },
  {
    id: 'invitation',
    src: `/landing/final/invitation-final.png?v=${imageVersion}`,
    mobileSrc: `/landing/final/invitation-mobile-final.png?v=${imageVersion}`,
    alt: '정담 청첩장 제작: 모바일 청첩장과 종이 청첩장을 함께 준비합니다',
  },
  {
    id: 'reception',
    src: `/landing/final/reception-final.png?v=${imageVersion}`,
    mobileSrc: `/landing/final/reception-mobile-final.png?v=${imageVersion}`,
    alt: '정담 접수 운영: 예식 당일 태블릿으로 이름 축의금 식권을 저장합니다',
  },
  {
    id: 'flow',
    src: `/landing/final/flow-final.png?v=${imageVersion}`,
    mobileSrc: `/landing/final/flow-mobile-final.png?v=${imageVersion}`,
    alt: '정담 접수 방식: 하객은 이름을 쓰고 접수자는 금액과 식권만 입력합니다',
  },
  {
    id: 'owner',
    src: `/landing/final/owner-final.png?v=${imageVersion}`,
    mobileSrc: `/landing/final/owner-mobile-final.png?v=${imageVersion}`,
    alt: '정담 관리자 화면: 주최자가 축의금 식권 하객 기록을 실시간으로 확인합니다',
  },
  {
    id: 'records',
    src: `/landing/final/records-final.png?v=${imageVersion}`,
    mobileSrc: `/landing/final/records-mobile-final.png?v=${imageVersion}`,
    alt: '정담 행사 후 기록 관리: 하객별 축의금과 식권 기록을 검색하고 관리합니다',
  },
  {
    id: 'problem',
    src: `/landing/final/problems-final.png?v=${imageVersion}`,
    mobileSrc: `/landing/final/problems-mobile-final.png?v=${imageVersion}`,
    alt: '종이 방명록, 봉투 정산, 식권 메모가 남기는 불편함',
  },
  {
    id: 'contact',
    src: `/landing/final/contact-final.png?v=${imageVersion}`,
    mobileSrc: `/landing/final/contact-mobile-final.png?v=${imageVersion}`,
    alt: '정담 도입 문의',
  },
];

export default function HomePage() {
  return (
    <>
      <Head>
        <title>정담 - 청첩장부터 접수, 정산, 기록까지</title>
        <meta
          name="description"
          content="정담은 모바일 청첩장, 종이 청첩장 스튜디오, 태블릿 디지털 방명록, 축의금과 식권 실시간 정산을 제공하는 결혼식 관리 서비스입니다."
        />
        <meta httpEquiv="Cache-Control" content="no-store" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="landing">
        <h1 className="srOnly">
          정담 - 모바일 청첩장, 종이 청첩장, 태블릿 방명록, 축의금과 식권
          실시간 정산, 행사 후 기록 관리
        </h1>

        {sections.map(section => (
          <section
            className={`imageSection ${section.kind === 'nav' ? 'navImage' : ''}`}
            id={section.id}
            key={section.id}
          >
            <picture>
              {section.mobileSrc && (
                <source media="(max-width: 720px)" srcSet={section.mobileSrc} />
              )}
              <img className="artboard" src={section.src} alt={section.alt} />
            </picture>
          </section>
        ))}
      </main>

      <style jsx>{`
        .landing {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #f8f5ee;
        }

        .srOnly {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
        }

        .imageSection {
          box-sizing: border-box;
          width: calc(100% - 40px);
          max-width: 1240px;
          margin: 0 auto;
          padding: 26px 0;
        }

        .navImage {
          position: sticky;
          top: 0;
          z-index: 10;
          padding: 0;
          background: rgba(248, 245, 238, 0.92);
          backdrop-filter: blur(18px);
        }

        .artboard {
          display: block;
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 34px;
          box-shadow: 0 28px 90px rgba(50, 42, 31, 0.08);
        }

        picture {
          display: block;
          width: 100%;
        }

        .navImage .artboard {
          border-radius: 0;
          box-shadow: none;
        }

        @media (max-width: 720px) {
          .imageSection {
            width: 100vw;
            max-width: 100vw;
            padding: 10px 0;
          }

          .navImage {
            padding: 0;
          }

          .artboard {
            border-radius: 0;
            box-shadow: none;
          }
        }
      `}</style>
    </>
  );
}
