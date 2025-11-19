import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Save, X, Trash2 } from 'lucide-react';
import LessonCard from './LessonCard';
import LessonModal from './LessonModal';
import useLessonStore from '../../store/useLessonStore';
import useUserStore from '../../store/useUserStore';

function LessonList() {
  const lessons = useLessonStore((state) => state.lessons);
  const addLesson = useLessonStore((state) => state.addLesson);
  const updateLesson = useLessonStore((state) => state.updateLesson);
  const deleteLesson = useLessonStore((state) => state.deleteLesson);
  const currentUser = useUserStore((state) => state.currentUser);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [newLessonForm, setNewLessonForm] = useState({
    title: '',
    description: '',
    difficulty: 'začátečník',
    duration: '5 min',
    content: {
      notes: [],
      instructions: []
    }
  });
  const [editForm, setEditForm] = useState(null);

  const isAdmin = currentUser?.isAdmin === true;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleCloseModal = () => {
    setSelectedLesson(null);
  };

  // Admin funkce
  const handleNewLessonChange = (field, value) => {
    if (field.startsWith('content.')) {
      const contentField = field.split('.')[1];
      setNewLessonForm(prev => ({
        ...prev,
        content: { ...prev.content, [contentField]: value }
      }));
    } else {
      setNewLessonForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setNewLessonForm({
      title: '',
      description: '',
      difficulty: 'začátečník',
      duration: '5 min',
      content: {
        notes: [],
        instructions: []
      }
    });
  };

  const saveNewLesson = () => {
    if (!newLessonForm.title || !newLessonForm.description) {
      alert('Vyplňte alespoň název a popis lekce');
      return;
    }
    addLesson(newLessonForm);
    setIsAddingNew(false);
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
  };

  const startEditingLesson = (lesson) => {
    setEditingLesson(lesson.id);
    setEditForm({
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      duration: lesson.duration,
      content: { ...lesson.content }
    });
  };

  const handleEditFormChange = (field, value) => {
    if (field.startsWith('content.')) {
      const contentField = field.split('.')[1];
      setEditForm(prev => ({
        ...prev,
        content: { ...prev.content, [contentField]: value }
      }));
    } else {
      setEditForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const saveEditedLesson = () => {
    if (!editForm.title || !editForm.description) {
      alert('Vyplňte alespoň název a popis lekce');
      return;
    }
    updateLesson(editingLesson, editForm);
    setEditingLesson(null);
    setEditForm(null);
  };

  const cancelEditingLesson = () => {
    setEditingLesson(null);
    setEditForm(null);
  };

  const handleDeleteLesson = (lessonId) => {
    if (confirm('Opravdu chcete smazat tuto lekci?')) {
      deleteLesson(lessonId);
    }
  };

  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: '1.5rem', color: '#ffffff' }}
      >
        Dostupné lekce
      </motion.h2>

      {/* Tlačítko pro přidání nové lekce (pouze pro adminy) */}
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
            borderRadius: 'var(--radius)',
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
          Přidat novou lekci
        </motion.button>
      )}

      {/* Formulář pro přidání nové lekce */}
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
              Nová lekce
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Název lekce
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newLessonForm.title}
                  onChange={(e) => handleNewLessonChange('title', e.target.value)}
                  placeholder="Např. První tóny"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Obtížnost
                </label>
                <select
                  className="form-input"
                  value={newLessonForm.difficulty}
                  onChange={(e) => handleNewLessonChange('difficulty', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="začátečník">začátečník</option>
                  <option value="mírně pokročilý">mírně pokročilý</option>
                  <option value="pokročilý">pokročilý</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Délka
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newLessonForm.duration}
                  onChange={(e) => handleNewLessonChange('duration', e.target.value)}
                  placeholder="Např. 5 min"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Popis
              </label>
              <textarea
                className="form-input"
                value={newLessonForm.description}
                onChange={(e) => handleNewLessonChange('description', e.target.value)}
                rows={2}
                placeholder="Popis lekce"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Tóny (oddělené čárkou)
              </label>
              <input
                type="text"
                className="form-input"
                value={newLessonForm.content.notes.join(', ')}
                onChange={(e) => handleNewLessonChange('content.notes', e.target.value.split(',').map(n => n.trim()).filter(n => n))}
                placeholder="Např. C, D, E"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Instrukce (jedna na řádek)
              </label>
              <textarea
                className="form-input"
                value={newLessonForm.content.instructions.join('\n')}
                onChange={(e) => handleNewLessonChange('content.instructions', e.target.value.split('\n').filter(i => i.trim()))}
                rows={3}
                placeholder="Zadejte instrukce&#10;Každá na nový řádek"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveNewLesson}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <Save size={16} />
                Přidat lekci
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

      <motion.div
        className="grid grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {lessons.map((lesson, index) => (
          <motion.div
            key={lesson.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <LessonCard
              lesson={lesson}
              onClick={handleLessonClick}
              isAdmin={isAdmin}
              onEdit={startEditingLesson}
              onDelete={handleDeleteLesson}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Edit Form */}
      <AnimatePresence>
        {editingLesson && editForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="card"
            style={{
              marginTop: '2rem',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '2px solid rgba(45, 91, 120, 0.4)',
              boxShadow: '0 8px 32px rgba(45, 91, 120, 0.25)'
            }}
          >
            <h3 style={{ marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit3 size={20} color="var(--color-secondary)" />
              Upravit lekci
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Název lekce
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.title}
                  onChange={(e) => handleEditFormChange('title', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Obtížnost
                </label>
                <select
                  className="form-input"
                  value={editForm.difficulty}
                  onChange={(e) => handleEditFormChange('difficulty', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="začátečník">začátečník</option>
                  <option value="mírně pokročilý">mírně pokročilý</option>
                  <option value="pokročilý">pokročilý</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Délka
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.duration}
                  onChange={(e) => handleEditFormChange('duration', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Popis
              </label>
              <textarea
                className="form-input"
                value={editForm.description}
                onChange={(e) => handleEditFormChange('description', e.target.value)}
                rows={2}
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Tóny (oddělené čárkou)
              </label>
              <input
                type="text"
                className="form-input"
                value={editForm.content.notes.join(', ')}
                onChange={(e) => handleEditFormChange('content.notes', e.target.value.split(',').map(n => n.trim()).filter(n => n))}
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Instrukce (jedna na řádek)
              </label>
              <textarea
                className="form-input"
                value={editForm.content.instructions.join('\n')}
                onChange={(e) => handleEditFormChange('content.instructions', e.target.value.split('\n').filter(i => i.trim()))}
                rows={3}
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveEditedLesson}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <Save size={16} />
                Uložit změny
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cancelEditingLesson}
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

      <LessonModal
        lesson={selectedLesson}
        isOpen={!!selectedLesson}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default LessonList;
