import { useState } from 'react';
import { Trash2, Mail, Calendar, Shield, ShieldOff, LogIn, Hash, Eye, X, CheckCircle, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useUserStore from '../../store/useUserStore';

function UserList() {
  const users = useUserStore((state) => state.users);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const toggleAdminRole = useUserStore((state) => state.toggleAdminRole);
  const [selectedUser, setSelectedUser] = useState(null);

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
                      onClick={() => setSelectedUser(user)}
                      className="btn btn-primary"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      title="Zobrazit detail"
                    >
                      <Eye size={14} />
                      Detail
                    </button>
                    <button
                      onClick={() => handleToggleAdmin(user.id, `${user.firstName} ${user.lastName}`, user.isAdmin)}
                      className={user.isAdmin ? 'btn btn-secondary' : 'btn btn-warning'}
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      title={user.isAdmin ? 'Odebrat admin práva' : 'Přidat admin práva'}
                    >
                      {user.isAdmin ? <ShieldOff size={14} /> : <Shield size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                      className="btn btn-danger"
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialogové okno s detailem uživatele */}
      <AnimatePresence>
        {selectedUser && (
          <>
            {/* Backdrop s glassmorphism efekty */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                background: 'rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Kouřový efekt */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at 30% 50%, rgba(181, 31, 101, 0.2) 0%, transparent 60%)',
                  pointerEvents: 'none'
                }}
              />
            </motion.div>

            {/* Modal obsah */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1001,
                width: '90%',
                maxWidth: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                padding: '2rem'
              }}
            >
              {/* Zavírací tlačítko */}
              <button
                onClick={() => setSelectedUser(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <X size={20} color="var(--color-danger)" />
              </button>

              {/* Hlavička */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '0.5rem', color: '#1e293b' }}>
                  Detail uživatele
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'linear-gradient(135deg, rgba(181, 31, 101, 0.2) 0%, rgba(45, 91, 120, 0.2) 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: 'var(--color-primary)'
                  }}>
                    {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '0.25rem', color: '#1e293b' }}>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistiky */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(45, 91, 120, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(45, 91, 120, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Hash size={16} color="var(--color-secondary)" />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Přihlášení</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-secondary)' }}>
                    {selectedUser.loginCount || 1}×
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'rgba(181, 31, 101, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(181, 31, 101, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={16} color="var(--color-primary)" />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dokončeno</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {selectedUser.progress?.length || 0} lekcí
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Trophy size={16} color="var(--color-success)" />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Body</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-success)' }}>
                    {selectedUser.points || 0}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'rgba(251, 146, 60, 0.1)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(251, 146, 60, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Calendar size={16} color="#fb923c" />
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Série dnů</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fb923c' }}>
                    {selectedUser.streak || 0}
                  </div>
                </div>
              </div>

              {/* Dokončené lekce */}
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>Dokončené lekce</h3>
                {selectedUser.progress && selectedUser.progress.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedUser.progress.map((lesson, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.05)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem'
                        }}
                      >
                        <CheckCircle size={18} color="var(--color-success)" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.875rem' }}>
                            Lekce {lesson.lessonId}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Dokončeno: {formatDate(lesson.completedAt)}
                          </div>
                        </div>
                        {lesson.score && (
                          <div style={{
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(16, 185, 129, 0.2)',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--color-success)'
                          }}>
                            {lesson.score}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                    Zatím nedokončil žádnou lekci
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserList;
