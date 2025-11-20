import { Link, useLocation } from 'react-router-dom';
import Header from './Header';
import useUserStore from '../../store/useUserStore';

function Layout({ children }) {
  const currentUser = useUserStore((state) => state.currentUser);
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer style={{
        borderTop: '1px solid rgba(0, 0, 0, 0.2)',
        padding: '2rem 0',
        marginTop: '4rem',
        textAlign: 'center',
        color: '#00000081',
        fontSize: '0.875rem'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <img
              src="/piano.webp"
              alt="PianoPro Logo"
              style={{
                height: '50px',
                width: 'auto',
                objectFit: 'contain',
                opacity: 0.8
              }}
            />
            <p style={{ margin: 0 }}>
              PianoPro App © 2025 {' '}
              <a
                href="https://online-byznys.cz"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                online-byznys.cz
              </a>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', fontSize: '0.875rem' }}>
            <a
              href="/gdpr"
              style={{
                color: '#00000081',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.target.style.color = '#00000081'}
            >
              GDPR
            </a>
            <span style={{ color: '#00000081' }}>|</span>
            <a
              href="/vop"
              style={{
                color: '#00000081',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.target.style.color = '#00000081'}
            >
              VOP
            </a>
            <span style={{ color: '#00000081' }}>|</span>
            <a
              href="/cookies"
              style={{
                color: '#00000081',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.target.style.color = '#00000081'}
            >
              Cookies
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
