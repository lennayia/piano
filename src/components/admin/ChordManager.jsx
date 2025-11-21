import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { Music, BookOpen, Plus, Edit, Trash2, Save, X, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { sortNotesByKeyboard } from '../../utils/noteUtils';
import TabButtons from '../ui/TabButtons';

const ChordManager = () => {
  const [chords, setChords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [editingChord, setEditingChord] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeQuizType, setActiveQuizType] = useState('chord');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    quiz_type: 'chord',
    notes: [],
    category: '',
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

  // Typy kvízů
  const QUIZ_TYPES = [
    { id: 'chord', label: 'Akordy', icon: Music },
    { id: 'theory', label: 'Teorie', icon: BookOpen },
    { id: 'interval', label: 'Intervaly', icon: Music },
    { id: 'scale', label: 'Stupnice', icon: Music },
    { id: 'rhythm', label: 'Rytmus', icon: Music },
    { id: 'mixed', label: 'Mix', icon: Music }
  ];

  // Rozsah klaviatury podle PianoKeyboard komponenty
  const NOTES_MALA_OKTAVA = ['A.', 'A#.', 'H.'];  // malá oktáva (a, ais, h)
  const NOTES_OKTAVA_1 = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'H'];  // oktáva 1
  const NOTES_OKTAVA_2 = ["C''", "C#''", "D''", "D#''", "E''"];  // oktáva 2
  const AVAILABLE_NOTES = [...NOTES_MALA_OKTAVA, ...NOTES_OKTAVA_1, ...NOTES_OKTAVA_2];
  const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Snadné' },
    { value: 'medium', label: 'Střední' },
    { value: 'hard', label: 'Těžké' }
  ];

  useEffect(() => {
    fetchChords();
  }, [activeQuizType]);

  const fetchChords = async () => {
    try {
      setLoading(true);
      setError(null);

      // Načteme kvízy podle typu s jejich možnostmi
      const { data: chordsData, error: chordsError } = await supabase
        .from('piano_quiz_chords')
        .select(`
          *,
          piano_quiz_chord_options (*)
        `)
        .eq('quiz_type', activeQuizType)
        .order('display_order');

      if (chordsError) throw chordsError;

      setChords(chordsData || []);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Nepodařilo se načíst kvízy: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChord = () => {
    setShowAddForm(true);
    setEditingChord(null);
    setFormData({
      name: '',
      quiz_type: activeQuizType,
      notes: activeQuizType === 'chord' ? [] : null,
      category: '',
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
    console.log('=== handleEditChord ===');
    console.log('chord:', chord);
    console.log('chord.piano_quiz_chord_options:', chord.piano_quiz_chord_options);

    setEditingChord(chord.id);
    setShowAddForm(false); // Formulář se zobrazí inline u akordu

    // Seřadíme možnosti podle display_order
    const sortedOptions = [...(chord.piano_quiz_chord_options || [])].sort(
      (a, b) => a.display_order - b.display_order
    );
    console.log('sortedOptions:', sortedOptions);

    // Převedeme možnosti na správný formát s option_name
    const formattedOptions = sortedOptions.length > 0
      ? sortedOptions.map(opt => ({
          option_name: opt.option_name || '',
          is_correct: opt.is_correct || false,
          display_order: opt.display_order || 1
        }))
      : [
          { option_name: '', is_correct: true, display_order: 1 },
          { option_name: '', is_correct: false, display_order: 2 },
          { option_name: '', is_correct: false, display_order: 3 },
          { option_name: '', is_correct: false, display_order: 4 }
        ];

    setFormData({
      name: chord.name,
      quiz_type: chord.quiz_type || 'chord',
      notes: chord.notes ? sortNotesByKeyboard(chord.notes) : [],
      category: chord.category || '',
      difficulty: chord.difficulty,
      is_active: chord.is_active,
      display_order: chord.display_order,
      options: formattedOptions
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
    console.log('=== handleSaveChord ===');
    console.log('editingChord:', editingChord);
    console.log('formData:', JSON.stringify(formData, null, 2));

    // Zkontrolujeme session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Current session:', sessionData);
    console.log('Session error:', sessionError);
    console.log('User ID:', sessionData?.session?.user?.id);
    console.log('User email:', sessionData?.session?.user?.email);

    // Ověříme, že máme platnou session
    if (!sessionData?.session) {
      setError('Nejste přihlášen. Obnovte stránku a přihlaste se znovu.');
      return;
    }

    // Zkontrolujeme admin status v databázi
    const { data: userData, error: userError } = await supabase
      .from('piano_users')
      .select('id, email, is_admin')
      .eq('id', sessionData.session.user.id)
      .single();

    console.log('User data from piano_users:', userData);
    console.log('User error:', userError);

    if (!userData?.is_admin) {
      setError('Nemáte oprávnění administrátora');
      return;
    }

    try {
      // Validace
      if (!formData.name.trim()) {
        setError(activeQuizType === 'chord' ? 'Název akordu je povinný' : 'Text otázky je povinný');
        return;
      }
      if (activeQuizType === 'chord' && formData.notes.length === 0) {
        setError('Vyberte alespoň jednu notu');
        return;
      }

      // Zkontrolujeme jestli uživatel vyplnil nějaké možnosti
      const filledOptions = formData.options.filter(opt => opt.option_name && opt.option_name.trim());

      // Pokud jsou vyplněné nějaké možnosti, validujeme je
      if (filledOptions.length > 0) {
        // Ověříme, že máme právě jednu správnou odpověď
        const correctAnswers = filledOptions.filter(opt => opt.is_correct);
        if (correctAnswers.length !== 1) {
          setError('Musí být právě jedna správná odpověď');
          return;
        }

        // Ověříme, že všechny 4 možnosti jsou vyplněné
        if (filledOptions.length !== 4) {
          setError('Vyplňte všechny 4 možnosti nebo žádnou (budou generovány automaticky)');
          return;
        }
      }

      setError(null);

      if (editingChord) {
        // UPDATE existujícího akordu
        console.log('Updating chord with ID:', editingChord);
        console.log('Update data:', {
          name: formData.name,
          notes: formData.notes,
          difficulty: formData.difficulty,
          is_active: formData.is_active,
          display_order: formData.display_order
        });

        const updateData_obj = {
          name: formData.name,
          quiz_type: formData.quiz_type,
          difficulty: formData.difficulty,
          is_active: formData.is_active,
          display_order: formData.display_order,
          category: formData.category || null
        };

        // Přidat noty pouze pro akordový kvíz
        if (formData.quiz_type === 'chord') {
          updateData_obj.notes = sortNotesByKeyboard(formData.notes);
        } else {
          updateData_obj.notes = null;
        }

        const { data: updateData, error: updateError, count, status, statusText } = await supabase
          .from('piano_quiz_chords')
          .update(updateData_obj)
          .eq('id', editingChord)
          .select();

        console.log('Update result:', updateData, 'error:', updateError, 'count:', count, 'status:', status, 'statusText:', statusText);

        // Pokud se nic neaktualizovalo, je problém s RLS
        if (!updateData || updateData.length === 0) {
          throw new Error('Aktualizace selhala - pravděpodobně nemáte oprávnění upravovat akordy (RLS policy)');
        }

        if (updateError) throw updateError;

        // Možnosti ukládáme pouze pokud jsou vyplněné
        if (filledOptions.length === 4) {
          // Smažeme staré možnosti a vytvoříme nové
          await supabase
            .from('piano_quiz_chord_options')
            .delete()
            .eq('chord_id', editingChord);

          const optionsToInsert = filledOptions.map(opt => ({
            chord_id: editingChord,
            option_name: opt.option_name,
            is_correct: opt.is_correct,
            display_order: opt.display_order
          }));

          const { error: optionsError } = await supabase
            .from('piano_quiz_chord_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }

        showSuccess('Akord byl úspěšně aktualizován');
      } else {
        // INSERT nového kvízu
        const insertData_obj = {
          name: formData.name,
          quiz_type: formData.quiz_type,
          difficulty: formData.difficulty,
          is_active: formData.is_active,
          display_order: formData.display_order,
          category: formData.category || null
        };

        // Přidat noty pouze pro akordový kvíz
        if (formData.quiz_type === 'chord') {
          insertData_obj.notes = sortNotesByKeyboard(formData.notes);
        } else {
          insertData_obj.notes = null;
        }

        const { data: newChord, error: insertError } = await supabase
          .from('piano_quiz_chords')
          .insert([insertData_obj])
          .select()
          .single();

        if (insertError) throw insertError;

        // Možnosti vkládáme pouze pokud jsou vyplněné
        if (filledOptions.length === 4) {
          const optionsToInsert = filledOptions.map(opt => ({
            chord_id: newChord.id,
            option_name: opt.option_name,
            is_correct: opt.is_correct,
            display_order: opt.display_order
          }));

          const { error: optionsError } = await supabase
            .from('piano_quiz_chord_options')
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }

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

  const getQuizTypeLabel = () => {
    const type = QUIZ_TYPES.find(t => t.id === activeQuizType);
    return type ? type.label : 'Kvízy';
  };

  const getQuizTypeIcon = () => {
    const type = QUIZ_TYPES.find(t => t.id === activeQuizType);
    const Icon = type ? type.icon : Music;
    return <Icon size={24} color="var(--color-primary)" />;
  };

  return (
    <div className="card">
      {/* Záložky pro typy kvízů */}
      <div style={{ marginBottom: '2rem' }}>
        <TabButtons
          tabs={QUIZ_TYPES}
          activeTab={activeQuizType}
          onTabChange={setActiveQuizType}
          options={{ layout: 'pill', size: 'sm' }}
        />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {getQuizTypeIcon()}
            Správa kvízů - {getQuizTypeLabel()}
          </h2>

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
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>🎹 Rozsah klaviatury:</strong>
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem',
                      color: '#64748b'
                    }}>
                      <p style={{ margin: '0 0 0.5rem 0' }}>
                        <strong>Malá oktáva:</strong> pouze a - h (A., A#., H.)
                      </p>
                      <p style={{ margin: '0 0 0.5rem 0' }}>
                        <strong>Oktáva 1:</strong> c1 - h1 (C, C#, D, D#, E, F, F#, G, G#, A, A#, H)
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Oktáva 2:</strong> pouze c2 - e2 (C², C#², D², D#², E²)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Form */}
      <AnimatePresence mode="wait">
        {showAddForm && (
          <motion.div
            key={editingChord || 'new'}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'rgba(181, 31, 101, 0.05)',
              borderRadius: 'var(--radius)',
              border: '2px solid rgba(181, 31, 101, 0.2)'
            }}
          >
            <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
              {editingChord
                ? (activeQuizType === 'chord' ? 'Upravit akord' : 'Upravit otázku')
                : (activeQuizType === 'chord' ? 'Přidat nový akord' : 'Přidat novou otázku')
              }
            </h4>

            {/* Název/Otázka */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                {activeQuizType === 'chord' ? 'Název akordu *' : 'Text otázky *'}
              </label>
              {activeQuizType === 'chord' ? (
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
              ) : (
                <textarea
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Zadejte text otázky..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              )}
            </div>

            {/* Kategorie (volitelná) */}
            {activeQuizType !== 'chord' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Kategorie (volitelná)
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="např. Notová soustava, Hudební teorie..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid #ddd',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            )}

            {/* Výběr not - pouze pro akordový kvíz */}
            {activeQuizType === 'chord' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                  Noty akordu * (vyberte kliknutím)
                </label>

              {/* Malá oktáva - pouze a, ais, h */}
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                  Malá oktáva (c - h, náš rozsah pouze a - h):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {NOTES_MALA_OKTAVA.map(note => (
                    <motion.button
                      key={note}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNoteToggle(note)}
                      style={{
                        background: formData.notes.includes(note) ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.9)',
                        border: `2px solid ${formData.notes.includes(note) ? 'var(--color-secondary)' : '#ddd'}`,
                        borderRadius: 'var(--radius)',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        color: formData.notes.includes(note) ? '#fff' : '#1e293b',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        minWidth: '50px'
                      }}
                    >
                      {note.replace('.', '')}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Oktáva 1 (c1 - h1) */}
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                  Oktáva 1 (c1 - h1):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {NOTES_OKTAVA_1.map(note => (
                    <motion.button
                      key={note}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNoteToggle(note)}
                      style={{
                        background: formData.notes.includes(note) ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.9)',
                        border: `2px solid ${formData.notes.includes(note) ? 'var(--color-primary)' : '#ddd'}`,
                        borderRadius: 'var(--radius)',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        color: formData.notes.includes(note) ? '#fff' : '#1e293b',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        minWidth: '50px'
                      }}
                    >
                      {note}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Oktáva 2 - pouze c2 - e2 */}
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                  Oktáva 2 (c2 - h2, náš rozsah pouze c2 - e2):
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {NOTES_OKTAVA_2.map(note => (
                    <motion.button
                      key={note}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleNoteToggle(note)}
                      style={{
                        background: formData.notes.includes(note) ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.9)',
                        border: `2px solid ${formData.notes.includes(note) ? 'var(--color-secondary)' : '#ddd'}`,
                        borderRadius: 'var(--radius)',
                        padding: '0.5rem 0.75rem',
                        cursor: 'pointer',
                        color: formData.notes.includes(note) ? '#fff' : '#1e293b',
                        fontWeight: '600',
                        fontSize: '0.875rem',
                        minWidth: '50px'
                      }}
                    >
                      {note.replace("''", "²")}
                    </motion.button>
                  ))}
                </div>
              </div>

                <div style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: '#64748b' }}>
                  Vybrané noty: {formData.notes.length > 0 ? sortNotesByKeyboard(formData.notes).join(', ') : 'žádné'}
                </div>
              </div>
            )}

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
          <div key={chord.id}>
            {/* Zobrazení akordu nebo inline editace */}
            {editingChord === chord.id ? (
              /* Inline editační formulář */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  padding: '1.5rem',
                  background: 'rgba(181, 31, 101, 0.05)',
                  borderRadius: 'var(--radius)',
                  border: '2px solid rgba(181, 31, 101, 0.3)'
                }}
              >
                <h4 style={{ marginBottom: '1rem', color: '#1e293b' }}>
                  Upravit akord: {chord.name}
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

                  {/* Malá oktáva */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                      Malá oktáva (c - h, náš rozsah pouze a - h):
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {NOTES_MALA_OKTAVA.map(note => (
                        <motion.button
                          key={note}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleNoteToggle(note)}
                          style={{
                            background: formData.notes.includes(note) ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.9)',
                            border: `2px solid ${formData.notes.includes(note) ? 'var(--color-secondary)' : '#ddd'}`,
                            borderRadius: 'var(--radius)',
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            color: formData.notes.includes(note) ? '#fff' : '#1e293b',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            minWidth: '50px'
                          }}
                        >
                          {note.replace('.', '')}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Oktáva 1 */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                      Oktáva 1 (c1 - h1):
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {NOTES_OKTAVA_1.map(note => (
                        <motion.button
                          key={note}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleNoteToggle(note)}
                          style={{
                            background: formData.notes.includes(note) ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.9)',
                            border: `2px solid ${formData.notes.includes(note) ? 'var(--color-primary)' : '#ddd'}`,
                            borderRadius: 'var(--radius)',
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            color: formData.notes.includes(note) ? '#fff' : '#1e293b',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            minWidth: '50px'
                          }}
                        >
                          {note}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Oktáva 2 */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>
                      Oktáva 2 (c2 - h2, náš rozsah pouze c2 - e2):
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {NOTES_OKTAVA_2.map(note => (
                        <motion.button
                          key={note}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleNoteToggle(note)}
                          style={{
                            background: formData.notes.includes(note) ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.9)',
                            border: `2px solid ${formData.notes.includes(note) ? 'var(--color-secondary)' : '#ddd'}`,
                            borderRadius: 'var(--radius)',
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            color: formData.notes.includes(note) ? '#fff' : '#1e293b',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            minWidth: '50px'
                          }}
                        >
                          {note.replace("''", "²")}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '0.625rem', fontSize: '0.75rem', color: '#64748b' }}>
                    Vybrané noty: {formData.notes.length > 0 ? sortNotesByKeyboard(formData.notes).join(', ') : 'žádné'}
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
                          name={`correct_answer_${chord.id}`}
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
            ) : (
              /* Normální zobrazení akordu */
              <motion.div
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
                      {sortNotesByKeyboard(chord.notes || []).join(', ') || 'Žádné'}
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
            )}
          </div>
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
