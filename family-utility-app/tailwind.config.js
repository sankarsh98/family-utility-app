/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Indian traditional color palette
        primary: {
          50: '#FFF5E6',   // Cream
          100: '#FFE6CC',
          200: '#FFD199',
          300: '#FFBB66',
          400: '#FFA533',
          500: '#FF9933',   // Saffron - Primary
          600: '#E68A00',
          700: '#CC7A00',
          800: '#B36B00',
          900: '#995C00',
          950: '#804D00',
        },
        secondary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#138808',   // India Green
          600: '#0D7C00',
          700: '#0A6F00',
          800: '#085F00',
          900: '#054F00',
          950: '#033F00',
        },
        maroon: {
          50: '#FCE4EC',
          100: '#F8BBD9',
          200: '#F48FB1',
          300: '#F06292',
          400: '#EC407A',
          500: '#880E4F',   // Deep Maroon
          600: '#7B0C47',
          700: '#6E0A3F',
          800: '#600837',
          900: '#53062F',
          950: '#450427',
        },
        gold: {
          50: '#FFFDF0',
          100: '#FFFAE0',
          200: '#FFF4B8',
          300: '#FFEE8F',
          400: '#FFE766',
          500: '#D4AF37',   // Traditional Gold
          600: '#C9A130',
          700: '#B8912A',
          800: '#A78023',
          900: '#96701D',
          950: '#856016',
        },
        cream: {
          50: '#FFFEF5',
          100: '#FEFCE8',
          200: '#FEF9C3',
          300: '#FEF08A',
          400: '#FEFCBF',
          500: '#FFF5E6',   // Warm cream
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'indian-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF9933' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'golden': '0 4px 14px 0 rgba(212, 175, 55, 0.25)',
        'saffron': '0 4px 14px 0 rgba(255, 153, 51, 0.25)',
      },
    },
  },
  plugins: [],
}
