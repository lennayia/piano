import { useState } from 'react';
import { Trophy, Search } from 'lucide-react';
import useUserStore from '../../../store/useUserStore';
import Drawer from '../../ui/Drawer';
import * as LucideIcons from 'lucide-react';

// Funkce pro získání ikony achievementu
const getAchievementIcon = (achievement, size = 16) => {
  if (achievement.icon_type) {
    const IconComponent = LucideIcons[achievement.icon_type];
    const color = achievement.icon_color || 'primary';
    if (IconComponent) {
      return <IconComponent size={size} color={`var(--color-${color})`} />;
    }
  }
  return <Trophy size={size} color="var(--color-primary)" />;
};

/**
 * UsersRewardsTable - Kompaktní tabulka achievementů všech uživatelů
 */
function UsersRewardsTable() {
  const users = useUserStore((state) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'achievements', 'points'
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  };

  // Filtrování a řazení
  const filteredUsers = users
    .filter(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = `${a.first_name || ''} ${a.last_name || ''}`.toLowerCase();
          bVal = `${b.first_name || ''} ${b.last_name || ''}`.toLowerCase();
          break;
        case 'achievements':
          aVal = a.achievements?.length || 0;
          bVal = b.achievements?.length || 0;
          break;
        case 'points':
          aVal = a.stats?.total_xp || 0;
          bVal = b.stats?.total_xp || 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
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
              <th style={{ padding: '0.75rem', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('name')}>
                <div className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Uživatel <SortIcon column="name" />
                </div>
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('achievements')}>
                <div className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                  Odměn <SortIcon column="achievements" />
                </div>
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('points')}>
                <div className="font-semibold" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
                  Body <SortIcon column="points" />
                </div>
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>
                <div className="font-semibold">Detail</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const achievementCount = user.achievements?.length || 0;
              const totalPoints = user.stats?.total_xp || 0;

              return (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {user.first_name || ''} {user.last_name || ''}
                    </div>
                    <div className="text-sm text-secondary">
                      {user.email}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <span className="font-semibold" style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      background: achievementCount > 0 ? 'rgba(181, 31, 101, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                      borderRadius: 'var(--radius-sm)',
                      color: achievementCount > 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                    }}>
                      {achievementCount}
                    </span>
                  </td>
                  <td className="font-semibold" style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {totalPoints.toLocaleString('cs-CZ')}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    {achievementCount > 0 && (
                      <button
                        onClick={() => handleViewUser(user)}
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
                    )}
                  </td>
                </tr>
              );
            })}
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

      {/* Drawer s achievementy uživatele */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name} - Odměny` : ''}
        width="500px"
      >
        {selectedUser && selectedUser.achievements && selectedUser.achievements.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedUser.achievements.map((achievement, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'var(--color-bg)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  minWidth: '48px',
                  background: 'rgba(181, 31, 101, 0.1)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getAchievementIcon(achievement, 24)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-semibold" style={{
                    color: 'var(--color-text)',
                    marginBottom: '0.25rem'
                  }}>
                    {achievement.title}
                  </div>
                  <div className="text-sm text-secondary">
                    {achievement.description}
                  </div>
                  {achievement.earnedAt && (
                    <div className="text-xs text-secondary" style={{ marginTop: '0.25rem' }}>
                      {new Date(achievement.earnedAt).toLocaleDateString('cs-CZ', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  )}
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
                  +{achievement.xp_reward} XP
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-base text-secondary" style={{ textAlign: 'center', padding: '2rem' }}>
            Žádné odměny
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default UsersRewardsTable;
