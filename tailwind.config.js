/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html", // Include if you have static files using Tailwind
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Define custom font family
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceOnce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-5px)' },
          '60%': { transform: 'translateY(-2px)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pingOnce: { // Used for the map pins with delays
          '0%': { transform: 'scale(0.2)', opacity: '0.8' },
          '80%, 100%': { transform: 'scale(1.2)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'slide-in-up': 'slideInUp 0.4s ease-out forwards',
        'bounce-once': 'bounceOnce 1s ease-in-out',
        'bounce-slow': 'bounceSlow 3s infinite ease-in-out',
        'ping-once': 'pingOnce 1.5s cubic-bezier(0, 0, 0.2, 1)',
        'ping-slow-delay1': 'pingOnce 1.5s cubic-bezier(0, 0, 0.2, 1) infinite 0s',
        'ping-slow-delay2': 'pingOnce 1.5s cubic-bezier(0, 0, 0.2, 1) infinite 0.5s',
        'ping-slow-delay3': 'pingOnce 1.5s cubic-bezier(0, 0, 0.2, 1) infinite 1s',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'), // Recommended for line-clamp utility in HomePage.js
  ],
};