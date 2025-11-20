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
    <div className="achievement-manager">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Music size={28} color="var(--color-primary)" />
          Správa akordů kvízu
        </h2>

        <button
          onClick={() => setShowHelp(!showHelp)}
          style={{
            background: showHelp ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.9)',
            border: '2px solid var(--color-primary)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.3s ease'
          }}
        >
          <HelpCircle size={18} color={showHelp ? '#fff' : 'var(--color-primary)'} />
          <span style={{ color: showHelp ? '#fff' : 'var(--color-primary)', fontSize: '14px' }}>
            {showHelp ? 'Skrýt nápovědu' : 'Nápověda'}
          </span>
        </button>

        <button
          onClick={handleAddChord}
          style={{
            marginLeft: 'auto',
            background: 'var(--color-primary)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={20} />
          Přidat akord
        </button>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '12px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <CheckCircle size={20} color="#10b981" />
            <span style={{ color: '#10b981', fontWeight: '500' }}>{successMessage}</span>
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
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '12px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <AlertCircle size={20} color="#ef4444" />
            <span style={{ color: '#ef4444', fontWeight: '500' }}>{error}</span>
            <X
              size={18}
              color="#ef4444"
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
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '2px solid var(--color-primary)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px'
            }}
          >
            <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Nápověda - Správa akordů</h3>

            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '8px' }}>Jak přidat akord:</h4>
              <ol style={{ color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0 }}>
                <li>Klikněte na "Přidat akord"</li>
                <li>Zadejte název akordu (např. "C dur", "Am", "F#m")</li>
                <li>Vyberte noty, které akord tvoří (kliknutím na klaviaturu)</li>
                <li>Nastavte obtížnost (snadné/střední/těžké)</li>
                <li>Zadejte 4 možnosti odpovědí a označte správnou</li>
                <li>Uložte akord</li>
              </ol>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '8px' }}>Tipy:</h4>
              <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0 }}>
                <li>Vždy musí být právě jedna správná odpověď</li>
                <li>Všechny 4 možnosti musí mít vyplněný název</li>
                <li>Neaktivní akordy se nezobrazí v kvízu</li>
                <li>Pořadí zobrazení určuje pole "Pořadí"</li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '8px' }}>Dostupné noty:</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {AVAILABLE_NOTES.map(note => (
                  <span
                    key={note}
                    style={{
                      background: 'var(--color-primary)',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '2px solid var(--color-primary)',
              borderRadius: '16px',
              padding: '30px',
              marginBottom: '30px'
            }}
          >
            <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>
              {editingChord ? 'Upravit akord' : 'Přidat nový akord'}
            </h3>

            {/* Název akordu */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Název akordu *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="např. C dur, Am, F#m"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  fontSize: '16px'
                }}
              />
            </div>

            {/* Výběr not */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Noty akordu * (vyberte kliknutím)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                gap: '10px'
              }}>
                {AVAILABLE_NOTES.map(note => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => handleNoteToggle(note)}
                    style={{
                      background: formData.notes.includes(note)
                        ? 'var(--color-primary)'
                        : 'rgba(255, 255, 255, 0.9)',
                      border: `2px solid ${formData.notes.includes(note) ? 'var(--color-primary)' : 'rgba(0, 0, 0, 0.1)'}`,
                      borderRadius: '8px',
                      padding: '12px',
                      cursor: 'pointer',
                      color: formData.notes.includes(note) ? '#fff' : 'var(--text-primary)',
                      fontWeight: '600',
                      fontSize: '16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {note}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Vybrané noty: {formData.notes.length > 0 ? formData.notes.join(', ') : 'žádné'}
              </div>
            </div>

            {/* Obtížnost a Pořadí */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Obtížnost
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    fontSize: '16px'
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Pořadí
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '8px',
                  width: '100%'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontWeight: '600' }}>Aktivní</span>
                </label>
              </div>
            </div>

            {/* Možnosti odpovědí */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', fontSize: '18px' }}>
                Možnosti odpovědí (4 možnosti) *
              </label>
              {formData.options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '10px',
                    alignItems: 'center',
                    background: option.is_correct ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                    padding: '10px',
                    borderRadius: '8px',
                    border: option.is_correct ? '2px solid #10b981' : '2px solid transparent'
                  }}
                >
                  <span style={{ fontWeight: '600', minWidth: '30px' }}>{index + 1}.</span>
                  <input
                    type="text"
                    value={option.option_name}
                    onChange={(e) => handleOptionChange(index, 'option_name', e.target.value)}
                    placeholder={`Možnost ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '12px',
                      border: '2px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      background: option.is_correct ? '#10b981' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '8px',
                      color: option.is_correct ? '#fff' : 'var(--text-secondary)',
                      fontWeight: '600',
                      minWidth: '120px',
                      justifyContent: 'center'
                    }}
                  >
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={option.is_correct}
                      onChange={() => handleOptionChange(index, 'is_correct', true)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    Správná
                  </label>
                </div>
              ))}
            </div>

            {/* Tlačítka */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingChord(null);
                  setError(null);
                }}
                style={{
                  background: 'rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <X size={18} />
                Zrušit
              </button>
              <button
                onClick={handleSaveChord}
                style={{
                  background: 'var(--color-primary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <Save size={18} />
                Uložit akord
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seznam akordů */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {chords.map((chord) => (
          <motion.div
            key={chord.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: chord.is_active
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(200, 200, 200, 0.5)',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{chord.name}</h3>
                <span style={{
                  background: chord.difficulty === 'easy' ? '#10b981' :
                             chord.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {chord.difficulty === 'easy' ? 'Snadné' :
                   chord.difficulty === 'medium' ? 'Střední' : 'Těžké'}
                </span>
                {!chord.is_active && (
                  <span style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    Neaktivní
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-secondary)' }}>Noty:</strong>{' '}
                <span style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                  {chord.notes?.join(', ') || 'Žádné'}
                </span>
              </div>

              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Možnosti odpovědí:</strong>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {chord.piano_quiz_chord_options
                    ?.sort((a, b) => a.display_order - b.display_order)
                    .map((opt, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: opt.is_correct ? '#10b981' : 'rgba(0, 0, 0, 0.1)',
                          color: opt.is_correct ? '#fff' : 'var(--text-secondary)',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '13px',
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

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleToggleActive(chord.id, chord.is_active)}
                style={{
                  background: chord.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  border: `2px solid ${chord.is_active ? '#ef4444' : '#10b981'}`,
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  color: chord.is_active ? '#ef4444' : '#10b981',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                {chord.is_active ? 'Deaktivovat' : 'Aktivovat'}
              </button>

              <button
                onClick={() => handleEditChord(chord)}
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '2px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Edit size={18} color="#3b82f6" />
              </button>

              <button
                onClick={() => handleDeleteChord(chord.id)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid #ef4444',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Trash2 size={18} color="#ef4444" />
              </button>
            </div>
          </motion.div>
        ))}

        {chords.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Music size={64} color="var(--color-primary)" style={{ opacity: 0.3 }} />
            <p style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '18px' }}>
              Zatím nejsou žádné akordy. Přidejte první akord pro kvíz!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChordManager;
