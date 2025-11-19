import { Trash2, Mail, Calendar, Shield, ShieldOff, LogIn, Hash } from 'lucide-react';
import useUserStore from '../../store/useUserStore';

function UserList() {
  const users = useUserStore((state) => state.users);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const toggleAdminRole = useUserStore((state) => state.toggleAdminRole);

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Opravdu chcete smazat uživatele ${userName}?`)) {
      deleteUser(userId);
    }
  };

  const handleToggleAdmin = (userId, userName, isCurrentlyAdmin) => {
    const action = isCurrentlyAdmin ? 'odebrat admin práva' : 'přidat admin práva';
    if (window.confirm(`Opravdu chcete ${action} pro ${userName}?`)) {
      toggleAdminRole(userId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (users.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '3rem' }}>
        <p className="text-secondary">Zatím se neregistroval žádný uživatel.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
        Registrovaní uživatelé ({users.length})
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Jméno</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registrace</th>
              <th>Počet přihlášení</th>
              <th>Poslední přihlášení</th>
              <th>Akce</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 500 }}>
                  {user.firstName} {user.lastName}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Mail size={16} color="var(--color-text-secondary)" />
                    <a href={`mailto:${user.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                      {user.email}
                    </a>
                  </div>
                </td>
                <td>
                  {user.isAdmin ? (
                    <span className="badge" style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--color-danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      width: 'fit-content'
                    }}>
                      <Shield size={14} />
                      Admin
                    </span>
                  ) : (
                    <span className="badge badge-secondary">Uživatel</span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Calendar size={16} color="var(--color-text-secondary)" />
                    {formatDate(user.createdAt)}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Hash size={16} color="var(--color-secondary)" />
                    <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>
                      {user.loginCount || 1}×
                    </span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <LogIn size={16} color="var(--color-text-secondary)" />
                    {formatDate(user.lastLogin)}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={() => handleToggleAdmin(user.id, `${user.firstName} ${user.lastName}`, user.isAdmin)}
                      className={user.isAdmin ? 'btn btn-secondary' : 'btn btn-warning'}
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      title={user.isAdmin ? 'Odebrat admin práva' : 'Přidat admin práva'}
                    >
                      {user.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                      {user.isAdmin ? 'Odebrat admin' : 'Nastavit admin'}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                      className="btn btn-danger"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={14} />
                      Smazat
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserList;
