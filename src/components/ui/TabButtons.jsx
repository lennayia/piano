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
 * @param {string} options.variant - 'primary' | 'secondary' (default: 'secondary')
 * @param {string} options.layout - 'default' | 'pill' (default: 'default')
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
    variant = 'secondary',
    layout = 'default',
    showShine = true,
    gap = '0.5rem',
    style = {}
  } = options;

  const isPill = layout === 'pill';

  // Velikostní varianty
  const sizes = {
    sm: {
      padding: '0.5rem 1rem',
      fontSize: '0.8rem',
      iconSize: 16,
      borderRadius: '10px',
      gap: '0.4rem'
    },
    md: {
      padding: '0.65rem 1.35rem',
      fontSize: '0.9rem',
      iconSize: 18,
      borderRadius: '12px',
      gap: '0.5rem'
    },
    lg: {
      padding: '0.85rem 1.6rem',
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
      inactiveColor: '#64748b',
      // Pill - jemnější verze primary
      pillActiveBackground: 'rgba(181, 31, 101, 0.85)',
      pillActiveColor: '#ffffff',
      pillHoverColor: 'var(--color-primary)'
    },
    secondary: {
      activeBackground: 'var(--color-secondary)',
      hoverBackground: 'linear-gradient(135deg, rgba(45, 91, 120, 0.1) 0%, rgba(45, 91, 120, 0.2) 100%)',
      activeShadow: '0 4px 20px rgba(45, 91, 120, 0.35), 0 2px 8px rgba(45, 91, 120, 0.2)',
      hoverShadow: '0 4px 12px rgba(45, 91, 120, 0.15)',
      activeColor: '#ffffff',
      hoverColor: 'var(--color-secondary)',
      inactiveColor: '#64748b',
      // Pill - jemnější verze secondary
      pillActiveBackground: 'rgba(45, 91, 120, 0.85)',
      pillActiveColor: '#ffffff',
      pillHoverColor: 'var(--color-secondary)'
    }
  };

  const sizeConfig = sizes[size];
  const variantConfig = variants[variant];

  // Renderování jednotlivých tlačítek
  const renderButtons = () => tabs.map((tab, index) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    const isHovered = hoveredTab === tab.id;

    // Pill layout - kompaktnější styly s neutrálními barvami
    const pillButtonStyle = {
      padding: '0.4rem 1rem',
      background: isActive
        ? variantConfig.pillActiveBackground
        : isHovered
          ? 'rgba(0, 0, 0, 0.05)'
          : 'transparent',
      border: 'none',
      borderRadius: '999px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      transition: 'all 0.2s ease',
      fontSize: '0.8rem',
      fontWeight: isActive ? 600 : 500,
      color: isActive
        ? variantConfig.pillActiveColor
        : isHovered
          ? variantConfig.pillHoverColor
          : variantConfig.inactiveColor,
      boxShadow: isActive
        ? '0 2px 8px rgba(0, 0, 0, 0.15)'
        : 'none',
      position: 'relative',
      overflow: 'hidden'
    };

    // Default layout - původní styly
    const defaultButtonStyle = {
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
    };

    return (
      <motion.button
        key={tab.id}
        initial={isPill ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={isPill
          ? { delay: index * 0.03 }
          : { delay: index * 0.05, type: 'spring', stiffness: 300 }
        }
        whileHover={isPill
          ? { scale: 1.02 }
          : { scale: 1.03, y: -2 }
        }
        whileTap={{ scale: 0.97 }}
        onClick={() => onTabChange(tab.id)}
        onMouseEnter={() => setHoveredTab(tab.id)}
        onMouseLeave={() => setHoveredTab(null)}
        style={isPill ? pillButtonStyle : defaultButtonStyle}
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
            size={isPill ? 14 : sizeConfig.iconSize}
            color={isActive
              ? (isPill ? variantConfig.pillActiveColor : variantConfig.activeColor)
              : isHovered
                ? (isPill ? variantConfig.pillHoverColor : variantConfig.hoverColor)
                : variantConfig.inactiveColor}
            style={{ transition: 'color 0.2s' }}
          />
        )}
        {tab.label}
      </motion.button>
    );
  });

  // Pill layout - kompaktní lišta, responzivní zalamování přes CSS
  if (isPill) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', ...style }}>
        <div className="tab-pill-container">
          {renderButtons()}
        </div>
      </div>
    );
  }

  // Default layout
  return (
    <div style={{
      display: 'flex',
      gap: gap,
      flexWrap: 'wrap',
      ...style
    }}>
      {renderButtons()}
    </div>
  );
}

export default TabButtons;
