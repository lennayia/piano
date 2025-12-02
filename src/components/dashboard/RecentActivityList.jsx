import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { History, Calendar, Clock } from 'lucide-react';
import { Chip } from '../ui/ButtonComponents';

/**
 * RecentActivityList - Seznam nedávných aktivit s animacemi
 *
 * @param {Array} activities - Seznam aktivit k zobrazení
 * @param {boolean} isMobile - Příznak mobilního zobrazení
 */
function RecentActivityList({ activities, isMobile }) {
  if (!activities || activities.length === 0) {
    return null;
  }

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}.`;
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      style={{ marginBottom: '2rem' }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <h2 style={{
          color: 'var(--color-text)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: 0
        }}>
          <History size={24} color="var(--color-primary)" />
          Nedávná aktivita
        </h2>
        <Link
          to="/history"
          className="text-base font-medium"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            textDecoration: 'none',
            color: 'var(--color-primary)',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          Ukázat všechno →
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0' : '0.5rem' }}>
        {activities.map((activity, index) => {
          const Icon = activity.icon;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.05 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="card"
              style={{
                padding: isMobile ? '0.75rem' : '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.75rem' : '1rem',
                background: 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                cursor: 'default',
                borderRadius: isMobile ? 'var(--radius-md)' : 'var(--radius-lg)'
              }}
            >
              <Icon
                size={20}
                color="var(--color-primary)"
                style={{ flexShrink: 0 }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-base font-semibold" style={{
                  color: 'var(--color-text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {activity.title}
                </div>
                <div className="text-sm" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--color-text-secondary)',
                  marginTop: '0.25rem'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    {formatDate(activity.date)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} />
                    {formatTime(activity.date)}
                  </span>
                </div>
              </div>

              <Chip
                text={`+${activity.xp} XP`}
                variant="info"
                style={{
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default RecentActivityList;
