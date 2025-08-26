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
  const [iframeError, setIframeError] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const handleDirectAccess = () => {
    if (eventId.trim()) {
      router.push(`/contribute/${eventId.trim()}`);
    }
  };

  // iframe 로드 실패 시 스크린샷 불러오기
  const handleIframeError = async () => {
    try {
      const templateUrl = 'https://contribution-web-srgt.vercel.app/template/c3798b4a-1d11-4cf7-b4ae-aa3150de585f?template=romantic';
      const response = await fetch(`/api/screenshot?url=${encodeURIComponent(templateUrl)}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const screenshotUrl = URL.createObjectURL(blob);
        setScreenshotUrl(screenshotUrl);
        setIframeError(true);
      }
    } catch (error) {
      console.error('Screenshot fallback failed:', error);
      setIframeError(true);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    setIframeError(true);
    
    // 실제 템플릿의 정적 미리보기 이미지 사용
    // 또는 간단한 HTML 템플릿을 직접 생성
    setScreenshotUrl(null);
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
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💎</span>
              <span className="text-xl font-bold text-gray-900">정담</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600">기능</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600">사용법</a>
              <a href="#templates" className="text-gray-600 hover:text-blue-600">템플릿</a>
              <a href="#download" className="text-gray-600 hover:text-blue-600">앱 다운로드</a>
            </div>
          </div>
        </header>

        {/* 히어로 섹션 */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* 왼쪽 텍스트 */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  🔥 7초만에 이해하는 디지털 부조 시스템
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                  종이 방명록은<br />
                  <span className="text-blue-600">이제 안녕!</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                  <span className="font-semibold text-gray-900">QR 스캔 → 디지털 방명록 → 실시간 관리</span><br />
                  결혼식·장례식이 이렇게 간편할 줄이야! 
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg">
                    📱 무료 앱 다운로드
                  </button>
                  <button 
                    onClick={() => window.open('https://contribution-web-srgt.vercel.app/template/c3798b4a-1d11-4cf7-b4ae-aa3150de585f?template=romantic', '_blank')}
                    className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-blue-200"
                  >
                    🚀 실제 템플릿 체험
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    무료 다운로드
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    1분 설치
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    즉시 사용 가능
                  </div>
                </div>
              </div>
              
              {/* 오른쪽 템플릿 미리보기 */}
              <div className="relative">
                {/* 정교한 iPhone 14 Pro 프레임 */}
                <div className="relative mx-auto" style={{ width: '300px', height: '610px' }}>
                  {/* iPhone 외곽 프레임 */}
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(145deg, #1c1c1e 0%, #2c2c2e  50%, #1c1c1e 100%)',
                    borderRadius: '50px',
                    boxShadow: `
                      0 0 0 3px #3a3a3c,
                      0 0 20px rgba(0, 0, 0, 0.6),
                      0 30px 60px rgba(0, 0, 0, 0.4),
                      inset 0 1px 2px rgba(255, 255, 255, 0.1),
                      inset 0 -1px 2px rgba(0, 0, 0, 0.3)
                    `
                  }}>
                    {/* 측면 버튼들 */}
                    <div className="absolute left-[-2px] top-[120px] w-1 h-[32px] bg-gray-600 rounded-l-sm"></div>
                    <div className="absolute left-[-2px] top-[170px] w-1 h-[50px] bg-gray-600 rounded-l-sm"></div>
                    <div className="absolute left-[-2px] top-[235px] w-1 h-[50px] bg-gray-600 rounded-l-sm"></div>
                    <div className="absolute right-[-2px] top-[180px] w-1 h-[70px] bg-gray-600 rounded-r-sm"></div>
                  </div>

                  {/* 화면 영역 */}
                  <div 
                    className="absolute bg-black"
                    style={{
                      top: '12px',
                      left: '12px',
                      right: '12px',
                      bottom: '12px',
                      borderRadius: '38px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Dynamic Island */}
                    <div 
                      className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black z-10"
                      style={{
                        width: '110px',
                        height: '30px',
                        borderRadius: '20px',
                        background: 'linear-gradient(145deg, #000 0%, #1a1a1a 100%)',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                      }}
                    ></div>

                    {/* 화면 내용 - 실제 템플릿 모양의 미리보기 */}
                    <div 
                      className="absolute inset-0 overflow-hidden cursor-pointer"
                      style={{ 
                        marginTop: '35px',
                        borderRadius: '0 0 32px 32px',
                        backgroundColor: '#fff'
                      }}
                      onClick={() => window.open('https://contribution-web-srgt.vercel.app/template/c3798b4a-1d11-4cf7-b4ae-aa3150de585f?template=romantic', '_blank')}
                    >
                      {/* 실제 템플릿과 유사한 디자인 */}
                      <div className="w-full h-full" style={{ 
                        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)',
                        transform: 'scale(0.9)',
                        transformOrigin: 'top center'
                      }}>
                        {/* 상단 장식 */}
                        <div style={{
                          height: '60px',
                          background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), transparent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: '#f472b6'
                        }}>
                          ✿ WEDDING INVITATION ✿
                        </div>

                        {/* 메인 컨텐츠 */}
                        <div style={{
                          padding: '15px',
                          textAlign: 'center'
                        }}>
                          {/* 이모지와 제목 */}
                          <div style={{ fontSize: '28px', marginBottom: '10px' }}>💒</div>
                          
                          {/* 신랑신부 이름 */}
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#1f2937',
                            marginBottom: '5px'
                          }}>
                            김민호 ♥ 이지은
                          </div>
                          
                          {/* 날짜 */}
                          <div style={{
                            fontSize: '11px',
                            color: '#6b7280',
                            marginBottom: '15px'
                          }}>
                            2025년 3월 15일 토요일 오후 2시<br/>
                            그랜드하얏트 서울
                          </div>
                          
                          {/* 사진 영역 */}
                          <div style={{
                            width: '120px',
                            height: '80px',
                            background: 'linear-gradient(45deg, #fbbf24, #f472b6)',
                            borderRadius: '10px',
                            margin: '0 auto 15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            opacity: 0.8
                          }}>
                            👰🤵
                          </div>

                          {/* 인사말 */}
                          <div style={{
                            fontSize: '10px',
                            color: '#4b5563',
                            lineHeight: '1.4',
                            marginBottom: '15px',
                            padding: '0 10px'
                          }}>
                            서로가 마주보며 다져온 사랑을<br/>
                            이제 함께 한 곳을 바라보며<br/>
                            걸어갈 수 있는 큰 사랑으로<br/>
                            키우고자 합니다
                          </div>
                          
                          {/* QR 코드 영역 */}
                          <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '10px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            width: '110px',
                            margin: '0 auto 15px'
                          }}>
                            <div style={{
                              width: '60px',
                              height: '60px',
                              background: '#1f2937',
                              borderRadius: '8px',
                              margin: '0 auto 5px',
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                position: 'absolute',
                                top: '5px',
                                left: '5px',
                                right: '5px',
                                bottom: '5px',
                                background: 'white',
                                borderRadius: '4px',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '2px',
                                padding: '4px'
                              }}>
                                <div style={{ background: '#1f2937', borderRadius: '1px' }}></div>
                                <div style={{ background: 'white', borderRadius: '1px' }}></div>
                                <div style={{ background: '#1f2937', borderRadius: '1px' }}></div>
                                <div style={{ background: 'white', borderRadius: '1px' }}></div>
                                <div style={{ background: '#1f2937', borderRadius: '1px' }}></div>
                                <div style={{ background: 'white', borderRadius: '1px' }}></div>
                                <div style={{ background: '#1f2937', borderRadius: '1px' }}></div>
                                <div style={{ background: 'white', borderRadius: '1px' }}></div>
                                <div style={{ background: '#1f2937', borderRadius: '1px' }}></div>
                              </div>
                            </div>
                            <div style={{ fontSize: '9px', color: '#6b7280' }}>
                              QR 스캔하여 축하하기
                            </div>
                          </div>

                          {/* 버튼들 */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 20px' }}>
                            <div style={{
                              background: 'linear-gradient(135deg, #f472b6, #ec4899)',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
                            }}>
                              💝 축하 마음 전하기
                            </div>
                            <div style={{
                              background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                            }}>
                              💌 축하 메시지 남기기
                            </div>
                          </div>
                        </div>

                        {/* 하단 장식 */}
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: 0,
                          right: 0,
                          textAlign: 'center',
                          fontSize: '9px',
                          color: '#f472b6',
                          opacity: 0.6
                        }}>
                          Made with ❤️ 정담
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg z-20">
                  LIVE
                </div>
                <div className="absolute -bottom-3 -left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-20">
                  🎯 실제 템플릿
                </div>
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
              <div className="group cursor-pointer" onClick={() => window.open('https://contribution-web-srgt.vercel.app/template/c3798b4a-1d11-4cf7-b4ae-aa3150de585f?template=romantic', '_blank')}>
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
                <div className="flex items-center space-x-2 mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">💎</span>
                  <span className="text-lg md:text-xl font-bold">정담</span>
                </div>
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