import { useState } from 'react';
import { Music, TrendingUp, Activity, Sparkles, Brain } from 'lucide-react';
import TabButtons from '../ui/TabButtons';
import UniversalTheoryQuiz from './UniversalTheoryQuiz';
import { motion } from 'framer-motion';

/**
 * TheoryQuizHub - Centrální rozhraní pro všechny teoretické kvízy
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
      description: 'Naučte se rozpoznávat a pojmenovávat hudební intervaly'
    },
    {
      id: 'scale',
      label: 'Stupnice',
      icon: Activity,
      title: 'Kvíz: Stupnice',
      description: 'Otestujte své znalosti durových a mollových stupnic'
    },
    {
      id: 'rhythm',
      label: 'Rytmus',
      icon: Music,
      title: 'Kvíz: Rytmus',
      description: 'Procvičte si notové hodnoty a rytmické vzorce'
    },
    {
      id: 'mixed',
      label: 'Mix',
      icon: Sparkles,
      title: 'Kvíz: Hudební teorie',
      description: 'Smíšené otázky ze všech oblastí hudební teorie'
    }
  ];

  const currentQuiz = QUIZ_TYPES.find(q => q.id === activeQuizType);

  return (
    <div className="container">
      {/* Hlavička */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.5rem'
        }}>
          <Brain size={32} color="var(--color-primary)" />
          Hudební teorie
        </h1>
        <p style={{ color: '#64748b' }}>
          Vyberte si typ kvízu a otestujte své znalosti!
        </p>
      </motion.div>

      {/* Tabs */}
      <TabButtons
        tabs={QUIZ_TYPES}
        activeTab={activeQuizType}
        onTabChange={setActiveQuizType}
        options={{ size: 'md', style: { marginBottom: '1.5rem' } }}
      />

      {/* Quiz obsah */}
      {currentQuiz && (
        <UniversalTheoryQuiz
          quizType={currentQuiz.id}
          title={currentQuiz.title}
          description={currentQuiz.description}
          icon={currentQuiz.icon}
        />
      )}
    </div>
  );
}

export default TheoryQuizHub;
