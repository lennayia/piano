import { useState, useRef } from 'react';
import { Music, Play, Pause, BookOpen, Piano, Edit3, Save, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from '../../utils/audio';
import PianoKeyboard from '../lessons/PianoKeyboard';
import useSongStore from '../../store/useSongStore';
import useUserStore from '../../store/useUserStore';

function SongLibrary() {
  const [playingSong, setPlayingSong] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [showKeyboard, setShowKeyboard] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSongForm, setNewSongForm] = useState({
    title: '',
    notes: '',
    difficulty: 'začátečník',
    tempo: '',
    key: '',
    tips: ''
  });
  const playingRef = useRef(false);

  const songs = useSongStore((state) => state.songs);
  const updateSong = useSongStore((state) => state.updateSong);
  const addSong = useSongStore((state) => state.addSong);
  const currentUser = useUserStore((state) => state.currentUser);

  // Admin je uživatel s isAdmin === true
  const isAdmin = currentUser?.isAdmin === true;

  const playMelody = async (song) => {
    if (playingRef.current && playingSong === song.id) {
      playingRef.current = false;
      setPlayingSong(null);
      setCurrentNoteIndex(-1);
      return;
    }

    playingRef.current = true;
    setPlayingSong(song.id);
    setCurrentNoteIndex(-1);

    for (let i = 0; i < song.notes.length; i++) {
      if (!playingRef.current) break;

      setCurrentNoteIndex(i);
      audioEngine.playNote(song.notes[i], 0.6);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    playingRef.current = false;
    setPlayingSong(null);
    setCurrentNoteIndex(-1);
  };

  const toggleKeyboard = (songId) => {
    setShowKeyboard(showKeyboard === songId ? null : songId);
  };

  const startEditing = (song) => {
    setEditingSong(song.id);
    setEditForm({
      title: song.title,
      notes: song.notes.join(', '),
      difficulty: song.difficulty,
      tempo: song.tempo,
      key: song.key,
      tips: song.tips
    });
  };

  const saveEdit = () => {
    const notesArray = editForm.notes
      .split(',')
      .map(note => note.trim())
      .filter(note => note.length > 0);

    updateSong(editingSong, {
      title: editForm.title,
      notes: notesArray,
      difficulty: editForm.difficulty,
      tempo: editForm.tempo,
      key: editForm.key,
      tips: editForm.tips
    });

    setEditingSong(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingSong(null);
    setEditForm({});
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewSongChange = (field, value) => {
    setNewSongForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setNewSongForm({
      title: '',
      notes: '',
      difficulty: 'začátečník',
      tempo: '',
      key: '',
      tips: ''
    });
  };

  const saveNewSong = () => {
    const notesArray = newSongForm.notes
      .split(',')
      .map(note => note.trim())
      .filter(note => note.length > 0);

    if (!newSongForm.title || notesArray.length === 0) {
      alert('Vyplňte alespoň název a noty');
      return;
    }

    addSong({
      title: newSongForm.title,
      notes: notesArray,
      difficulty: newSongForm.difficulty,
      tempo: newSongForm.tempo,
      key: newSongForm.key,
      tips: newSongForm.tips
    });

    setIsAddingNew(false);
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
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
          <Music size={24} color="var(--color-primary)" />
        </div>
        Playlist lidových písní
      </h2>
      <p style={{ marginBottom: '2rem', color: '#64748b', fontSize: '1rem' }}>
        Procvičte si harmonizaci na těchto oblíbených lidových písních
      </p>

      {/* Tlačítko pro přidání nové písně (pouze pro adminy) */}
      {isAdmin && !isAddingNew && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startAddingNew}
          style={{
            marginBottom: '1.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.9) 0%, rgba(65, 111, 140, 0.9) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 'calc(var(--radius) * 2)',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 16px rgba(45, 91, 120, 0.3)'
          }}
        >
          <Plus size={18} />
          Přidat novou píseň
        </motion.button>
      )}

      {/* Formulář pro přidání nové písně */}
      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card"
            style={{
              marginBottom: '1.5rem',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '2px solid rgba(181, 31, 101, 0.4)',
              boxShadow: '0 8px 32px rgba(181, 31, 101, 0.25)'
            }}
          >
            <h3 style={{ marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="var(--color-primary)" />
              Nová píseň
            </h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Název písně
              </label>
              <input
                type="text"
                className="form-input"
                value={newSongForm.title}
                onChange={(e) => handleNewSongChange('title', e.target.value)}
                placeholder="Zadejte název písně"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Noty (oddělené čárkami, např: C, D, E, F, G)
              </label>
              <input
                type="text"
                className="form-input"
                value={newSongForm.notes}
                onChange={(e) => handleNewSongChange('notes', e.target.value)}
                placeholder="C, D, E, F, G, A, H"
                style={{ fontSize: '0.875rem' }}
              />
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Použijte notaci: C, C#, D, D#, E, F, F#, G, G#, A, A#, H (nebo Db, Eb, Gb, Ab, Bb)
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Obtížnost
                </label>
                <select
                  className="form-input"
                  value={newSongForm.difficulty}
                  onChange={(e) => handleNewSongChange('difficulty', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="začátečník">začátečník</option>
                  <option value="mírně pokročilý">mírně pokročilý</option>
                  <option value="pokročilý">pokročilý</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Tempo
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newSongForm.tempo}
                  onChange={(e) => handleNewSongChange('tempo', e.target.value)}
                  placeholder="Allegro, Moderato, Andante..."
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Tónina
              </label>
              <input
                type="text"
                className="form-input"
                value={newSongForm.key}
                onChange={(e) => handleNewSongChange('key', e.target.value)}
                placeholder="C dur, G dur..."
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Tip pro harmonizaci
              </label>
              <textarea
                className="form-input"
                value={newSongForm.tips}
                onChange={(e) => handleNewSongChange('tips', e.target.value)}
                rows={2}
                placeholder="Zadejte užitečné tipy pro harmonizaci této písně"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveNewSong}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <Save size={16} />
                Přidat píseň
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelAddingNew}
                className="btn btn-secondary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <X size={16} />
                Zrušit
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {songs.map((song, index) => (
          <motion.div
            key={song.id}
            className="card"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{
              y: -4,
              boxShadow: '0 12px 40px rgba(181, 31, 101, 0.25)'
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '1.5rem' }}>
              {/* Play Button */}
              <motion.button
                whileHover={{ scale: 1.15, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => playMelody(song)}
                style={{
                  width: '64px',
                  height: '64px',
                  background: playingSong === song.id
                    ? 'linear-gradient(135deg, rgba(181, 31, 101, 0.9) 0%, rgba(221, 51, 121, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(45, 91, 120, 0.9) 0%, rgba(65, 111, 140, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: playingSong === song.id
                    ? '0 8px 32px rgba(181, 31, 101, 0.5)'
                    : '0 8px 32px rgba(45, 91, 120, 0.4)',
                  flexShrink: 0,
                  transition: 'all 0.3s'
                }}
              >
                {playingSong === song.id ? (
                  <Pause size={24} color="#ffffff" />
                ) : (
                  <Play size={24} color="#ffffff" style={{ marginLeft: '3px' }} />
                )}
              </motion.button>

              {/* Song Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', marginBottom: 0, color: '#1e293b' }}>
                    {song.title}
                  </h3>
                  <span className={`badge ${getDifficultyColor(song.difficulty)}`}>
                    {song.difficulty}
                  </span>
                  {isAdmin && editingSong !== song.id && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => startEditing(song)}
                      style={{
                        background: 'rgba(45, 91, 120, 0.2)',
                        border: '1px solid rgba(45, 91, 120, 0.3)',
                        borderRadius: 'var(--radius)',
                        padding: '0.25rem 0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem',
                        color: 'var(--color-secondary)'
                      }}
                    >
                      <Edit3 size={14} />
                      Upravit
                    </motion.button>
                  )}
                </div>

                {editingSong === song.id ? (
                  /* Editační formulář pro admina */
                  <div style={{ marginTop: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        Název písně
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editForm.title}
                        onChange={(e) => handleEditChange('title', e.target.value)}
                        style={{ fontSize: '0.875rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        Noty (oddělené čárkami, např: C, D, E, F, G)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editForm.notes}
                        onChange={(e) => handleEditChange('notes', e.target.value)}
                        placeholder="C, D, E, F, G, A, H"
                        style={{ fontSize: '0.875rem' }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Použijte notaci: C, C#, D, D#, E, F, F#, G, G#, A, A#, H (nebo Db, Eb, Gb, Ab, Bb)
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                          Obtížnost
                        </label>
                        <select
                          className="form-input"
                          value={editForm.difficulty}
                          onChange={(e) => handleEditChange('difficulty', e.target.value)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          <option value="začátečník">začátečník</option>
                          <option value="mírně pokročilý">mírně pokročilý</option>
                          <option value="pokročilý">pokročilý</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                          Tempo
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={editForm.tempo}
                          onChange={(e) => handleEditChange('tempo', e.target.value)}
                          placeholder="Allegro, Moderato, Andante..."
                          style={{ fontSize: '0.875rem' }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        Tónina
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editForm.key}
                        onChange={(e) => handleEditChange('key', e.target.value)}
                        placeholder="C dur, G dur..."
                        style={{ fontSize: '0.875rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        Tip pro harmonizaci
                      </label>
                      <textarea
                        className="form-input"
                        value={editForm.tips}
                        onChange={(e) => handleEditChange('tips', e.target.value)}
                        rows={2}
                        style={{ fontSize: '0.875rem' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={saveEdit}
                        className="btn btn-primary"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        <Save size={16} />
                        Uložit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={cancelEdit}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        <X size={16} />
                        Zrušit
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        <strong>Tónina:</strong> {song.key}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        <strong>Tempo:</strong> {song.tempo}
                      </span>
                    </div>

                    {/* Noty s vizualizací */}
                    <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {song.notes.map((note, noteIndex) => {
                      const isCurrent = playingSong === song.id && currentNoteIndex === noteIndex;
                      const isNext = playingSong === song.id && currentNoteIndex + 1 === noteIndex;

                      return (
                        <motion.div
                          key={noteIndex}
                          animate={{
                            scale: isCurrent ? 1.3 : isNext ? 1.1 : 1,
                            backgroundColor: isCurrent
                              ? 'rgba(181, 31, 101, 0.4)'
                              : isNext
                              ? 'rgba(181, 31, 101, 0.15)'
                              : 'rgba(45, 91, 120, 0.1)'
                          }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: isCurrent || isNext ? 'var(--color-primary)' : 'var(--color-secondary)',
                            border: isCurrent
                              ? '2px solid var(--color-primary)'
                              : isNext
                              ? '2px dashed var(--color-primary)'
                              : '1px solid rgba(45, 91, 120, 0.2)',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          {note}
                          {isNext && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                fontSize: '0.75rem'
                              }}
                            >
                              ▶
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleKeyboard(song.id)}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <Piano size={16} />
                    {showKeyboard === song.id ? 'Skrýt klavír' : 'Zkusit na klavíru'}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showKeyboard === song.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: '1rem', marginBottom: '1rem' }}
                    >
                      <PianoKeyboard highlightedNotes={song.notes} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {playingSong === song.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        padding: '1rem',
                        background: 'rgba(45, 91, 120, 0.15)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: 'var(--radius)',
                        marginTop: '0.75rem',
                        border: '2px solid rgba(45, 91, 120, 0.3)',
                        boxShadow: '0 4px 16px rgba(45, 91, 120, 0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <BookOpen size={16} color="var(--color-secondary)" />
                        <strong style={{ fontSize: '0.875rem', color: '#1e293b' }}>Tip pro harmonizaci:</strong>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                        {song.tips}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default SongLibrary;
