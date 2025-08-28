// pages/index.js - 정담 서비스 소개 랜딩 페이지
import Head from 'next/head';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';

// 책자 애니메이션이 끝난 후 연필로 방명록 이름을 쓰는 애니메이션
function HandwritingAnimation() {
  const [showBook, setShowBook] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showText, setShowText] = useState(false);
  const [startWriting, setStartWriting] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0); // 0: 깔끔한 글씨, 1: 흘려쓴 글씨
  const [isWriting, setIsWriting] = useState(false);
  const [currentNameIndex, setCurrentNameIndex] = useState(0);
  const [isWritingComplete, setIsWritingComplete] = useState(false);
  const timersRef = useRef([]);

  const addTimer = (timer) => {
    timersRef.current.push(timer);
  };

  const clearAllTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  const startContinuousFlip = () => {
    setIsFlipping(true);
    
    // 더 자연스럽고 빠른 연속 페이지 플립 효과 - 후루룩!
    const flipSequence = [1, 2, 3, 4, 5, 6, 7, 8];
    
    flipSequence.forEach((pageNum, index) => {
      const timer = setTimeout(() => {
        setCurrentPage(pageNum);
        
        // 마지막 페이지가 넘어간 후
        if (index === flipSequence.length - 1) {
          const finalTimer = setTimeout(() => {
            setCurrentPage(0); // 첫 페이지로 돌아가기
            setIsFlipping(false);
            setShowText(true);
            
            // 책자 애니메이션이 끝나면 연필로 쓰기 시작
            setTimeout(() => {
              setStartWriting(true);
              startHandwriting();
            }, 1000);
          }, 300);
          addTimer(finalTimer);
        }
      }, index * 200); // 200ms 간격으로 빠르게 넘김 (후루룩!)
      addTimer(timer);
    });
  };

  const names = [
    { text: '김민수', isClean: true, position: { col: 0, row: 0 } },
    { text: '이종호', isClean: false, position: { col: 0, row: 1 } }, // 잘못 쓴 글씨
    { text: '박정우', isClean: true, position: { col: 0, row: 2 } },
    { text: '최수현', isClean: false, position: { col: 1, row: 0 } }, // 잘못 쓴 글씨
    { text: '정현민', isClean: true, position: { col: 1, row: 1 } },
    { text: '한소희', isClean: true, position: { col: 1, row: 2 } }
  ];

  const startHandwriting = () => {
    let nameIndex = 0;
    
    const writeNextName = () => {
      if (nameIndex >= names.length) {
        // 모든 이름을 다 썼으면 잠시 후 다시 시작
        setIsWritingComplete(true);
        setTimeout(() => {
          setCurrentNameIndex(0);
          setIsWritingComplete(false);
          nameIndex = 0;
          writeNextName();
        }, 3000);
        return;
      }
      
      const currentName = names[nameIndex];
      setCurrentNameIndex(nameIndex);
      setCurrentPhase(currentName.isClean ? 0 : 1);
      setIsWriting(true);
      
      // 이름 쓰기 시간
      setTimeout(() => {
        setIsWriting(false);
        nameIndex++;
        
        setTimeout(() => {
          writeNextName();
        }, 500);
      }, currentName.isClean ? 1200 : 1800);
    };
    
    writeNextName();
  };

  useEffect(() => {
    // 모달이 열리면 잠시 후 책을 페이드인
    const bookTimer = setTimeout(() => {
      setShowBook(true);
    }, 500);
    addTimer(bookTimer);
    
    // 책이 나타난 후 덮개 열기
    const coverTimer = setTimeout(() => {
      setCoverOpen(true);
    }, 1200);
    addTimer(coverTimer);
    
    // 덮개가 열린 후 잠깐 기다렸다가 페이지 넘김 시작
    const flipTimer = setTimeout(() => {
      startContinuousFlip();
    }, 2000);
    addTimer(flipTimer);
    
    return () => {
      clearAllTimers();
    };
  }, []);

  return (
    <div className="flex justify-center mb-4">
      {/* 책자 애니메이션 */}
      <div 
        className={`transition-all duration-600 ${showBook ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        style={{ 
          margin: '15px 0 20px 0',
          position: 'relative'
        }}
      >
        <div style={{
          width: '280px',
          height: '175px',
          position: 'relative',
          perspective: '1500px',
          margin: '0 auto',
          background: '#f5f5f5',
          borderRadius: '4px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px #8b2020',
          transformStyle: 'preserve-3d'
        }}>
          
          {/* 책 두께감 표현 */}
          <div style={{
            position: 'absolute',
            bottom: '-3px',
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #8b2020 0%, #c53030 50%, #8b2020 100%)',
            borderRadius: '0 0 4px 4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }} />

          {/* 책 등(spine) 표현 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-2px',
            width: '2px',
            height: '100%',
            background: 'linear-gradient(180deg, #8b2020 0%, #c53030 50%, #8b2020 100%)',
            borderRadius: '2px 0 0 2px',
            boxShadow: '-1px 0 3px rgba(0, 0, 0, 0.2)'
          }} />

          {/* 책 덮개 */}
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)',
            zIndex: 20,
            transform: coverOpen ? 'rotateY(-150deg)' : 'rotateY(0deg)'
          }}>
            {/* 덮개 앞면 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #c53030 0%, #9b2c2c 100%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.1)',
              border: '2px solid #8b2020',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* 책 테두리 금색 장식 */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                bottom: '10px',
                border: '2px solid #d4af37',
                borderRadius: '4px',
                opacity: 0.6
              }} />

              <div style={{
                textAlign: 'center',
                color: '#d4af37',
                padding: '20px',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{
                  fontSize: '32px',
                  marginBottom: '10px',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))'
                }}>💒</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: '0 0 5px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                  fontFamily: 'Georgia, serif'
                }}>Wedding</div>
                <div style={{
                  fontSize: '12px',
                  margin: 0,
                  fontStyle: 'italic',
                  color: '#e5c973',
                  fontFamily: 'Georgia, serif'
                }}>Guest Book</div>
                <div style={{
                  fontSize: '10px',
                  color: '#d4af37',
                  letterSpacing: '4px',
                  marginTop: '15px'
                }}>◆ ◇ ◆</div>
              </div>
            </div>
            
            {/* 덮개 뒷면 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#f8f8f8',
              border: '1px solid #e2e8f0',
              borderRadius: '4px'
            }} />
          </div>

          {/* 왼쪽 고정 페이지 - 빈 페이지에서 시작 */}
          <div style={{
            width: '50%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: currentPage === 0 ? 2 : 0,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px 0 0 4px',
            padding: '20px',
            boxSizing: 'border-box',
            display: currentPage === 0 ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#2d3748',
              lineHeight: '1.4',
              width: '100%'
            }}>
              {/* 고정된 6개 이름 표시 */}
              {startWriting && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '25px',
                  marginTop: '10px',
                  position: 'relative',
                  minHeight: '120px'
                }}>
                  {/* 2개 열 */}
                  {[0, 1].map(colIndex => (
                    <div 
                      key={colIndex}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      {/* 각 열에 3개 이름 */}
                      {names
                        .filter(name => name.position.col === colIndex)
                        .map((name, rowIndex) => {
                          const nameIndex = names.findIndex(n => n === name);
                          const isShown = nameIndex <= currentNameIndex || isWritingComplete;
                          return (
                            <span
                              key={nameIndex}
                              style={{
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                fontSize: '13px',
                                fontWeight: name.isClean ? '500' : '400',
                                color: name.isClean ? '#2d3748' : '#6b7280',
                                minHeight: '42px',
                                display: 'flex',
                                alignItems: 'center',
                                transform: !name.isClean ? 'rotate(-2deg) skew(-3deg)' : 'none',
                                filter: !name.isClean ? 'blur(1px)' : 'none',
                                opacity: isShown ? 0.9 : 0,
                                transition: 'opacity 0.5s ease-in',
                                textAlign: 'center',
                                lineHeight: '1.2'
                              }}
                            >
                              {name.isClean 
                                ? name.text 
                                : name.text
                                    .replace('종', 'ㅗㅇ')
                                    .replace('수', 'ㅅㅜ')
                              }
                            </span>
                          );
                        })}
                    </div>
                  ))}
                </div>
              )}

              {/* 연필 애니메이션 - 간단하게 */}
              {isWriting && currentNameIndex < names.length && (
                <div 
                  className="absolute pointer-events-none z-20 transition-all duration-300"
                  style={{
                    fontSize: '14px',
                    left: `${30 + names[currentNameIndex].position.col * 50}px`,
                    top: `${35 + names[currentNameIndex].position.row * 52}px`,
                    transform: `rotate(${currentPhase === 0 ? 45 : 35}deg)`,
                    filter: 'drop-shadow(1px 1px 3px rgba(0,0,0,0.4))',
                    animation: currentPhase === 0 ? 'pencilWriteClean 1.2s ease-out' : 'pencilWriteMessy 1.8s ease-in-out'
                  }}
                >
                  ✏️
                </div>
              )}
              
            </div>
          </div>

          {/* 페이지들 (기존 애니메이션) */}
          <div style={{
            width: '50%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: '50%',
            transformOrigin: 'left center',
            transition: 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)',
            transformStyle: 'preserve-3d',
            zIndex: 15,
            transform: currentPage >= 1 ? 'rotateY(-180deg)' : 'rotateY(0deg)'
          }}>
            {/* 페이지 앞면 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              backfaceVisibility: 'hidden',
              borderRadius: '0 4px 4px 0',
              padding: '20px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                textAlign: 'center',
                color: '#2d3748',
                lineHeight: '1.4'
              }}>
                {showText && (
                  <>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      margin: '0 0 10px',
                      color: '#1a202c'
                    }}>방명록,<br />이제 간편하게</h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#4a5568',
                      margin: 0
                    }}>종이와 펜은 이제 안녕</p>
                  </>
                )}
              </div>
            </div>
            {/* 페이지 뒷면 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: '#fafafa',
              border: '1px solid #e2e8f0',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: '4px 0 0 4px'
            }} />
          </div>

          {/* 추가 페이지들 (플립 효과용) */}
          {[2, 3, 4, 5, 6, 7, 8].map(pageNum => (
            <div key={pageNum} style={{
              width: '50%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: '50%',
              transformOrigin: 'left center',
              transition: 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)',
              transformStyle: 'preserve-3d',
              zIndex: 15 - pageNum,
              transform: currentPage >= pageNum ? 'rotateY(-180deg)' : 'rotateY(0deg)'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                backfaceVisibility: 'hidden',
                borderRadius: '0 4px 4px 0'
              }} />
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '#fafafa',
                border: '1px solid #e2e8f0',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderRadius: '4px 0 0 4px'
              }} />
            </div>
          ))}
        </div>

        {/* 상태 표시 */}
        {startWriting && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: '600',
              color: currentPhase === 0 ? '#2563eb' : '#dc2626'
            }}>
              {currentPhase === 0 ? '읽기 쉬운 글씨 ✓' : '읽기 어려운 글씨 ⚠️'}
            </div>
          </div>
        )}

        <style jsx>{`
          /* 깔끔한 글씨를 쓸 때 연필 움직임 */
          @keyframes pencilWriteClean {
            0% { 
              transform: rotate(45deg) translateY(-2px);
            }
            50% { 
              transform: rotate(50deg) translateY(2px);
            }
            100% { 
              transform: rotate(45deg) translateY(0px);
            }
          }

          /* 흘려쓴 글씨를 쓸 때 연필 움직임 (더 불안정) */
          @keyframes pencilWriteMessy {
            0% { 
              transform: rotate(35deg) translateY(-1px) translateX(-1px);
            }
            25% { 
              transform: rotate(55deg) translateY(3px) translateX(2px);
            }
            50% { 
              transform: rotate(30deg) translateY(-2px) translateX(-2px);
            }
            75% { 
              transform: rotate(50deg) translateY(2px) translateX(1px);
            }
            100% { 
              transform: rotate(40deg) translateY(1px) translateX(0px);
            }
          }

          /* 텍스트가 나타나는 효과 */
          @keyframes fadeInText {
            from { 
              opacity: 0;
              transform: scale(0.8);
            }
            to { 
              opacity: 1;
              transform: scale(1);
            }
          }

          /* 이름 나타나는 효과 */
          @keyframes fadeInName {
            from { 
              opacity: 0;
              transform: translateY(5px);
            }
            to { 
              opacity: 0.9;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// ArrivalConfirmModal의 진짜 책자 애니메이션
function BookAnimation() {
  const [showBook, setShowBook] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showText, setShowText] = useState(false);
  const timersRef = useRef([]);

  const addTimer = (timer) => {
    timersRef.current.push(timer);
  };

  const clearAllTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  const startContinuousFlip = () => {
    setIsFlipping(true);
    
    // 더 자연스럽고 빠른 연속 페이지 플립 효과 - 후루룩!
    const flipSequence = [1, 2, 3, 4, 5, 6, 7, 8];
    
    flipSequence.forEach((pageNum, index) => {
      const timer = setTimeout(() => {
        setCurrentPage(pageNum);
        
        // 마지막 페이지가 넘어간 후
        if (index === flipSequence.length - 1) {
          const finalTimer = setTimeout(() => {
            setCurrentPage(0); // 첫 페이지로 돌아가기
            setIsFlipping(false);
            setShowText(true);
          }, 300);
          addTimer(finalTimer);
        }
      }, index * 200); // 200ms 간격으로 빠르게 넘김 (후루룩!)
      addTimer(timer);
    });
  };

  useEffect(() => {
    // 모달이 열리면 잠시 후 책을 페이드인
    const bookTimer = setTimeout(() => {
      setShowBook(true);
    }, 500);
    addTimer(bookTimer);
    
    // 책이 나타난 후 덮개 열기
    const coverTimer = setTimeout(() => {
      setCoverOpen(true);
    }, 1200);
    addTimer(coverTimer);
    
    // 덮개가 열린 후 잠깐 기다렸다가 페이지 넘김 시작
    const flipTimer = setTimeout(() => {
      startContinuousFlip();
    }, 2000);
    addTimer(flipTimer);
    
    return () => {
      clearAllTimers();
    };
  }, []);

  return (
    <div className="flex justify-center mb-4">
      {/* 책자 애니메이션 */}
      <div 
        className={`transition-all duration-600 ${showBook ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        style={{ 
          margin: '15px 0 20px 0',
          position: 'relative'
        }}
      >
        <div style={{
          width: '280px',
          height: '175px',
          position: 'relative',
          perspective: '1500px',
          margin: '0 auto',
          background: '#f5f5f5',
          borderRadius: '4px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px #8b2020',
          transformStyle: 'preserve-3d'
        }}>
          
          {/* 책 두께감 표현 */}
          <div style={{
            position: 'absolute',
            bottom: '-3px',
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #8b2020 0%, #c53030 50%, #8b2020 100%)',
            borderRadius: '0 0 4px 4px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }} />

          {/* 책 등(spine) 표현 */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-2px',
            width: '2px',
            height: '100%',
            background: 'linear-gradient(180deg, #8b2020 0%, #c53030 50%, #8b2020 100%)',
            borderRadius: '2px 0 0 2px',
            boxShadow: '-1px 0 3px rgba(0, 0, 0, 0.2)'
          }} />

          {/* 책 덮개 */}
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1)',
            zIndex: 20,
            transform: coverOpen ? 'rotateY(-150deg)' : 'rotateY(0deg)'
          }}>
            {/* 덮개 앞면 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #c53030 0%, #9b2c2c 100%)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 2px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 0 rgba(0, 0, 0, 0.3), inset 2px 0 4px rgba(0, 0, 0, 0.2), inset -2px 0 4px rgba(0, 0, 0, 0.2)',
              border: '2px solid #8b2020',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* 책 테두리 금색 장식 */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                bottom: '10px',
                border: '2px solid #d4af37',
                borderRadius: '4px',
                opacity: 0.6
              }} />
              
              {/* 책 모서리 금색 장식 */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, transparent 40%, #d4af37 40%, #d4af37 60%, transparent 60%)',
                opacity: 0.3
              }} />

              <div style={{
                textAlign: 'center',
                color: '#d4af37',
                padding: '20px',
                position: 'relative',
                zIndex: 2
              }}>
                <div style={{
                  fontSize: '32px',
                  marginBottom: '10px',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))'
                }}>💒</div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: '0 0 5px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.4), 0 0 10px rgba(212, 175, 55, 0.3)',
                  color: '#d4af37',
                  fontFamily: 'Georgia, serif'
                }}>Wedding</div>
                <div style={{
                  fontSize: '12px',
                  margin: 0,
                  fontStyle: 'italic',
                  color: '#e5c973',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  fontFamily: 'Georgia, serif'
                }}>Guest Book</div>
                <div style={{
                  fontSize: '10px',
                  color: '#d4af37',
                  letterSpacing: '4px',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  marginTop: '15px'
                }}>◆ ◇ ◆</div>
              </div>
            </div>
            
            {/* 덮개 뒷면 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: '#f8f8f8',
              border: '1px solid #e2e8f0',
              borderRadius: '4px'
            }} />
          </div>

          {/* 왼쪽 고정 페이지 - 1-1 (첫 번째 장의 왼쪽) */}
          <div style={{
            width: '50%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: currentPage === 0 ? 2 : 0,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px 0 0 4px',
            padding: '20px',
            boxSizing: 'border-box',
            display: currentPage === 0 ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              textAlign: 'center',
              color: '#2d3748',
              lineHeight: '1.4'
            }}>
              {showText && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '15px',
                  marginTop: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#2d3748',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>김민수</span>
                    <span style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#2d3748',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>이지영</span>
                    <span style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#2d3748',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>박정우</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#2d3748',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>최수연</span>
                    <span style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#2d3748',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>정현민</span>
                    <span style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#2d3748',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>한소희</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 페이지 1 */}
          <div style={{
            width: '50%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: '50%',
            transformOrigin: 'left center',
            transition: 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)',
            transformStyle: 'preserve-3d',
            zIndex: 15,
            transform: currentPage >= 1 ? 'rotateY(-180deg)' : 'rotateY(0deg)'
          }}>
            {/* 페이지 앞면 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              backfaceVisibility: 'hidden',
              overflow: 'hidden',
              padding: '20px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0 4px 4px 0',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                textAlign: 'center',
                color: '#2d3748',
                lineHeight: '1.4'
              }}>
                {showText && (
                  <>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      margin: '0 0 10px',
                      color: '#1a202c'
                    }}>방명록,<br />이제 간편하게</h3>
                    <p style={{
                      fontSize: '13px',
                      color: '#4a5568',
                      margin: 0,
                      lineHeight: '1.5'
                    }}>종이와 펜은 이제 안녕</p>
                  </>
                )}
              </div>
            </div>
            {/* 페이지 뒷면 */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: '#fafafa',
              border: '1px solid #e2e8f0',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: '4px 0 0 4px',
              padding: '20px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                textAlign: 'center',
                color: '#2d3748',
                lineHeight: '1.4'
              }}>
                {/* 2-1: 두 번째 장의 왼쪽 */}
                {showText && currentPage === 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                    marginTop: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#2d3748',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>조현우</span>
                      <span style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#2d3748',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>신예은</span>
                      <span style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#2d3748',
                        minHeight: '40px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>김태현</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 추가 페이지들 (연속으로 넘어가는 여러 페이지들 - 후루룩 효과!) */}
          {[2, 3, 4, 5, 6, 7, 8].map(pageNum => (
            <div key={pageNum} style={{
              width: '50%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: '50%',
              transformOrigin: 'left center',
              transition: 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1)',
              transformStyle: 'preserve-3d',
              zIndex: 15 - pageNum,
              transform: currentPage >= pageNum ? 'rotateY(-180deg)' : 'rotateY(0deg)'
            }}>
              {/* 페이지 앞면 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                backfaceVisibility: 'hidden',
                overflow: 'hidden',
                padding: '20px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0 4px 4px 0',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)'
              }}>
                <div style={{
                  textAlign: 'center',
                  color: '#2d3748',
                  lineHeight: '1.4'
                }}>
                  {/* 빈 페이지 */}
                </div>
              </div>
              {/* 페이지 뒷면 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '#fafafa',
                border: '1px solid #e2e8f0',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderRadius: '4px 0 0 4px',
                padding: '20px',
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  textAlign: 'center',
                  color: '#2d3748',
                  lineHeight: '1.4'
                }}>
                  {/* 빈 페이지 */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function HomePage() {
  const router = useRouter();
  const [eventId, setEventId] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleDirectAccess = () => {
    if (eventId.trim()) {
      router.push(`/contribute/${eventId.trim()}`);
    }
  };


  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>정담 - 디지털 경조사 관리 서비스</title>
        <meta
          name="description"
          content="종이 방명록을 디지털로! QR코드로 간편하게 부조하고 실시간으로 관리하는 스마트 경조사 시스템"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* X-Frame-Bypass 스크립트 - Next.js Script 사용 */}
      <Script
        src="https://unpkg.com/x-frame-bypass"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('X-Frame-Bypass loaded');
        }}
      />

      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-1 md:py-2 flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/jeongdamlogo.png" 
                alt="정담 로고" 
                className="h-20 md:h-28 lg:h-32 object-contain"
              />
            </div>
            
            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600">기능</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600">사용법</a>
              <a href="#templates" className="text-gray-600 hover:text-blue-600">템플릿</a>
              <a href="#download" className="text-gray-600 hover:text-blue-600">앱 다운로드</a>
            </div>
            
            {/* 모바일 햄버거 버튼 */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all duration-200 shadow-sm"
            >
              <svg 
                className={`w-6 h-6 text-gray-700 hover:text-blue-600 transform transition-all duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* 모바일 메뉴 */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
              <div className="px-4 py-3 space-y-3">
                <a 
                  href="#features" 
                  className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  기능
                </a>
                <a 
                  href="#how-it-works" 
                  className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  사용법
                </a>
                <a 
                  href="#templates" 
                  className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  템플릿
                </a>
                <a 
                  href="#download" 
                  className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  앱 다운로드
                </a>
              </div>
            </div>
          )}
        </header>

        {/* 히어로 섹션 */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 md:py-20 relative overflow-hidden">
          {/* 배경 장식 요소들 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-0 md:px-4 relative">
            {/* 모바일 전용 버전 */}
            <div className="block md:hidden text-center pt-8 pb-2">
              {/* 배지 */}
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-3 shadow-sm">
                🔥 7초만에 이해하는 디지털 부조 시스템
              </div>
              
              {/* 메인 타이틀 */}
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                디지털 경조사 관리<br />
                <span className="text-blue-600 relative">
                  정담
                  <div className="absolute -bottom-2 left-0 w-full h-3 bg-blue-200/50 -z-10 rounded"></div>
                </span>
              </h1>
              
              {/* 서브텍스트 */}
              <p className="text-lg text-gray-600 mb-4 px-4 leading-relaxed">
                <span className="font-semibold text-gray-900">QR 스캔 → 디지털 방명록 → 실시간 관리</span><br />
                결혼식·장례식이 이렇게 간편할 줄이야! 
              </p>

              {/* 아이폰 프레임 - 모바일용 (더 큰 크기) */}
              <div className="relative mb-2 flex justify-center items-center w-full">
                <div className="relative w-[95vw] h-[75vh] drop-shadow-2xl -mt-28">
                  <img 
                    src="/iphone16pro.png" 
                    alt="iPhone Frame"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                  />

                  {/* 아이폰 화면 안 미리보기 컨텐츠 */}
                  <div className="absolute inset-0 flex items-center justify-center z-5">
                    <div className="w-[45%] h-[55%] rounded-[25px] overflow-hidden bg-white shadow-inner">
                      <div className="w-full h-full bg-white flex flex-col items-center justify-center p-2">
                        <div className="w-6 h-6 rounded-full bg-pink-200 flex items-center justify-center mb-1">
                          <span className="text-xs">💕</span>
                        </div>
                        <div className="text-center">
                          <div className="text-[8px] font-bold text-gray-800 mb-0.5">지현 ♥ 태준</div>
                          <div className="text-[6px] text-gray-600 mb-0.5">2024년 12월 15일</div>
                          <div className="text-[5px] text-gray-500">서울 강남구 웨딩홀</div>
                        </div>
                        <div className="mt-1 w-4 h-2 bg-pink-100 rounded-sm flex items-center justify-center">
                          <span className="text-[4px] text-pink-600">💒</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 플로팅 알림들 */}
                  <div className="absolute top-60 left-8 animate-float z-50">
                    <div className="bg-white rounded-xl p-3 shadow-xl border border-gray-100 max-w-[140px]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-900 truncate">김민수님</div>
                          <div className="text-xs text-gray-500">축의금 10만원</div>
                        </div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-64 right-8 z-50">
                    <div className="bg-white rounded-xl p-3 shadow-xl border border-gray-100 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-gray-900">최효정님</div>
                          <div className="text-xs text-gray-500">축의금 10만원</div>
                        </div>
                        <div className="text-sm font-bold text-blue-600">12명</div>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                  </div>

                  {/* 하단 기능 태그들 */}
                  <div className="relative z-10 mt-28 flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                      ⚡ 실시간 알림
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                      📱 모바일 최적화
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">
                      🔒 안전한 관리
                    </span>
                  </div>
                </div>
              </div>

              {/* 리뷰 카드들 - 아이폰 아래 */}
              <div className="flex flex-col items-center gap-3 px-4 -mt-36">
                <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 w-full max-w-[320px]">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face&auto=format" 
                      alt="박지영님 프로필" 
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-gray-900">박지영</div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-yellow-400 text-xs">★★★★★</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        "정말 편리해요! QR코드로 간편하게 축의금 받고 관리도 쉬워요"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100 w-full max-w-[320px]">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face&auto=format" 
                      alt="이준호님 프로필" 
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-xs font-semibold text-gray-900">이준호</div>
                        <div className="flex items-center gap-0.5">
                          <span className="text-yellow-400 text-xs">★★★★★</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        "종이 방명록 정리 고민이 사라졌어요. 모든 게 자동으로!"
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 무료 앱 다운로드 버튼 */}
              <div className="flex justify-center px-4 mt-10 mb-8">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-sm shadow-lg transition-colors duration-200 w-full max-w-[320px]">
                  무료 앱 다운로드
                </button>
              </div>

            </div>

            {/* 데스크톱/태블릿 버전 (기존) */}
            <div className="hidden md:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* 왼쪽 텍스트 */}
              <div className="text-center lg:text-left md:max-w-lg md:mx-auto lg:max-w-none lg:mx-0 relative z-10">
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 shadow-sm">
                  🔥 7초만에 이해하는 디지털 부조 시스템
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  종이 방명록은<br />
                  <span className="text-blue-600 relative">
                    이제 안녕!
                    <div className="absolute -bottom-2 left-0 w-full h-3 bg-blue-200/50 -z-10 rounded"></div>
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                  <span className="font-semibold text-gray-900">QR 스캔 → 디지털 방명록 → 실시간 관리</span><br />
                  결혼식·장례식이 이렇게 간편할 줄이야! 
                </p>
                
                {/* 핵심 가치 제안 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 mb-8 border border-gray-100 shadow-xl">
                  <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
                    <div className="group">
                      <div className="relative mb-3 md:mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl md:rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <div className="text-white text-lg md:text-2xl font-bold">01</div>
                        </div>
                        <div className="absolute -inset-2 bg-blue-500/10 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2">간편한 접속</h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">QR코드 스캔으로<br/>종이 방명록 완전 대체</p>
                    </div>
                    
                    <div className="group">
                      <div className="relative mb-3 md:mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl md:rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <div className="text-white text-lg md:text-2xl font-bold">02</div>
                        </div>
                        <div className="absolute -inset-2 bg-emerald-500/10 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2">실시간 확인</h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">축의금·조의금 입금<br/>즉시 알림으로 확인</p>
                    </div>
                    
                    <div className="group">
                      <div className="relative mb-3 md:mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl md:rounded-2xl mx-auto flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <div className="text-white text-lg md:text-2xl font-bold">03</div>
                        </div>
                        <div className="absolute -inset-2 bg-violet-500/10 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-1 md:mb-2">완벽 관리</h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-relaxed">자동 정리된 명단과<br/>통계로 한눈에 관리</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-center lg:justify-start mb-8">
                  <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                    무료 앱 다운로드
                  </button>
                  <button 
                    onClick={() => window.open('https://contribution-web-srgt.vercel.app/template/603dfb2e-707b-420b-afc9-406c9775a0ee?template=romantic', '_blank')}
                    className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all duration-300 border-2 border-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    실제 템플릿 체험
                  </button>
                </div>
                
                <div className="flex items-center justify-center md:justify-center lg:justify-start gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    무료 다운로드
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    1분 설치
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    즉시 사용 가능
                  </div>
                </div>
                
                {/* 사용자 리뷰 슬라이드 */}
                <div className="space-y-4 mb-8">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face&auto=format" 
                        alt="김○○님 프로필" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-gray-700 mb-2">"진짜 편해요! 이제 방명록 관리 스트레스 없어졌어요. 축의금도 실시간으로 확인되고 정말 혁신적이에요!"</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                            <span className="text-sm text-gray-600 font-medium">김○○님 (결혼식)</span>
                          </div>
                          <span className="text-xs text-gray-400">2024.08.15</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">박</div>
                      <div className="flex-1">
                        <p className="text-gray-700 mb-2">"장례식 때 사용했는데 정말 간편하고 조문객분들도 편리해하셨어요. 감사합니다."</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-yellow-400">⭐⭐⭐⭐⭐</div>
                            <span className="text-sm text-gray-600 font-medium">박○○님 (장례식)</span>
                          </div>
                          <span className="text-xs text-gray-400">2024.08.10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* 오른쪽 템플릿 미리보기 */}
              <div className="relative lg:ml-8">
                {/* 메인 시연 컨테이너 */}
                <div className="relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-2xl border border-gray-100 max-w-2xl mx-auto">
                  {/* 배경 장식 요소 */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    <div className="absolute -top-6 -right-6 w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-blue-200/20 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-6 -left-6 w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-purple-200/20 rounded-full blur-xl"></div>
                  </div>

                  {/* 상단 제목 */}
                  <div className="relative z-10 text-center mb-6">
                    <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                      💫 실제 작동 중
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">디지털 청첩장 미리보기</h3>
                    <p className="text-sm text-gray-600 mt-1">지금 바로 체험해보세요</p>
                  </div>

                {/* iPhone 프레임 컨테이너 */}
                <div className="relative z-10">
                  {/* iPhone 프레임 */}
                  <div className="relative mx-auto w-[240px] h-[480px] sm:w-[260px] sm:h-[520px] md:w-[280px] md:h-[560px] lg:w-[380px] lg:h-[760px] xl:w-[480px] xl:h-[960px] drop-shadow-2xl">
                    <img 
                      src="/iphone16pro.png" 
                      alt="iPhone Frame"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10"
                    />

                    {/* 실제 템플릿을 iframe으로 표시할 화면 영역 */}
                    <div 
                      className="absolute cursor-pointer group iframe-container-mobile md:iframe-container-desktop z-5"
                      onClick={() => window.open('https://contribution-web-srgt.vercel.app/template/603dfb2e-707b-420b-afc9-406c9775a0ee?template=romantic', '_blank')}
                    >
                      {/* 호버 오버레이 */}
                      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center rounded-[30px]">
                        <div className="bg-white/90 rounded-full p-2 shadow-lg">
                          <svg className="w-4 h-4 md:w-5 md:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>

                      {/* 실제 템플릿 iframe */}
                      <iframe 
                        src="https://contribution-web-srgt.vercel.app/template/603dfb2e-707b-420b-afc9-406c9775a0ee?template=romantic"
                        className="w-full h-full border-0"
                        style={{
                          transform: 'scale(1.0)',
                          transformOrigin: 'top center',
                          width: '100%',
                          height: '100%'
                        }}
                        title="Wedding Template Preview"
                        scrolling="no"
                        sandbox="allow-scripts allow-same-origin"
                        onError={() => {
                          console.log('iframe load error');
                        }}
                      />
                    </div>

                    {/* 플로팅 알림들 - iPhone 프레임에 상대적으로 위치 */}
                    <div className="absolute top-16 -left-1 md:-left-2 lg:-left-4 animate-float z-50">
                      <div className="bg-white rounded-xl p-3 shadow-xl border border-gray-100 max-w-[140px]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">김민수님</div>
                            <div className="text-xs text-gray-500">축의금 10만원</div>
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                    </div>

                    <div className="absolute bottom-16 -right-1 md:-right-2 lg:-right-4 z-50">
                      <div className="bg-white rounded-xl p-3 shadow-xl border border-gray-100 min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900">김민수님</div>
                            <div className="text-xs text-gray-500">축의금 10만원</div>
                          </div>
                          <div className="text-sm font-bold text-blue-600">12명</div>
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                      </div>
                    </div>
                  </div>
                </div>

                  {/* 하단 기능 태그들 */}
                  <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                      ⚡ 실시간 알림
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                      📱 모바일 최적화
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">
                      🔒 안전한 관리
                    </span>
                  </div>
                </div>

                {/* 하단 설명 텍스트 */}
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">실제 작동하는 템플릿을 클릭해서 체험해보세요</p>
                </div>

                {/* CSS 애니메이션 및 반응형 스타일 추가 */}
                <style jsx>{`
                  @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                  }
                  .animate-float {
                    animation: float 3s ease-in-out infinite;
                  }
                  .iframe-container-mobile {
                    top: 45px;
                    left: 30px;
                    right: 30px;
                    bottom: 45px;
                    border-radius: 30px;
                    overflow: hidden;
                    z-index: 5;
                    background-color: #f5f5f5;
                  }
                  @media (min-width: 768px) {
                    .iframe-container-desktop {
                      top: 60px !important;
                      left: 38px !important;
                      right: 38px !important;
                      bottom: 60px !important;
                      border-radius: 28px !important;
                    }
                  }
                `}</style>

              </div>
            </div>
          </div>
        </section>

        {/* 문제점 제시 */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">이런 불편함 겪어보셨죠?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                <BookAnimation />
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">종이 방명록 분실</h3>
                <p className="text-sm md:text-base text-gray-600">소중한 축의금 기록이 담긴 방명록을 잃어버리는 불상사...</p>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                <HandwritingAnimation />
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">손글씨 해독의 어려움</h3>
                <p className="text-sm md:text-base text-gray-600">알아보기 힘든 손글씨로 나중에 정리할 때 스트레스...</p>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">💸</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">부조금 계산 실수</h3>
                <p className="text-sm md:text-base text-gray-600">현금 관리와 수동 계산으로 인한 누락이나 착오...</p>
              </div>
            </div>
          </div>
        </section>

        {/* 솔루션 소개 */}
        <section className="py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">정담이 모든 걸 해결해드립니다</h2>
              <p className="text-lg md:text-xl text-gray-600">모바일 앱 + 웹 페이지로 완벽한 디지털 경조사 관리</p>
            </div>
            
            {/* 앱 + 웹 연동 설명 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl mb-8 md:mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">📱 모바일 앱 (주최자용)</h3>
                  <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
                    <li className="flex items-center"><span className="text-blue-600 mr-2 text-sm">✓</span> 청첩장/부고장 제작</li>
                    <li className="flex items-center"><span className="text-blue-600 mr-2 text-sm">✓</span> QR코드 생성</li>
                    <li className="flex items-center"><span className="text-blue-600 mr-2 text-sm">✓</span> 실시간 부조금 확인</li>
                    <li className="flex items-center"><span className="text-blue-600 mr-2 text-sm">✓</span> 참석자 관리</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">💻 웹 페이지 (참석자용)</h3>
                  <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
                    <li className="flex items-center"><span className="text-green-600 mr-2 text-sm">✓</span> QR코드로 접속</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2 text-sm">✓</span> 온라인 방명록 작성</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2 text-sm">✓</span> 부조금 기록</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2 text-sm">✓</span> 축하 메시지 남기기</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 사용 방법 */}
        <section id="how-it-works" className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">이렇게 간단합니다</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">1. 앱에서 행사 생성</h3>
                <p className="text-gray-600 text-xs md:text-sm px-2">결혼식/장례식 정보를 입력하고 예쁜 템플릿 선택</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">📷</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">2. QR코드 생성</h3>
                <p className="text-gray-600 text-xs md:text-sm px-2">행사장에 QR코드를 출력해서 게시</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">💝</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">3. 참석자가 QR 스캔</h3>
                <p className="text-gray-600 text-xs md:text-sm px-2">휴대폰으로 스캔하면 웹 방명록으로 이동</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">4. 실시간 확인</h3>
                <p className="text-gray-600 text-xs md:text-sm px-2">앱에서 부조금과 방명록을 실시간 확인</p>
              </div>
            </div>
          </div>
        </section>

        {/* 주요 기능 */}
        <section id="features" className="py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">핵심 기능들</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎨</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">다양한 템플릿</h3>
                <p className="text-sm md:text-base text-gray-700">결혼식 5종, 장례식 1종의 세련된 디자인 템플릿</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">⚡</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">실시간 동기화</h3>
                <p className="text-sm md:text-base text-gray-700">웹에서 입력된 정보가 앱으로 즉시 전송</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">🔒</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">안전한 관리</h3>
                <p className="text-sm md:text-base text-gray-700">클라우드 저장으로 데이터 분실 걱정 없음</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">📱</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">모바일 최적화</h3>
                <p className="text-sm md:text-base text-gray-700">참석자들이 쉽게 사용할 수 있는 모바일 친화적 설계</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">💳</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">간편한 부조</h3>
                <p className="text-sm md:text-base text-gray-700">이름과 금액만 입력하면 자동으로 기록</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">📊</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">통계 및 분석</h3>
                <p className="text-sm md:text-base text-gray-700">총 부조금액, 참석자 수 등 한눈에 파악</p>
              </div>
            </div>
          </div>
        </section>

        {/* 실제 템플릿 미리보기 */}
        <section id="templates" className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                🎨 실제 서비스 템플릿
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">바로 사용 가능한 템플릿들</h2>
              <p className="text-lg md:text-xl text-gray-600">클릭하면 실제 템플릿 페이지를 체험해볼 수 있어요</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* 로맨틱 핑크 템플릿 */}
              <div className="group cursor-pointer" onClick={() => window.open('https://contribution-web-srgt.vercel.app/template/603dfb2e-707b-420b-afc9-406c9775a0ee?template=romantic', '_blank')}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-80 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                    {/* 실제 템플릿 미리보기 목업 */}
                    <div className="bg-white rounded-xl shadow-2xl p-4 max-w-48">
                      <div className="text-center">
                        <div className="text-2xl mb-2">💒</div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">김민호 ♥ 이지은</h4>
                        <p className="text-xs text-gray-600 mb-3">2025년 3월 15일</p>
                        <div className="bg-gray-100 rounded p-2 mb-3">
                          <div className="w-12 h-12 bg-gray-300 rounded mx-auto flex items-center justify-center">
                            <span className="text-xs">QR</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">스캔하여 참여</p>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-pink-50 rounded p-1 text-xs">
                            💝 부조금 기록하기
                          </div>
                          <div className="bg-blue-50 rounded p-1 text-xs">
                            💌 축하메시지 남기기
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      REAL
                    </div>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      실제 링크
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">로맨틱 핑크</h3>
                    <p className="text-gray-600 text-sm mb-3">부드러운 핑크 톤의 로맨틱한 결혼식 템플릿</p>
                    <div className="flex items-center justify-between">
                      <span className="text-pink-600 text-sm font-semibold">👆 실제 템플릿 체험</span>
                      <span className="text-xs text-gray-400 group-hover:text-pink-600">→ LIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모던 미니멀 템플릿 */}
              <div className="group cursor-pointer opacity-75" onClick={() => alert('곧 제공될 예정입니다!')}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative h-80 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl p-4 max-w-48">
                      <div className="text-center">
                        <div className="text-2xl mb-2">💍</div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">박준혁 ♥ 최서연</h4>
                        <p className="text-xs text-gray-600 mb-3">2025년 5월 24일</p>
                        <div className="bg-gray-100 rounded p-2 mb-3">
                          <div className="w-12 h-12 bg-gray-300 rounded mx-auto flex items-center justify-center">
                            <span className="text-xs">QR</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">스캔하여 참여</p>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-blue-50 rounded p-1 text-xs">
                            💝 부조금 기록하기
                          </div>
                          <div className="bg-indigo-50 rounded p-1 text-xs">
                            💌 축하메시지 남기기
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      SOON
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">모던 미니멀</h3>
                    <p className="text-gray-600 text-sm mb-3">깔끔하고 세련된 모던 스타일 템플릿</p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 text-sm font-semibold">곧 제공 예정</span>
                      <span className="text-xs text-gray-400">→ COMING</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 장례식 템플릿 */}
              <div className="group cursor-pointer opacity-75" onClick={() => alert('곧 제공될 예정입니다!')}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl p-4 max-w-48">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🕊️</div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">고 김영호 님</h4>
                        <p className="text-xs text-gray-600 mb-3">향년 75세</p>
                        <div className="bg-gray-100 rounded p-2 mb-3">
                          <div className="w-12 h-12 bg-gray-300 rounded mx-auto flex items-center justify-center">
                            <span className="text-xs">QR</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">스캔하여 참여</p>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-gray-50 rounded p-1 text-xs">
                            🙏 조의금 기록하기
                          </div>
                          <div className="bg-gray-50 rounded p-1 text-xs">
                            💐 추모메시지 남기기
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      SOON
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">장례식 추모</h3>
                    <p className="text-gray-600 text-sm mb-3">정중하고 따뜻한 추모 템플릿</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm font-semibold">곧 제공 예정</span>
                      <span className="text-xs text-gray-400">→ COMING</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">💡 위 템플릿들은 실제 서비스에서 사용 중인 라이브 템플릿입니다</p>
              <div className="inline-flex items-center bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-sm">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                실시간으로 부조금과 메시지가 업데이트됩니다
              </div>
            </div>
          </div>
        </section>

        {/* 데모 체험 */}
        <section id="demo" className="py-12 md:py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">바로 체험해보세요</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 px-2">QR코드가 없어도 경조사 ID로 직접 접속 가능합니다</p>
            
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 max-w-md mx-auto">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">경조사 ID로 체험하기</h3>
              <div className="space-y-3 md:space-y-4">
                <input
                  type="text"
                  value={eventId}
                  onChange={e => setEventId(e.target.value)}
                  placeholder="경조사 ID를 입력해주세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  onKeyPress={e => e.key === 'Enter' && handleDirectAccess()}
                />
                <button
                  onClick={handleDirectAccess}
                  disabled={!eventId.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 text-sm md:text-base"
                >
                  체험하러 가기
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 앱 다운로드 */}
        <section id="download" className="py-12 md:py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">지금 바로 시작하세요</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90 px-2">정담 앱을 다운로드하고 첫 번째 디지털 경조사를 만들어보세요</p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center px-4">
              <button className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center text-sm md:text-base">
                <span className="mr-2">📱</span> App Store에서 다운로드
              </button>
              <button className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center text-sm md:text-base">
                <span className="mr-2">🤖</span> Google Play에서 다운로드
              </button>
            </div>
          </div>
        </section>


        {/* 푸터 */}
        <footer className="bg-gray-900 text-white py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="col-span-2 md:col-span-1">
                <p className="text-gray-400 text-sm md:text-base">디지털 경조사 관리의 새로운 표준</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">서비스</h4>
                <ul className="space-y-1 md:space-y-2 text-gray-400 text-xs md:text-sm">
                  <li>모바일 청첩장</li>
                  <li>디지털 방명록</li>
                  <li>부조금 관리</li>
                  <li>QR코드 생성</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">지원</h4>
                <ul className="space-y-1 md:space-y-2 text-gray-400 text-xs md:text-sm">
                  <li>사용법 가이드</li>
                  <li>자주 묻는 질문</li>
                  <li>고객센터</li>
                  <li>피드백</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">회사</h4>
                <ul className="space-y-1 md:space-y-2 text-gray-400 text-xs md:text-sm">
                  <li>이용약관</li>
                  <li>개인정보처리방침</li>
                  <li>회사소개</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
              <p className="text-xs md:text-sm">&copy; 2025 정담. 모든 권리 보유.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}