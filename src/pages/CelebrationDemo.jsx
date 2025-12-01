import { useState } from 'react';
import { Target, Trophy, Star, Flame, Crown } from 'lucide-react';
import CelebrationEffect from '../components/ui/CelebrationEffect';
import { getCelebrationConfig } from '../services/celebrationService';

/**
 * Demo stránka pro testování celebrations
 */
function CelebrationDemo() {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  // Test denního cíle bez achievementu
  const testDailyGoal = () => {
    const config = getCelebrationConfig('daily_goal', []);
    config.message = '🎯 Denní cíl splněn!\n3 dní v řadě! 🔥';

    setCelebrationData({
      config,
      xpEarned: 50,
      achievements: []
    });
    setShowCelebration(true);
  };

  // Test denního cíle s achievementem
  const testDailyGoalWithAchievement = () => {
    const mockAchievement = {
      id: 1,
      title: 'První denní cíl',
      description: 'Splň svůj první denní cíl',
      icon_type: 'Target',
      icon_color: 'primary',
      confetti_type: 'golden',
      celebration_sound: 'achievement',
      xp_reward: 100
    };

    const config = getCelebrationConfig('daily_goal', [mockAchievement]);

    setCelebrationData({
      config,
      xpEarned: 50,
      achievements: [mockAchievement]
    });
    setShowCelebration(true);
  };

  // Test lekce
  const testLesson = () => {
    const config = getCelebrationConfig('lesson', []);

    setCelebrationData({
      config,
      xpEarned: 10,
      achievements: []
    });
    setShowCelebration(true);
  };

  // Test písně
  const testSong = () => {
    const config = getCelebrationConfig('song', []);

    setCelebrationData({
      config,
      xpEarned: 15,
      achievements: []
    });
    setShowCelebration(true);
  };

  // Test kvízu
  const testQuiz = () => {
    const config = getCelebrationConfig('quiz', []);

    setCelebrationData({
      config,
      xpEarned: 25,
      achievements: []
    });
    setShowCelebration(true);
  };

  // Test achievement s vlastní konfigurací
  const testCustomAchievement = () => {
    const mockAchievement = {
      id: 2,
      title: 'Týdenní warrior 🔥',
      description: 'Splň denní cíl 7 dní v řadě',
      icon_type: 'Flame',
      icon_color: 'danger',
      confetti_type: 'rainbow',
      celebration_sound: 'fanfare',
      xp_reward: 500
    };

    const config = getCelebrationConfig('daily_goal', [mockAchievement]);

    setCelebrationData({
      config,
      xpEarned: 500,
      achievements: [mockAchievement]
    });
    setShowCelebration(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'var(--color-bg)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: 'var(--color-text)'
        }}>
          🎉 Celebration Demo
        </h1>

        <p style={{
          color: 'var(--color-text-muted)',
          marginBottom: '2rem'
        }}>
          Otestuj různé typy celebrations s modulární konfigurací
        </p>

        <div style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
        }}>
          {/* Denní cíle */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text)'
            }}>
              <Target size={20} color="var(--color-primary)" />
              Denní cíle
            </h3>

            <button
              className="btn btn-primary"
              onClick={testDailyGoal}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              Bez achievementu
            </button>

            <button
              className="btn btn-secondary"
              onClick={testDailyGoalWithAchievement}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              S achievementem
            </button>

            <button
              className="btn"
              onClick={testCustomAchievement}
              style={{ width: '100%' }}
            >
              Týdenní warrior 🔥
            </button>
          </div>

          {/* Ostatní typy */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              color: 'var(--color-text)'
            }}>
              <Star size={20} color="var(--color-secondary)" />
              Ostatní
            </h3>

            <button
              className="btn btn-secondary"
              onClick={testLesson}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              Lekce
            </button>

            <button
              className="btn btn-secondary"
              onClick={testSong}
              style={{ width: '100%', marginBottom: '0.5rem' }}
            >
              Píseň
            </button>

            <button
              className="btn btn-secondary"
              onClick={testQuiz}
              style={{ width: '100%' }}
            >
              Kvíz
            </button>
          </div>
        </div>

        {/* Config info */}
        <div className="card" style={{
          padding: '1.5rem',
          marginTop: '2rem',
          background: 'rgba(0, 0, 0, 0.02)'
        }}>
          <h3 style={{
            marginBottom: '1rem',
            color: 'var(--color-text)'
          }}>
            📋 Konfigurace
          </h3>

          <div style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            lineHeight: '1.6'
          }}>
            <p><strong>Denní cíl (fallback):</strong></p>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Ikona: Target</li>
              <li>Barva: Primary</li>
              <li>Konfety: Golden</li>
              <li>Zvuk: Achievement</li>
              <li>XP: 50</li>
            </ul>

            <p><strong>S achievementem:</strong></p>
            <ul style={{ marginLeft: '1.5rem' }}>
              <li>Vše se bere z achievement databáze</li>
              <li>Editovatelné v admin panelu</li>
              <li>Modulární - žádné hardcoded hodnoty</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Celebration Effect */}
      {celebrationData && (
        <CelebrationEffect
          isVisible={showCelebration}
          config={celebrationData.config}
          xpEarned={celebrationData.xpEarned}
          achievements={celebrationData.achievements}
          onComplete={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
}

export default CelebrationDemo;
