import { Award, BookOpen, Zap, Flame, Gamepad2, Music } from 'lucide-react';
import { StatCard } from '../ui/CardComponents';

/**
 * UserStatsGrid - Reusable statistický grid s 6 kartami
 *
 * @param {Object} stats - Statistiky uživatele
 * @param {number} stats.completedLessons - Počet dokončených lekcí
 * @param {number} stats.totalLessons - Celkový počet dostupných lekcí
 * @param {number} stats.points - Celkové body (XP)
 * @param {number} stats.streak - Počet dní v řadě
 * @param {number} stats.quizzesCompleted - Počet dokončených kvízů
 * @param {number} stats.songsCompleted - Počet zahraných písní
 * @param {Function} onStatClick - Optional callback pro kliknutí na stat (filterType) => void
 */
function UserStatsGrid({ stats, onStatClick }) {
  const {
    completedLessons = 0,
    totalLessons = 0,
    points = 0,
    streak = 0,
    quizzesCompleted = 0,
    songsCompleted = 0
  } = stats;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem' }}>
      <StatCard
        icon={Award}
        value={completedLessons}
        label="Dokončených lekcí"
        onClick={onStatClick ? () => onStatClick('lessons_completed') : undefined}
        delay={0.2}
      />

      <StatCard
        icon={BookOpen}
        value={totalLessons}
        label="Dostupných lekcí"
        delay={0.4}
      />

      <StatCard
        icon={Zap}
        value={points}
        label="Bodů"
        onClick={onStatClick ? () => onStatClick('total_xp') : undefined}
        delay={0.6}
      />

      <StatCard
        icon={Flame}
        value={streak}
        label="Dní v řadě"
        onClick={onStatClick ? () => onStatClick('current_streak') : undefined}
        delay={0.8}
      />

      <StatCard
        icon={Gamepad2}
        value={quizzesCompleted}
        label="Dokončených kvízů"
        onClick={onStatClick ? () => onStatClick('quizzes_completed') : undefined}
        delay={1.0}
      />

      <StatCard
        icon={Music}
        value={songsCompleted}
        label="Zahraných písní"
        onClick={onStatClick ? () => onStatClick('songs_completed') : undefined}
        delay={1.2}
      />
    </div>
  );
}

export default UserStatsGrid;
