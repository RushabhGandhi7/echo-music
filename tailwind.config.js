/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'echo-primary': '#A7D7F4',    // Exact sky blue from requirements
        'echo-secondary': '#F8F9FA',  // Light Gray
        'echo-accent': '#87CEEB',     // Lighter sky blue
        'echo-light': '#E0F6FF',      // Very Light Blue
        'echo-dark': '#000000',       // Pure Black
        'echo-gray': '#1a1a1a',       // Dark Gray
        'echo-text': '#FFFFFF',       // White Text
        'echo-text-secondary': '#A7D7F4', // Sky Blue Text
        'echo-white': '#FFFFFF',      // Pure White
        'echo-warm': '#FFF8DC',       // Cornsilk
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #A7D7F4 0%, #87CEEB 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(167, 215, 244, 0.1) 0%, rgba(0, 0, 0, 0.9) 100%)',
        'gradient-button': 'linear-gradient(135deg, #A7D7F4 0%, #87CEEB 100%)',
        'gradient-button-hover': 'linear-gradient(135deg, #87CEEB 0%, #A7D7F4 100%)',
        'gradient-hero': 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(167, 215, 244, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(167, 215, 244, 0.8)' },
        },
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(167, 215, 244, 0.15)',
        'glow': '0 0 20px rgba(167, 215, 244, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(167, 215, 244, 0.1)',
      },
    },
  },
  plugins: [],
}
