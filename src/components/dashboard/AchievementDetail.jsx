import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Chip, PrimaryButton } from '../ui/ButtonComponents';

/**
 * AchievementDetail - Detailní zobrazení achievementu pro Drawer
 *
 * @param {Object} achievement - Achievement k zobrazení
 * @param {Array} activities - Seznam aktivit přispívajících k achievementu
 * @param {boolean} loadingActivities - Příznak načítání aktivit
 * @param {Object} spacing - Spacing konstanty (margin, cardPadding, sectionGap)
 * @param {Function} getAchievementIcon - Funkce pro získání ikony achievementu
 * @param {Function} onNavigateToSection - Callback pro navigaci na sekci pro splnění
 */
function AchievementDetail({
  achievement,
  activities = [],
  loadingActivities,
  spacing,
  getAchievementIcon,
  onNavigateToSection
}) {
  if (!achievement) {
    return null;
  }

  return (
    <div>
      {/* Icon */}
      <div style={{
        width: '64px',
        height: '64px',
        background: achievement.isEarned
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(226, 232, 240, 0.6)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        boxShadow: achievement.isEarned
          ? '0 4px 16px rgba(181, 31, 101, 0.25)'
          : '0 2px 8px rgba(148, 163, 184, 0.15)',
        filter: achievement.isEarned ? 'none' : 'grayscale(70%)',
        margin: `0 auto ${spacing.margin}`
      }}>
        <div style={{ transform: 'scale(1.0)' }}>
          {getAchievementIcon(achievement)}
        </div>
      </div>

      {/* Description */}
      <p className="text-base" style={{
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        lineHeight: '1.5',
        marginBottom: spacing.margin
      }}>
        {achievement.description}
      </p>

      {/* Requirements & Progress */}
      <div style={{
        background: 'rgba(248, 250, 252, 0.8)',
        borderRadius: 'var(--radius-lg)',
        border: 'none',
        padding: spacing.cardPadding,
        marginBottom: spacing.margin
      }}>
        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(181, 31, 101, 0.06)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '0.5rem'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: achievement.isEarned
                ? '100%'
                : `${(achievement.currentValue / achievement.requirementValue) * 100}%`
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, rgba(181, 31, 101, 1) 0%, rgba(181, 31, 101, 1) 75%, rgba(45, 91, 120, 1) 100%)',
              borderRadius: '999px'
            }}
          />
        </div>
        {/* Progress text */}
        <div className="text-sm font-medium" style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)'
        }}>
          {achievement.isEarned
            ? `${achievement.requirementValue} z ${achievement.requirementValue}`
            : `${achievement.currentValue} z ${achievement.requirementValue}`
          }
        </div>
      </div>

      {/* Earned Date - show date of last contributing activity */}
      {achievement.isEarned && activities.length > 0 && (() => {
        const lastActivity = activities[activities.length - 1];
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            marginBottom: spacing.margin
          }}>
            <CheckCircle size={16} color="#10b981" fill="none" strokeWidth={2.5} />
            <span>
              Splněno {lastActivity.date.toLocaleDateString('cs-CZ', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })} v {lastActivity.date.toLocaleTimeString('cs-CZ', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        );
      })()}

      {/* XP Reward */}
      <div style={{
        textAlign: 'center',
        marginBottom: spacing.margin
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 10,
            delay: 0.3
          }}
          whileHover={{ scale: 1.05 }}
          style={{ display: 'inline-block' }}
        >
          <Chip
            text={`+${achievement.xp_reward} XP`}
            variant="info"
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              color: 'var(--color-primary)',
              boxShadow: 'inset 0 0 16px rgba(181, 31, 101, 1), 0 1px 3px rgba(181, 31, 101, 0.15)'
            }}
          />
        </motion.div>
      </div>

      {/* Activity Details Section */}
      {activities.length > 0 && (
        <div style={{
          marginBottom: spacing.margin,
          paddingTop: spacing.sectionGap
        }}>
          {loadingActivities ? (
            <div style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Načítání...
            </div>
          ) : (
            <div style={{
              maxHeight: '70vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              boxShadow: '0 1px 3px rgba(148, 163, 184, 0.1)'
            }}>
              {activities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(181, 31, 101, 0.03)' }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderBottom: index < activities.length - 1
                      ? '1px solid rgba(148, 163, 184, 0.1)'
                      : 'none',
                    cursor: 'default'
                  }}
                >
                  {/* Icon */}
                  <CheckCircle
                    size={16}
                    color="var(--color-primary)"
                    fill="none"
                    strokeWidth={2.5}
                    style={{ minWidth: '16px', flexShrink: 0 }}
                  />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="text-base font-medium" style={{
                      color: 'var(--color-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '0.125rem'
                    }}>
                      {activity.title}
                    </div>
                    <div className="text-sm" style={{
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {activity.date.toLocaleDateString('cs-CZ', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                      <span>•</span>
                      {activity.date.toLocaleTimeString('cs-CZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* XP Badge */}
                  <Chip
                    text={`+${activity.xp}`}
                    variant="success"
                    style={{ whiteSpace: 'nowrap', borderRadius: 'var(--radius-md)' }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      {!achievement.isEarned && (
        <PrimaryButton
          onClick={(e) => onNavigateToSection(achievement.requirement_type, e)}
          style={{ margin: '0 auto' }}
        >
          Jít splnit
          <ArrowRight size={18} />
        </PrimaryButton>
      )}
    </div>
  );
}

export default AchievementDetail;
