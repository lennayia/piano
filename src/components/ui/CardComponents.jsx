import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
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

/**
 * InfoPanel - informační panel s ikonou a obsahem
 * Používá se pro zobrazení textu písničky, tipů, poznámek atd.
 *
 * @param {string} title - Nadpis panelu (např. "Text písničky:")
 * @param {React.Component} icon - Ikona komponenta (např. Music, BookOpen)
 * @param {string} variant - 'primary' (růžová) | 'secondary' (modrá) - default: 'primary'
 * @param {React.ReactNode} children - Obsah panelu
 * @param {object} style - Dodatečné styly
 */
export function InfoPanel({ title, icon: Icon, variant = 'primary', children, style = {}, ...props }) {
  const variants = {
    primary: {
      background: 'rgba(181, 31, 101, 0.08)',
      border: 'none',
      boxShadow: 'none',
      iconColor: 'var(--color-primary)'
    },
    secondary: {
      background: 'rgba(45, 91, 120, 0.15)',
      border: 'none',
      boxShadow: 'none',
      iconColor: 'var(--color-secondary)'
    }
  };

  const variantStyle = variants[variant];

  return (
    <div
      style={{
        padding: '1rem',
        background: variantStyle.background,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: RADIUS.lg,
        marginTop: '0.75rem',
        border: variantStyle.border,
        boxShadow: variantStyle.boxShadow,
        ...style
      }}
      {...props}
    >
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {Icon && <Icon size={16} color={variantStyle.iconColor} />}
          <strong style={{ fontSize: '0.875rem', color: '#1e293b' }}>{title}</strong>
        </div>
      )}
      <div style={{ fontSize: '0.875rem', color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * ProgressBar - lišta pokroku s animací
 * Používá se pro zobrazení pokroku v akordech, písničkách, kvízech atd.
 *
 * @param {number} current - Aktuální pozice (1-based index)
 * @param {number} total - Celkový počet položek
 * @param {string} title - Název položky (např. "Akord", "Písnička", "Otázka")
 * @param {string} label - Štítek vpravo (např. "Základní", "Pokročilý")
 * @param {object} style - Dodatečné styly
 */
export function ProgressBar({ current, total, title = 'Položka', label, style = {}, ...props }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        marginBottom: '1.5rem',
        ...style
      }}
      {...props}
    >
      {/* Info text */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
        paddingLeft: '0.125rem',
        paddingRight: '0.125rem'
      }}>
        <span style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          fontWeight: 500
        }}>
          {title} {current} z {total}
        </span>
        {label && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            letterSpacing: '0.02em'
          }}>
            {label}
          </span>
        )}
      </div>

      {/* Progress bar track */}
      <div style={{
        position: 'relative',
        height: '4px',
        background: 'rgba(181, 31, 101, 0.06)',
        borderRadius: '999px',
        overflow: 'hidden'
      }}>
        {/* Progress bar fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary) 70%, var(--color-secondary) 100%)',
            borderRadius: '999px'
          }}
        />
      </div>
    </motion.div>
  );
}

/**
 * ItemCard - univerzální karta pro zobrazení položek (lekce, písničky, atd.)
 * s chevron ikonou vpravo dolů
 *
 * @param {string} title - Nadpis karty
 * @param {string} description - Popis položky
 * @param {React.ReactNode} headerActions - Akční tlačítka v hlavičce (např. ActionButtonGroup)
 * @param {React.ReactNode} footer - Obsah footeru (obtížnost, délka, atd.)
 * @param {React.ReactNode} dragHandle - Drag handle pro přetahování
 * @param {boolean} isExpanded - Je karta rozbalená? (chevron rotace)
 * @param {function} onClick - Callback při kliknutí na kartu
 * @param {object} style - Dodatečné styly
 */
export function ItemCard({
  title,
  description,
  headerActions,
  footer,
  dragHandle,
  isExpanded = false,
  onClick,
  style = {},
  children,
  ...props
}) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 12px 48px rgba(45, 91, 120, 0.25)',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      style={{
        cursor: 'pointer',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        borderRadius: RADIUS.xl,
        padding: '1.25rem',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
      {...props}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          {dragHandle}

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
              {headerActions}
            </div>
          </div>
        </div>
        {description && (
          <p className="text-secondary" style={{ lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>

      {/* Footer s chevron */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: '1px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {footer}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={20} color="var(--color-text-secondary)" />
        </motion.div>
      </div>

      {/* Rozbalovací obsah */}
      {children}
    </motion.div>
  );
}
