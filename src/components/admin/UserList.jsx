import { Trash2, Mail, Calendar } from 'lucide-react';
import useUserStore from '../../store/useUserStore';

function UserList() {
  const users = useUserStore((state) => state.users);
  const deleteUser = useUserStore((state) => state.deleteUser);

  const handleDelete = (userId, userName) => {
    if (window.confirm(`Opravdu chcete smazat uživatele ${userName}?`)) {
      deleteUser(userId);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
              <th>Datum registrace</th>
              <th>Pokrok</th>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <Calendar size={16} color="var(--color-text-secondary)" />
                    {formatDate(user.createdAt)}
                  </div>
                </td>
                <td>
                  <span className="badge badge-primary">
                    {user.progress?.length || 0} lekcí
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                    className="btn btn-danger"
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    <Trash2 size={14} />
                    Smazat
                  </button>
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
