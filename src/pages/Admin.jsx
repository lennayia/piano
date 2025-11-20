import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, BarChart3, Users, Music, Trophy, Gamepad2 } from 'lucide-react';
import AdminDashboard from '../components/admin/Dashboard';
import UserList from '../components/admin/UserList';
import SongLibrary from '../components/resources/SongLibrary';
import AchievementManager from '../components/admin/AchievementManager';
import ChordManager from '../components/admin/ChordManager';
import useUserStore from '../store/useUserStore';

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hoveredTab, setHoveredTab] = useState(null);
  const currentUser = useUserStore((state) => state.currentUser);
  const getAllUsers = useUserStore((state) => state.getAllUsers);

  // Kontrola, zda je uživatel admin
  const isAdmin = currentUser?.is_admin === true;

  // Načíst všechny uživatele při otevření Admin stránky
  useEffect(() => {
    if (isAdmin) {
      getAllUsers();
    }
  }, [isAdmin, getAllUsers]);

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Shield size={48} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Přístup odepřen</h2>
          <p style={{ color: '#64748b' }}>
            Pro přístup k admin panelu musíte mít administrátorská oprávnění.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Přehled', icon: BarChart3 },
    { id: 'users', label: 'Uživatelé', icon: Users },
    { id: 'achievements', label: 'Odměny', icon: Trophy },
    { id: 'quizzes', label: 'Kvízy', icon: Gamepad2 },
    { id: 'songs', label: 'Správa písní', icon: Music }
  ];

  return (
    <div className="container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid var(--color-border)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(181, 31, 101, 0.2)',
          boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
        }}>
          <Shield size={24} color="var(--color-primary)" />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.25rem', color: '#1e293b' }}>Admin panel</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Správa uživatelů, statistik a obsahu aplikace
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        justifyContent: 'flex-start',
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
              whileHover={{
                scale: 1.05,
                y: -4,
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.9) 0%, rgba(221, 51, 121, 0.9) 100%)'
                  : 'linear-gradient(135deg, rgba(45, 91, 120, 0.2) 0%, rgba(65, 111, 140, 0.2) 100%)',
                color: activeTab === tab.id ? '#ffffff' : '#1e293b'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="card"
              style={{
                padding: '1rem 2rem',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.9) 0%, rgba(221, 51, 121, 0.9) 100%)'
                  : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: activeTab === tab.id
                  ? '2px solid rgba(181, 31, 101, 0.3)'
                  : '2px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s',
                fontSize: '1rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#ffffff' : '#64748b',
                boxShadow: activeTab === tab.id ? '0 4px 16px rgba(181, 31, 101, 0.3)' : 'none'
              }}
            >
              <Icon
                size={20}
                color={
                  activeTab === tab.id || hoveredTab === tab.id
                    ? '#ffffff'
                    : '#64748b'
                }
              />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div>
          <AdminDashboard />
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <UserList />
        </div>
      )}

      {activeTab === 'achievements' && (
        <div>
          <AchievementManager />
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div>
          <ChordManager />
        </div>
      )}

      {activeTab === 'songs' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>Správa písní</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Upravujte melodie lidových písní a přidávejte nové skladby
            </p>
          </div>
          <SongLibrary />
        </div>
      )}
    </div>
  );
}

export default Admin;
