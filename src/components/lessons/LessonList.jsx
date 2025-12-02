import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import LessonCard from './LessonCard';
import LessonModal from './LessonModal';
import { useItemEdit } from '../../hooks/useItemEdit';
import { DIFFICULTY_OPTIONS } from '../../utils/lessonUtils';
import useLessonStore from '../../store/useLessonStore';
import useUserStore from '../../store/useUserStore';
import { AddButton, SaveButton, CancelButton } from '../ui/ButtonComponents';
import { FormLabel, FormInput, FormSelect, FormTextarea } from '../ui/FormComponents';
import { supabase } from '../../lib/supabase';

function SortableLessonCard({ lesson, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(attributes, listeners)}
    </div>
  );
}

function LessonList({ onLessonComplete }) {
  const {
    editingItem: editingLesson,
    editForm,
    startEditing,
    cancelEdit,
    updateEditForm,
    setEditingItem: setEditingLesson,
    setEditForm
  } = useItemEdit();

  const lessons = useLessonStore((state) => state.lessons);
  const fetchLessons = useLessonStore((state) => state.fetchLessons);
  const addLesson = useLessonStore((state) => state.addLesson);
  const updateLesson = useLessonStore((state) => state.updateLesson);
  const deleteLesson = useLessonStore((state) => state.deleteLesson);
  const duplicateLesson = useLessonStore((state) => state.duplicateLesson);
  const reorderLessons = useLessonStore((state) => state.reorderLessons);
  const currentUser = useUserStore((state) => state.currentUser);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());

  const isAdmin = currentUser?.is_admin === true;

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Načíst dokončené lekce pro aktuálního uživatele
  useEffect(() => {
    const fetchCompletedLessons = async () => {
      if (currentUser) {
        try {
          const { data, error } = await supabase
            .from('piano_lesson_completions')
            .select('lesson_id')
            .eq('user_id', currentUser.id);

          if (!error && data) {
            setCompletedLessonIds(new Set(data.map(item => parseInt(item.lesson_id))));
          }
        } catch (error) {
          console.error('Chyba při načítání dokončených lekcí:', error);
        }
      }
    };

    fetchCompletedLessons();
  }, [currentUser]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
      const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);
      const newOrder = arrayMove(lessons, oldIndex, newIndex);
      reorderLessons(newOrder);
    }
  };
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
      alert('Vyplňte aspoň něco 😊 Třeba název a popis lekce.');
      return;
    }
    addLesson(newLessonForm);
    setIsAddingNew(false);
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
  };

  // Wrapper funkce pro startEditing s custom mapováním na editForm
  const startEditingLesson = (lesson) => {
    startEditing(lesson, (lesson) => ({
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      duration: lesson.duration,
      content: { ...lesson.content }
    }));
  };

  // handleEditFormChange používá updateEditForm z hooku
  const handleEditFormChange = updateEditForm;

  const saveEditedLesson = () => {
    if (!editForm.title || !editForm.description) {
      alert('Vyplňte aspoň něco 😊 Třeba název a popis lekce.');
      return;
    }
    updateLesson(editingLesson, editForm);
    cancelEdit(); // Použít hook cancelEdit místo manuálního nastavování
  };

  // cancelEditingLesson je poskytnut hookem jako cancelEdit

  const handleDeleteLesson = (lessonId) => {
    if (confirm('Když to teď smažete, už to nepůjde nikdy, ale vůbec nikdy vrátit. Vážně chcete tuhle lekci smazat?')) {
      deleteLesson(lessonId);
    }
  };

  return (
    <div>
      {/* Tlačítko pro přidání nové lekce (pouze pro adminy) */}
      {isAdmin && !isAddingNew && (
        <div style={{ marginBottom: '1.5rem', display: 'flex' }}>
          <AddButton onClick={startAddingNew} />
        </div>
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
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: 'none',
              boxShadow: '0 8px 32px rgba(181, 31, 101, 0.25), var(--shadow-lg)'
            }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="var(--color-primary)" />
              Nová lekce
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <FormLabel text="Název lekce" />
                <FormInput
                  type="text"
                  value={newLessonForm.title}
                  onChange={(e) => handleNewLessonChange('title', e.target.value)}
                  placeholder="Např. První tóny"
                />
              </div>

              <div className="form-group">
                <FormLabel text="Obtížnost" />
                <FormSelect
                  value={newLessonForm.difficulty}
                  onChange={(e) => handleNewLessonChange('difficulty', e.target.value)}
                  options={DIFFICULTY_OPTIONS}
                />
              </div>

              <div className="form-group">
                <FormLabel text="Délka" />
                <FormInput
                  type="text"
                  value={newLessonForm.duration}
                  onChange={(e) => handleNewLessonChange('duration', e.target.value)}
                  placeholder="Např. 5 min"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <FormLabel text="Popis" />
              <FormTextarea
                value={newLessonForm.description}
                onChange={(e) => handleNewLessonChange('description', e.target.value)}
                rows={2}
                placeholder="Popis lekce"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <FormLabel text="Tóny (oddělené mezerou)" />
              <FormInput
                type="text"
                value={newLessonForm.content.notes.join(' ')}
                onChange={(e) => handleNewLessonChange('content.notes', e.target.value.split(/\s+/).map(n => n.trim()).filter(n => n))}
                placeholder="Např. C D E"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <FormLabel text="Instrukce (jedna na řádek)" />
              <FormTextarea
                value={newLessonForm.content.instructions.join('\n')}
                onChange={(e) => handleNewLessonChange('content.instructions', e.target.value.split('\n').filter(i => i.trim()))}
                rows={3}
                placeholder="Zadejte instrukce&#10;Každá na nový řádek"
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <SaveButton onClick={saveNewLesson} label="Přidat lekci" />
              <CancelButton onClick={cancelAddingNew} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lessons.map(l => l.id)}
          strategy={rectSortingStrategy}
        >
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            variants={container}
            initial="hidden"
            animate="show"
          >
            {lessons.map((lesson, index) => (
              <div key={lesson.id}>
                <SortableLessonCard lesson={lesson}>
                  {(dragAttributes, dragListeners) => (
                    <motion.div
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
                        onDuplicate={duplicateLesson}
                        dragAttributes={dragAttributes}
                        dragListeners={dragListeners}
                        isEditing={editingLesson === lesson.id}
                        editForm={editingLesson === lesson.id ? editForm : null}
                        onEditFormChange={handleEditFormChange}
                        onSaveEdit={saveEditedLesson}
                        onCancelEdit={cancelEdit}
                        isCompleted={completedLessonIds.has(lesson.id)}
                      />
                    </motion.div>
                  )}
                </SortableLessonCard>
              </div>
            ))}
          </motion.div>
        </SortableContext>
      </DndContext>

      <LessonModal
        lesson={selectedLesson}
        isOpen={!!selectedLesson}
        onClose={handleCloseModal}
        onComplete={onLessonComplete}
      />
    </div>
  );
}

export default LessonList;
