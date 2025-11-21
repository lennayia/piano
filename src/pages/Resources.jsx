import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Music, Target, Book } from 'lucide-react';
import SongLibrary from '../components/resources/SongLibrary';
import HarmonizationTemplates from '../components/resources/HarmonizationTemplates';
import ChordQuiz from '../components/games/ChordQuiz';
import Glossary from '../components/resources/Glossary';
import TabButtons from '../components/ui/TabButtons';

function Resources() {
  const [activeTab, setActiveTab] = useState('playlist');
  const [activeCategory, setActiveCategory] = useState('lidovky');

  const tabs = [
    { id: 'quiz', label: 'Poznáte akord?', icon: Target },
    { id: 'playlist', label: 'Písničky', icon: Music },
    { id: 'templates', label: 'Šablony harmonizace', icon: BookOpen },
    { id: 'glossary', label: 'Slovníček', icon: Book }
  ];

  const songCategories = [
    { id: 'lidovky', label: 'Lidovky', icon: Music },
    { id: 'uzskorolidovky', label: 'Užskorolidovky', icon: Music },
    { id: 'detske', label: 'Dětské', icon: Music }
  ];

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '3rem', textAlign: 'left' }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1e293b' }}>
          Výukové materiály
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
          Procvičte si harmonizaci pomocí interaktivního kvízu, playlistu lidovek a připravených šablon
        </p>
      </motion.div>

      {/* Tabs s vnořeným pill pro Písničky */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Hlavní řádek s taby */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <TabButtons
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            options={{ size: 'md', gap: '1rem' }}
          />
        </div>

        {/* Pill pod Písničky - zobrazí se jen když je aktivní */}
        {activeTab === 'playlist' && (
          <div style={{ marginTop: '0.75rem', marginLeft: '0' }}>
            <TabButtons
              tabs={songCategories}
              activeTab={activeCategory}
              onTabChange={setActiveCategory}
              options={{ layout: 'pill' }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'quiz' && <ChordQuiz />}
        {activeTab === 'playlist' && <SongLibrary activeCategory={activeCategory} />}
        {activeTab === 'templates' && <HarmonizationTemplates />}
        {activeTab === 'glossary' && <Glossary />}
      </motion.div>
    </div>
  );
}

export default Resources;
