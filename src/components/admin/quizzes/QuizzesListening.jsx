import { useState } from 'react';
import { Music } from 'lucide-react';
import TabButtons from '../../ui/TabButtons';
import QuizManager from '../QuizManager';

/**
 * Wrapper komponenta pro Admin → Kvízy → Poslech
 * Zobrazuje 3. úroveň navigace (jen Akordy)
 */
function QuizzesListening() {
  const [activeTab, setActiveTab] = useState('chords');

  const tabs = [
    { id: 'chords', label: 'Akordy', icon: Music }
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

      {/* Obsah */}
      <div style={{ marginTop: '1.5rem' }}>
        {activeTab === 'chords' && <QuizManager />}
      </div>
    </div>
  );
}

export default QuizzesListening;
