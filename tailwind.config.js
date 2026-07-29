/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316', // vibrant ukay orange
          600: '#ea580c',
          700: '#c2410c',
        },
        ukay: {
          dark: '#0f172a',
          card: '#1e293b',
          accent: '#10b981', // green for available
          warning: '#f59e0b', // amber for reserved
          muted: '#64748b', // sold
        }
      },
    },
  },
  plugins: [],
}
