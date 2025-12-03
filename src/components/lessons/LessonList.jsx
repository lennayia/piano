import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
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

// Lazy loading - LessonModal se načte až při kliknutí na lekci
const LessonModal = lazy(() => import('./LessonModal'));
import { useItemEdit } from '../../hooks/useItemEdit';
import useLessonStore from '../../store/useLessonStore';
import useUserStore from '../../store/useUserStore';
import { AddButton } from '../ui/ButtonComponents';
import { supabase } from '../../lib/supabase';
import LessonForm from './LessonForm';
import SectionHeader from '../ui/SectionHeader';
import GlassCard from '../ui/GlassCard';

// Konstanty mimo komponentu pro lepší performance
const DIFFICULTY_MAP = {
  'beginner': 'začátečník',
  'intermediate': 'pokročilý',
  'expert': 'expert'
};

const DEFAULT_LESSON_FORM = {
  title: '',
  description: '',
  difficulty: 'začátečník',
  duration: '5 min',
  content: {
    notes: [],
    instructions: []
  }
};

const ANIMATION_VARIANTS = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

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

function LessonList({ filter = 'all', difficulty = 'all', onLessonComplete }) {
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

  // Filtrovaná verze lekcí podle aktivních tabů - memoizovaná pro optimalizaci
  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    // Filtrování podle stavu (all, in_progress, completed)
    if (filter === 'in_progress') {
      result = result.filter(lesson => !completedLessonIds.has(lesson.id));
    } else if (filter === 'completed') {
      result = result.filter(lesson => completedLessonIds.has(lesson.id));
    }

    // Filtrování podle obtížnosti
    if (difficulty !== 'all') {
      result = result.filter(lesson => {
        const lessonDiff = lesson.difficulty?.toLowerCase() || '';
        const targetDiff = DIFFICULTY_MAP[difficulty]?.toLowerCase() || '';

        // Pro intermediate zahrnout i "mírně pokročilý začátečník"
        if (difficulty === 'intermediate') {
          return lessonDiff.includes('pokročilý');
        }

        return lessonDiff === targetDiff;
      });
    }

    return result;
  }, [lessons, filter, difficulty, completedLessonIds]);

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

  const [newLessonForm, setNewLessonForm] = useState(DEFAULT_LESSON_FORM);

  // Handler funkce memoizované pomocí useCallback pro lepší performance
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
      const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);
      const newOrder = arrayMove(lessons, oldIndex, newIndex);
      reorderLessons(newOrder);
    }
  }, [lessons, reorderLessons]);

  const handleLessonClick = useCallback((lesson) => {
    setSelectedLesson(lesson);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLesson(null);
  }, []);

  // Admin funkce - memoizované pomocí useCallback
  const handleNewLessonChange = useCallback((field, value) => {
    if (field.startsWith('content.')) {
      const contentField = field.split('.')[1];
      setNewLessonForm(prev => ({
        ...prev,
        content: { ...prev.content, [contentField]: value }
      }));
    } else {
      setNewLessonForm(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const startAddingNew = useCallback(() => {
    setIsAddingNew(true);
    setNewLessonForm(DEFAULT_LESSON_FORM);
  }, []);

  const saveNewLesson = useCallback(() => {
    if (!newLessonForm.title || !newLessonForm.description) {
      alert('Vyplňte aspoň něco 😊 Třeba název a popis lekce.');
      return;
    }
    addLesson(newLessonForm);
    setIsAddingNew(false);
  }, [newLessonForm, addLesson]);

  const cancelAddingNew = useCallback(() => {
    setIsAddingNew(false);
  }, []);

  // Wrapper funkce pro startEditing s custom mapováním na editForm
  const startEditingLesson = useCallback((lesson) => {
    startEditing(lesson, (lesson) => ({
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      duration: lesson.duration,
      content: { ...lesson.content }
    }));
  }, [startEditing]);

  // handleEditFormChange používá updateEditForm z hooku
  const handleEditFormChange = updateEditForm;

  const saveEditedLesson = useCallback(() => {
    if (!editForm.title || !editForm.description) {
      alert('Vyplňte aspoň něco 😊 Třeba název a popis lekce.');
      return;
    }
    updateLesson(editingLesson, editForm);
    cancelEdit();
  }, [editForm, editingLesson, updateLesson, cancelEdit]);

  const handleDeleteLesson = useCallback((lessonId) => {
    if (confirm('Když to teď smažete, už to nepůjde nikdy, ale vůbec nikdy vrátit. Vážně chcete tuhle lekci smazat?')) {
      deleteLesson(lessonId);
    }
  }, [deleteLesson]);

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
          <GlassCard
            animate
            animationProps={{
              initial: { opacity: 0, y: -20 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -20 }
            }}
            style={{ marginBottom: '1.5rem' }}
          >
            <SectionHeader icon={Plus} title="Nová lekce" variant="h3" />

            <LessonForm
              formData={newLessonForm}
              onChange={handleNewLessonChange}
              onSave={saveNewLesson}
              onCancel={cancelAddingNew}
              saveLabel="Přidat lekci"
              titlePlaceholder="Např. První tóny"
              durationPlaceholder="Např. 5 min"
            />
          </GlassCard>
        )}
      </AnimatePresence>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredLessons.map(l => l.id)}
          strategy={rectSortingStrategy}
        >
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}
            variants={ANIMATION_VARIANTS}
            initial="hidden"
            animate="show"
          >
            {filteredLessons.map((lesson, index) => (
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

      <Suspense fallback={<div />}>
        <LessonModal
          lesson={selectedLesson}
          isOpen={!!selectedLesson}
          onClose={handleCloseModal}
          onComplete={onLessonComplete}
        />
      </Suspense>
    </div>
  );
}

export default LessonList;
