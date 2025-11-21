import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Moderní tab tlačítka s animacemi
 *
 * @param {Array} tabs - Pole objektů { id, label, icon? }
 * @param {string} activeTab - ID aktivního tabu
 * @param {function} onTabChange - Callback při změně tabu
 * @param {object} options - Volitelné nastavení
 * @param {string} options.size - 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} options.variant - 'primary' | 'secondary' (default: 'primary')
 * @param {boolean} options.showShine - Zobrazit shine efekt (default: true)
 * @param {string} options.gap - Mezera mezi tlačítky (default: '0.5rem')
 * @param {object} options.style - Dodatečné styly pro kontejner
 */
function TabButtons({
  tabs,
  activeTab,
  onTabChange,
  options = {}
}) {
  const [hoveredTab, setHoveredTab] = useState(null);

  const {
    size = 'md',
    variant = 'primary',
    showShine = true,
    gap = '0.5rem',
    style = {}
  } = options;

  // Velikostní varianty
  const sizes = {
    sm: {
      padding: '0.4rem 0.9rem',
      fontSize: '0.75rem',
      iconSize: 14,
      borderRadius: '10px',
      gap: '0.4rem'
    },
    md: {
      padding: '0.6rem 1.25rem',
      fontSize: '0.875rem',
      iconSize: 18,
      borderRadius: '12px',
      gap: '0.5rem'
    },
    lg: {
      padding: '0.8rem 1.5rem',
      fontSize: '1rem',
      iconSize: 20,
      borderRadius: '14px',
      gap: '0.6rem'
    }
  };

  // Barevné varianty
  const variants = {
    primary: {
      activeBackground: 'var(--color-primary)',
      hoverBackground: 'linear-gradient(135deg, rgba(181, 31, 101, 0.1) 0%, rgba(181, 31, 101, 0.2) 100%)',
      activeShadow: '0 4px 20px rgba(181, 31, 101, 0.35), 0 2px 8px rgba(181, 31, 101, 0.2)',
      hoverShadow: '0 4px 12px rgba(181, 31, 101, 0.15)',
      activeColor: '#ffffff',
      hoverColor: 'var(--color-primary)',
      inactiveColor: '#64748b'
    },
    secondary: {
      activeBackground: 'var(--color-secondary)',
      hoverBackground: 'linear-gradient(135deg, rgba(45, 91, 120, 0.1) 0%, rgba(45, 91, 120, 0.2) 100%)',
      activeShadow: '0 4px 20px rgba(45, 91, 120, 0.35), 0 2px 8px rgba(45, 91, 120, 0.2)',
      hoverShadow: '0 4px 12px rgba(45, 91, 120, 0.15)',
      activeColor: '#ffffff',
      hoverColor: 'var(--color-secondary)',
      inactiveColor: '#64748b'
    }
  };

  const sizeConfig = sizes[size];
  const variantConfig = variants[variant];

  return (
    <div style={{
      display: 'flex',
      gap: gap,
      flexWrap: 'wrap',
      ...style
    }}>
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isHovered = hoveredTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300 }}
            whileHover={{
              scale: 1.03,
              y: -2
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onTabChange(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            style={{
              padding: sizeConfig.padding,
              background: isActive
                ? variantConfig.activeBackground
                : isHovered
                  ? variantConfig.hoverBackground
                  : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: 'none',
              borderRadius: sizeConfig.borderRadius,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: sizeConfig.gap,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: sizeConfig.fontSize,
              fontWeight: isActive ? 600 : 500,
              color: isActive
                ? variantConfig.activeColor
                : isHovered
                  ? variantConfig.hoverColor
                  : variantConfig.inactiveColor,
              boxShadow: isActive
                ? variantConfig.activeShadow
                : isHovered
                  ? variantConfig.hoverShadow
                  : '0 2px 8px rgba(0, 0, 0, 0.06)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Shine effect */}
            {showShine && isActive && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '50%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  pointerEvents: 'none'
                }}
              />
            )}
            {Icon && (
              <Icon
                size={sizeConfig.iconSize}
                color={isActive
                  ? variantConfig.activeColor
                  : isHovered
                    ? variantConfig.hoverColor
                    : variantConfig.inactiveColor}
                style={{ transition: 'color 0.2s' }}
              />
            )}
            {tab.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export default TabButtons;
