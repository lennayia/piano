import { Shield } from 'lucide-react';
import AdminDashboard from '../components/admin/Dashboard';
import UserList from '../components/admin/UserList';

function Admin() {
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
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Shield size={24} color="var(--color-danger)" />
        </div>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Admin Panel</h1>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            Správa uživatelů a přehled statistik
          </p>
        </div>
      </div>

      <AdminDashboard />
      <UserList />
    </div>
  );
}

export default Admin;
