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
// import { RADIUS } from '@/utils/styleConstants';
// style={{ borderRadius: RADIUS.xl }}
