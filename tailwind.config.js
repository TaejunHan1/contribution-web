/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        // 토스 컬러 시스템
        colors: {
          // 메인 컬러
          primary: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#3182F6',
            600: '#2171E5',
            700: '#1D4ED8',
            800: '#1E40AF',
            900: '#1E3A8A',
          },
          
          // 그레이스케일
          gray: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
          },
          
          // 상태 컬러
          success: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B',
          },
          
          warning: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
          },
          
          error: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#EF4444',
            600: '#DC2626',
            700: '#B91C1C',
            800: '#991B1B',
            900: '#7F1D1D',
          },
          
          // 경조사 타입별 컬러
          wedding: {
            50: '#FDF2F8',
            100: '#FCE7F3',
            200: '#FBCFE8',
            300: '#F9A8D4',
            400: '#F472B6',
            500: '#EC4899',
            600: '#DB2777',
            700: '#BE185D',
            800: '#9D174D',
            900: '#831843',
          },
          
          funeral: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
          
          celebration: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706',
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
          },
        },
        
        // 폰트
        fontFamily: {
          sans: [
            'Pretendard',
            '-apple-system',
            'BlinkMacSystemFont',
            'system-ui',
            'Roboto',
            'Helvetica Neue',
            'Segoe UI',
            'Apple SD Gothic Neo',
            'Noto Sans KR',
            'Malgun Gothic',
            'sans-serif',
          ],
        },
        
        // 폰트 크기 (토스 스타일)
        fontSize: {
          'display-1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
          'display-2': ['2rem', { lineHeight: '1.25', fontWeight: '700', letterSpacing: '-0.01em' }],
          'title-1': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
          'title-2': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
          'title-3': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
          'body-1': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
          'body-2': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
          'caption-1': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
          'caption-2': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }],
        },
        
        // 간격
        spacing: {
          'safe-top': 'max(1rem, env(safe-area-inset-top))',
          'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
          'safe-left': 'max(1rem, env(safe-area-inset-left))',
          'safe-right': 'max(1rem, env(safe-area-inset-right))',
        },
        
        // 높이
        height: {
          'screen-mobile': 'calc(var(--vh, 1vh) * 100)',
          'screen-safe': 'calc(var(--vh, 1vh) * 100 - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        },
        
        // 최소 높이
        minHeight: {
          'screen-mobile': 'calc(var(--vh, 1vh) * 100)',
          'screen-safe': 'calc(var(--vh, 1vh) * 100 - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        },
        
        // 그림자 (토스 스타일)
        boxShadow: {
          'toss': '0 2px 20px 0 rgba(49, 130, 246, 0.1)',
          'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'large': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
        
        // 테두리 반지름
        borderRadius: {
          'toss': '12px',
          'toss-lg': '16px',
          'toss-xl': '20px',
        },
        
        // 애니메이션
        animation: {
          'fade-in': 'fadeIn 0.5s ease-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'spin-slow': 'spin 2s linear infinite',
          'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        
        // 키프레임
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          slideUp: {
            '0%': { opacity: '0', transform: 'translateY(30px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
        
        // 백드롭 필터
        backdropBlur: {
          'toss': '10px',
        },
        
        // 그라데이션
        backgroundImage: {
          'gradient-primary': 'linear-gradient(135deg, #3182F6 0%, #6366F1 100%)',
          'gradient-wedding': 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
          'gradient-funeral': 'linear-gradient(135deg, #64748B 0%, #94A3B8 100%)',
          'gradient-success': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
          'gradient-toss': 'linear-gradient(135deg, #3182F6 0%, #6366F1 100%)',
        },
        
        // Z-인덱스
        zIndex: {
          'modal': '1000',
          'overlay': '999',
          'dropdown': '100',
          'sticky': '10',
          'below': '-1',
        },
      },
    },
    plugins: [
      // 커스텀 유틸리티 추가
      function({ addUtilities, addComponents, theme }) {
        // 토스 스타일 버튼 컴포넌트
        addComponents({
          '.btn-toss': {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '56px',
            padding: '0 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 250ms ease-out',
            overflow: 'hidden',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            
            '&:disabled': {
              opacity: '0.5',
              cursor: 'not-allowed',
            },
            
            '&:active': {
              transform: 'scale(0.98)',
            },
          },
          
          // 토스 스타일 카드
          '.card-toss': {
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: theme('boxShadow.card'),
            border: '1px solid ' + theme('colors.gray.100'),
            transition: 'all 250ms ease-out',
            
            '&:hover': {
              boxShadow: theme('boxShadow.large'),
            },
          },
          
          // 토스 스타일 입력 필드
          '.input-toss': {
            width: '100%',
            minHeight: '56px',
            padding: '16px 20px',
            border: '2px solid ' + theme('colors.gray.200'),
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '400',
            background: 'white',
            color: theme('colors.gray.900'),
            transition: 'all 250ms ease-out',
            outline: 'none',
            
            '&::placeholder': {
              color: theme('colors.gray.400'),
            },
            
            '&:focus': {
              borderColor: theme('colors.primary.500'),
              boxShadow: '0 0 0 3px rgba(49, 130, 246, 0.1)',
            },
            
            '&:disabled': {
              background: theme('colors.gray.50'),
              color: theme('colors.gray.400'),
              cursor: 'not-allowed',
            },
          },
        });
        
        // 커스텀 유틸리티
        addUtilities({
          '.safe-area-top': {
            paddingTop: 'max(20px, env(safe-area-inset-top))',
          },
          '.safe-area-bottom': {
            paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          },
          '.safe-area-left': {
            paddingLeft: 'max(20px, env(safe-area-inset-left))',
          },
          '.safe-area-right': {
            paddingRight: 'max(20px, env(safe-area-inset-right))',
          },
          '.touch-optimized': {
            minHeight: '44px',
            minWidth: '44px',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
          },
          '.text-korean': {
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
          },
        });
      },
    ],
  }