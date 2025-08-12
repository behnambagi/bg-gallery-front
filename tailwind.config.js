/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'vazir': ['Vazir', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#fef7ee',
                    100: '#fdecd4',
                    200: '#fbd5a8',
                    300: '#f8b771',
                    400: '#f49038',
                    500: '#f1721a',
                    600: '#e25910',
                    700: '#bb420f',
                    800: '#953517',
                    900: '#782e16',
                },
                gold: {
                    100: '#fef9e7',
                    200: '#fef0c7',
                    300: '#fedf89',
                    400: '#fdc841',
                    500: '#fbad18',
                    600: '#e6890a',
                    700: '#bf650a',
                    800: '#9d4f10',
                    900: '#804111',
                },
            },
            container: {
                center: true,
                padding: '1rem',
                screens: {
                    sm: '375px',
                    md: '375px',
                    lg: '375px',
                    xl: '375px',
                    '2xl': '375px',
                },
            },
        },
    },
    plugins: [],
}
