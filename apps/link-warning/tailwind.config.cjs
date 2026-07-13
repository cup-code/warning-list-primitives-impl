/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'lime-500': '#84cc16',
        'primary': '#0069b9',
        'warning': '#cfde00',
        'success': '#2d9c0e',
        'danger': '#f54a41',
        'info': '#909399',
        'ky-blue': '#f7fbff',
        'sky-50': '#f0f9ff',
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
      },
    },
  },
  plugins: [],
}
