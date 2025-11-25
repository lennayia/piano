import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, RotateCcw, CheckCircle, ChevronRight, Volume2, Headphones, Shuffle, Piano, Target, Brain } from 'lucide-react';
import useUserStore from '../store/useUserStore';
import PianoKeyboard from '../components/lessons/PianoKeyboard';
import TabButtons from '../components/ui/TabButtons';
import { RADIUS, SHADOW, BORDER } from '../utils/styleConstants';
import SongLibrary from '../components/resources/SongLibrary';
import ChordQuiz from '../components/games/ChordQuiz';
import { FloatingHelpButton } from '../components/ui/FloatingHelp';
import audioEngine from '../utils/audio';
import { getChordNotesWithOctaves, shuffleArray } from '../utils/noteUtils';
import { supabase } from '../lib/supabase';

function Cviceni() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);

  const [allChords, setAllChords] = useState([]);
  const [chords, setChords] = useState([]);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [playedNotes, setPlayedNotes] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all'); // 'all', 'easy', 'medium'
  const [isShuffled, setIsShuffled] = useState(false);
  const [activeSection, setActiveSection] = useState('chords'); // 'chords', 'quiz', 'theory', 'songs'
  const [activeSongCategory, setActiveSongCategory] = useState('lidovky');

  useEffect(() => {
    if (!currentUser) {
      navigate('/registration');
    } else {
      fetchChords();
    }
  }, [currentUser, navigate]);

  const fetchChords = async () => {
    try {
      const { data, error } = await supabase
        .from('piano_quiz_chords')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setAllChords(data || []);
      setChords(data || []);
    } catch (error) {
      console.error('Chyba při načítání akordů:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrování a míchání akordů
  useEffect(() => {
    let filtered = selectedDifficulty === 'all'
      ? allChords
      : allChords.filter(chord => chord.difficulty === selectedDifficulty);

    if (isShuffled) {
      filtered = shuffleArray(filtered);
    }

    setChords(filtered);
    setCurrentChordIndex(0);
    resetPractice();
  }, [selectedDifficulty, allChords, isShuffled]);

  const currentChord = chords[currentChordIndex];

  // Noty jsou už ve správném formátu v databázi (A., C#, H'', atd.)
  // Použijeme je přímo pro zvýraznění na klaviatuře
  const chordNotesWithOctaves = currentChord?.notes || [];

  // Přehrát celý akord najednou
  const playFullChord = () => {
    if (!currentChord) return;

    chordNotesWithOctaves.forEach((note, index) => {
      setTimeout(() => {
        audioEngine.playNote(note, 1.0);
      }, index * 50); // Malé zpoždění pro "rozložený" zvuk
    });
  };

  // Přehrát akord postupně (arpeggio)
  const playArpeggio = () => {
    if (!currentChord) return;

    chordNotesWithOctaves.forEach((note, index) => {
      setTimeout(() => {
        audioEngine.playNote(note, 1.0);
      }, index * 400);
    });
  };

  // Handler pro klik na klávesu
  const handleNoteClick = (note) => {
    if (!currentChord) return;

    const newPlayedNotes = [...playedNotes, note];
    setPlayedNotes(newPlayedNotes);

    // Zkontrolovat, jestli uživatel zahrál správné noty
    const requiredNotes = chordNotesWithOctaves;

    // Pokud zahrál všechny noty akordu (v jakémkoliv pořadí)
    const playedSet = new Set(newPlayedNotes);

    if (requiredNotes.every(n => playedSet.has(n)) && newPlayedNotes.length >= requiredNotes.length) {
      // Úspěch! Přehrát celý akord
      setTimeout(() => {
        playFullChord();
        setShowSuccess(true);
      }, 300);
    }
  };

  // Reset aktuálního cvičení
  const resetPractice = () => {
    setPlayedNotes([]);
    setShowSuccess(false);
  };

  // Přejít na další akord
  const nextChord = () => {
    if (currentChordIndex < chords.length - 1) {
      setCurrentChordIndex(currentChordIndex + 1);
    } else {
      setCurrentChordIndex(0); // Začít znovu od začátku
    }
    resetPractice();
  };

  // Přejít na předchozí akord
  const prevChord = () => {
    if (currentChordIndex > 0) {
      setCurrentChordIndex(currentChordIndex - 1);
    } else {
      setCurrentChordIndex(chords.length - 1);
    }
    resetPractice();
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Music size={48} color="var(--color-primary)" />
        </motion.div>
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Načítám cvičení...</p>
      </div>
    );
  }

  if (chords.length === 0) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Music size={64} color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
          <h2>Zatím nejsou k dispozici žádná cvičení</h2>
          <p style={{ color: '#64748b' }}>Administrátor musí nejprve přidat akordy do databáze.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FloatingHelpButton title="Nápověda - Cvičení">
        <div style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.7 }}>
          <h4 style={{ color: '#1e293b', marginBottom: '0.75rem', fontSize: '1rem' }}>
            Cvičení
          </h4>
          <p style={{ marginBottom: '1rem' }}>
            Procvičujte si hru na klavír různými způsoby.
          </p>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: '#1e293b' }}>Akordy</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Procvičujte hraní akordů. Zobrazí se vám název akordu a tóny, které máte zahrát na klaviatuře. Můžete si akord přehrát postupně nebo najednou.
            </p>
          </div>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: '#1e293b' }}>Poznáte akord?</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Kvíz pro trénink sluchové analýzy. Přehrajte si akord a hádejte, který to je. Skvělé pro rozvoj hudebního sluchu.
            </p>
          </div>

          <div style={{
            background: 'rgba(45, 91, 120, 0.08)',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            borderLeft: '3px solid var(--color-secondary)'
          }}>
            <strong style={{ color: '#1e293b' }}>Písničky</strong>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem' }}>
              Hrajte známé písničky podle not. Vyberte kategorii (Lidovky, Užskorolidovky, Dětské) a procvičujte melodie.
            </p>
          </div>

          <h4 style={{ color: '#1e293b', marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '1rem' }}>
            Tipy
          </h4>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Míchání:</strong> Zapněte náhodné pořadí akordů pro lepší procvičení
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Obtížnost:</strong> Filtrujte akordy podle úrovně (Základní, Pokročilé)
            </li>
            <li>
              <strong>Přehrávání:</strong> Klikněte na tóny pro náslech správného zvuku
            </li>
          </ul>
        </div>
      </FloatingHelpButton>

      <div className="container">
      {/* Hlavička */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.5rem'
        }}>
          <Headphones size={32} color="var(--color-primary)" />
          Cvičení
        </h1>
        <p style={{ color: '#64748b' }}>
          Procvičujte akordy nebo si zahrajte písničky podle not.
        </p>
      </motion.div>

      {/* Hlavní navigace - Akordy / Poznáte akord? / Písničky */}
      <TabButtons
        tabs={[
          { id: 'chords', label: 'Akordy', icon: Piano },
          { id: 'quiz', label: 'Poznáte akord?', icon: Target },
          { id: 'songs', label: 'Písničky', icon: Music }
        ]}
        activeTab={activeSection}
        onTabChange={setActiveSection}
        options={{ size: 'md', style: { marginBottom: '1.5rem' } }}
      />

      {/* Sekce Akordy */}
      {activeSection === 'chords' && (
        <>
          {/* Výběr obtížnosti */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        <TabButtons
          tabs={[
            { id: 'all', label: 'Všechny akordy' },
            { id: 'easy', label: 'Základní' },
            { id: 'medium', label: 'Pokročilé' }
          ]}
          activeTab={selectedDifficulty}
          onTabChange={setSelectedDifficulty}
          options={{ layout: 'pill' }}
        />

        {/* Tlačítko pro míchání */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsShuffled(!isShuffled)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: RADIUS.md,
            border: BORDER.none,
            boxShadow: SHADOW.subtle,
            background: isShuffled
              ? 'var(--color-secondary)'
              : 'rgba(255, 255, 255, 0.7)',
            color: isShuffled ? 'white' : '#64748b',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: isShuffled ? 600 : 400,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          title={isShuffled ? 'Vypnout míchání' : 'Zamíchat akordy'}
        >
          <Shuffle size={16} />
          Míchat
        </motion.button>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: 'var(--radius)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Akord {currentChordIndex + 1} z {chords.length}
          </span>
          <span style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-primary)'
          }}>
            {currentChord?.difficulty === 'easy' ? 'Základní' :
             currentChord?.difficulty === 'medium' ? 'Pokročilý' : 'Těžký'}
          </span>
        </div>
        <div style={{
          height: '8px',
          background: 'rgba(181, 31, 101, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentChordIndex + 1) / chords.length) * 100}%` }}
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              borderRadius: '4px'
            }}
          />
        </div>
      </motion.div>

      {/* Hlavní karta cvičení */}
      <motion.div
        key={currentChordIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '2px solid rgba(181, 31, 101, 0.2)',
          boxShadow: '0 8px 32px rgba(181, 31, 101, 0.15)',
          marginBottom: '2rem'
        }}
      >
        {/* Název akordu */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.h2
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              marginBottom: '0.5rem'
            }}
          >
            {currentChord?.name}
          </motion.h2>
          <p style={{ color: '#64748b' }}>
            Zahrajte postupně tyto tóny:
          </p>
        </div>

        {/* Tóny k zahrání */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {chordNotesWithOctaves.map((note, index) => {
            const isPlayed = playedNotes.includes(note);
            // Zobrazit původní název noty (bez oktávové notace)
            const displayNote = currentChord?.notes[index] || note;
            return (
              <motion.div
                key={note}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.1 }}
                onClick={() => audioEngine.playNote(note, 1.0)}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: isPlayed
                    ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'
                    : 'rgba(255, 255, 255, 0.9)',
                  border: isPlayed
                    ? '3px solid var(--color-primary)'
                    : '3px solid rgba(181, 31, 101, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: isPlayed ? 'white' : 'var(--color-primary)',
                  cursor: 'pointer',
                  boxShadow: isPlayed
                    ? '0 8px 24px rgba(181, 31, 101, 0.4)'
                    : '0 4px 16px rgba(181, 31, 101, 0.15)',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                {displayNote}
                {isPlayed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px'
                    }}
                  >
                    <CheckCircle size={24} color="white" fill="var(--color-primary)" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tlačítka pro přehrání */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playArpeggio}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <Play size={18} />
            Přehrát postupně
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playFullChord}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            <Volume2 size={18} />
            Přehrát akord
          </motion.button>
        </div>

        {/* Klaviatura */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{
            textAlign: 'center',
            marginBottom: '1rem',
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Klikněte na klávesy a zahrajte tóny akordu:
          </p>
          <PianoKeyboard
            highlightedNotes={chordNotesWithOctaves}
            onNoteClick={handleNoteClick}
          />
        </div>

        {/* Stav zahraných not */}
        {playedNotes.length > 0 && !showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '1rem',
              background: 'rgba(181, 31, 101, 0.1)',
              borderRadius: 'var(--radius)',
              marginBottom: '1rem'
            }}
          >
            <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>Zahrané tóny:</p>
            <p style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              {playedNotes.join(' → ')}
            </p>
          </motion.div>
        )}

        {/* Úspěch! */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2))',
                borderRadius: 'var(--radius)',
                border: '2px solid rgba(16, 185, 129, 0.3)'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                <CheckCircle size={64} color="var(--color-success)" style={{ marginBottom: '1rem' }} />
              </motion.div>
              <h3 style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                Výborně!
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                Správně jste zahráli akord <strong>{currentChord?.name}</strong>
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={nextChord}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem' }}
              >
                Další akord
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reset tlačítko */}
        {playedNotes.length > 0 && !showSuccess && (
          <div style={{ textAlign: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetPractice}
              className="btn btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              <RotateCcw size={16} />
              Začít znovu
            </motion.button>
          </div>
        )}
      </motion.div>

          {/* Navigace mezi akordy */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={prevChord}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              ← Předchozí
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextChord}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Další →
            </motion.button>
          </div>
        </>
      )}

      {/* Sekce Poznáte akord? */}
      {activeSection === 'quiz' && (
        <ChordQuiz />
      )}

      {/* Sekce Písničky */}
      {activeSection === 'songs' && (
        <>
          <div style={{ marginBottom: '1rem' }}>
            <TabButtons
              tabs={[
                { id: 'lidovky', label: 'Lidovky', icon: Music },
                { id: 'uzskorolidovky', label: 'Užskorolidovky', icon: Music },
                { id: 'detske', label: 'Dětské', icon: Music }
              ]}
              activeTab={activeSongCategory}
              onTabChange={setActiveSongCategory}
              options={{ layout: 'pill' }}
            />
          </div>
          <SongLibrary activeCategory={activeSongCategory} />
        </>
      )}
      </div>
    </>
  );
}

export default Cviceni;
