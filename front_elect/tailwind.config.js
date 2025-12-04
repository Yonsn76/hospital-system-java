/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[theme-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          soft: 'var(--color-primary-soft)',
          mute: 'var(--color-primary-mute)'
        },
        background: {
          DEFAULT: 'var(--color-background)',
          soft: 'var(--color-background-soft)',
          mute: 'var(--color-background-mute)',
          opacity: 'var(--color-background-opacity)'
        },
        text: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
          1: 'var(--color-text-1)',
          2: 'var(--color-text-2)',
          3: 'var(--color-text-3)'
        },
        border: {
          DEFAULT: 'var(--color-border)',
          soft: 'var(--color-border-soft)',
          mute: 'var(--color-border-mute)'
        },
        gray: {
          1: 'var(--color-gray-1)',
          2: 'var(--color-gray-2)',
          3: 'var(--color-gray-3)'
        },
        error: 'var(--color-error)',
        link: 'var(--color-link)',
        hover: 'var(--color-hover)',
        active: 'var(--color-active)'
      },
      fontFamily: {
        sans: 'var(--font-family)',
        serif: 'var(--font-family-serif)',
        mono: 'var(--code-font-family)'
      },
      borderRadius: {
        list: 'var(--list-item-border-radius)'
      },
      backgroundColor: {
        modal: 'var(--modal-background)',
        navbar: 'var(--navbar-background)',
        'list-item': 'var(--color-list-item)',
        'list-item-hover': 'var(--color-list-item-hover)',
        'chat-user': 'var(--chat-background-user)',
        'chat-assistant': 'var(--chat-background-assistant)'
      }
    }
  },
  plugins: []
}
