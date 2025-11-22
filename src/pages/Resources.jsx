import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Book } from 'lucide-react';
import HarmonizationTemplates from '../components/resources/HarmonizationTemplates';
import Glossary from '../components/resources/Glossary';
import TabButtons from '../components/ui/TabButtons';
import { FloatingHelpButton } from '../components/ui/FloatingHelp';

function Resources() {
  const [activeTab, setActiveTab] = useState('templates');

  const tabs = [
    { id: 'templates', label: 'Šablony harmonizace', icon: BookOpen },
    { id: 'glossary', label: 'Slovníček', icon: Book }
  ];

  return (
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

      <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '3rem', textAlign: 'left' }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1e293b' }}>
          Výukové materiály
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
          Procvičte si harmonizaci pomocí interaktivního kvízu a připravených šablon
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{ marginBottom: '2rem' }}>
        <TabButtons
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          options={{ size: 'md', gap: '1rem' }}
        />
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'templates' && <HarmonizationTemplates />}
        {activeTab === 'glossary' && <Glossary />}
      </motion.div>
      </div>
    </>
  );
}

export default Resources;
