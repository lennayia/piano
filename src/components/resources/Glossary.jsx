import { useState } from 'react';
import { Book, Search } from 'lucide-react';
import { motion } from 'framer-motion';

function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');

  const terms = [
    {
      term: 'Akord',
      definition: 'Současné znění tří nebo více tónů. Základní stavební kámen harmonizace.'
    },
    {
      term: 'Kadence',
      definition: 'Sled akordů, který přináší pocit uzavřenosti nebo závěru hudební fráze. Základní kadence: I - IV - V - I'
    },
    {
      term: 'Tónika (I. stupeň)',
      definition: 'Základní akord tóniny, přináší pocit stability a klidu. V C dur je to akord C dur (C-E-G).'
    },
    {
      term: 'Dominanta (V. stupeň)',
      definition: 'Akord, který vytváří napětí a touží se vrátit k tónice. V C dur je to akord G dur (G-H-D).'
    },
    {
      term: 'Subdominanta (IV. stupeň)',
      definition: 'Akord mezi tónikou a dominantou. V C dur je to akord F dur (F-A-C).'
    },
    {
      term: 'Dur',
      definition: 'Durová tónina má veselý, jasný charakter. Durový akord obsahuje velkou tercii.'
    },
    {
      term: 'Moll',
      definition: 'Mollová tónina má smutný, melancholický charakter. Mollový akord obsahuje malou tercii.'
    },
    {
      term: 'Harmonizace',
      definition: 'Proces přidávání akordového doprovodu k melodii.'
    },
    {
      term: 'Tónina',
      definition: 'Systém tónů uspořádaných kolem základního tónu (tóniky). Např. C dur, D moll.'
    },
    {
      term: 'Stupeň',
      definition: 'Pozice tónu nebo akordu ve stupnici. Označuje se římskými číslicemi (I, II, III, IV, V, VI, VII).'
    },
    {
      term: 'Melodie',
      definition: 'Posloupnost jednotlivých tónů, které tvoří hlavní hudební linku písně.'
    },
    {
      term: 'Doprovod',
      definition: 'Harmonický základ pod melodií, obvykle tvořený akordy.'
    },
    {
      term: 'Allegro',
      definition: 'Rychlé tempo (rychle, živě)'
    },
    {
      term: 'Andante',
      definition: 'Mírné tempo (kráčejícím tempem)'
    },
    {
      term: 'Moderato',
      definition: 'Střední tempo (mírně, umírněně)'
    }
  ];

  const filteredTerms = terms.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 style={{
        marginBottom: '1.5rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Book size={28} color="var(--color-primary)" />
        Slovníček hudebních výrazů
      </h2>
      <p style={{ marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
        Vysvětlení základních pojmů, se kterými se v aplikaci setkáte
      </p>

      {/* Search */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search
          size={20}
          color="#64748b"
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        />
        <input
          type="text"
          placeholder="Hledat výraz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{
            paddingLeft: '3rem',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Terms List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredTerms.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <h3 style={{
              fontSize: '1.125rem',
              marginBottom: '0.75rem',
              color: 'var(--color-primary)',
              fontWeight: 600
            }}>
              {item.term}
            </h3>
            <p style={{
              fontSize: '0.9375rem',
              color: '#64748b',
              lineHeight: 1.7,
              margin: 0
            }}>
              {item.definition}
            </p>
          </motion.div>
        ))}

        {filteredTerms.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1rem'
          }}>
            Žádný výraz nenalezen. Zkuste jiné hledání.
          </div>
        )}
      </div>
    </div>
  );
}

export default Glossary;
