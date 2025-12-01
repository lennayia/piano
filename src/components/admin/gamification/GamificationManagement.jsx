import { useState } from 'react';
import { Zap, Trophy, BarChart3, Eye } from 'lucide-react';
import TabButtons from '../../ui/TabButtons';
import GamificationManager from '../GamificationManager';
import AchievementManager from '../AchievementManager';
import AchievementManagerBackup from '../AchievementManager-backup';

/**
 * Wrapper komponenta pro Admin → Gamifikace → Správa
 * Zobrazuje 3. úroveň navigace (XP body, Bonusy, Odměny, Levely)
 */
function GamificationManagement() {
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
            <h3>⚡ Bonusy - CRUD operace</h3>
            <p>Tady bude NOVÁ komponenta pro správu bonusů za výkon</p>
            <p>S možností přidat, upravit, duplikovat, smazat</p>
          </div>
        )}

        {activeTab === 'achievements' && <AchievementManager />}

        {activeTab === 'achievements-backup' && <AchievementManagerBackup />}

        {activeTab === 'levels' && (
          <div style={{ padding: '1rem', background: 'rgba(181, 31, 101, 0.1)', borderRadius: '8px' }}>
            <h3>📊 Levely - CRUD operace</h3>
            <p>Tady bude komponenta pro správu levelů</p>
            <p>S možností přidat, upravit, duplikovat, smazat</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GamificationManagement;
