import { useState } from 'react';
import { Music, TrendingUp, Activity, Sparkles, Brain, BookOpen, GraduationCap } from 'lucide-react';
import TabButtons from '../ui/TabButtons';
import UniversalTheoryQuiz from './UniversalTheoryQuiz';
import { motion } from 'framer-motion';

/**
 * TheoryQuizHub - Centrální rozhraní pro všechny teoretické kvízy
 */
function TheoryQuizHub() {
  const [mainSection, setMainSection] = useState('quizzes'); // 'quizzes' nebo 'materials'
  const [activeQuizType, setActiveQuizType] = useState('interval');

  // Konfigurace hlavních sekcí
  const MAIN_SECTIONS = [
    {
      id: 'quizzes',
      label: 'Kvízy',
      icon: GraduationCap
    },
    {
      id: 'materials',
      label: 'Materiály',
      icon: BookOpen
    }
  ];

  // Konfigurace všech typů kvízů
  const QUIZ_TYPES = [
    {
      id: 'theory',
      label: 'Teoretický kvíz',
      icon: Brain,
      title: 'Kvíz: Hudební teorie',
      description: 'Obecné otázky z hudební teorie'
    },
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
      id: 'chord',
      label: 'Akordy',
      icon: Music,
      title: 'Kvíz: Akordy',
      description: 'Rozpoznávejte a pojmenovávejte hudební akordy'
    },
    {
      id: 'rhythm',
      label: 'Rytmus',
      icon: Sparkles,
      title: 'Kvíz: Rytmus',
      description: 'Procvičte si notové hodnoty a rytmické vzorce'
    },
    {
      id: 'mixed',
      label: 'Mix',
      icon: Sparkles,
      title: 'Kvíz: Mix',
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

      {/* Hlavní navigační tabs */}
      <TabButtons
        tabs={MAIN_SECTIONS}
        activeTab={mainSection}
        onTabChange={setMainSection}
        options={{ size: 'lg', style: { marginBottom: '1.5rem' } }}
      />

      {/* Kvízy sekce */}
      {mainSection === 'quizzes' && (
        <>
          {/* Tabs pro typy kvízů */}
          <TabButtons
            tabs={QUIZ_TYPES}
            activeTab={activeQuizType}
            onTabChange={setActiveQuizType}
            options={{ layout: 'pill', style: { marginBottom: '1.5rem' } }}
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
        </>
      )}

      {/* Materiály sekce */}
      {mainSection === 'materials' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '12px',
            textAlign: 'center'
          }}
        >
          <BookOpen size={48} color="var(--color-primary)" style={{ margin: '0 auto 1rem' }} />
          <h2>Materiály</h2>
          <p style={{ color: '#64748b' }}>
            Sekce s učebními materiály bude brzy k dispozici.
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default TheoryQuizHub;
