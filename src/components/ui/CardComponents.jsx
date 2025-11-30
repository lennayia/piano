import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
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
 *
 * LAYOUT 'list':
 * - Řádek 1: leftControls (drag+play) vlevo | footer chipy (obtížnost, délka) + očko vpravo
 * - Řádek 2: Nadpis (samostatný řádek)
 * - Řádek 3: Popis (samostatný, zalamovací na 2 řádky)
 * - Řádek 4: statusChips (odpovědi, postup) vlevo | headerActions (edit/delete) vpravo
 * - Responsivní: řádky se zalamují na menších obrazovkách
 *
 * LAYOUT 'grid':
 * - Původní struktura s full height a flexbox
 *
 * @param {string} title - Nadpis karty
 * @param {string} description - Popis položky
 * @param {React.ReactNode} headerActions - Akční tlačítka pro admina (např. ActionButtonGroup)
 * @param {React.ReactNode} footer - Chipy (obtížnost, délka) - zobrazí se v řádku 1 vpravo
 * @param {React.ReactNode} statusChips - Chipy se statusem (odpovědi, postup) - zobrazí se v řádku 4 vlevo
 * @param {React.ReactNode} dragHandle - Drag handle pro přetahování
 * @param {React.ReactNode} leftControls - Levá ovládací sekce v řádku 1 (play button, drag handle)
 * @param {boolean} isExpanded - Je karta rozbalená? (změna ikony oka)
 * @param {string} layout - 'list' | 'grid' - layout typ (default: 'list')
 * @param {function} onClick - Callback při kliknutí na ikonu oka
 * @param {object} style - Dodatečné styly
 */
export function ItemCard({
  title,
  description,
  headerActions,
  footer,
  statusChips,
  dragHandle,
  leftControls,
  isExpanded = false,
  layout = 'list',
  onClick,
  style = {},
  children,
  ...props
}) {
  const isGrid = layout === 'grid';
  const isList = layout === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: '0 12px 48px rgba(45, 91, 120, 0.25)',
        transition: { duration: 0.2 }
      }}
      className={isList ? 'item-card-responsive' : ''}
      style={{
        cursor: 'default',
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
        borderRadius: RADIUS.xl,
        padding: '1.25rem',
        overflow: 'hidden',
        position: 'relative',
        ...(isGrid && {
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }),
        ...style
      }}
      {...props}
    >
      {isList ? (
        // LIST LAYOUT - nová struktura
        <>
          {/* Řádek 1: leftControls+footer chipy (vlevo, zalamovací) | očko (vpravo, vždy na 1. řádku) */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
            marginBottom: '0.75rem'
          }}>
            {/* Levá sekce - leftControls + footer chipy (může se zalamovat) */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              flex: 1,
              alignItems: 'center'
            }}>
              {/* leftControls - vždy na prvním řádku (bez wrap) */}
              {leftControls ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexShrink: 0
                }}>
                  {leftControls}
                </div>
              ) : dragHandle ? (
                <div style={{ flexShrink: 0 }}>
                  {dragHandle}
                </div>
              ) : null}

              {/* Footer chipy - mohou se zalamovat na další řádek */}
              {footer}
            </div>

            {/* Očko - vždy vpravo, vždy na prvním řádku */}
            <motion.div
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick(e);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isExpanded ? (
                <EyeOff size={20} color="var(--color-text-secondary)" style={{ pointerEvents: 'none' }} />
              ) : (
                <Eye size={20} color="var(--color-text-secondary)" style={{ pointerEvents: 'none' }} />
              )}
            </motion.div>
          </div>

          {/* Řádek 2: Nadpis */}
          <h3 style={{
            margin: 0,
            marginBottom: '0.75rem'
            /* fontSize, fontWeight, lineHeight, color dědí z globálního CSS */
          }}>
            {title}
          </h3>

          {/* Řádek 3: Popis (samostatný, zalamovací na 2 řádky) */}
          {description && (
            <div style={{
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {typeof description === 'string' ? (
                <p className="text-secondary" style={{ margin: 0 }}>
                  {description}
                </p>
              ) : (
                description
              )}
            </div>
          )}

          {/* Řádek 4: statusChips (vlevo) | headerActions (vpravo) */}
          {(statusChips || headerActions) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              {/* Vlevo: Status chipy (odpovědi, postup atd.) */}
              {statusChips && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  flex: '1 1 auto'
                }}>
                  {statusChips}
                </div>
              )}

              {/* Vpravo: Akční tlačítka pro admina - vždy zarovnané doprava */}
              {headerActions && (
                <div style={{
                  marginLeft: 'auto',
                  flexShrink: 0
                }}>
                  {headerActions}
                </div>
              )}
            </div>
          )}

          {/* Rozbalovací obsah */}
          {children}
        </>
      ) : (
        // GRID LAYOUT - původní struktura
        <>
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

          {/* Footer s očkem */}
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
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick(e);
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                cursor: 'pointer',
                padding: '0.25rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isExpanded ? (
                <EyeOff size={20} color="var(--color-text-secondary)" style={{ pointerEvents: 'none' }} />
              ) : (
                <Eye size={20} color="var(--color-text-secondary)" style={{ pointerEvents: 'none' }} />
              )}
            </motion.div>
          </div>

          {/* Rozbalovací obsah */}
          {children}
        </>
      )}
    </motion.div>
  );
}
