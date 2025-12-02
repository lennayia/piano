import { useState, useEffect } from 'react';
import { Users, BookOpen, BarChart3, Trophy, Search, History, Music, Gamepad2, Book } from 'lucide-react';
import TabButtons from '../../ui/TabButtons';
import UserList from '../UserList';
import UsersRewardsTable from './UsersRewardsTable';
import UserStatsGrid from '../../dashboard/UserStatsGrid';
import useUserStore from '../../../store/useUserStore';
import Drawer from '../../ui/Drawer';
import { getAllUsersActivities } from '../../../services/activityService';

/**
 * Wrapper komponenta pro Admin → Přehledy → Uživatelé
 * Zobrazuje 3. úroveň navigace (Přehled, Historie, Statistiky, Odměny)
 */
function UsersOverview() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isStatsDrawerOpen, setIsStatsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const users = useUserStore((state) => state.users);

  // Fetch activities when history tab is active
  useEffect(() => {
    if (activeTab === 'history' && activities.length === 0) {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const data = await getAllUsersActivities(100);
      setActivities(data);
    } catch (error) {
      console.error('Chyba při načítání aktivit:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleViewUserStats = (user) => {
    setSelectedUser(user);
    setIsStatsDrawerOpen(true);
  };

  const closeStatsDrawer = () => {
    setIsStatsDrawerOpen(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: Users },
    { id: 'history', label: 'Historie', icon: BookOpen },
    { id: 'statistics', label: 'Statistiky', icon: BarChart3 },
    { id: 'rewards', label: 'Odměny', icon: Trophy }
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
          <div>
            {/* Vyhledávání */}
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              <input
                type="text"
                placeholder="Hledat v historii..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-base"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: 'none',
                  boxShadow: 'var(--shadow)',
                  borderRadius: 'var(--radius-md)'
                }}
              />
            </div>

            {/* Seznam aktivit */}
            {loadingActivities ? (
              <div className="text-base text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>
                Načítám aktivity...
              </div>
            ) : activities.length === 0 ? (
              <div className="text-base text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>
                Žádné aktivity nenalezeny
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activities
                  .filter(activity => {
                    if (!searchTerm) return true;
                    const userName = `${activity.user?.first_name || ''} ${activity.user?.last_name || ''}`.toLowerCase();
                    const activityTitle = activity.title.toLowerCase();
                    return userName.includes(searchTerm.toLowerCase()) || activityTitle.includes(searchTerm.toLowerCase());
                  })
                  .map((activity) => {
                    // Get icon component
                    const IconComponent = activity.icon === 'Music' ? Music :
                                         activity.icon === 'Gamepad2' ? Gamepad2 :
                                         activity.icon === 'Book' ? Book :
                                         activity.icon === 'Trophy' ? Trophy :
                                         History;

                    return (
                      <div
                        key={activity.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          background: activity.isSpecial ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.08), transparent)' : 'var(--color-bg)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        {/* Ikona */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          background: activity.isSpecial ? 'rgba(255, 215, 0, 0.15)' : 'rgba(181, 31, 101, 0.1)',
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <IconComponent size={20} color={activity.isSpecial ? '#FFD700' : 'var(--color-primary)'} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="font-medium" style={{ color: 'var(--color-text)', marginBottom: '0.25rem' }}>
                            {activity.user?.first_name} {activity.user?.last_name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {activity.title}
                            {activity.subtitle && (
                              <span style={{ color: activity.isSpecial ? '#FFD700' : 'inherit', marginLeft: '0.5rem' }}>
                                • {activity.subtitle}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-secondary" style={{ marginTop: '0.25rem' }}>
                            {activity.date.toLocaleDateString('cs-CZ', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* XP Badge */}
                        <div style={{
                          padding: '0.375rem 0.75rem',
                          background: 'rgba(181, 31, 101, 0.1)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap'
                        }}>
                          +{activity.xp} XP
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'statistics' && (
          <div>
            {/* Vyhledávání */}
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              <input
                type="text"
                placeholder="Hledat uživatele..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-base"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: 'none',
                  boxShadow: 'var(--shadow)',
                  borderRadius: 'var(--radius-md)'
                }}
              />
            </div>

            {/* Tabulka */}
            <div style={{ overflowX: 'auto' }}>
              <table className="text-base" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>
                      <div className="font-semibold">Uživatel</div>
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div className="font-semibold">Body</div>
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div className="font-semibold">Lekce</div>
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div className="font-semibold">Kvízy</div>
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <div className="font-semibold">Detail</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                          {user.first_name || ''} {user.last_name || ''}
                        </div>
                        <div className="text-sm text-secondary">
                          {user.email}
                        </div>
                      </td>
                      <td className="font-semibold" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {(user.stats?.total_xp || 0).toLocaleString('cs-CZ')}
                      </td>
                      <td className="font-semibold" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {user.stats?.lessons_completed || 0}
                      </td>
                      <td className="font-semibold" style={{ padding: '0.75rem', textAlign: 'center' }}>
                        {user.stats?.quizzes_completed || 0}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => handleViewUserStats(user)}
                          className="text-sm"
                          style={{
                            padding: '0.25rem 0.5rem',
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'var(--shadow-sm)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: 'var(--color-text-secondary)',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-bg-secondary)';
                            e.currentTarget.style.color = 'var(--color-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                          }}
                        >
                          Zobrazit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-base text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>
                  Žádní uživatelé nenalezeni
                </div>
              )}
            </div>

            {/* Statistiky */}
            <div className="text-sm text-secondary" style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <strong>{filteredUsers.length}</strong> uživatelů celkem
            </div>
          </div>
        )}

        {activeTab === 'rewards' && <UsersRewardsTable />}
      </div>

      {/* Drawer se statistikami uživatele */}
      <Drawer
        isOpen={isStatsDrawerOpen}
        onClose={closeStatsDrawer}
        title={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name} - Statistiky` : ''}
        width="1000px"
      >
        {selectedUser && selectedUser.stats && (
          <UserStatsGrid
            stats={{
              completedLessons: selectedUser.stats.lessons_completed || 0,
              totalLessons: selectedUser.stats.total_lessons || 0,
              points: selectedUser.stats.total_xp || 0,
              streak: selectedUser.stats.current_streak || 0,
              quizzesCompleted: selectedUser.stats.quizzes_completed || 0,
              songsCompleted: selectedUser.stats.songs_completed || 0
            }}
          />
        )}
      </Drawer>
    </div>
  );
}

export default UsersOverview;
