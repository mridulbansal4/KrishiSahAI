/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./contexts/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Noto Sans Devanagari', 'serif'],
            },
            colors: {
                'deep-green': '#1B5E20',   // Primary Dark
                'medium-green': '#2E7D32', // Primary Medium
                'light-green': '#E8F5E9',  // Background Tint
                'deep-blue': '#0D47A1',    // Secondary / Accents
                'muted-blue': '#1565C0',   // Muted Accents
                'text-dark': '#002105',    // High Contrast Text
            },
        },
    },
    plugins: [],
}
