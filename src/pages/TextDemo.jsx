import React from 'react';

function TextDemo() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Demo: Barvy textů a řádkování</h1>

      {/* Demo nadpisů */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Barvy nadpisů - Možnosti</h2>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>1. Stejná jako texty (#475569)</h3>
          <div style={{ padding: '1.5rem', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px' }}>
            <h1 style={{ color: '#475569', lineHeight: 1.2 }}>H1 Nadpis první úrovně</h1>
            <h2 style={{ color: '#475569', lineHeight: 1.2 }}>H2 Nadpis druhé úrovně</h2>
            <h3 style={{ color: '#475569', lineHeight: 1.2 }}>H3 Nadpis třetí úrovně</h3>
            <p style={{ marginTop: '1rem' }}>
              Běžný text odstavce. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>2. Tmavší (#1e293b)</h3>
          <div style={{ padding: '1.5rem', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px' }}>
            <h1 style={{ color: '#1e293b', lineHeight: 1.2 }}>H1 Nadpis první úrovně</h1>
            <h2 style={{ color: '#1e293b', lineHeight: 1.2 }}>H2 Nadpis druhé úrovně</h2>
            <h3 style={{ color: '#1e293b', lineHeight: 1.2 }}>H3 Nadpis třetí úrovně</h3>
            <p style={{ marginTop: '1rem' }}>
              Běžný text odstavce. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>3. Primary barva (růžová #b51f65)</h3>
          <div style={{ padding: '1.5rem', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px' }}>
            <h1 style={{ color: 'var(--color-primary)', lineHeight: 1.2 }}>H1 Nadpis první úrovně</h1>
            <h2 style={{ color: 'var(--color-primary)', lineHeight: 1.2 }}>H2 Nadpis druhé úrovně</h2>
            <h3 style={{ color: 'var(--color-primary)', lineHeight: 1.2 }}>H3 Nadpis třetí úrovně</h3>
            <p style={{ marginTop: '1rem' }}>
              Běžný text odstavce. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>4. Secondary barva (modrá #2d5b78)</h3>
          <div style={{ padding: '1.5rem', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px' }}>
            <h1 style={{ color: 'var(--color-secondary)', lineHeight: 1.2 }}>H1 Nadpis první úrovně</h1>
            <h2 style={{ color: 'var(--color-secondary)', lineHeight: 1.2 }}>H2 Nadpis druhé úrovně</h2>
            <h3 style={{ color: 'var(--color-secondary)', lineHeight: 1.2 }}>H3 Nadpis třetí úrovně</h3>
            <p style={{ marginTop: '1rem' }}>
              Běžný text odstavce. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          </div>
        </div>
      </div>

      {/* Barvy textů */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '16px',
        marginBottom: '2rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Barvy textů</h2>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Primární barva textu</h3>
          <code style={{
            background: 'rgba(0, 0, 0, 0.05)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            display: 'block',
            marginBottom: '1rem'
          }}>
            var(--color-text) = #1e293b
          </code>
          <p style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Toto je primární barva textu. Používá se pro hlavní obsah, důležité informace a běžný text.
            Je tmavší a má lepší kontrast, takže je ideální pro čtení delších textů.
          </p>
          <div style={{
            background: 'var(--color-text)',
            width: '100px',
            height: '50px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }} />
        </div>

        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Sekundární barva textu</h3>
          <code style={{
            background: 'rgba(0, 0, 0, 0.05)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            display: 'block',
            marginBottom: '1rem'
          }}>
            var(--color-text-secondary) = #64748b
          </code>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            Toto je sekundární barva textu. Používá se pro méně důležité informace, popisky, pomocné texty a poznámky.
            Je světlejší (šedá), takže vizuálně ustupuje do pozadí.
          </p>
          <div style={{
            background: 'var(--color-text-secondary)',
            width: '100px',
            height: '50px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.1)'
          }} />
        </div>
      </div>

      {/* Řádkování */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Řádkování (line-height)</h2>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>line-height: 1.2 (těsné)</h3>
          <p style={{ lineHeight: 1.2, background: 'rgba(181, 31, 101, 0.05)', padding: '1rem', borderRadius: '8px' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Řádky jsou hodně blízko u sebe, text je těsný a méně čitelný pro delší odstavce.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>line-height: 1.4</h3>
          <p style={{ lineHeight: 1.4, background: 'rgba(45, 91, 120, 0.05)', padding: '1rem', borderRadius: '8px' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Řádkování je mírně větší, text je čitelnější.
          </p>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>line-height: 1.6 (aktuální globální)</h3>
          <p style={{ lineHeight: 1.6, background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Toto je aktuální globální řádkování. Řádky mají příjemný vzduch, text je dobře čitelný a pohodlný pro oči.
          </p>
        </div>

        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>line-height: 1.8 (volné)</h3>
          <p style={{ lineHeight: 1.8, background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            Řádkování je hodně volné, řádky jsou daleko od sebe. Může být příjemné, ale zabírá více místa.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TextDemo;
