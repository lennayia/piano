import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Edit, Copy, Trash2, Plus, HelpCircle, X, Save, CheckCircle, XCircle, ChevronLeft, Play, Pause, Volume2, Eye, EyeOff } from 'lucide-react';
import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
import audioEngine from '../../utils/audio';

/**
 * Chip - malý barevný chip pro zobrazení obtížnosti, odpovědí atd.
 *
 * @param {string|number} text - Text nebo číslo chipu
 * @param {string} variant - 'primary' | 'secondary' | 'light' | 'difficulty' | 'answer' | 'info' | 'inactive'
 * @param {number} level - Úroveň obtížnosti 1-3 (pro variant='difficulty')
 * @param {boolean} isCorrect - Je odpověď správná? (pro variant='answer')
 * @param {object} style - Dodatečné styly
 */
export function Chip({ text, variant = 'answer', level = 1, isCorrect = false, style = {}, ...props }) {
  // Definice barev pro různé varianty
  const variants = {
    // Primary - čistá primary barva bez borderu a stínu
    primary: {
      background: 'var(--color-primary)',
      color: '#ffffff',
      border: 'none',
      boxShadow: 'none'
    },
    // Secondary - čistá secondary barva bez borderu a stínu
    secondary: {
      background: 'var(--color-secondary)',
      color: '#ffffff',
      border: 'none',
      boxShadow: 'none'
    },
    // Light - světlá secondary barva bez borderu a stínu
    light: {
      background: 'rgba(45, 91, 120, 0.1)',
      color: 'var(--color-secondary)',
      border: 'none',
      boxShadow: 'none'
    },
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
    // Info/Metadata - vnitřní glow se secondary barvou
    info: {
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
 * @param {boolean} iconOnly - Zobrazit jen ikonu bez textu (default: true)
 * @param {number} iconSize - Velikost ikony (default: 18)
 * @param {object} style - Dodatečné styly
 */
export function ActionButton({ variant = 'edit', onClick, label, icon: CustomIcon, iconOnly = true, iconSize, style = {}, ...props }) {
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
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
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
        border: BORDER.none,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isHovered ? config.hoverBackground : config.background,
        color: config.color,
        boxShadow: isHovered
          ? '0 3px 8px rgba(0, 0, 0, 0.1)'
          : SHADOW.subtle,
        minWidth: iconOnly ? '38px' : 'auto',
        minHeight: iconOnly ? '38px' : 'auto',
        ...style
      }}
      {...props}
    >
      <Icon size={finalIconSize} style={{ pointerEvents: 'none' }} />
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
 * @param {boolean} iconOnly - Zobrazit jen ikonu bez textu (default: true)
 * @param {object} style - Dodatečné styly
 */
export function AddButton({ onClick, label = 'Přidat novou otázku', icon: CustomIcon, iconOnly = true, style = {}, ...props }) {
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
        borderRadius: RADIUS.lg,
        fontSize: '0.9rem',
        fontWeight: 600,
        border: BORDER.none,
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
        marginLeft: 'auto',
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

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
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
        border: BORDER.none,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: isActive
          ? 'linear-gradient(135deg, rgba(45, 91, 120, 0.15) 0%, rgba(45, 91, 120, 0.2) 100%)'
          : isHovered
            ? 'linear-gradient(135deg, rgba(45, 91, 120, 0.12) 0%, rgba(45, 91, 120, 0.18) 100%)'
            : 'rgba(45, 91, 120, 0.08)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: isHovered || isActive
          ? '0 3px 12px rgba(0, 0, 0, 0.12)'
          : SHADOW.subtle,
        ...style
      }}
      {...props}
    >
      <HelpCircle
        size={18}
        color="var(--color-secondary)"
        style={{ transition: 'color 0.2s', pointerEvents: 'none' }}
      />
    </motion.button>
  );
}

/**
 * CancelButton - tlačítko pro zrušení akce (secondary styl)
 *
 * @param {function} onClick - Callback funkce
 * @param {string} label - Text tlačítka (default: 'Zrušit')
 * @param {object} style - Dodatečné styly
 */
export function CancelButton({ onClick, label = 'Zrušit', style = {}, ...props }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        padding: '0.3rem 0.6rem',
        borderRadius: '10px',
        border: BORDER.none,
        background: 'rgba(45, 91, 120, 0.08)',
        color: 'var(--color-secondary)',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: SHADOW.subtle,
        ...style
      }}
      {...props}
    >
      <X size={14} style={{ pointerEvents: 'none' }} />
      {label}
    </button>
  );
}

/**
 * SaveButton - tlačítko pro uložení (primary styl)
 *
 * @param {function} onClick - Callback funkce
 * @param {string} label - Text tlačítka (default: 'Uložit')
 * @param {object} style - Dodatečné styly
 */
export function SaveButton({ onClick, label = 'Uložit', style = {}, ...props }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        padding: '0.3rem 0.6rem',
        borderRadius: '10px',
        border: BORDER.none,
        background: 'var(--color-primary)',
        color: '#fff',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: SHADOW.subtle,
        ...style
      }}
      {...props}
    >
      <Save size={14} style={{ pointerEvents: 'none' }} />
      {label}
    </button>
  );
}

/**
 * PlayButton - tlačítko pro přehrání zvuku/kadence
 * Modulární verze play buttonu z SongLibrary - stejné rozměry jako AddButton
 *
 * @param {function} onClick - Callback při kliknutí
 * @param {boolean} isPlaying - Je právě přehráváno? (default: false)
 * @param {string} variant - 'pause' (Play/Pause) nebo 'volume' (Play/Volume2) (default: 'pause')
 * @param {number} size - Velikost tlačítka v px (default: 44)
 * @param {number} iconSize - Velikost ikony v px (default: 22)
 * @param {object} style - Dodatečné styly
 */
export function PlayButton({
  onClick,
  isPlaying = false,
  variant = 'pause',
  size = 44,
  iconSize = 22,
  style = {},
  ...props
}) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  const PlayingIcon = variant === 'volume' ? Volume2 : Pause;

  return (
    <motion.button
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      style={{
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        padding: '0.75rem',
        background: isPlaying
          ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.9) 0%, rgba(221, 51, 121, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(45, 91, 120, 0.9) 0%, rgba(65, 111, 140, 0.9) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: BORDER.none,
        borderRadius: RADIUS.lg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: isPlaying
          ? '0 8px 32px rgba(181, 31, 101, 0.5)'
          : '0 8px 32px rgba(45, 91, 120, 0.4)',
        flexShrink: 0,
        transition: 'all 0.3s',
        ...style
      }}
      {...props}
    >
      {isPlaying ? (
        <PlayingIcon size={iconSize} color="#ffffff" />
      ) : (
        <Play size={iconSize} color="#ffffff" style={{ marginLeft: '3px' }} />
      )}
    </motion.button>
  );
}

/**
 * NoteButton - tlačítko pro výběr not v akordovém kvízu
 *
 * @param {string} note - Text noty (např. "C", "C#", "D")
 * @param {boolean} selected - Je nota vybraná?
 * @param {function} onClick - Callback při kliknutí
 * @param {string} variant - Barva pro vybraný stav: 'primary' | 'secondary' (default: 'primary')
 * @param {object} style - Dodatečné styly
 */
export function NoteButton({ note, selected = false, onClick, variant = 'primary', style = {}, ...props }) {
  const color = variant === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)';

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        background: selected ? color : 'rgba(255, 255, 255, 0.9)',
        border: BORDER.none,
        boxShadow: SHADOW.subtle,
        borderRadius: RADIUS.md,
        padding: '0.5rem 0.75rem',
        cursor: 'pointer',
        color: selected ? '#fff' : '#1e293b',
        fontWeight: '600',
        fontSize: '0.875rem',
        minWidth: '50px',
        ...style
      }}
      {...props}
    >
      {note}
    </motion.button>
  );
}

/**
 * IconButton - tlačítko s ikonou pro navigaci a akce
 *
 * @param {React.Component} icon - Lucide ikona komponenta
 * @param {function} onClick - Callback při kliknutí
 * @param {string} variant - 'primary' | 'secondary' (default: 'primary')
 * @param {number} size - Velikost tlačítka v px (default: 48)
 * @param {number} iconSize - Velikost ikony v px (default: 24)
 * @param {string} borderRadius - Border radius (default: RADIUS.lg)
 * @param {string} ariaLabel - Accessibility label
 * @param {object} style - Dodatečné styly
 */
export function IconButton({
  icon: Icon,
  onClick,
  variant = 'primary',
  size = 48,
  iconSize = 24,
  borderRadius = RADIUS.lg,
  ariaLabel,
  style = {},
  ...props
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  const variants = {
    primary: {
      background: 'var(--color-primary)',
      hoverBackground: 'linear-gradient(135deg, rgba(181, 31, 101, 1) 0%, rgba(181, 31, 101, 0.9) 100%)',
      color: '#ffffff',
      shadow: '0 4px 16px rgba(181, 31, 101, 0.25), 0 2px 8px rgba(181, 31, 101, 0.15)',
      hoverShadow: '0 6px 20px rgba(181, 31, 101, 0.35), 0 3px 10px rgba(181, 31, 101, 0.2)'
    },
    secondary: {
      background: 'var(--color-secondary)',
      hoverBackground: 'linear-gradient(135deg, rgba(45, 91, 120, 1) 0%, rgba(45, 91, 120, 0.9) 100%)',
      color: '#ffffff',
      shadow: '0 4px 16px rgba(45, 91, 120, 0.25), 0 2px 8px rgba(45, 91, 120, 0.15)',
      hoverShadow: '0 6px 20px rgba(45, 91, 120, 0.35), 0 3px 10px rgba(45, 91, 120, 0.2)'
    }
  };

  const variantStyle = variants[variant];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaLabel}
      style={{
        background: isHovered ? variantStyle.hoverBackground : variantStyle.background,
        color: variantStyle.color,
        border: 'none',
        borderRadius: borderRadius,
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: isHovered ? variantStyle.hoverShadow : variantStyle.shadow,
        padding: 0,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
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
      <Icon size={iconSize} />
    </motion.button>
  );
}

/**
 * AnswerStatusChip - malý chip s ikonou pro zobrazení správnosti odpovědi
 *
 * @param {string} status - 'correct' | 'incorrect'
 * @param {number} size - Velikost ikony v px (default: 20)
 * @param {object} style - Dodatečné styly
 */
export function AnswerStatusChip({ status = 'correct', size = 20, style = {}, ...props }) {
  const statusConfig = {
    correct: {
      icon: CheckCircle,
      background: 'rgba(16, 185, 129, 0.15)',
      color: '#10b981',
      border: 'none'
    },
    incorrect: {
      icon: XCircle,
      background: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
      border: 'none'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  // Přehrát zvuk při zobrazení chipu
  useEffect(() => {
    if (status === 'correct') {
      audioEngine.playSuccess();
    } else if (status === 'incorrect') {
      audioEngine.playError();
    }
  }, []); // Prázdný array = spustí se pouze při mount

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.375rem',
        borderRadius: RADIUS.md,
        background: config.background,
        border: config.border,
        ...style
      }}
      {...props}
    >
      <Icon size={size} color={config.color} strokeWidth={2.5} />
    </motion.div>
  );
}

/**
 * ActionButtonGroup - skupina akčních tlačítek ve standardním pořadí
 * Pořadí: Upravit → Duplikovat → Smazat
 *
 * @param {function} onEdit - Callback pro úpravu
 * @param {function} onDuplicate - Callback pro duplikaci
 * @param {function} onDelete - Callback pro smazání
 * @param {boolean} iconOnly - Zobrazit jen ikony bez textů (default: true)
 * @param {number} iconSize - Velikost ikon (default: 18)
 * @param {object} style - Dodatečné styly pro wrapper
 */
export function ActionButtonGroup({
  onEdit,
  onDuplicate,
  onDelete,
  iconOnly = true,
  iconSize = 18,
  style = {},
  ...props
}) {
  return (
    <div
      className="action-button-group"
      style={{
        display: 'flex',
        gap: '0.25rem',
        justifyContent: 'flex-end',
        width: '100%',
        ...style
      }}
      {...props}
    >
      {onEdit && (
        <ActionButton
          variant="edit"
          onClick={onEdit}
          iconOnly={iconOnly}
          iconSize={iconSize}
        />
      )}
      {onDuplicate && (
        <ActionButton
          variant="duplicate"
          onClick={onDuplicate}
          iconOnly={iconOnly}
          iconSize={iconSize}
        />
      )}
      {onDelete && (
        <ActionButton
          variant="delete"
          onClick={onDelete}
          iconOnly={iconOnly}
          iconSize={iconSize}
        />
      )}
    </div>
  );
}

/**
 * BackButton - tlačítko pro navigaci zpět
 * Automaticky používá React Router navigate(-1)
 *
 * @param {string} variant - 'primary' | 'secondary' (default: 'secondary')
 * @param {number} size - Velikost tlačítka v px (default: 48)
 * @param {number} iconSize - Velikost ikony v px (default: 24)
 * @param {function} onClick - Custom onClick handler (pokud chceš override default behavior)
 * @param {object} style - Dodatečné styly
 */
export function BackButton({
  variant = 'secondary',
  size = 48,
  iconSize = 24,
  onClick,
  style = {},
  ...props
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <IconButton
      icon={ChevronLeft}
      onClick={handleClick}
      variant={variant}
      size={size}
      iconSize={iconSize}
      ariaLabel="Zpět"
      style={style}
      {...props}
    />
  );
}

/**
 * MelodyNote - animovaný chip pro zobrazení noty v melodii písničky
 * Používá se pro vizualizaci melodie s podporou zvýraznění aktuální/následující/zahrané noty
 *
 * @param {string} note - Text noty (např. "C", "E", "GG", "-")
 * @param {boolean} isCurrent - Je to právě hraná nota? (default: false)
 * @param {boolean} isNext - Je to následující nota? (default: false)
 * @param {boolean} isPlayed - Byla nota už správně zahraná? (default: false) - pro akordy
 * @param {object} style - Dodatečné styly
 */
export function MelodyNote({ note, isCurrent = false, isNext = false, isPlayed = false, style = {}, ...props }) {
  return (
    <motion.div
      animate={{
        scale: isCurrent ? 1.3 : isNext ? 1.1 : 1
      }}
      style={{
        padding: '0.5rem 0.75rem',
        borderRadius: RADIUS.md,
        fontSize: '0.875rem',
        fontWeight: 600,
        color: isPlayed || isCurrent || isNext ? 'var(--color-primary)' : 'var(--color-secondary)',
        background: isCurrent
          ? 'rgba(181, 31, 101, 0.4)'
          : isNext
          ? 'rgba(181, 31, 101, 0.15)'
          : 'rgba(45, 91, 120, 0.1)',
        border: 'none',
        transition: 'all 0.2s',
        position: 'relative',
        ...style
      }}
      {...props}
    >
      {note}
      {isNext && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            fontSize: '0.75rem'
          }}
        >
          ▶
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * PrimaryButton - Univerzální primární tlačítko
 * @param {function} onClick - Callback funkce
 * @param {React.ReactNode} children - Obsah tlačítka (text, ikony)
 * @param {boolean} fullWidth - Roztáhnout na celou šířku? (default: false)
 * @param {object} style - Dodatečné styly
 */
export function PrimaryButton({ onClick, children, fullWidth = false, style = {}, ...props }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.875rem 1.5rem',
        borderRadius: 'var(--radius-lg)',
        fontSize: '0.95rem',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: 'linear-gradient(135deg, rgba(181, 31, 101, 1) 0%, rgba(221, 51, 121, 1) 100%)',
        color: '#ffffff',
        boxShadow: isHovered
          ? '0 6px 20px rgba(181, 31, 101, 0.4)'
          : '0 4px 12px rgba(181, 31, 101, 0.3)',
        width: fullWidth ? '100%' : 'auto',
        ...style
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * ToggleButton - Modulární toggle tlačítko pro zapínání/vypínání funkcí
 * @param {boolean} isActive - Je tlačítko aktivní (zapnuté)?
 * @param {function} onClick - Funkce volaná při kliknutí
 * @param {React.Component} icon - Lucide ikona komponenta
 * @param {string} label - Text tlačítka
 * @param {string} activeTitle - Tooltip text pro aktivní stav
 * @param {string} inactiveTitle - Tooltip text pro neaktivní stav
 * @param {object} style - Dodatečné inline styly
 */
export function ToggleButton({
  isActive = false,
  onClick,
  icon: Icon,
  label,
  activeTitle = '',
  inactiveTitle = '',
  style = {},
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: RADIUS.md,
        border: BORDER.none,
        boxShadow: SHADOW.subtle,
        background: isActive
          ? 'var(--color-secondary)'
          : 'rgba(255, 255, 255, 0.7)',
        color: isActive ? 'white' : 'var(--color-text-muted)',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: isActive ? 600 : 400,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        ...style
      }}
      title={isActive ? activeTitle : inactiveTitle}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {label}
    </motion.button>
  );
}

/**
 * CloseButton - Modulární zavírací tlačítko s animací oka
 * @param {function} onClick - Funkce volaná při kliknutí
 * @param {number} size - Velikost ikony (default: 20)
 * @param {string} buttonSize - Velikost tlačítka (default: '36px')
 * @param {object} style - Dodatečné inline styly
 */
export function CloseButton({ onClick, size = 20, buttonSize = '36px', style = {} }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    audioEngine.playClick();
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        background: 'rgba(45, 91, 120, 0.1)',
        border: 'none',
        borderRadius: '50%',
        width: buttonSize,
        height: buttonSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ...style
      }}
    >
      {isHovered ? (
        <EyeOff size={size} color="var(--color-secondary)" />
      ) : (
        <Eye size={size} color="var(--color-secondary)" />
      )}
    </motion.button>
  );
}

/**
 * QuizAnswerButton - Interaktivní button pro odpovědi v kvízech
 * Použití: ChordQuiz, TheoryQuiz, atd.
 *
 * @param {string} text - Text odpovědi
 * @param {boolean} isSelected - Je tato odpověď vybrána?
 * @param {boolean} showResult - Zobrazit výsledek (disable interakce)?
 * @param {boolean} showCorrect - Zobrazit zelenou fajfku (správná odpověď)?
 * @param {boolean} showWrong - Zobrazit červený křížek (špatná odpověď)?
 * @param {function} onClick - Callback při kliknutí
 * @param {boolean} disabled - Zakázat button?
 * @param {boolean} isMobile - Mobilní rozměry?
 * @param {string} background - Pozadí buttonu (default: 'var(--glass-bg)')
 * @param {object} style - Dodatečné styly
 */
export function QuizAnswerButton({
  text,
  isSelected = false,
  showResult = false,
  showCorrect = false,
  showWrong = false,
  onClick,
  disabled = false,
  isMobile = false,
  background = 'var(--glass-bg)',
  style = {},
  ...props
}) {
  return (
    <motion.button
      whileHover={!showResult ? { scale: 1.02, y: -2 } : {}}
      whileTap={!showResult ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: isMobile ? '0.875rem' : '1.25rem',
        borderRadius: RADIUS.lg,
        border: BORDER.none,
        boxShadow: isSelected
          ? SHADOW.selected
          : SHADOW.subtle,
        background,
        cursor: showResult ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        color: 'var(--text-primary)',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        minHeight: isMobile ? '3rem' : '3.5rem',
        ...(isMobile ? {} : { fontSize: '1rem' }),
        ...style
      }}
      {...props}
    >
      <span>{text}</span>
      {showCorrect && <AnswerStatusChip status="correct" size={isMobile ? 16 : 20} />}
      {showWrong && <AnswerStatusChip status="incorrect" size={isMobile ? 16 : 20} />}
    </motion.button>
  );
}
