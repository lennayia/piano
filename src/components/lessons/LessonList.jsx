import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, GripVertical } from 'lucide-react';
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
import useLessonStore from '../../store/useLessonStore';
import useUserStore from '../../store/useUserStore';
import { AddButton, SaveButton, CancelButton } from '../ui/ButtonComponents';

// Sortable Lesson Wrapper
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
    height: '100%',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children(attributes, listeners)}
    </div>
  );
}

function LessonList() {
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
  const [editingLesson, setEditingLesson] = useState(null);

  const isAdmin = currentUser?.is_admin === true;

  // Načíst lekce z databáze při načtení komponenty
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Sensors pro drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
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
  const [editForm, setEditForm] = useState(null);

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
      alert('Vyplňte aspoň něco 😊 Třeba název a popis lekce.');
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
    if (confirm('Když to teď smažete, už to nepůjde nikdy, ale vůbec nikdy vrátit. Vážně chcete tuhle lekci smazat?')) {
      deleteLesson(lessonId);
    }
  };

  return (
    <div>
      {/* Tlačítko pro přidání nové lekce (pouze pro adminy) */}
      {isAdmin && !isAddingNew && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AddButton
            onClick={startAddingNew}
            label="Přidat novou lekci"
          />
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
                <label className="form-label" style={{ color: '#1e293b' }}>
                  Název lekce
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newLessonForm.title}
                  onChange={(e) => handleNewLessonChange('title', e.target.value)}
                  placeholder="Např. První tóny"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#1e293b' }}>
                  Obtížnost
                </label>
                <select
                  className="form-input"
                  value={newLessonForm.difficulty}
                  onChange={(e) => handleNewLessonChange('difficulty', e.target.value)}
                >
                  <option value="začátečník">začátečník</option>
                  <option value="mírně pokročilý začátečník">mírně pokročilý začátečník</option>
                  <option value="pokročilý">pokročilý</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: '#1e293b' }}>
                  Délka
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newLessonForm.duration}
                  onChange={(e) => handleNewLessonChange('duration', e.target.value)}
                  placeholder="Např. 5 min"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ color: '#1e293b' }}>
                Popis
              </label>
              <textarea
                className="form-input"
                value={newLessonForm.description}
                onChange={(e) => handleNewLessonChange('description', e.target.value)}
                rows={2}
                placeholder="Popis lekce"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ color: '#1e293b' }}>
                Tóny (oddělené mezerou)
              </label>
              <input
                type="text"
                className="form-input"
                value={newLessonForm.content.notes.join(' ')}
                onChange={(e) => handleNewLessonChange('content.notes', e.target.value.split(/\s+/).map(n => n.trim()).filter(n => n))}
                placeholder="Např. C D E"
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ color: '#1e293b' }}>
                Instrukce (jedna na řádek)
              </label>
              <textarea
                className="form-input"
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
            className="grid grid-cols-2"
            style={{ gridAutoRows: '1fr' }}
            variants={container}
            initial="hidden"
            animate="show"
          >
            {lessons.map((lesson, index) => (
              <div key={lesson.id} style={{ gridColumn: editingLesson === lesson.id ? '1 / -1' : 'auto', height: '100%' }}>
                <SortableLessonCard lesson={lesson}>
                  {(dragAttributes, dragListeners) => (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                      style={{ height: '100%' }}
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
                        onCancelEdit={cancelEditingLesson}
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
      />
    </div>
  );
}

export default LessonList;
