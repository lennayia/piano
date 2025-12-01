import { useState } from 'react';
import { Zap, Trophy, BarChart3, Eye } from 'lucide-react';
import TabButtons from '../../ui/TabButtons';
import GamificationManager from '../GamificationManager';
import AchievementManager from '../AchievementManager';
import AchievementManagerBackup from '../AchievementManager-backup';

/**
 * Wrapper komponenta pro Admin → Gamifikace → Přehled
 * Zobrazuje 3. úroveň navigace (XP body, Bonusy, Odměny, Levely)
 */
function GamificationOverview() {
  const [activeTab, setActiveTab] = useState('xp-rules');

  const tabs = [
    { id: 'xp-rules', label: 'XP body', icon: Zap },
    { id: 'bonuses', label: 'Bonusy', icon: Trophy },
    { id: 'achievements', label: 'Odměny', icon: Trophy },
    { id: 'achievements-backup', label: 'Odměny - Záloha', icon: Eye },
    { id: 'levels', label: 'Levely', icon: BarChart3 }
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
        {activeTab === 'xp-rules' && <GamificationManager />}

        {activeTab === 'bonuses' && (
          <div style={{ padding: '1rem', background: 'rgba(181, 31, 101, 0.1)', borderRadius: '8px' }}>
            <h3>⚡ Přehled bonusů</h3>
            <p>Přehled všech nastavených bonusů</p>
          </div>
        )}

        {activeTab === 'achievements' && <AchievementManager />}

        {activeTab === 'achievements-backup' && <AchievementManagerBackup />}

        {activeTab === 'levels' && <GamificationManager />}
      </div>
    </div>
  );
}

export default GamificationOverview;
