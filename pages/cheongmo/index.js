import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from './cheongmo.module.css';

const hostFlowItems = [
  {
    icon: '/cheongmo/room-insight-people.png',
    title: '청모 만들기',
    body: '모임 이름, 입장 방식, 만날 달을 차례대로 정해요.',
  },
  {
    icon: '/cheongmo/date-calendar-icon.svg',
    title: '후보 범위 정하기',
    body: '날짜와 지역을 직접 정할지, 친구 의견을 받을지 선택해요.',
  },
  {
    icon: '/cheongmo/room-insight-chart.png',
    title: '결과 확인',
    body: '친구들이 저장한 날짜와 지역을 보고 가장 좋은 후보를 정해요.',
  },
];

const guestFlowItems = [
  {
    icon: '/cheongmo/room-status-sync.png',
    title: '링크로 입장',
    body: '공유받은 링크에서 비밀번호나 초대 번호로 들어와요.',
  },
  {
    icon: '/cheongmo/date-calendar-icon.svg',
    title: '가능한 날짜 선택',
    body: '달력에서 가능한 날을 고르고 내 의견을 저장해요.',
  },
  {
    icon: '/cheongmo/room-insight-pin.png',
    title: '지역 의견 남기기',
    body: '만나기 편한 지역을 제안하고 마음에 드는 후보를 선택해요.',
  },
];

const benefitItems = [
  {
    icon: '/cheongmo/room-insight-chart.png',
    title: '겹치는 날짜를 바로 확인',
    body: '친구들이 저장할 때마다 많이 겹치는 날짜가 위로 올라와요.',
  },
  {
    icon: '/cheongmo/room-insight-pin.png',
    title: '지역 의견도 한 곳에',
    body: '홍대, 성수처럼 후보를 모으고 선택한 사람까지 같이 보여줘요.',
  },
  {
    icon: '/cheongmo/room-status-sync.png',
    title: '초대된 사람만 조용히',
    body: '비밀번호나 휴대폰번호 입장 방식으로 필요한 사람만 들어와요.',
  },
];

export default function CheongmoHomePage() {
  return (
    <>
      <Head>
        <title>정담 청모 - 청첩장 모임</title>
        <meta
          name="description"
          content="친구들과 청첩장 모임 날짜와 지역을 함께 정하는 정담 청모 서비스입니다."
        />
      </Head>

      <main className={styles.cheongmoHome}>
        <div className={styles.cheongmoHomeShell}>
          <section className={styles.cheongmoLandingHero}>
            <div className={styles.cheongmoHeroCopy}>
              <div className={styles.cheongmoHeroBrand}>
                <Image
                  src="/cheongmo/cheongmo-home-logo-pill.png"
                  alt="JEONGDAM 정담"
                  width={2073}
                  height={758}
                  priority
                />
              </div>
              <p className={styles.cheongmoHeroEyebrow}>
                정담과 함께 청첩장 모임을 쉽게
              </p>
              <h1>친구들과 약속 잡는 청모룸</h1>
              <span>
                날짜와 지역 의견을 한 곳에서
                <br />
                모으고 가장 좋은 시간을 함께 정해요.
              </span>
              <div className={styles.cheongmoHeroActions}>
                <Link href="/cheongmo/new">모임 만들기</Link>
              </div>
            </div>
            <Image
              className={styles.cheongmoHeroObject}
              src="/cheongmo/cheongmo-home-hero-visual.png"
              alt=""
              width={1402}
              height={1122}
              priority
            />
          </section>

          <section className={styles.cheongmoLiveCard}>
            <div className={styles.cheongmoLiveHeader}>
              <strong>실시간으로 모이는 의견</strong>
              <span>진행중</span>
            </div>
            <div className={styles.cheongmoLiveStats}>
              <article>
                <Image
                  src="/cheongmo/room-insight-people.png"
                  alt=""
                  width={36}
                  height={36}
                />
                <span>참여</span>
                <strong>3 / 8</strong>
              </article>
              <article>
                <Image
                  src="/cheongmo/room-insight-chart.png"
                  alt=""
                  width={36}
                  height={36}
                />
                <span>가장 유력</span>
                <strong>6월 13일</strong>
              </article>
              <article>
                <Image
                  src="/cheongmo/room-insight-pin.png"
                  alt=""
                  width={36}
                  height={36}
                />
                <span>지역 의견</span>
                <strong>홍대</strong>
              </article>
            </div>
          </section>

          <section className={styles.cheongmoFlowSection}>
            <div className={styles.cheongmoSectionTitle}>
              <h2>청모는 이렇게 진행돼요</h2>
              <p>주최자와 참여자가 해야 할 일을 나눠서 보여줘요.</p>
            </div>
            <div className={styles.cheongmoFlowColumns}>
              <article className={styles.cheongmoFlowColumn}>
                <span>주최자</span>
                <div className={styles.cheongmoFlowList}>
                  {hostFlowItems.map(item => (
                    <div key={item.title}>
                      <Image src={item.icon} alt="" width={36} height={36} />
                      <section>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                      </section>
                    </div>
                  ))}
                </div>
              </article>
              <article className={styles.cheongmoFlowColumn}>
                <span>참여자</span>
                <div className={styles.cheongmoFlowList}>
                  {guestFlowItems.map(item => (
                    <div key={item.title}>
                      <Image src={item.icon} alt="" width={36} height={36} />
                      <section>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                      </section>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className={styles.cheongmoBenefitSection}>
            <div className={styles.cheongmoSectionTitle}>
              <h2>따로 물어보지 않아도 돼요</h2>
              <p>카톡방에서 흩어지는 날짜와 지역 의견을 청모룸에서 정리해요.</p>
            </div>
            <div className={styles.cheongmoBenefitList}>
              {benefitItems.map(item => (
                <article key={item.title}>
                  <Image src={item.icon} alt="" width={42} height={42} />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
