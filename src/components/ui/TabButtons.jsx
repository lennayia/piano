import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Copy, Trash2, Plus, HelpCircle } from 'lucide-react';

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
      borderRadius: '10px',
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

  // Pill layout - kompaktní lišta
  if (isPill) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', ...style }}>
        <div style={{
          display: 'inline-flex',
          flexWrap: 'wrap',
          gap: '0.25rem',
          padding: '0.3rem',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '14px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
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

/**
 * Moderní Chip komponent pro zobrazení obtížnosti a odpovědí
 *
 * @param {string|number} text - Text nebo číslo chipu
 * @param {string} variant - 'difficulty' | 'answer' | 'inactive'
 * @param {number} level - Úroveň obtížnosti 1-3 (pro variant='difficulty')
 * @param {boolean} isCorrect - Je odpověď správná? (pro variant='answer')
 * @param {object} style - Dodatečné styly
 */
export function Chip({ text, variant = 'answer', level = 1, isCorrect = false, style = {}, ...props }) {
  // Definice barev pro různé varianty
  const variants = {
    // Obtížnost - jednotná barva, číslo určuje level
    difficulty: {
      background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.08) 0%, rgba(181, 31, 101, 0.12) 100%)',
      color: 'rgba(181, 31, 101, 0.95)',
      border: '1.5px solid rgba(181, 31, 101, 0.25)',
      boxShadow: '0 2px 4px rgba(181, 31, 101, 0.08)'
    },
    // Odpovědi - jemný neutrální design
    answer: {
      background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.05) 0%, rgba(100, 116, 139, 0.08) 100%)',
      color: '#64748b',
      border: '1.5px solid rgba(100, 116, 139, 0.15)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    },
    // Správná odpověď - vnitřní glow se secondary barvou
    'answer-correct': {
      background: 'rgba(255, 255, 255, 0.95)',
      color: 'var(--color-secondary)',
      border: 'none',
      boxShadow: 'inset 0 0 16px rgba(45, 91, 120, 1), 0 1px 3px rgba(45, 91, 120, 0.15)'
    },
    // Neaktivní
    inactive: {
      background: 'rgba(0, 0, 0, 0.04)',
      color: '#94a3b8',
      border: '1.5px solid rgba(0, 0, 0, 0.08)',
      boxShadow: 'none'
    }
  };

  // Pokud je isCorrect=true, použijeme variantu answer-correct
  const finalVariant = (variant === 'answer' && isCorrect) ? 'answer-correct' : variant;
  const variantStyle = variants[finalVariant] || variants.answer;

  // Pro obtížnost zobrazíme číslo v kruhu
  const isDifficulty = variant === 'difficulty';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isDifficulty ? '0.2rem 0.4rem' : '0.25rem 0.5rem',
        borderRadius: '10px',
        fontSize: isDifficulty ? '0.6875rem' : '0.75rem',
        fontWeight: isCorrect ? 600 : isDifficulty ? 700 : 400,
        transition: 'all 0.2s ease',
        minWidth: isDifficulty ? '26px' : 'auto',
        ...variantStyle,
        ...style
      }}
      {...props}
    >
      {text}
      {isCorrect && ' ✓'}
    </span>
  );
}

/**
 * Moderní ActionButton komponenty pro upravit/duplikovat/smazat
 *
 * @param {string} variant - 'edit' | 'duplicate' | 'delete'
 * @param {function} onClick - Callback funkce
 * @param {string} label - Text tlačítka (optional)
 * @param {boolean} iconOnly - Zobrazit jen ikonu bez textu (default: false)
 * @param {number} iconSize - Velikost ikony (default: 15 pro text, 18 pro iconOnly)
 * @param {object} style - Dodatečné styly
 */
export function ActionButton({ variant = 'edit', onClick, label, icon: CustomIcon, iconOnly = false, iconSize, style = {}, ...props }) {
  const variants = {
    edit: {
      background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.08) 0%, rgba(45, 91, 120, 0.12) 100%)',
      hoverBackground: 'linear-gradient(135deg, rgba(45, 91, 120, 0.15) 0%, rgba(45, 91, 120, 0.2) 100%)',
      color: 'var(--color-secondary)',
      icon: Edit,
      defaultLabel: 'Upravit'
    },
    duplicate: {
      background: 'linear-gradient(135deg, rgba(100, 116, 139, 0.06) 0%, rgba(100, 116, 139, 0.1) 100%)',
      hoverBackground: 'linear-gradient(135deg, rgba(100, 116, 139, 0.12) 0%, rgba(100, 116, 139, 0.16) 100%)',
      color: '#64748b',
      icon: Copy,
      defaultLabel: 'Duplikovat'
    },
    delete: {
      background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.06) 0%, rgba(181, 31, 101, 0.1) 100%)',
      hoverBackground: 'linear-gradient(135deg, rgba(181, 31, 101, 0.12) 0%, rgba(181, 31, 101, 0.16) 100%)',
      color: 'var(--color-primary)',
      icon: Trash2,
      defaultLabel: 'Smazat'
    }
  };

  const config = variants[variant];
  const Icon = CustomIcon || config.icon;
  const buttonLabel = label || config.defaultLabel;
  const [isHovered, setIsHovered] = React.useState(false);

  // Velikost ikony - větší pro iconOnly režim
  const finalIconSize = iconSize || (iconOnly ? 18 : 15);

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: iconOnly ? 0 : '0.4rem',
        padding: iconOnly ? '0.625rem' : '0.5rem 0.875rem',
        borderRadius: '14px',
        fontSize: '0.8125rem',
        fontWeight: 500,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isHovered ? config.hoverBackground : config.background,
        color: config.color,
        boxShadow: isHovered
          ? '0 3px 8px rgba(0, 0, 0, 0.1)'
          : '0 1px 3px rgba(0, 0, 0, 0.06)',
        minWidth: iconOnly ? '38px' : 'auto',
        minHeight: iconOnly ? '38px' : 'auto',
        ...style
      }}
      {...props}
    >
      <Icon size={finalIconSize} />
      {!iconOnly && buttonLabel}
    </motion.button>
  );
}

/**
 * Moderní AddButton - primární akční tlačítko pro přidání nového záznamu
 *
 * @param {function} onClick - Callback funkce
 * @param {string} label - Text tlačítka (default: 'Přidat novou otázku')
 * @param {object} icon - Custom ikona (default: Plus)
 * @param {boolean} iconOnly - Zobrazit jen ikonu bez textu (default: false)
 * @param {object} style - Dodatečné styly
 */
export function AddButton({ onClick, label = 'Přidat novou otázku', icon: CustomIcon, iconOnly = false, style = {}, ...props }) {
  const Icon = CustomIcon || Plus;
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: iconOnly ? 0 : '0.5rem',
        padding: iconOnly ? '0.75rem' : '0.75rem 1.5rem',
        borderRadius: '17px',
        fontSize: '0.9rem',
        fontWeight: 600,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isHovered
          ? 'linear-gradient(135deg, rgba(181, 31, 101, 1) 0%, rgba(181, 31, 101, 0.9) 100%)'
          : 'linear-gradient(135deg, var(--color-primary) 0%, rgba(181, 31, 101, 0.85) 100%)',
        color: '#ffffff',
        boxShadow: isHovered
          ? '0 8px 24px rgba(181, 31, 101, 0.4), 0 4px 12px rgba(181, 31, 101, 0.3)'
          : '0 4px 16px rgba(181, 31, 101, 0.25), 0 2px 8px rgba(181, 31, 101, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        minWidth: iconOnly ? '44px' : 'auto',
        minHeight: iconOnly ? '44px' : 'auto',
        ...style
      }}
      {...props}
    >
      {/* Shine effect */}
      {isHovered && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            pointerEvents: 'none'
          }}
        />
      )}
      <Icon size={iconOnly ? 22 : 20} />
      {!iconOnly && label}
    </motion.button>
  );
}

/**
 * Moderní HelpButton - tlačítko nápovědy s jemným designem
 *
 * @param {function} onClick - Callback funkce
 * @param {boolean} isActive - Je nápověda aktivní/otevřená? (default: false)
 * @param {string} title - Tooltip text (default: 'Zobrazit nápovědu')
 * @param {object} style - Dodatečné styly
 */
export function HelpButton({ onClick, isActive = false, title = 'Zobrazit nápovědu', style = {}, ...props }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '14px',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isActive
          ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.15) 0%, rgba(181, 31, 101, 0.2) 100%)'
          : isHovered
            ? 'linear-gradient(135deg, rgba(45, 91, 120, 0.12) 0%, rgba(45, 91, 120, 0.18) 100%)'
            : 'rgba(45, 91, 120, 0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: isHovered || isActive
          ? '0 3px 12px rgba(0, 0, 0, 0.12)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)',
        ...style
      }}
      {...props}
    >
      <HelpCircle
        size={18}
        color={isActive ? 'var(--color-primary)' : 'var(--color-secondary)'}
        style={{ transition: 'color 0.2s' }}
      />
    </motion.button>
  );
}

export default TabButtons;
