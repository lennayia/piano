import { useState } from 'react';
import { Music, TrendingUp, Activity, Sparkles, Brain } from 'lucide-react';
import TabButtons from '../ui/TabButtons';
import UniversalTheoryQuiz from './UniversalTheoryQuiz';
import { motion } from 'framer-motion';

/**
 * TheoryQuizHub - Centrální rozhraní pro všechny teoretické kvízy
 * Umožňuje uživatelům vybrat si typ kvízu a hrát
 */
function TheoryQuizHub() {
  const [activeQuizType, setActiveQuizType] = useState('interval');

  // Konfigurace všech typů kvízů
  const QUIZ_TYPES = [
    {
      id: 'interval',
      label: 'Intervaly',
      icon: TrendingUp,
      title: 'Kvíz: Intervaly',
      description: 'Naučte se rozpoznávat a pojmenovávat hudební intervaly',
      color: 'rgba(45, 91, 120, 0.1)'
    },
    {
      id: 'scale',
      label: 'Stupnice',
      icon: Activity,
      title: 'Kvíz: Stupnice',
      description: 'Otestujte své znalosti durových a mollových stupnic',
      color: 'rgba(181, 31, 101, 0.1)'
    },
    {
      id: 'rhythm',
      label: 'Rytmus',
      icon: Music,
      title: 'Kvíz: Rytmus',
      description: 'Procvičte si notové hodnoty a rytmické vzorce',
      color: 'rgba(139, 92, 246, 0.1)'
    },
    {
      id: 'mixed',
      label: 'Mix',
      icon: Sparkles,
      title: 'Kvíz: Hudební teorie',
      description: 'Smíšené otázky ze všech oblastí hudební teorie',
      color: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  const currentQuiz = QUIZ_TYPES.find(q => q.id === activeQuizType);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9))'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <Brain size={48} color="var(--color-primary)" />
            <h1 style={{
              fontSize: '3rem',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}>
              Hudební teorie
            </h1>
          </div>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Vyberte si typ kvízu a otestujte své znalosti! Získávejte XP body a sledujte svůj pokrok.
          </p>
        </motion.div>

        {/* Quiz Type Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            marginBottom: '3rem',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: '2px solid rgba(45, 91, 120, 0.1)'
          }}>
            <TabButtons
              tabs={QUIZ_TYPES}
              activeTab={activeQuizType}
              onTabChange={setActiveQuizType}
              options={{ layout: 'pill', size: 'md' }}
            />
          </div>
        </motion.div>

        {/* Quiz Container */}
        <motion.div
          key={activeQuizType}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius)',
            padding: '2rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: '2px solid rgba(45, 91, 120, 0.1)'
          }}
        >
          {currentQuiz && (
            <UniversalTheoryQuiz
              quizType={currentQuiz.id}
              title={currentQuiz.title}
              description={currentQuiz.description}
              icon={currentQuiz.icon}
            />
          )}
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            marginTop: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.1), rgba(45, 91, 120, 0.05))',
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '2px solid rgba(45, 91, 120, 0.2)',
            textAlign: 'center'
          }}>
            <TrendingUp size={32} color="var(--color-secondary)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Sledujte pokrok
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Každý kvíz ukládá vaše výsledky a získáváte XP body za správné odpovědi
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.1), rgba(181, 31, 101, 0.05))',
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '2px solid rgba(181, 31, 101, 0.2)',
            textAlign: 'center'
          }}>
            <Sparkles size={32} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Získávejte odměny
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Perfektní skóre vám přinese 100 XP! Čím lépe odpovídáte, tím více bodů získáte
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
            padding: '1.5rem',
            borderRadius: 'var(--radius)',
            border: '2px solid rgba(255, 215, 0, 0.3)',
            textAlign: 'center'
          }}>
            <Music size={32} color="#FFD700" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Budujte sérii
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Odpovídejte správně za sebou a budujte svou streak sérii pro extra motivaci
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TheoryQuizHub;
