import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Music, Plus, Edit, Trash2, Save, X, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

const ChordManager = () => {
  const [chords, setChords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [editingChord, setEditingChord] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    notes: [],
    difficulty: 'easy',
    is_active: true,
    display_order: 0,
    options: [
      { option_name: '', is_correct: true, display_order: 1 },
      { option_name: '', is_correct: false, display_order: 2 },
      { option_name: '', is_correct: false, display_order: 3 },
      { option_name: '', is_correct: false, display_order: 4 }
    ]
  });

  const AVAILABLE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];
  const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Snadné' },
    { value: 'medium', label: 'Střední' },
    { value: 'hard', label: 'Těžké' }
  ];

  useEffect(() => {
    fetchChords();
  }, []);

  const fetchChords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Načteme akordy s jejich možnostmi
      const { data: chordsData, error: chordsError } = await supabase
        .from('piano_quiz_chords')
        .select(`
          *,
          piano_quiz_chord_options (*)
        `)
        .order('display_order');

      if (chordsError) throw chordsError;

      setChords(chordsData || []);
    } catch (err) {
      console.error('Error fetching chords:', err);
      setError('Nepodařilo se načíst akordy: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChord = () => {
    setShowAddForm(true);
    setEditingChord(null);
    setFormData({
      name: '',
      notes: [],
      difficulty: 'easy',
      is_active: true,
      display_order: chords.length + 1,
      options: [
        { option_name: '', is_correct: true, display_order: 1 },
        { option_name: '', is_correct: false, display_order: 2 },
        { option_name: '', is_correct: false, display_order: 3 },
        { option_name: '', is_correct: false, display_order: 4 }
      ]
    });
  };

  const handleEditChord = (chord) => {
    setEditingChord(chord.id);
    setShowAddForm(true);

    // Seřadíme možnosti podle display_order
    const sortedOptions = [...(chord.piano_quiz_chord_options || [])].sort(
      (a, b) => a.display_order - b.display_order
    );

    setFormData({
      name: chord.name,
      notes: chord.notes || [],
      difficulty: chord.difficulty,
      is_active: chord.is_active,
      display_order: chord.display_order,
      options: sortedOptions.length > 0 ? sortedOptions : [
        { option_name: '', is_correct: true, display_order: 1 },
        { option_name: '', is_correct: false, display_order: 2 },
        { option_name: '', is_correct: false, display_order: 3 },
        { option_name: '', is_correct: false, display_order: 4 }
      ]
    });
  };

  const handleDeleteChord = async (chordId) => {
    if (!confirm('Opravdu chcete smazat tento akord? Tato akce je nevratná.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('piano_quiz_chords')
        .delete()
        .eq('id', chordId);

      if (error) throw error;

      showSuccess('Akord byl úspěšně smazán');
      fetchChords();
    } catch (err) {
      console.error('Error deleting chord:', err);
      setError('Nepodařilo se smazat akord: ' + err.message);
    }
  };

  const handleSaveChord = async () => {
    try {
      // Validace
      if (!formData.name.trim()) {
        setError('Název akordu je povinný');
        return;
      }
      if (formData.notes.length === 0) {
        setError('Vyberte alespoň jednu notu');
        return;
      }

      // Ověříme, že máme právě jednu správnou odpověď
      const correctAnswers = formData.options.filter(opt => opt.is_correct);
      if (correctAnswers.length !== 1) {
        setError('Musí být právě jedna správná odpověď');
        return;
      }

      // Ověříme, že všechny možnosti mají název
      if (formData.options.some(opt => !opt.option_name.trim())) {
        setError('Všechny možnosti musí mít název');
        return;
      }

      setError(null);

      if (editingChord) {
        // UPDATE existujícího akordu
        const { error: updateError } = await supabase
          .from('piano_quiz_chords')
          .update({
            name: formData.name,
            notes: formData.notes,
            difficulty: formData.difficulty,
            is_active: formData.is_active,
            display_order: formData.display_order
          })
          .eq('id', editingChord);

        if (updateError) throw updateError;

        // Smažeme staré možnosti a vytvoříme nové
        await supabase
          .from('piano_quiz_chord_options')
          .delete()
          .eq('chord_id', editingChord);

        const optionsToInsert = formData.options.map(opt => ({
          chord_id: editingChord,
          option_name: opt.option_name,
          is_correct: opt.is_correct,
          display_order: opt.display_order
        }));

        const { error: optionsError } = await supabase
          .from('piano_quiz_chord_options')
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;

        showSuccess('Akord byl úspěšně aktualizován');
      } else {
        // INSERT nového akordu
        const { data: newChord, error: insertError } = await supabase
          .from('piano_quiz_chords')
          .insert([{
            name: formData.name,
            notes: formData.notes,
            difficulty: formData.difficulty,
            is_active: formData.is_active,
            display_order: formData.display_order
          }])
          .select()
          .single();

        if (insertError) throw insertError;

        // Vložíme možnosti
        const optionsToInsert = formData.options.map(opt => ({
          chord_id: newChord.id,
          option_name: opt.option_name,
          is_correct: opt.is_correct,
          display_order: opt.display_order
        }));

        const { error: optionsError } = await supabase
          .from('piano_quiz_chord_options')
          .insert(optionsToInsert);

        if (optionsError) throw optionsError;

        showSuccess('Akord byl úspěšně přidán');
      }

      setShowAddForm(false);
      setEditingChord(null);
      fetchChords();
    } catch (err) {
      console.error('Error saving chord:', err);
      setError('Nepodařilo se uložit akord: ' + err.message);
    }
  };

  const handleToggleActive = async (chordId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('piano_quiz_chords')
        .update({ is_active: !currentStatus })
        .eq('id', chordId);

      if (error) throw error;

      showSuccess(`Akord byl ${!currentStatus ? 'aktivován' : 'deaktivován'}`);
      fetchChords();
    } catch (err) {
      console.error('Error toggling active status:', err);
      setError('Nepodařilo se změnit stav: ' + err.message);
    }
  };

  const handleNoteToggle = (note) => {
    setFormData(prev => ({
      ...prev,
      notes: prev.notes.includes(note)
        ? prev.notes.filter(n => n !== note)
        : [...prev.notes, note]
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setFormData(prev => {
      const newOptions = [...prev.options];

      // Pokud měníme is_correct na true, ostatní nastavíme na false
      if (field === 'is_correct' && value === true) {
        newOptions.forEach((opt, i) => {
          opt.is_correct = i === index;
        });
      } else {
        newOptions[index] = { ...newOptions[index], [field]: value };
      }

      return { ...prev, options: newOptions };
    });
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Music size={48} color="var(--color-primary)" style={{ animation: 'pulse 1.5s infinite' }} />
        <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Načítám akordy...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h3 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Music size={24} color="var(--color-primary)" />
            Správa akordů kvízu
          </h3>

          {/* Help Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowHelp(!showHelp)}
            style={{
              background: showHelp ? 'rgba(181, 31, 101, 0.1)' : 'rgba(45, 91, 120, 0.1)',
              border: showHelp ? '2px solid rgba(181, 31, 101, 0.3)' : '2px solid rgba(45, 91, 120, 0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            title="Zobrazit nápovědu"
          >
            <HelpCircle size={18} color={showHelp ? 'var(--color-primary)' : 'var(--color-secondary)'} />
          </motion.button>
        </div>

        {!showAddForm && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddChord}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <Plus size={16} />
            Přidat akord
          </motion.button>
        )}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: 'rgba(45, 91, 120, 0.1)',
              border: '2px solid var(--color-secondary)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem'
            }}
          >
            <CheckCircle size={20} color="var(--color-secondary)" />
            <span style={{ color: 'var(--color-secondary)', fontWeight: '500' }}>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: 'rgba(181, 31, 101, 0.1)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius)',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem'
            }}
          >
            <AlertCircle size={20} color="var(--color-primary)" />
            <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>{error}</span>
            <X
              size={18}
              color="var(--color-primary)"
              style={{ marginLeft: 'auto', cursor: 'pointer' }}
              onClick={() => setError(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(45, 91, 120, 0.05) 0%, rgba(181, 31, 101, 0.05) 100%)',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(45, 91, 120, 0.2)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(45, 91, 120, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <HelpCircle size={20} color="var(--color-secondary)" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ marginBottom: '0.75rem', color: '#1e293b', fontSize: '1rem' }}>
                  Nápověda - Správa akordů
                </h4>

                <div style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>📝 Jak přidat akord:</strong>
                    <ol style={{ marginLeft: '1.5rem', marginBottom: '0' }}>
                      <li style={{ marginBottom: '0.25rem' }}>Klikněte na "Přidat akord"</li>
                      <li style={{ marginBottom: '0.25rem' }}>Zadejte název akordu (např. "C dur", "Am", "F#m")</li>
                      <li style={{ marginBottom: '0.25rem' }}>Vyberte noty, které akord tvoří</li>
                      <li style={{ marginBottom: '0.25rem' }}>Nastavte obtížnost (snadné/střední/těžké)</li>
                      <li style={{ marginBottom: '0.25rem' }}>Zadejte 4 možnosti odpovědí a označte správnou</li>
                      <li>Uložte akord</li>
                    </ol>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>💡 Tipy:</strong>
                    <ul style={{ marginLeft: '1.5rem', marginBottom: '0' }}>
                      <li style={{ marginBottom: '0.25rem' }}>Vždy musí být právě jedna správná odpověď</li>
                      <li style={{ marginBottom: '0.25rem' }}>Všechny 4 možnosti musí mít vyplněný název</li>
                      <li style={{ marginBottom: '0.25rem' }}>Neaktivní akordy se nezobrazí v kvízu</li>
                      <li>Pořadí zobrazení určuje pole "Pořadí"</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>🎹 Dostupné noty:</strong>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: 'var(--radius)'
                    }}>
                      {AVAILABLE_NOTES.map(note => (
                        <span
                          key={note}
                          style={{
                            background: 'var(--color-primary)',
                            color: '#fff',
                            padding: '0.375rem 0.75rem',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'rgba(181, 31, 101, 0.05)',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(181, 31, 101, 0.2)'
            }}
          >
            <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
              {editingChord ? 'Upravit akord' : 'Přidat nový akord'}
            </h4>

            {/* Název akordu */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Název akordu *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="např. C dur, Am, F#m"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid #ddd',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            {/* Výběr not */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                Noty akordu * (vyberte kliknutím)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                gap: '0.5rem'
              }}>
                {AVAILABLE_NOTES.map(note => (
                  <motion.button
                    key={note}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNoteToggle(note)}
                    style={{
                      background: formData.notes.includes(note)
                        ? 'var(--color-primary)'
                        : 'rgba(255, 255, 255, 0.9)',
                      border: `2px solid ${formData.notes.includes(note) ? 'var(--color-primary)' : '#ddd'}`,
                      borderRadius: 'var(--radius)',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      color: formData.notes.includes(note) ? '#fff' : '#1e293b',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {note}
                  </motion.button>
                ))}
              </div>
              <div style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: '#64748b' }}>
                Vybrané noty: {formData.notes.length > 0 ? formData.notes.join(', ') : 'žádné'}
              </div>
            </div>

            {/* Obtížnost a Pořadí */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Obtížnost
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                >
                  {DIFFICULTY_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Pořadí
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: 'var(--radius)',
                  width: '100%',
                  fontSize: '0.875rem'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 500 }}>Aktivní</span>
                </label>
              </div>
            </div>

            {/* Možnosti odpovědí */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 500, fontSize: '0.875rem' }}>
                Možnosti odpovědí (4 možnosti) *
              </label>
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    alignItems: 'center',
                    background: option.is_correct ? 'rgba(45, 91, 120, 0.05)' : 'transparent',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: option.is_correct ? '2px solid var(--color-secondary)' : '2px solid transparent'
                  }}
                >
                  <span style={{ fontWeight: 600, minWidth: '25px', fontSize: '0.875rem' }}>{index + 1}.</span>
                  <input
                    type="text"
                    value={option.option_name}
                    onChange={(e) => handleOptionChange(index, 'option_name', e.target.value)}
                    placeholder={`Možnost ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem'
                    }}
                  />
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      cursor: 'pointer',
                      padding: '0.5rem 0.75rem',
                      background: option.is_correct ? 'var(--color-secondary)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: 'var(--radius)',
                      color: option.is_correct ? '#fff' : '#64748b',
                      fontWeight: 500,
                      minWidth: '110px',
                      justifyContent: 'center',
                      fontSize: '0.75rem'
                    }}
                  >
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={option.is_correct}
                      onChange={() => handleOptionChange(index, 'is_correct', true)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Správná
                  </label>
                </div>
              ))}
            </div>

            {/* Tlačítka */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowAddForm(false);
                  setEditingChord(null);
                  setError(null);
                }}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <X size={16} />
                Zrušit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveChord}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Save size={16} />
                Uložit
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seznam akordů */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {chords.map((chord) => (
          <motion.div
            key={chord.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01, y: -2 }}
            style={{
              background: chord.is_active
                ? 'rgba(255, 255, 255, 0.9)'
                : 'rgba(200, 200, 200, 0.5)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(181, 31, 101, 0.2)',
              borderRadius: 'var(--radius)',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              boxShadow: '0 4px 15px rgba(181, 31, 101, 0.15)'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>{chord.name}</h3>
                <span style={{
                  background: chord.difficulty === 'easy' ? 'var(--color-secondary)' :
                             chord.difficulty === 'medium' ? 'var(--color-primary)' : '#1e293b',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {chord.difficulty === 'easy' ? 'Snadné' :
                   chord.difficulty === 'medium' ? 'Střední' : 'Těžké'}
                </span>
                {!chord.is_active && (
                  <span style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius)',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Neaktivní
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                <strong style={{ color: '#64748b' }}>Noty:</strong>{' '}
                <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                  {chord.notes?.join(', ') || 'Žádné'}
                </span>
              </div>

              <div style={{ fontSize: '0.875rem' }}>
                <strong style={{ color: '#64748b' }}>Možnosti odpovědí:</strong>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                  {chord.piano_quiz_chord_options
                    ?.sort((a, b) => a.display_order - b.display_order)
                    .map((opt, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: opt.is_correct ? 'var(--color-secondary)' : 'rgba(0, 0, 0, 0.1)',
                          color: opt.is_correct ? '#fff' : '#64748b',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.8125rem',
                          fontWeight: opt.is_correct ? '600' : '400'
                        }}
                      >
                        {opt.option_name}
                        {opt.is_correct && ' ✓'}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEditChord(chord)}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Edit size={14} />
                Upravit
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDeleteChord(chord.id)}
                className="btn btn-danger"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  fontSize: '0.75rem',
                  padding: '0.5rem 0.75rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Trash2 size={14} />
                Smazat
              </motion.button>
            </div>
          </motion.div>
        ))}

        {chords.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1.25rem' }}>
            <Music size={48} color="var(--color-primary)" style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <p style={{ marginTop: '1.25rem', color: '#64748b', fontSize: '1rem' }}>
              Zatím nejsou žádné akordy. Přidejte první akord pro kvíz!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChordManager;
