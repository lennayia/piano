import { useState } from 'react';
import { FileText, Download, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function HarmonizationTemplates() {
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  const templates = [
    {
      id: 1,
      title: 'Základní kadence v C dur',
      description: 'Nejjednodušší harmonizace pro začáteční písně',
      difficulty: 'začátečník',
      chords: [
        { name: 'C dur', notes: ['C', 'E', 'G'], function: 'I. stupeň - tónika' },
        { name: 'F dur', notes: ['F', 'A', 'C'], function: 'IV. stupeň - subdominanta' },
        { name: 'G dur', notes: ['G', 'H', 'D'], function: 'V. stupeň - dominanta' }
      ],
      progression: 'I - IV - V - I',
      example: 'Použití: Skákal pes, Holka modrooká'
    },
    {
      id: 2,
      title: 'Kadence v G dur',
      description: 'Pro písně v tónině G dur',
      difficulty: 'začátečník',
      chords: [
        { name: 'G dur', notes: ['G', 'H', 'D'], function: 'I. stupeň - tónika' },
        { name: 'C dur', notes: ['C', 'E', 'G'], function: 'IV. stupeň - subdominanta' },
        { name: 'D dur', notes: ['D', 'F#', 'A'], function: 'V. stupeň - dominanta' }
      ],
      progression: 'I - IV - V - I',
      example: 'Použití: Když jsem já šel okolo vrat'
    },
    {
      id: 3,
      title: 'Rozšířená kadence s mollovou subdominantou',
      difficulty: 'mírně pokročilý',
      chords: [
        { name: 'C dur', notes: ['C', 'E', 'G'], function: 'I. stupeň - tónika' },
        { name: 'Am', notes: ['A', 'C', 'E'], function: 'VI. stupeň - mollová paralelá' },
        { name: 'F dur', notes: ['F', 'A', 'C'], function: 'IV. stupeň - subdominanta' },
        { name: 'G dur', notes: ['G', 'H', 'D'], function: 'V. stupeň - dominanta' }
      ],
      progression: 'I - VI - IV - V - I',
      example: 'Použití: Složitější lidové písně s melancholickým nádechem'
    },
    {
      id: 4,
      title: 'Kadence v D dur',
      description: 'Pro písně v tónině D dur',
      difficulty: 'začátečník',
      chords: [
        { name: 'D dur', notes: ['D', 'F#', 'A'], function: 'I. stupeň - tónika' },
        { name: 'G dur', notes: ['G', 'H', 'D'], function: 'IV. stupeň - subdominanta' },
        { name: 'A dur', notes: ['A', 'C#', 'E'], function: 'V. stupeň - dominanta' }
      ],
      progression: 'I - IV - V - I',
      example: 'Použití: Slyšel jsem zvon'
    }
  ];

  const toggleTemplate = (id) => {
    setExpandedTemplate(expandedTemplate === id ? null : id);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'začátečník':
        return 'badge-success';
      case 'mírně pokročilý':
        return 'badge-warning';
      default:
        return '';
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <FileText size={28} color="var(--color-primary)" />
        Šablony pro harmonizaci
      </h2>
      <p style={{ marginBottom: '2rem', color: '#64748b', fontSize: '1rem' }}>
        Připravené harmonické postupy pro rychlou harmonizaci písní
      </p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              overflow: 'hidden'
            }}
          >
            <div
              onClick={() => toggleTemplate(template.id)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', marginBottom: 0, color: '#1e293b' }}>
                      {template.title}
                    </h3>
                    <span className={`badge ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 0 }}>
                    {template.description}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    marginLeft: '1rem'
                  }}
                >
                  {expandedTemplate === template.id ? (
                    <EyeOff size={20} color="var(--color-secondary)" />
                  ) : (
                    <Eye size={20} color="var(--color-secondary)" />
                  )}
                </motion.button>
              </div>

              <div style={{
                padding: '0.75rem 1rem',
                background: 'rgba(45, 91, 120, 0.08)',
                borderRadius: 'var(--radius)',
                marginTop: '0.75rem',
                border: '1px solid rgba(45, 91, 120, 0.15)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--color-secondary)" />
                  <strong style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                    Postup: {template.progression}
                  </strong>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {expandedTemplate === template.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(0, 0, 0, 0.1)', paddingTop: '1.5rem' }}
                >
                  <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1e293b' }}>
                    Akordy v šabloně:
                  </h4>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {template.chords.map((chord, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.6)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid rgba(45, 91, 120, 0.2)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '1rem', color: '#1e293b' }}>
                            {chord.name}
                          </strong>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#64748b',
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(45, 91, 120, 0.1)',
                            borderRadius: '4px'
                          }}>
                            {chord.function}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {chord.notes.map((note, noteIdx) => (
                            <span
                              key={noteIdx}
                              style={{
                                padding: '0.5rem 0.75rem',
                                background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.15) 0%, rgba(45, 91, 120, 0.05) 100%)',
                                borderRadius: 'var(--radius)',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: 'var(--color-secondary)'
                              }}
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(181, 31, 101, 0.05)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid rgba(181, 31, 101, 0.1)'
                  }}>
                    <strong style={{ fontSize: '0.875rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
                      Příklad použití:
                    </strong>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                      {template.example}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default HarmonizationTemplates;
