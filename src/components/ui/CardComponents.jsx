import React from 'react';
import { RADIUS, SHADOW } from '../../utils/styleConstants';

/**
 * PageCard - hlavní card kontejner pro stránky s animovaným gradientem
 *
 * @param {React.ReactNode} children - Obsah karty
 * @param {object} style - Dodatečné styly
 */
export function PageCard({ children, style = {}, ...props }) {
  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: SHADOW.default,
        borderRadius: RADIUS.xl,
        padding: '1.25rem',
        marginBottom: '1.5rem',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * QuestionCard - karta pro zobrazení otázky v quiz manageru
 *
 * @param {React.ReactNode} children - Obsah karty
 * @param {boolean} isActive - Je otázka aktivní?
 * @param {React.ElementType} as - Vlastní element (default: 'div')
 * @param {object} style - Dodatečné styly
 */
export function QuestionCard({ children, isActive = true, as: Component = 'div', style = {}, ...props }) {
  return (
    <Component
      style={{
        background: isActive
          ? 'rgba(255, 255, 255, 0.8)'
          : 'rgba(200, 200, 200, 0.5)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(181, 31, 101, 0.1)',
        borderRadius: RADIUS.xl,
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: SHADOW.default,
        ...style
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
