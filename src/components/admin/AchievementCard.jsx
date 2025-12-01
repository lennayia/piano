import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Chip, ActionButtonGroup } from '../ui/ButtonComponents';
import { CONFETTI_TYPE_LABELS } from '../../utils/achievementConstants';

/**
 * Karta pro zobrazení jedné achievement (odměny)
 */
function AchievementCard({ achievement, onEdit, onDuplicate, onDelete }) {
  const renderIcon = (iconType, iconColor, size = 32) => {
    const IconComponent = LucideIcons[iconType] || LucideIcons.Trophy;
    return <IconComponent size={size} color={`var(--color-${iconColor})`} />;
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
        opacity: achievement.is_active === false ? 0.6 : 1
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
          color: achievement.is_active === false ? '#ef4444' : '#10b981',
          opacity: 0.7
        }}
        title={achievement.is_active === false ? 'Neaktivní' : 'Aktivní'}
      >
        {achievement.is_active === false ? <LucideIcons.XCircle size={18} /> : <LucideIcons.CheckCircle size={18} />}
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
          border: `2px solid var(--color-${achievement.icon_color})`,
          boxShadow: `0 4px 16px rgba(181, 31, 101, 0.25)`
        }}
      >
        {renderIcon(achievement.icon_type, achievement.icon_color, 32)}
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
        {achievement.title}
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
        {achievement.description}
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
        <Chip text={`+${achievement.xp_reward} XP`} variant="info" />
        <Chip
          text={CONFETTI_TYPE_LABELS[achievement.confetti_type] || 'Kovové'}
          variant="info"
        />
        <Chip text={achievement.celebration_sound || 'achievement'} variant="info" />
        {achievement.is_active === false && (
          <Chip text="Neaktivní" variant="inactive" />
        )}
      </div>

      {/* Akční tlačítka */}
      <ActionButtonGroup
        onEdit={() => onEdit(achievement)}
        onDuplicate={() => onDuplicate(achievement)}
        onDelete={() => onDelete(achievement.id, achievement.title)}
      />
    </motion.div>
  );
}

export default AchievementCard;
