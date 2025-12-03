import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Chip } from '../ui/ButtonComponents';

/**
 * AchievementGrid - Grid s achievementy včetně animací a filtrování
 *
 * @param {Array} achievements - Seznam achievementů k zobrazení
 * @param {string} activeFilter - Aktivní filtr (requirement_type) nebo null
 * @param {Function} onAchievementClick - Callback při kliknutí na achievement
 * @param {Function} getAchievementIcon - Funkce pro získání ikony achievementu
 */
function AchievementGrid({ achievements, activeFilter, onAchievementClick, getAchievementIcon }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
      {achievements.map((achievement, index) => {
        const isEarned = achievement.isEarned;
        const isHighlighted = !activeFilter || achievement.requirement_type === activeFilter;
        const isDimmed = activeFilter && achievement.requirement_type !== activeFilter;

        return (
          <motion.div
            key={achievement.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: 1,
              rotate: 0,
              opacity: isDimmed ? 0.3 : 1
            }}
            transition={{ delay: index * 0.05, type: 'spring' }}
            whileHover={{ scale: isDimmed ? 1 : 1.05, y: isDimmed ? 0 : -5 }}
            onClick={() => !isDimmed && onAchievementClick(achievement)}
            style={{
              padding: '1.5rem',
              background: isDimmed
                ? 'rgba(255, 255, 255, 0.3)'
                : isEarned
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              textAlign: 'center',
              cursor: isDimmed ? 'default' : 'pointer',
              boxShadow: isDimmed
                ? 'none'
                : isEarned
                  ? '0 8px 24px rgba(181, 31, 101, 0.25)'
                  : '0 4px 12px rgba(148, 163, 184, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              position: 'relative',
              filter: isDimmed ? 'grayscale(80%)' : 'none',
              transform: isHighlighted && activeFilter ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s ease'
            }}
            title={isDimmed ? achievement.description : 'Klikněte pro více informací'}
          >
            {/* Earned Badge - zelená ikona vlevo dole */}
            {isEarned && !isDimmed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.3, type: 'spring' }}
                style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  left: '0.75rem',
                  zIndex: 1
                }}
              >
                <CheckCircle size={20} color="#10b981" fill="none" strokeWidth={2.5} />
              </motion.div>
            )}

            {/* Icon */}
            <div style={{
              width: '64px',
              height: '64px',
              background: isEarned
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(226, 232, 240, 0.6)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              boxShadow: isEarned
                ? '0 4px 16px rgba(181, 31, 101, 0.25)'
                : '0 2px 8px rgba(148, 163, 184, 0.15)',
              filter: isEarned ? 'none' : 'grayscale(70%)'
            }}>
              {getAchievementIcon(achievement)}
            </div>

            {/* Title */}
            <div style={{
              fontWeight: 600,
              color: isEarned ? 'var(--color-text)' : 'var(--color-text-secondary)',
              fontSize: '0.95rem',
              lineHeight: '1.3'
            }}>
              {achievement.title}
            </div>

            {/* Description */}
            <div className="text-sm" style={{
              color: 'var(--color-text-secondary)',
              lineHeight: '1.4',
              minHeight: '2.8em'
            }}>
              {achievement.description}
            </div>

            {/* XP Reward */}
            <Chip
              text={`+${achievement.xp_reward} XP`}
              variant={isEarned ? 'info' : 'inactive'}
            />

            {/* Progress Bar for Unearned */}
            {!isEarned && (
              <div style={{ width: '100%', marginTop: '0.25rem' }}>
                <div className="text-xs font-medium" style={{
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.375rem'
                }}>
                  {achievement.currentValue} / {achievement.requirementValue}
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(148, 163, 184, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${achievement.progress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, rgba(181, 31, 101, 0.5) 0%, rgba(181, 31, 101, 0.6) 75%, rgba(45, 91, 120, 0.6) 100%)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Earned Date */}
            {isEarned && achievement.earnedAt && (
              <div className="text-xs" style={{
                color: 'var(--color-text-secondary)',
                marginTop: '0.25rem'
              }}>
                Získáno {new Date(achievement.earnedAt).toLocaleDateString('cs-CZ')}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default AchievementGrid;
