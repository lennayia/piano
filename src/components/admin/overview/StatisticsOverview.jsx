import { useState } from 'react';
import { BarChart3, Zap, Trophy, Eye } from 'lucide-react';
import TabButtons from '../../ui/TabButtons';
import AdminDashboard from '../Dashboard';
import GamificationManager from '../GamificationManager';
import GamificationManagerBackup from '../GamificationManager-backup';

/**
 * Wrapper komponenta pro Admin → Přehledy → Statistiky
 * Zobrazuje 3. úroveň navigace (Obecné, Gamifikace, Žebříček)
 */
function StatisticsOverview() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'Obecné', icon: BarChart3 },
    { id: 'gamification', label: 'Gamifikace', icon: Zap },
    { id: 'gamification-backup', label: 'Gamifikace - Záloha', icon: Eye },
    { id: 'leaderboard', label: 'Žebříček', icon: Trophy }
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
        {activeTab === 'general' && <AdminDashboard />}
        {activeTab === 'gamification' && <GamificationManager />}
        {activeTab === 'gamification-backup' && <GamificationManagerBackup />}
        {activeTab === 'leaderboard' && <GamificationManager />}
      </div>
    </div>
  );
}

export default StatisticsOverview;
