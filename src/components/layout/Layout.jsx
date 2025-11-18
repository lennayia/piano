import Header from './Header';

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        padding: '2rem 0',
        marginTop: '4rem',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '0.875rem'
      }}>
        <div className="container">
          <p>© 2025 Piano Learning App. Naučte se hrát na klavír jednoduše a zábavně.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
