/**
 * Centralizované responzivní breakpointy a hodnoty
 * Pro eliminaci duplicitního kódu napříč komponenty
 */

// Breakpointy v px
export const BREAKPOINTS = {
  xs: 360,
  sm: 480,
  md: 540,
  lg: 700,
  xl: 768,
  xxl: 1024,
  xxxl: 1200
};

// Modal padding podle šířky okna
export const getModalPadding = (width) => {
  if (width < BREAKPOINTS.sm) return 32;    // < 480px: minimum ale bezpečné
  if (width < BREAKPOINTS.md) return 40;    // 480-540px: minimum ale bezpečné
  if (width < BREAKPOINTS.lg) return 48;    // 540-700px: minimum ale bezpečné
  if (width < BREAKPOINTS.xxl) return 80;   // 700-1024px: menší padding
  if (width < BREAKPOINTS.xxxl) return 100; // 1024-1200px: střední padding
  return 132; // 1200px+: plný padding
};

// Card horizontal padding v px (konvertováno z rem)
export const getCardHorizontalPadding = (width) => {
  return width < BREAKPOINTS.lg ? 0.25 * 16 : 1 * 16;
};

// Keyboard padding (vertical horizontal)
export const getKeyboardPadding = (width) => {
  if (width < BREAKPOINTS.xs) return '0.75rem 0.25rem';
  if (width < BREAKPOINTS.lg) return '0.75rem 0.25rem';
  return '1.5rem 1rem';
};

// Note card responsive values
export const getNoteCardValues = (width) => {
  return {
    padding: width < BREAKPOINTS.xs ? '0.65rem' : width < BREAKPOINTS.sm ? '0.75rem' : '1rem',
    fontSize: width < BREAKPOINTS.xs ? '1.15rem' : width < BREAKPOINTS.sm ? '1.35rem' : '1.5rem',
    minWidth: width < BREAKPOINTS.xs ? '50px' : width < BREAKPOINTS.sm ? '55px' : '60px'
  };
};

// Obecná responzivní hodnota - vrátí hodnotu podle breakpointů
export const getResponsiveValue = (width, values) => {
  // values = { xs: val1, sm: val2, md: val3, lg: val4, xl: val5, default: val6 }
  if (width < BREAKPOINTS.xs && values.xs !== undefined) return values.xs;
  if (width < BREAKPOINTS.sm && values.sm !== undefined) return values.sm;
  if (width < BREAKPOINTS.md && values.md !== undefined) return values.md;
  if (width < BREAKPOINTS.lg && values.lg !== undefined) return values.lg;
  if (width < BREAKPOINTS.xl && values.xl !== undefined) return values.xl;
  if (width < BREAKPOINTS.xxl && values.xxl !== undefined) return values.xxl;
  return values.default;
};

// Piano key width calculation
export const calculateKeyWidth = (windowWidth, whiteKeyCount = 12, gap = 2) => {
  const modalPadding = getModalPadding(windowWidth);
  const cardHorizontalPadding = getCardHorizontalPadding(windowWidth);
  const availableWidth = windowWidth - modalPadding - (cardHorizontalPadding * 2);
  const totalGaps = (whiteKeyCount - 1) * gap;
  const maxKeyWidth = Math.floor((availableWidth - totalGaps) / whiteKeyCount);

  // Omezíme na rozumné minimum a maximum
  // Od 700px nahoru držíme max šířku 60px - klaviatura využívá dostupný prostor
  if (windowWidth >= BREAKPOINTS.lg) return Math.min(60, maxKeyWidth);    // 700px+
  return Math.max(20, Math.min(45, maxKeyWidth));
};
