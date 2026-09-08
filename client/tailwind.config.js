/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0B0E',
          surface: '#16161A',
          'surface-2': '#1E1E24',
        },
        border: {
          subtle: '#2A2A30',
        },
        ember: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#ffb86b',
          400: '#f7a462',
          500: '#E8935A',
          600: '#D4772F',
          700: '#c1531f',
          800: '#9a3412',
          900: '#7c2d12',
          gold: '#F2C879',
        },
        charcoal: {
          950: '#0B0B0E',
          900: '#16161A',
          850: '#1B1B21',
          800: '#1E1E24',
          700: '#2A2A30',
          600: '#3A3A42',
          500: '#6E6A64',
        },
        gold: {
          highlight: '#F2C879',
          400: '#F2C879',
          500: '#E8935A',
        },
        status: {
          veg: '#34D399',
          nonveg: '#F0725A',
          info: '#5EA8E0',
          warning: '#FBBF54',
          success: '#4ADE80',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#E2DFD8',
          muted: '#B5B0A6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 0 30px -5px rgba(232, 147, 90, 0.35)',
        'glow-gold': '0 0 35px -5px rgba(242, 200, 121, 0.4)',
        card: '0 12px 35px rgba(0, 0, 0, 0.65)',
        '3d': '0 15px 35px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(232, 147, 90, 0.15)',
      },
      backgroundImage: {
        'ember-gradient': 'linear-gradient(135deg, #FFB86B 0%, #E8935A 40%, #C1531F 100%)',
      },
    },
  },
  plugins: [],
};
