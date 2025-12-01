import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Chip, ActionButtonGroup } from '../ui/ButtonComponents';
import { CONFETTI_TYPE_LABELS } from '../../utils/achievementConstants';

/**
 * Univerzální karta pro zobrazení různých typů entit
 * @param {string} type - Typ entity: 'achievement' | 'xp_rule' | 'quiz_bonus' | 'level'
 * @param {object} data - Data entity
 */
function AchievementCard({ type = 'achievement', data, achievement, onEdit, onDuplicate, onDelete }) {
  // Zpětná kompatibilita - pokud je předán achievement prop místo data
  const item = data || achievement;

  // Mapování dat podle typu
  const getMappedData = () => {
    switch (type) {
      case 'xp_rule':
      case 'quiz_bonus':
        return {
          title: item.label,
          description: item.description || '',
          xp_value: item.xp_value,
          action_type: item.action_type,
          icon_type: item.icon_type || 'Zap',
          icon_color: item.icon_color || 'primary',
          display_order: item.display_order,
          is_active: item.is_active,
          id: item.id
        };

      case 'level':
        return {
          title: item.label,
          description: `Level ${item.level}`,
          level: item.level,
          min_xp: item.min_xp,
          max_xp: item.max_xp,
          icon_type: item.icon_type || 'Star',
          icon_color: item.icon_color || 'secondary',
          is_active: item.is_active,
          id: item.id
        };

      case 'achievement':
      default:
        return {
          title: item.title,
          description: item.description,
          xp_reward: item.xp_reward,
          confetti_type: item.confetti_type,
          celebration_sound: item.celebration_sound,
          icon_type: item.icon_type || 'Trophy',
          icon_color: item.icon_color || 'primary',
          is_active: item.is_active,
          id: item.id
        };
    }
  };

  const mappedData = getMappedData();

  const renderIcon = (iconType, iconColor, size = 32) => {
    const IconComponent = LucideIcons[iconType] || LucideIcons.Trophy;
    return <IconComponent size={size} color={`var(--color-${iconColor})`} />;
  };

  // Renderování info chipů podle typu
  const renderInfoChips = () => {
    switch (type) {
      case 'xp_rule':
      case 'quiz_bonus':
        return (
          <>
            <Chip text={`+${mappedData.xp_value} XP`} variant="info" />
            <Chip text={`ID: ${mappedData.action_type}`} variant="info" />
            {mappedData.display_order !== undefined && (
              <Chip text={`Pořadí: ${mappedData.display_order}`} variant="info" />
            )}
            {mappedData.is_active === false && (
              <Chip text="Neaktivní" variant="inactive" />
            )}
          </>
        );

      case 'level':
        return (
          <>
            <Chip text={`Level ${mappedData.level}`} variant="info" />
            <Chip
              text={`${mappedData.min_xp} - ${mappedData.max_xp === null ? '∞' : mappedData.max_xp} XP`}
              variant="info"
            />
            {mappedData.is_active === false && (
              <Chip text="Neaktivní" variant="inactive" />
            )}
          </>
        );

      case 'achievement':
      default:
        return (
          <>
            <Chip text={`+${mappedData.xp_reward} XP`} variant="info" />
            <Chip
              text={CONFETTI_TYPE_LABELS[mappedData.confetti_type] || 'Kovové'}
              variant="info"
            />
            <Chip text={mappedData.celebration_sound || 'achievement'} variant="info" />
            {mappedData.is_active === false && (
              <Chip text="Neaktivní" variant="inactive" />
            )}
          </>
        );
    }
  };

  return (
    <motion.div
      className="achievement-card"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4, boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.25)' }}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 'var(--radius-xl)',
        border: 'none',
        boxShadow: 'var(--glass-shadow)',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: mappedData.is_active === false ? 0.6 : 1
      }}
    >
      {/* Drag handle - levý horní roh */}
      <div
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          cursor: 'grab',
          color: 'var(--color-text-secondary)',
          opacity: 0.4,
          transition: 'opacity 0.2s'
        }}
      >
        <LucideIcons.GripVertical size={18} />
      </div>

      {/* Aktivní/Neaktivní ikona - levý spodní roh */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.75rem',
          left: '0.75rem',
          color: mappedData.is_active === false ? '#ef4444' : '#10b981',
          opacity: 0.7
        }}
        title={mappedData.is_active === false ? 'Neaktivní' : 'Aktivní'}
      >
        {mappedData.is_active === false ? <LucideIcons.XCircle size={18} /> : <LucideIcons.CheckCircle size={18} />}
      </div>

      {/* Ikona odměny */}
      <div
        style={{
          width: '60px',
          height: '60px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          border: `2px solid var(--color-${mappedData.icon_color})`,
          boxShadow: `0 4px 16px rgba(181, 31, 101, 0.25)`
        }}
      >
        {renderIcon(mappedData.icon_type, mappedData.icon_color, 32)}
      </div>

      {/* Název a popis */}
      <h4
        style={{
          marginBottom: '0.5rem',
          color: 'var(--color-text)',
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        {mappedData.title}
      </h4>
      <p
        style={{
          fontSize: '0.8125rem',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          marginBottom: '1rem',
          lineHeight: 1.5
        }}
      >
        {mappedData.description}
      </p>

      {/* Info chipy */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}
      >
        {renderInfoChips()}
      </div>

      {/* Akční tlačítka */}
      <ActionButtonGroup
        onEdit={() => onEdit(item)}
        onDuplicate={() => onDuplicate(item)}
        onDelete={() => onDelete(item.id, mappedData.title)}
      />
    </motion.div>
  );
}

export default AchievementCard;
