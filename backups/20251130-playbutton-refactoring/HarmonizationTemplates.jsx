import { useState } from 'react';
import { FileText, Eye, EyeOff, Sparkles, Plus, Edit3, Save, X, Trash2, GripVertical, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Chip, ActionButtonGroup, AddButton, SaveButton, CancelButton, PlayButton
} from '../ui/ButtonComponents';
import {
  FormInput, FormTextarea, FormSelect, FormLabel
} from '../ui/FormComponents';
import { RADIUS, SHADOW, BORDER } from '../../utils/styleConstants';
import useHarmonizationTemplatesStore from '../../store/useHarmonizationTemplatesStore';
import useUserStore from '../../store/useUserStore';
import audioEngine from '../../utils/audio';
import { getChordNotesWithOctaves } from '../../utils/noteUtils';

// Sortable wrapper component for drag and drop
function SortableTemplate({ template, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

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

function HarmonizationTemplates() {
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [playingTemplate, setPlayingTemplate] = useState(null);
  const [newTemplateForm, setNewTemplateForm] = useState({
    title: '',
    description: '',
    difficulty: 'začátečník',
    chords: [],
    progression: '',
    example: ''
  });

  const templates = useHarmonizationTemplatesStore((state) => state.templates);
  const updateTemplate = useHarmonizationTemplatesStore((state) => state.updateTemplate);
  const addTemplate = useHarmonizationTemplatesStore((state) => state.addTemplate);
  const deleteTemplate = useHarmonizationTemplatesStore((state) => state.deleteTemplate);
  const duplicateTemplate = useHarmonizationTemplatesStore((state) => state.duplicateTemplate);
  const reorderTemplates = useHarmonizationTemplatesStore((state) => state.reorderTemplates);
  const currentUser = useUserStore((state) => state.currentUser);

  const isAdmin = currentUser?.is_admin === true;

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = templates.findIndex((template) => template.id === active.id);
      const newIndex = templates.findIndex((template) => template.id === over.id);
      const newOrder = arrayMove(templates, oldIndex, newIndex);
      reorderTemplates(newOrder);
    }
  };

  // Admin funkce pro šablony
  const handleNewTemplateChange = (field, value) => {
    setNewTemplateForm(prev => ({ ...prev, [field]: value }));
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setNewTemplateForm({
      title: '',
      description: '',
      difficulty: 'začátečník',
      chords: [],
      progression: '',
      example: ''
    });
  };

  const saveNewTemplate = () => {
    if (!newTemplateForm.title || !newTemplateForm.progression) {
      alert('Vyplňte alespoň název a postup');
      return;
    }

    addTemplate(newTemplateForm);
    setIsAddingNew(false);
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
  };

  const startEditingTemplate = (template) => {
    setEditingTemplate(template.id);
    setEditForm({
      title: template.title,
      description: template.description || '',
      difficulty: template.difficulty,
      chords: template.chords || [],
      progression: template.progression,
      example: template.example || ''
    });
    setExpandedTemplate(null);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEditedTemplate = () => {
    if (!editForm.title || !editForm.progression) {
      alert('Vyplňte alespoň název a postup');
      return;
    }
    updateTemplate(editingTemplate, editForm);
    setEditingTemplate(null);
    setEditForm(null);
  };

  const cancelEditingTemplate = () => {
    setEditingTemplate(null);
    setEditForm(null);
  };

  const handleDeleteTemplate = (templateId) => {
    if (confirm('Opravdu chcete smazat tuto šablonu?')) {
      deleteTemplate(templateId);
    }
  };

  const toggleTemplate = (id) => {
    setExpandedTemplate(expandedTemplate === id ? null : id);
  };

  // Přehrát celou kadenci (všechny akordy za sebou)
  const playCadence = async (template) => {
    if (playingTemplate === template.id) return; // Už se přehrává

    setPlayingTemplate(template.id);

    const chordDelay = 1200; // Pauza mezi akordy

    for (let i = 0; i < template.chords.length; i++) {
      const chord = template.chords[i];
      const notes = getChordNotesWithOctaves(chord.notes);

      // Přehrát všechny noty akordu najednou
      notes.forEach((note, idx) => {
        setTimeout(() => {
          audioEngine.playNote(note, 1.0);
        }, idx * 30); // Malé zpoždění pro "rozložený" zvuk
      });

      // Počkat před dalším akordem
      if (i < template.chords.length - 1) {
        await new Promise(resolve => setTimeout(resolve, chordDelay));
      }
    }

    // Na konec ještě jednou první akord (tónika)
    await new Promise(resolve => setTimeout(resolve, chordDelay));
    const tonicaNotes = getChordNotesWithOctaves(template.chords[0].notes);
    tonicaNotes.forEach((note, idx) => {
      setTimeout(() => {
        audioEngine.playNote(note, 1.0);
      }, idx * 30);
    });

    setTimeout(() => setPlayingTemplate(null), 800);
  };

  return (
    <div>
      <h2>
        Harmonizační postupy
      </h2>
      <p>
        Připravené harmonické sekvence a kadence pro různé tóniny. Každou šablonu můžete přehrát a použít jako inspiraci pro vlastní harmonizace.
      </p>

      {/* Tlačítko pro přidání nové šablony (pouze pro adminy) */}
      {isAdmin && !isAddingNew && (
        <AddButton
          onClick={startAddingNew}
          label="Přidat novou šablonu"
          iconOnly={false}
          style={{ marginBottom: '1.5rem' }}
        />
      )}

      {/* Formulář pro přidání nové šablony */}
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="var(--color-primary)" />
              Nová šablona harmonizace
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <FormInput
                label="Název šablony"
                value={newTemplateForm.title}
                onChange={(e) => handleNewTemplateChange('title', e.target.value)}
                placeholder="Zadejte název šablony"
              />

              <FormSelect
                label="Obtížnost"
                value={newTemplateForm.difficulty}
                onChange={(e) => handleNewTemplateChange('difficulty', e.target.value)}
                options={[
                  { value: 'začátečník', label: 'začátečník' },
                  { value: 'mírně pokročilý začátečník', label: 'mírně pokročilý začátečník' },
                  { value: 'pokročilý', label: 'pokročilý' }
                ]}
              />
            </div>

            <FormInput
              label="Popis"
              value={newTemplateForm.description}
              onChange={(e) => handleNewTemplateChange('description', e.target.value)}
              placeholder="Popis šablony"
              style={{ marginBottom: '1rem' }}
            />

            <FormInput
              label="Harmonický postup"
              value={newTemplateForm.progression}
              onChange={(e) => handleNewTemplateChange('progression', e.target.value)}
              placeholder="Např. I - IV - V - I"
              style={{ marginBottom: '1rem' }}
            />

            <FormTextarea
              label="Příklad použití"
              value={newTemplateForm.example}
              onChange={(e) => handleNewTemplateChange('example', e.target.value)}
              rows={2}
              placeholder="Zadejte příklad použití"
              style={{ marginBottom: '1rem' }}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <SaveButton
                onClick={saveNewTemplate}
                label="Přidat šablonu"
              />
              <CancelButton
                onClick={cancelAddingNew}
              />
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
          items={templates.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: 'grid', gap: '1rem' }}>
            {templates.map((template, index) => (
              <SortableTemplate key={template.id} template={template}>
                {(dragAttributes, dragListeners) => (
                  <motion.div
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            {isAdmin && (
                              <div
                                {...dragAttributes}
                                {...dragListeners}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  cursor: 'grab',
                                  padding: '0.25rem',
                                  opacity: 0.5,
                                  transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.3'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                              >
                                <GripVertical size={16} />
                              </div>
                            )}
                            <h3 style={{ marginBottom: 0 }}>
                              {template.title}
                            </h3>
                            <Chip
                              text={template.difficulty}
                              variant={template.difficulty === 'začátečník' ? 'success' : template.difficulty === 'mírně pokročilý začátečník' ? 'warning' : 'info'}
                            />
                            {isAdmin && (
                              <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: 'auto' }}>
                                <ActionButtonGroup
                                  onEdit={() => startEditingTemplate(template)}
                                  onDuplicate={() => duplicateTemplate(template.id)}
                                  onDelete={() => handleDeleteTemplate(template.id)}
                                  iconOnly={true}
                                  iconSize={14}
                                />
                              </div>
                            )}
                          </div>
                  <p style={{ marginBottom: 0 }}>
                    {template.description}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTemplate(template.id);
                  }}
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
                borderRadius: RADIUS.md,
                marginTop: '0.75rem',
                border: BORDER.subtle,
                boxShadow: SHADOW.subtle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--color-secondary)" />
                  <strong>
                    Postup: {template.progression}
                  </strong>
                </div>
                <PlayButton
                  onClick={() => playCadence(template)}
                  isPlaying={playingTemplate === template.id}
                  disabled={playingTemplate !== null && playingTemplate !== template.id}
                  variant="volume"
                />
              </div>
            </div>

            {/* Edit Form */}
            <AnimatePresence>
              {editingTemplate === template.id && editForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(0, 0, 0, 0.1)', paddingTop: '1.5rem' }}
                >
                  <div style={{
                    padding: '1rem',
                    background: 'rgba(45, 91, 120, 0.05)',
                    borderRadius: RADIUS.md,
                    border: BORDER.none,
                    boxShadow: SHADOW.md
                  }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Edit3 size={18} color="var(--color-secondary)" />
                      Upravit šablonu
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <FormInput
                        label="Název šablony"
                        value={editForm.title}
                        onChange={(e) => handleEditFormChange('title', e.target.value)}
                      />

                      <FormSelect
                        label="Obtížnost"
                        value={editForm.difficulty}
                        onChange={(e) => handleEditFormChange('difficulty', e.target.value)}
                        options={[
                          { value: 'začátečník', label: 'začátečník' },
                          { value: 'mírně pokročilý začátečník', label: 'mírně pokročilý začátečník' },
                          { value: 'pokročilý', label: 'pokročilý' }
                        ]}
                      />
                    </div>

                    <FormInput
                      label="Popis"
                      value={editForm.description}
                      onChange={(e) => handleEditFormChange('description', e.target.value)}
                      style={{ marginBottom: '1rem' }}
                    />

                    <FormInput
                      label="Harmonický postup"
                      value={editForm.progression}
                      onChange={(e) => handleEditFormChange('progression', e.target.value)}
                      style={{ marginBottom: '1rem' }}
                    />

                    <FormTextarea
                      label="Příklad použití"
                      value={editForm.example}
                      onChange={(e) => handleEditFormChange('example', e.target.value)}
                      rows={2}
                      style={{ marginBottom: '1rem' }}
                    />

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <SaveButton
                        onClick={saveEditedTemplate}
                        label="Uložit změny"
                      />
                      <CancelButton
                        onClick={cancelEditingTemplate}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Expanded Content */}
            <AnimatePresence>
              {expandedTemplate === template.id && editingTemplate !== template.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(0, 0, 0, 0.1)', paddingTop: '1.5rem' }}
                >
                  <h4>
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
                          borderRadius: RADIUS.md,
                          border: '1px solid rgba(45, 91, 120, 0.2)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <strong>
                            {chord.name}
                          </strong>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            background: 'rgba(45, 91, 120, 0.1)',
                            borderRadius: RADIUS.sm,
                            opacity: 0.8
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
                                borderRadius: RADIUS.md,
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
                    borderRadius: RADIUS.md,
                    border: '1px solid rgba(181, 31, 101, 0.1)'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Příklad použití:
                    </strong>
                    <p style={{ margin: 0 }}>
                      {template.example}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
                )}
              </SortableTemplate>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default HarmonizationTemplates;
