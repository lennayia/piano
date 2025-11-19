import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Music, Target, Book } from 'lucide-react';
import SongLibrary from '../components/resources/SongLibrary';
import HarmonizationTemplates from '../components/resources/HarmonizationTemplates';
import ChordQuiz from '../components/games/ChordQuiz';
import Glossary from '../components/resources/Glossary';

function Resources() {
  const [activeTab, setActiveTab] = useState('playlist');

  const tabs = [
    { id: 'quiz', label: 'Poznáš akord?', icon: Target, color: 'var(--color-primary)' },
    { id: 'playlist', label: 'Lidové písně', icon: Music, color: 'var(--color-secondary)' },
    { id: 'templates', label: 'Šablony harmonizace', icon: BookOpen, color: 'var(--color-secondary)' },
    { id: 'glossary', label: 'Slovníček', icon: Book, color: 'var(--color-secondary)' }
  ];

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '3rem', textAlign: 'center' }}
      >
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#ffffff' }}>
          Výukové materiály
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.8)', maxWidth: '700px', margin: '0 auto' }}>
          Procvičte si harmonizaci pomocí interaktivního kvízu, playlistu lidových písní a připravených šablon
        </p>
      </motion.div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className="card"
              style={{
                padding: '1rem 2rem',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.2) 0%, rgba(45, 91, 120, 0.2) 100%)'
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: activeTab === tab.id
                  ? '2px solid rgba(181, 31, 101, 0.4)'
                  : '2px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s',
                fontSize: '1rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? 'var(--color-primary)' : '#64748b'
              }}
            >
              <Icon size={20} color={activeTab === tab.id ? tab.color : '#64748b'} />
              {tab.label}
            </motion.button>
          );
        })}
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
        {activeTab === 'playlist' && <SongLibrary />}
        {activeTab === 'templates' && <HarmonizationTemplates />}
        {activeTab === 'glossary' && <Glossary />}
      </motion.div>
    </div>
  );
}

export default Resources;
