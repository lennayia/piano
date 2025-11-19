import { useState } from 'react';
import { Book, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTerm, setExpandedTerm] = useState(null);

  const terms = [
    // Základy harmonie
    {
      category: 'Harmonie',
      term: 'Akord',
      definition: 'Současné znění tří nebo více tónů. Základní stavební kámen harmonizace.',
      example: 'C dur akord se skládá z tónů C, E a G zahraných současně.'
    },
    {
      category: 'Harmonie',
      term: 'Kadence',
      definition: 'Sled akordů, který přináší pocit uzavřenosti nebo závěru hudební fráze. Základní kadence: I - IV - V - I',
      example: 'V C dur: C dur → F dur → G dur → C dur'
    },
    {
      category: 'Harmonie',
      term: 'Tónika (I. stupeň)',
      definition: 'Základní akord tóniny, přináší pocit stability a klidu. V C dur je to akord C dur (C-E-G).',
      example: 'Písně většinou začínají a končí na tónice.'
    },
    {
      category: 'Harmonie',
      term: 'Dominanta (V. stupeň)',
      definition: 'Akord, který vytváří napětí a touží se vrátit k tónice. V C dur je to akord G dur (G-H-D).',
      example: 'Dominanta → Tónika je nejsilnější harmonický postup.'
    },
    {
      category: 'Harmonie',
      term: 'Subdominanta (IV. stupeň)',
      definition: 'Akord mezi tónikou a dominantou. V C dur je to akord F dur (F-A-C).',
      example: 'Používá se pro přechod k dominantě.'
    },
    {
      category: 'Tóniny',
      term: 'Dur',
      definition: 'Durová tónina má veselý, jasný charakter. Durový akord obsahuje velkou tercii.',
      example: 'C dur: C - E (velká tercie) - G'
    },
    {
      category: 'Tóniny',
      term: 'Moll',
      definition: 'Mollová tónina má smutný, melancholický charakter. Mollový akord obsahuje malou tercii.',
      example: 'A moll: A - C (malá tercie) - E'
    },
    {
      category: 'Tóniny',
      term: 'Tónina',
      definition: 'Systém tónů uspořádaných kolem základního tónu (tóniky). Např. C dur, D moll.',
      example: 'C dur používá pouze bílé klávesy, D dur má 2 křížky.'
    },
    {
      category: 'Základy',
      term: 'Harmonizace',
      definition: 'Proces přidávání akordového doprovodu k melodii.',
      example: 'K melodii "Skákal pes" přidáme akordy C, F, G.'
    },
    {
      category: 'Základy',
      term: 'Stupeň',
      definition: 'Pozice tónu nebo akordu ve stupnici. Označuje se římskými číslicemi (I, II, III, IV, V, VI, VII).',
      example: 'I = tónika, IV = subdominanta, V = dominanta'
    },
    {
      category: 'Základy',
      term: 'Melodie',
      definition: 'Posloupnost jednotlivých tónů, které tvoří hlavní hudební linku písně.',
      example: 'To, co zpíváte nebo si hvízdáte.'
    },
    {
      category: 'Základy',
      term: 'Doprovod',
      definition: 'Harmonický základ pod melodií, obvykle tvořený akordy.',
      example: 'Levá ruka na klavíru často hraje doprovod.'
    },
    // Klavírní pojmy
    {
      category: 'Klavír',
      term: 'Bílé klávesy',
      definition: 'Představují základní tóny C, D, E, F, G, A, H. Opakují se v oktávách.',
      example: 'C dur stupnice používá pouze bílé klávesy.'
    },
    {
      category: 'Klavír',
      term: 'Černé klávesy',
      definition: 'Představují zvýšené (#) nebo snížené (b) tóny. Např. C# (Cis) nebo Db (Des).',
      example: 'Mezi C a D je černá klávesa C# (Cis).'
    },
    {
      category: 'Klavír',
      term: 'Oktáva',
      definition: 'Vzdálenost osmi tónů. Tóny se po oktávě opakují ve vyšší nebo nižší poloze.',
      example: 'Od C do dalšího C je jedna oktáva.'
    },
    {
      category: 'Klavír',
      term: 'Tercie',
      definition: 'Interval mezi prvním a třetím tónem stupnice. Může být velká (dur) nebo malá (moll).',
      example: 'C → E je velká tercie (4 půltóny)'
    },
    {
      category: 'Klavír',
      term: 'Kvinta',
      definition: 'Interval mezi prvním a pátým tónem stupnice. Základní součást akordu.',
      example: 'C → G je čistá kvinta'
    },
    {
      category: 'Klavír',
      term: 'Pravá ruka',
      definition: 'Na klavíru obvykle hraje melodii nebo vyšší tóny akordu.',
      example: 'Prstoklad: palec = 1, ukazovák = 2, prostředník = 3, prsteník = 4, malík = 5'
    },
    {
      category: 'Klavír',
      term: 'Levá ruka',
      definition: 'Na klavíru obvykle hraje basové tóny a doprovod.',
      example: 'Často hraje základní tón akordu nebo celý akord.'
    },
    {
      category: 'Klavír',
      term: 'Pedál',
      definition: 'Pravý pedál (sustain) prodlužuje znění tónů, levý je ztišuje.',
      example: 'Sustain pedál spojuje tóny a vytváří plnější zvuk.'
    },
    // Tempo
    {
      category: 'Tempo',
      term: 'Allegro',
      definition: 'Rychlé tempo (rychle, živě)',
      example: 'Veselé, energické písně'
    },
    {
      category: 'Tempo',
      term: 'Andante',
      definition: 'Mírné tempo (kráčejícím tempem)',
      example: 'Klidné, procházkové tempo'
    },
    {
      category: 'Tempo',
      term: 'Moderato',
      definition: 'Střední tempo (mírně, umírněně)',
      example: 'Ani rychle, ani pomalu'
    }
  ];

  const filteredTerms = terms.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.example.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTerm = (index) => {
    setExpandedTerm(expandedTerm === index ? null : index);
  };

  // Kategorizace pro zobrazení
  const categories = ['Základy', 'Harmonie', 'Tóniny', 'Klavír', 'Tempo'];

  return (
    <div>
      <h2 style={{
        marginBottom: '1.5rem',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(181, 31, 101, 0.2)',
          boxShadow: '0 4px 15px rgba(181, 31, 101, 0.2)'
        }}>
          <Book size={24} color="var(--color-primary)" />
        </div>
        Slovníček hudebních výrazů
      </h2>
      <p style={{ marginBottom: '2rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>
        Vysvětlení základních pojmů pro začátečníky - klikněte na výraz pro více informací
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
            transform: 'translateY(-50%)',
            zIndex: 1
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

      {/* Terms Accordion by Category */}
      {categories.map((category) => {
        const categoryTerms = filteredTerms.filter(t => t.category === category);
        if (categoryTerms.length === 0) return null;

        return (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <h3 style={{
              color: '#ffffff',
              fontSize: '1.25rem',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid rgba(181, 31, 101, 0.3)'
            }}>
              {category}
            </h3>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {categoryTerms.map((item, termIndex) => {
                const globalIndex = `${category}-${termIndex}`;
                const isExpanded = expandedTerm === globalIndex;

                return (
                  <motion.div
                    key={globalIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: termIndex * 0.05 }}
                    className="card"
                    style={{
                      background: isExpanded
                        ? 'rgba(255, 255, 255, 0.95)'
                        : 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(30px)',
                      WebkitBackdropFilter: 'blur(30px)',
                      border: isExpanded
                        ? '2px solid var(--color-primary)'
                        : '1px solid rgba(255, 255, 255, 0.3)',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      overflow: 'hidden'
                    }}
                    onClick={() => toggleTerm(globalIndex)}
                    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(181, 31, 101, 0.2)' }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '1.125rem',
                          marginBottom: isExpanded ? '0.5rem' : 0,
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {item.term}
                        </h4>
                        {!isExpanded && (
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            margin: '0.25rem 0 0 0',
                            lineHeight: 1.5
                          }}>
                            {item.definition.substring(0, 80)}
                            {item.definition.length > 80 ? '...' : ''}
                          </p>
                        )}
                      </div>

                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginLeft: '1rem', flexShrink: 0 }}
                      >
                        <ChevronDown size={24} color="var(--color-secondary)" />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ marginTop: '1rem' }}
                        >
                          <div style={{
                            padding: '1rem',
                            background: 'rgba(45, 91, 120, 0.05)',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1rem',
                            border: '1px solid rgba(45, 91, 120, 0.1)'
                          }}>
                            <strong style={{ fontSize: '0.875rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
                              Definice:
                            </strong>
                            <p style={{
                              fontSize: '0.9375rem',
                              color: '#64748b',
                              lineHeight: 1.7,
                              margin: 0
                            }}>
                              {item.definition}
                            </p>
                          </div>

                          <div style={{
                            padding: '1rem',
                            background: 'rgba(181, 31, 101, 0.05)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid rgba(181, 31, 101, 0.1)'
                          }}>
                            <strong style={{ fontSize: '0.875rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
                              Příklad:
                            </strong>
                            <p style={{
                              fontSize: '0.9375rem',
                              color: '#64748b',
                              lineHeight: 1.7,
                              margin: 0,
                              fontStyle: 'italic'
                            }}>
                              {item.example}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

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
  );
}

export default Glossary;
