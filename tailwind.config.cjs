/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /** 巡检总览大屏 Midnight Industrial */
        io: {
          bg: '#0b121a',
          surface: '#152a3d',
          surface2: '#0e1926',
          line: '#273446',
          line2: '#1a2430',
          select: '#1a2533',
          text: '#e8eef4',
          dim: '#778699',
          muted: '#96a5b5',
          caption: '#6b7c8d',
          title: '#b0c1d4',
          blue: '#4f7399',
          green: '#5e9b7a',
          'green-soft': '#679e8a',
          amber: '#c4a063',
          red: '#c04a4a',
          'red-soft': '#e07878',
          'gray-pin': '#6b7380',
          'staff-off': '#566577',
          badge: '#1e2a38',
          badgeAlert: '#2c2428',
          barTrack: '#243547',
          water: '#5b6b7e',
          inputText: '#c5d0e0',
          ok: '#7daa96',
          warn: '#c0908c',
        },
        'lime-500': '#84cc16',
        'primary': '#0069b9',
        'warning': '#cfde00',
        'success': '#2d9c0e',
        'danger': '#f54a41',
        'info': '#909399',
        'ky-blue': '#f7fbff',
        'sky-50': '#f0f9ff',
        'primary-light': '#e8f0f7',
        'primary-dark': '#0f445d',
        'primary-dark-light': '#0bb4c0',
        'amber': {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      height: {
        'calc-45px': 'calc(100vh - 45px)',
      },
      width: {
        'w/4': '66%',
        'w/2': '34%',
      },
      boxShadow: {
        'outline': '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
        'insetLight': 'inset 0 2px 40px rgba(11,180,192, 1), 0 0px 8px rgba(0,157,206, 0.3)',
      },
      backgroundImage: {
        'radial-fade': 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
        'radial-fade-dark': 'radial-gradient(circle_at_center,rgba(47,49,54,0.95)_0%,rgba(47,49,54,0.3)_100%)',
        'gradient-white': 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px), repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px)'
      },
      keyframes: {
        'io-sos-a': {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0.2' },
        },
        'io-sos-b': {
          '0%, 49%': { opacity: '0.2' },
          '50%, 100%': { opacity: '1' },
        },
        'slide-scale-down-right': {
          '0%': {
            transform: 'translate(0, 0) scale(1)',
            transformOrigin: 'right bottom',
          },
          '100%': {
            transform: 'translate(2rem, 2rem) scale(0.75)',
            transformOrigin: 'right bottom',
          },
        },
      },
      animation: {
        'io-sos-a': 'io-sos-a 1s steps(1, end) infinite',
        'io-sos-b': 'io-sos-b 1s steps(1, end) infinite',
        'slide-scale-down-right': 'slide-scale-down-right 0.5s ease-in-out forwards',
      },
      maxWidth: {
        'screen-3xl': '1920px',
      },
    },
  },
  plugins: [],
}
