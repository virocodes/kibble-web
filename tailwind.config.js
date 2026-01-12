/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kibble: {
          primary: '#007AFF',
          'primary-light': '#E5F1FF',
          background: '#F5F5F7',
          surface: '#FFFFFF',
          'surface-elevated': '#FAFAFA',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          'text-primary': '#1D1D1F',
          'text-secondary': '#6E6E73',
          'text-tertiary': '#AEAEB2',
        },
      },
      spacing: {
        'xxs': '2px',
        'xs': '4px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
      },
      fontSize: {
        'body': '17px',
        'subheadline': '15px',
        'footnote': '13px',
        'caption': '12px',
      },
    },
  },
  plugins: [],
}
