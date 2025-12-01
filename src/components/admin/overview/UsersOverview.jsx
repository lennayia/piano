import { useState } from 'react';
import { Users, BookOpen, BarChart3 } from 'lucide-react';
import TabButtons from '../../ui/TabButtons';
import UserList from '../UserList';

/**
 * Wrapper komponenta pro Admin → Přehledy → Uživatelé
 * Zobrazuje 3. úroveň navigace (Přehled, Historie, Statistiky)
 */
function UsersOverview() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: Users },
    { id: 'history', label: 'Historie', icon: BookOpen },
    { id: 'statistics', label: 'Statistiky', icon: BarChart3 }
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
        {activeTab === 'overview' && <UserList />}

        {activeTab === 'history' && (
          <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
            <h3>📜 Historie aktivit</h3>
            <p>Komponenta pro zobrazení kompletní historie všech aktivit</p>
          </div>
        )}

        {activeTab === 'statistics' && (
          <div style={{ padding: '1rem', background: 'rgba(45, 91, 120, 0.1)', borderRadius: '8px' }}>
            <h3>📊 Statistiky uživatelů</h3>
            <p>Komponenta pro detailní statistiky jednotlivých uživatelů</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersOverview;
