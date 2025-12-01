import { useState } from 'react';
import { Music, BookOpen, Trophy } from 'lucide-react';
import TabButtons from '../../ui/TabButtons';
import QuizManager from '../QuizManager';

/**
 * Wrapper komponenta pro Admin → Kvízy → Teorie
 * Zobrazuje 3. úroveň navigace (Akordy, Teorie, Intervaly, Stupnice, Rytmus, Mix)
 */
function QuizzesTheory() {
  const [activeTab, setActiveTab] = useState('chords');

  const tabs = [
    { id: 'chords', label: 'Akordy', icon: Music },
    { id: 'theory', label: 'Teorie', icon: BookOpen },
    { id: 'intervals', label: 'Intervaly', icon: Music },
    { id: 'scales', label: 'Stupnice', icon: Music },
    { id: 'rhythm', label: 'Rytmus', icon: Music },
    { id: 'mix', label: 'Mix', icon: Trophy }
  ];

  return (
    <div className="card">
      {/* 3. úroveň navigace */}
      <TabButtons
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        options={{ layout: 'pill', size: 'sm' }}
      />

      {/* Obsah podle aktivního tabu */}
      <div style={{ marginTop: '1.5rem' }}>
        {activeTab === 'chords' && <QuizManager />}

        {activeTab === 'theory' && (
          <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
            <h3>📚 Teorie - Obecná teorie</h3>
            <p>Komponenta pro správu obecných teoretických otázek</p>
          </div>
        )}

        {activeTab === 'intervals' && (
          <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
            <h3>🎵 Teorie - Intervaly</h3>
            <p>Komponenta pro správu otázek o intervalech</p>
          </div>
        )}

        {activeTab === 'scales' && (
          <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
            <h3>🎹 Teorie - Stupnice</h3>
            <p>Komponenta pro správu otázek o stupnicích</p>
          </div>
        )}

        {activeTab === 'rhythm' && (
          <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
            <h3>🥁 Teorie - Rytmus</h3>
            <p>Komponenta pro správu otázek o rytmu</p>
          </div>
        )}

        {activeTab === 'mix' && (
          <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
            <h3>🎲 Teorie - Mix</h3>
            <p>Komponenta pro správu smíšených teoretických otázek</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizzesTheory;
