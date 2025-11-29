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
 *
 * LAYOUT 'list':
 * - Řádek 1: Nadpis (vlevo) + chips (délka, úroveň) + šipka (vpravo)
 * - Řádek 2: Jemný divider
 * - Řádek 3: Description/chips (vlevo) + akční tlačítka (vpravo)
 * - Responsivní: na menších obrazovkách se vše skládá pod sebe
 * - leftControls: Pokud je zadáno, vytvoří samostatnou levou sekci (pro play button atd.)
 *
 * LAYOUT 'grid':
 * - Původní struktura s full height a flexbox
 *
 * @param {string} title - Nadpis karty
 * @param {string} description - Popis položky nebo další chipy
 * @param {React.ReactNode} headerActions - Akční tlačítka pro admina (např. ActionButtonGroup)
 * @param {React.ReactNode} footer - Chipy (obtížnost, délka, atd.)
 * @param {React.ReactNode} dragHandle - Drag handle pro přetahování (malý, inline s nadpisem)
 * @param {React.ReactNode} leftControls - Levá ovládací sekce (play button, drag handle, atd.)
 * @param {boolean} isExpanded - Je karta rozbalená? (chevron rotace)
 * @param {string} layout - 'list' | 'grid' - layout typ (default: 'list')
 * @param {function} onClick - Callback při kliknutí na kartu
 * @param {object} style - Dodatečné styly
 */
export function ItemCard({
  title,
  description,
  headerActions,
  footer,
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
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap', // Povolit wrap pro menší obrazovky
            alignItems: 'flex-start'
          }}>
            {/* Levá ovládací sekce (play button, drag handle atd.) */}
            {leftControls && (
              <div className="item-card-left-controls" style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                alignSelf: 'stretch'
              }}>
                {leftControls}
              </div>
            )}

            {/* Hlavní obsah vpravo */}
            <div className="item-card-main-content" style={{
              flex: 1,
              minWidth: leftControls ? '300px' : 0 // Jen pokud jsou leftControls, jinak bez omezení
            }}>
              {/* Řádek 1: Nadpis + chips + šipka */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap' // Povolit zalamování chipů pod nadpis
              }}>
                {/* Vlevo: Drag handle + Nadpis */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flex: '1 1 auto',
                  minWidth: '150px' // Minimální šířka pro nadpis
                }}>
                  {dragHandle}
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    wordBreak: 'break-word' // Zalomit dlouhý nadpis
                  }}>{title}</h3>
                </div>

                {/* Vpravo: Footer chips + Šipka - zarovnané doprava */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginLeft: 'auto' // Zarovnat doprava i po wrap
                }}>
                  {footer && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'nowrap' // Chipy vedle sebe, ne pod sebou
                    }}>
                      {footer}
                    </div>
                  )}
                  <motion.div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onClick) onClick(e);
                    }}
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
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
                    <ChevronRight size={20} color="var(--color-text-secondary)" style={{ pointerEvents: 'none' }} />
                  </motion.div>
                </div>
              </div>

              {/* Řádek 2: Divider */}
              <div style={{
                width: '100%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent)',
                margin: '1rem 0'
              }} />

              {/* Řádek 3: Description/chips + akční tlačítka */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                {/* Vlevo: Description nebo další chipy */}
                {description && (
                  <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
                    {typeof description === 'string' ? (
                      <p className="text-secondary" style={{ margin: 0, lineHeight: 1.5 }}>
                        {description}
                      </p>
                    ) : (
                      description
                    )}
                  </div>
                )}

                {/* Vpravo: Akční tlačítka pro admina */}
                {headerActions && (
                  <div style={{
                    marginLeft: 'auto' // Zarovnat doprava i po wrap
                  }}>
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rozbalovací obsah - mimo flexbox, napříč celou šířkou */}
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
              onClick={(e) => {
                e.stopPropagation();
                if (onClick) onClick(e);
              }}
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
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
              <ChevronRight size={20} color="var(--color-text-secondary)" style={{ pointerEvents: 'none' }} />
            </motion.div>
          </div>

          {/* Rozbalovací obsah */}
          {children}
        </>
      )}
    </motion.div>
  );
}
