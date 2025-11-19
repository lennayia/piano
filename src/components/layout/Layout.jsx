import { Link } from 'react-router-dom';
import Header from './Header';
import useUserStore from '../../store/useUserStore';

function Layout({ children }) {
  const currentUser = useUserStore((state) => state.currentUser);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '2rem 0',
        marginTop: '4rem',
        textAlign: 'center',
        color: '#ffffff',
        fontSize: '0.875rem'
      }}>
        <div className="container">
          {!currentUser && (
            <div style={{ marginBottom: '1rem' }}>
              <Link
                to="/registration"
                style={{
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  padding: '0.5rem 1.5rem',
                  borderRadius: 'var(--radius)',
                  background: 'rgba(181, 31, 101, 0.1)',
                  border: '1px solid rgba(181, 31, 101, 0.3)',
                  display: 'inline-block',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(181, 31, 101, 0.2)';
                  e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(181, 31, 101, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                Přihlásit se
              </Link>
            </div>
          )}
          <p>© 2025 Piano Learning App. Naučte se hrát na klavír jednoduše a zábavně.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
