import { useState } from 'react';
import { Shield, BarChart3, Users, Music } from 'lucide-react';
import AdminDashboard from '../components/admin/Dashboard';
import UserList from '../components/admin/UserList';
import SongLibrary from '../components/resources/SongLibrary';
import useUserStore from '../store/useUserStore';

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const currentUser = useUserStore((state) => state.currentUser);

  // Kontrola, zda je uživatel admin
  const isAdmin = currentUser?.isAdmin === true;

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Shield size={48} color="var(--color-danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ marginBottom: '0.5rem', color: '#ffffff' }}>Přístup odepřen</h2>
          <p style={{ color: '#ffffff', opacity: 0.9 }}>
            Pro přístup k admin panelu musíte mít administrátorská oprávnění.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Přehled', icon: BarChart3 },
    { id: 'users', label: 'Uživatelé', icon: Users },
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
          <h1 style={{ marginBottom: '0.25rem', color: '#1e293b' }}>Admin Panel</h1>
          <p style={{ fontSize: '0.875rem', color: '#ffffff', opacity: 0.9 }}>
            Správa uživatelů, statistik a obsahu aplikace
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '0.5rem'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: activeTab === tab.id
                  ? 'var(--gradient-primary)'
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--color-text)',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
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

      {activeTab === 'songs' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem', color: '#ffffff' }}>Správa písní</h2>
            <p style={{ fontSize: '0.875rem', color: '#ffffff', opacity: 0.9 }}>
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
