/**
 * Centralizované stylovací konstanty pro celou aplikaci
 * Synchronizováno s CSS proměnnými v src/styles/index.css
 */

// Border Radius System
export const RADIUS = {
  sm: '10px',    // Small elements: buttons, inputs, chips
  md: '12px',    // Medium elements: form container, modals
  lg: '16px',    // Large elements: cards, panels
  xl: '22px',    // Extra large: main containers, question cards
};

// Pro zpětnou kompatibilitu
export const BORDER_RADIUS = RADIUS;

// Shadow System
export const SHADOW = {
  default: '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.06)',
  subtle: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
  selected: '0 4px 16px rgba(181, 31, 101, 0.25), 0 2px 8px rgba(181, 31, 101, 0.15)'
};

// Border System
export const BORDER = {
  none: 'none',
  default: '1px solid #ddd'
};

// Colors (z CSS proměnných)
export const COLORS = {
  primary: '#b51f65',
  primaryDark: '#8f1850',
  secondary: '#2d5b78',
  secondaryDark: '#1e3d52',
  accent: '#d63384',
  success: '#10b981',
  danger: '#ef4444',
};

// Použití:
// import { RADIUS, SHADOW, BORDER } from '@/utils/styleConstants';
// style={{ borderRadius: RADIUS.xl, boxShadow: SHADOW.subtle, border: BORDER.none }}
