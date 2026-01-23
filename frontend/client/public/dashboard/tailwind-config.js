// Tailwind Configuration
if (typeof tailwind !== 'undefined') {
    tailwind.config = {
        theme: {
            extend: {
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                },
                colors: {
                    primary: {
                        DEFAULT: '#7A5AF8',
                        light: '#F3F0FF',
                        dark: '#5B21B6',
                    },
                    secondary: '#64748B',
                    card: '#FFFFFF',
                    bg: '#F8FAFC',
                    accent: '#8B5CF6'
                },
                boxShadow: {
                    'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                    'glow': '0 0 15px rgba(122, 90, 248, 0.1)',
                },
                borderRadius: {
                    'xl': '1rem',
                    '2xl': '1.5rem',
                    '3xl': '2rem',
                }
            }
        }
    };
}
