import type { Config } from 'tailwindcss'

/**
 * Internal Tailwind config for `@eltech/ui` library build.
 *
 * Full Tailwind access for component authors.
 *
 * Consumers get a compiled dist/styles.css that includes:
 *   - Component styles (from cva variants, scanned via content)
 *   - Safelisted utility classes for escape-hatch use (spacing, sizing, position)
 *
 * Banned from safelist intentionally (use components instead):
 *   bg-*, text-{color}, font-*, shadow-*, flex, grid
 */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Surface / background ──────────────────────────────────────────
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          subtle: 'var(--color-surface-subtle)',
          dark: 'var(--color-surface-dark)',
        },

        // ─── Foreground (text) ─────────────────────────────────────────────
        foreground: {
          DEFAULT: 'var(--color-foreground)',
          strong: 'var(--color-foreground-strong)',
          input: 'var(--color-foreground-input)',
        },
        muted: {
          DEFAULT: 'var(--color-muted)',
          foreground: 'var(--color-muted-foreground)',
        },

        // ─── Border ────────────────────────────────────────────────────────
        border: {
          DEFAULT: 'var(--color-border)',
          input: 'var(--color-border-input)',
        },

        // ─── Primary (brand — overridable via ThemeProvider) ──────────────
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          foreground: 'var(--color-primary-foreground)',
          soft: 'var(--color-primary-soft)',
        },

        // ─── Neutral scale ─────────────────────────────────────────────────
        neutral: {
          0: 'var(--color-neutral-0)',
          50: 'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
          950: 'var(--color-neutral-950)',
        },

        // ─── Semantic palettes ─────────────────────────────────────────────
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          soft: 'var(--color-accent-soft)',
          foreground: 'var(--color-accent-foreground)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
          soft: 'var(--color-success-soft)',
          foreground: 'var(--color-success-foreground)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          hover: 'var(--color-warning-hover)',
          soft: 'var(--color-warning-soft)',
          foreground: 'var(--color-warning-foreground)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          hover: 'var(--color-error-hover)',
          soft: 'var(--color-error-soft)',
          foreground: 'var(--color-error-foreground)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          hover: 'var(--color-info-hover)',
          soft: 'var(--color-info-soft)',
          foreground: 'var(--color-info-foreground)',
        },

        ring: 'var(--color-ring)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        paper: 'var(--shadow-paper)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(200%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  safelist: [
    // ─── Padding ──────────────────────────────────────────────────────────
    // p-{n}, px-{n}, py-{n}, pt-{n}, pr-{n}, pb-{n}, pl-{n}, ps-{n}, pe-{n}
    { pattern: /^p[xytrblse]?-/ },

    // ─── Margin (including negative) ──────────────────────────────────────
    // m-{n}, mx-{n}, -mt-{n}, auto, etc.
    { pattern: /^-?m[xytrblse]?-/ },

    // ─── Position ─────────────────────────────────────────────────────────
    'static',
    'fixed',
    'absolute',
    'relative',
    'sticky',

    // ─── Inset / top / right / bottom / left ──────────────────────────────
    { pattern: /^-?(top|right|bottom|left|inset[xy]?)-/ },

    // ─── Z-index ──────────────────────────────────────────────────────────
    { pattern: /^z-/ },

    // ─── Sizing ───────────────────────────────────────────────────────────
    { pattern: /^(w|h)-/ },
    { pattern: /^(min|max)-(w|h)-/ },

    // ─── Display (flex/grid intentionally excluded — use Stack/Grid) ───────
    'block',
    'inline-block',
    'inline',
    'hidden',
    'contents',

    // ─── Overflow ─────────────────────────────────────────────────────────
    { pattern: /^overflow(-[xy])?-/ },
    'truncate',

    // ─── Text alignment (layout only, no color/size — use Text component) ─
    'text-left',
    'text-center',
    'text-right',
    'text-justify',

    // ─── Aspect ratio ─────────────────────────────────────────────────────
    { pattern: /^aspect-/ },

    // ─── Object fit / position (for img/video) ────────────────────────────
    { pattern: /^object-/ },

    // ─── Cursor ───────────────────────────────────────────────────────────
    { pattern: /^cursor-/ },

    // ─── Opacity ──────────────────────────────────────────────────────────
    { pattern: /^opacity-/ },

    // ─── Pointer events ───────────────────────────────────────────────────
    'pointer-events-none',
    'pointer-events-auto',

    // ─── Visibility ───────────────────────────────────────────────────────
    'visible',
    'invisible',

    // ─── Accessibility ────────────────────────────────────────────────────
    'sr-only',
    'not-sr-only',
  ],
  plugins: [require('tailwindcss-animate')],
} satisfies Config
