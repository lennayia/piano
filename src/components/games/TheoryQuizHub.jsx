import { useState } from 'react';
import { Music, TrendingUp, Activity, Sparkles, Brain, BookOpen, GraduationCap, Book } from 'lucide-react';
import PageSection from '../ui/PageSection';
import UniversalTheoryQuiz from './UniversalTheoryQuiz';
import HarmonizationTemplates from '../resources/HarmonizationTemplates';
import Glossary from '../resources/Glossary';
import { FloatingHelpButton } from '../ui/FloatingHelp';
import { motion } from 'framer-motion';

/**
 * TheoryQuizHub - Centrální rozhraní pro všechny teoretické kvízy a materiály
 */
function TheoryQuizHub() {
  const [activeMainTab, setActiveMainTab] = useState('quizzes');
  const [activeSubTab, setActiveSubTab] = useState('chord');

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
      id: 'chord',
      label: 'Akordy',
      icon: Music,
      title: 'Kvíz: Akordy',
      description: 'Rozpoznávejte a pojmenovávejte hudební akordy'
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
      id: 'rhythm',
      label: 'Rytmus',
      icon: Sparkles,
      title: 'Kvíz: Rytmus',
      description: 'Procvičte si notové hodnoty a rytmické vzorce'
    },
    {
      id: 'theory',
      label: 'Teoretický kvíz',
      icon: Brain,
      title: 'Kvíz: Hudební teorie',
      description: 'Obecné otázky z hudební teorie'
    },
    {
      id: 'mixed',
      label: 'Mix',
      icon: Sparkles,
      title: 'Kvíz: Mix',
      description: 'Smíšené otázky ze všech oblastí hudební teorie'
    }
  ];

  // Konfigurace tabs pro materiály
  const MATERIAL_TABS = [
    { id: 'templates', label: 'Šablony harmonizace', icon: BookOpen },
    { id: 'glossary', label: 'Slovníček', icon: Book }
  ];

  // Mapování hlavních tabs na jejich sub-tabs
  const SUB_TABS = {
    quizzes: QUIZ_TYPES,
    materials: MATERIAL_TABS
  };

  // Handler pro změnu hlavního tabu - resetuje sub tab na výchozí hodnotu
  const handleMainTabChange = (newTab) => {
    setActiveMainTab(newTab);
    // Nastavit výchozí sub tab podle sekce
    if (newTab === 'quizzes') {
      setActiveSubTab('chord');
    } else if (newTab === 'materials') {
      setActiveSubTab('templates');
    }
  };

  // Najít aktuální kvíz
  const currentQuiz = QUIZ_TYPES.find(q => q.id === activeSubTab);

  // Dynamický obsah podle aktivních tabů
  const getSectionContent = () => {
    if (activeMainTab === 'quizzes') {
      const quiz = QUIZ_TYPES.find(q => q.id === activeSubTab);
      return {
        title: quiz?.title || '',
        description: quiz?.description || ''
      };
    } else if (activeMainTab === 'materials') {
      const materialContent = {
        templates: {
          title: 'Šablony harmonizace',
          description: 'Připravené harmonické postupy pro různé tóniny. Můžete si je přehrát a použít jako inspiraci.'
        },
        glossary: {
          title: 'Hudební slovníček',
          description: 'Přehled hudebních pojmů a jejich vysvětlení pro lepší pochopení teorie.'
        }
      };
      return materialContent[activeSubTab] || { title: '', description: '' };
    }
    return { title: '', description: '' };
  };

  const sectionContent = getSectionContent();

  return (
    <PageSection
      maxWidth="lg"
      icon={Brain}
      title="Hudební teorie"
      description="Vyberte si typ kvízu a otestujte své znalosti!"
      mainTabs={MAIN_SECTIONS}
      subTabs={SUB_TABS}
      activeMainTab={activeMainTab}
      activeSubTab={activeSubTab}
      onMainTabChange={handleMainTabChange}
      onSubTabChange={setActiveSubTab}
      sectionTitle={sectionContent.title}
      sectionDescription={sectionContent.description}
    >
      {/* Obsah podle aktivní sekce a sub tabu */}
      {activeMainTab === 'quizzes' && currentQuiz && (
        <UniversalTheoryQuiz
          quizType={currentQuiz.id}
          title={currentQuiz.title}
          description={currentQuiz.description}
          icon={currentQuiz.icon}
        />
      )}

      {activeMainTab === 'materials' && (
        <>
          <FloatingHelpButton title="Nápověda - Výukové materiály">
            <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.7 }}>
              <h4 style={{ color: '#1e293b', marginBottom: '0.75rem', fontSize: '1rem' }}>
                Výukové materiály
              </h4>
              <p style={{ marginBottom: '1rem' }}>
                Zde najdete pomocné materiály pro studium harmonizace a hudební teorie.
              </p>

              <div style={{
                background: 'rgba(45, 91, 120, 0.08)',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                marginBottom: '1rem',
                borderLeft: '3px solid var(--color-secondary)'
              }}>
                <strong style={{ color: '#1e293b' }}>Šablony harmonizace</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
                  Připravené harmonické postupy pro různé tóniny. Můžete si je přehrát a použít jako inspiraci.
                </p>
              </div>

              <div style={{
                background: 'rgba(45, 91, 120, 0.08)',
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                marginBottom: '1rem',
                borderLeft: '3px solid var(--color-secondary)'
              }}>
                <strong style={{ color: '#1e293b' }}>Slovníček</strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
                  Přehled hudebních pojmů a jejich vysvětlení. Užitečné pro pochopení teorie.
                </p>
              </div>

              <h4 style={{ color: '#1e293b', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}>
                Tip
              </h4>
              <p style={{ margin: 0 }}>
                U každé šablony harmonizace můžete kliknout na tlačítko <strong>Přehrát</strong> a uslyšíte celou kadenci - všechny akordy za sebou zakončené návratem na tóniku.
              </p>
            </div>
          </FloatingHelpButton>

          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeSubTab === 'templates' && <HarmonizationTemplates />}
            {activeSubTab === 'glossary' && <Glossary />}
          </motion.div>
        </>
      )}
    </PageSection>
  );
}

export default TheoryQuizHub;
