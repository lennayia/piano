import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RADIUS } from '../../utils/styleConstants';

/**
 * Moderní HelpPanel - rozbalovací panel s nápovědou
 *
 * @param {boolean} isOpen - Je panel otevřený?
 * @param {string} title - Nadpis nápovědy
 * @param {object} content - Obsah nápovědy { steps: [], tips: [], sections: [] }
 * @param {React.ReactNode} children - Custom obsah (pokud je zadán, content se ignoruje)
 * @param {object} style - Dodatečné styly
 */
export function HelpPanel({ isOpen = false, title = "Nápověda", content, children, style = {}, ...props }) {
  const { steps = [], tips = [], sections = [] } = content || {};
  const [isMobile, setIsMobile] = useState(window.innerWidth < 667);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 667);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            marginBottom: '2rem',
            padding: '1.25rem',
            background: 'rgba(45, 91, 120, 0.04)',
            borderRadius: RADIUS.xl,
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.10), 0 2px 8px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
            ...style
          }}
          {...props}
        >
          <h4 style={{ marginBottom: '1rem', color: 'var(--color-secondary)', fontSize: '0.95rem', fontWeight: 600 }}>
            {title}
          </h4>

          {children ? (
            // Custom obsah
            <div style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
              {children}
            </div>
          ) : sections.length > 0 ? (
            // Nová struktura se sections - responzivní layout
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(180px, 280px) 1fr',
              gap: '1.75rem',
              fontSize: '0.8125rem',
              color: '#64748b',
              lineHeight: '1.3',
              alignItems: 'start'
            }}>
              {/* Levý sloupec: Jak na to + Základní pravidla */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Jak na to */}
                {steps.length > 0 && (
                  <div>
                    <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.8125rem' }}>
                      Jak na to:
                    </strong>
                    <ol style={{ marginLeft: '1.25rem', marginBottom: '0' }}>
                      {steps.map((step, index) => (
                        <li key={index} style={{ marginBottom: '0.3rem' }}>
                          {step.text || step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {/* První sekce (Základní pravidla) */}
                {sections[0] && (
                  <div>
                    <strong style={{
                      color: 'var(--color-secondary)',
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600
                    }}>
                      {sections[0].title}
                    </strong>

                    {sections[0].tips && sections[0].tips.length > 0 && (
                      <ul style={{ marginLeft: '1.25rem', marginBottom: '0' }}>
                        {sections[0].tips.map((tip, tipIndex) => (
                          <li key={tipIndex} style={{ marginBottom: '0.3rem' }}>
                            {tip.text || tip}
                          </li>
                        ))}
                      </ul>
                    )}

                    {sections[0].items && sections[0].items.length > 0 && (
                      <ul style={{ marginLeft: '1.25rem', marginBottom: '0', listStyle: 'none' }}>
                        {sections[0].items.map((item, itemIndex) => (
                          <li key={itemIndex} style={{ marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 600, color: '#475569' }}>{item.label}:</span>{' '}
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Pravý sloupec: Ostatní sekce */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sections.slice(1).map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <strong style={{
                      color: 'var(--color-secondary)',
                      display: 'block',
                      marginBottom: '0.4rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600
                    }}>
                      {section.title}
                    </strong>

                    {/* Pokud má sekce tips (odrážky) */}
                    {section.tips && section.tips.length > 0 && (
                      <ul style={{ marginLeft: '1.25rem', marginBottom: '0' }}>
                        {section.tips.map((tip, tipIndex) => (
                          <li key={tipIndex} style={{ marginBottom: '0.3rem' }}>
                            {tip.text || tip}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Pokud má sekce items (s label) */}
                    {section.items && section.items.length > 0 && (
                      <ul style={{ marginLeft: '1.25rem', marginBottom: '0', listStyle: 'none' }}>
                        {section.items.map((item, itemIndex) => (
                          <li key={itemIndex} style={{ marginBottom: '0.4rem' }}>
                            <span style={{ fontWeight: 600, color: '#475569' }}>{item.label}:</span>{' '}
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Defaultní struktura se steps a tips (zpětná kompatibilita)
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              fontSize: '0.875rem',
              color: '#64748b',
              lineHeight: '1.6'
            }}>
              {steps.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Jak na to:
                  </strong>
                  <ol style={{ marginLeft: '1.25rem', marginBottom: '0' }}>
                    {steps.map((step, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>
                        {step.text || step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {tips.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--color-secondary)', display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    Tipy:
                  </strong>
                  <ul style={{ marginLeft: '1.25rem', marginBottom: '0' }}>
                    {tips.map((tip, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>
                        {tip.text || tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HelpPanel;
