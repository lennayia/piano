import { useState } from 'react';
import { Book, Search, ChevronDown, ChevronUp, Plus, Edit3, Save, X, Trash2, GripVertical, Copy } from 'lucide-react';
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
import useGlossaryStore from '../../store/useGlossaryStore';
import useUserStore from '../../store/useUserStore';

// Sortable wrapper component for drag and drop
function SortableGlossaryItem({ term, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: term.id });

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

function Glossary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTerm, setExpandedTerm] = useState(null);
  const [editingTerm, setEditingTerm] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTermForm, setNewTermForm] = useState({
    term: '',
    definition: '',
    example: '',
    category: 'Základy'
  });

  const terms = useGlossaryStore((state) => state.terms);
  const updateTerm = useGlossaryStore((state) => state.updateTerm);
  const addTerm = useGlossaryStore((state) => state.addTerm);
  const deleteTerm = useGlossaryStore((state) => state.deleteTerm);
  const duplicateTerm = useGlossaryStore((state) => state.duplicateTerm);
  const reorderTerms = useGlossaryStore((state) => state.reorderTerms);
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
      const oldIndex = terms.findIndex((term) => term.id === active.id);
      const newIndex = terms.findIndex((term) => term.id === over.id);
      const newOrder = arrayMove(terms, oldIndex, newIndex);
      reorderTerms(newOrder);
    }
  };

  // Admin funkce
  const handleNewTermChange = (field, value) => {
    setNewTermForm(prev => ({ ...prev, [field]: value }));
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setNewTermForm({
      term: '',
      definition: '',
      example: '',
      category: 'Základy'
    });
  };

  const saveNewTerm = () => {
    if (!newTermForm.term || !newTermForm.definition) {
      alert('Vyplňte aspoň něco 😊 Třeba název a definici.');
      return;
    }

    addTerm(newTermForm);
    setIsAddingNew(false);
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
  };

  const startEditingTerm = (term) => {
    setEditingTerm(term.id);
    setEditForm({
      term: term.term,
      definition: term.definition,
      example: term.example,
      category: term.category
    });
    setExpandedTerm(null); // Close expanded view when editing
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const saveEditedTerm = () => {
    if (!editForm.term || !editForm.definition) {
      alert('Vyplňte aspoň něco 😊 Třeba název a definici.');
      return;
    }
    updateTerm(editingTerm, editForm);
    setEditingTerm(null);
    setEditForm(null);
  };

  const cancelEditingTerm = () => {
    setEditingTerm(null);
    setEditForm(null);
  };

  const handleDeleteTerm = (termId) => {
    if (confirm('Aha, tenhle výraz se vám nelíbí a chcete ho smazat. Ano, ale je to definitivní. Takže vážně smazat?')) {
      deleteTerm(termId);
    }
  };

  const filteredTerms = terms.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.example.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTerm = (index) => {
    setExpandedTerm(expandedTerm === index ? null : index);
  };

  // Kategorizace pro zobrazení
  const categories = ['Základy', 'Harmonie', 'Tóniny', 'Klavír', 'Tempo'];

  return (
    <div>
      <h2 style={{
        marginBottom: '1.5rem',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
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
          <Book size={24} color="var(--color-primary)" />
        </div>
        Slovníček hudebních výrazů
      </h2>
      <p style={{ marginBottom: '2rem', color: '#64748b', fontSize: '1rem' }}>
        Vysvětlení základních pojmů pro začátečníky - klikněte na výraz pro víc informací
      </p>

      {/* Tlačítko pro přidání nového termínu (pouze pro adminy) */}
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
          Přidat nový termín
        </motion.button>
      )}

      {/* Formulář pro přidání nového termínu */}
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
              Nový termín
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Název termínu
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={newTermForm.term}
                  onChange={(e) => handleNewTermChange('term', e.target.value)}
                  placeholder="Zadejte název termínu"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Kategorie
                </label>
                <select
                  className="form-input"
                  value={newTermForm.category}
                  onChange={(e) => handleNewTermChange('category', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="Základy">Základy</option>
                  <option value="Harmonie">Harmonie</option>
                  <option value="Tóniny">Tóniny</option>
                  <option value="Klavír">Klavír</option>
                  <option value="Tempo">Tempo</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Definice
              </label>
              <textarea
                className="form-input"
                value={newTermForm.definition}
                onChange={(e) => handleNewTermChange('definition', e.target.value)}
                rows={2}
                placeholder="Zadejte definici termínu"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Příklad
              </label>
              <textarea
                className="form-input"
                value={newTermForm.example}
                onChange={(e) => handleNewTermChange('example', e.target.value)}
                rows={2}
                placeholder="Zadejte příklad použití"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveNewTerm}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <Save size={16} />
                Přidat termín
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

      {/* Search */}
      <div style={{ marginBottom: '2rem', position: 'relative' }}>
        <Search
          size={20}
          color="#64748b"
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1
          }}
        />
        <input
          type="text"
          placeholder="Hledat výraz..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
          style={{
            paddingLeft: '3rem',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Terms Accordion by Category */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredTerms.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => {
            const categoryTerms = filteredTerms.filter(t => t.category === category);
            if (categoryTerms.length === 0) return null;

            return (
              <div key={category} style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  color: '#1e293b',
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid rgba(181, 31, 101, 0.3)'
                }}>
                  {category}
                </h3>

                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {categoryTerms.map((item, termIndex) => {
                    const globalIndex = `${category}-${termIndex}`;
                    const isExpanded = expandedTerm === globalIndex;

                    return (
                      <SortableGlossaryItem key={item.id} term={item}>
                        {(dragAttributes, dragListeners) => (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: termIndex * 0.05 }}
                            className="card"
                            style={{
                              background: isExpanded
                                ? 'rgba(255, 255, 255, 0.95)'
                                : 'rgba(255, 255, 255, 0.85)',
                              backdropFilter: 'blur(30px)',
                              WebkitBackdropFilter: 'blur(30px)',
                              border: isExpanded
                                ? '2px solid var(--color-primary)'
                                : '1px solid rgba(255, 255, 255, 0.3)',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              overflow: 'hidden'
                            }}
                            onClick={() => toggleTerm(globalIndex)}
                            whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(181, 31, 101, 0.2)' }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: isExpanded ? '0.5rem' : 0 }}>
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
                                  <h4 style={{
                                    fontSize: '1.125rem',
                                    margin: 0,
                                    color: 'var(--color-primary)',
                                    fontWeight: 600
                                  }}>
                                    {item.term}
                                  </h4>
                                  {isAdmin && (
                                    <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => duplicateTerm(item.id)}
                                        style={{
                                          padding: '0.25rem 0.5rem',
                                          background: 'rgba(181, 31, 101, 0.1)',
                                          border: '1px solid rgba(181, 31, 101, 0.3)',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                        title="Duplikovat termín"
                                      >
                                        <Copy size={14} color="var(--color-primary)" />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => startEditingTerm(item)}
                                        style={{
                                          padding: '0.25rem 0.5rem',
                                          background: 'rgba(45, 91, 120, 0.1)',
                                          border: '1px solid rgba(45, 91, 120, 0.3)',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <Edit3 size={14} color="var(--color-secondary)" />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDeleteTerm(item.id)}
                                        style={{
                                          padding: '0.25rem 0.5rem',
                                          background: 'rgba(239, 68, 68, 0.1)',
                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                      >
                                        <Trash2 size={14} color="var(--color-danger)" />
                                      </motion.button>
                                    </div>
                                  )}
                                </div>
                        {!isExpanded && (
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            margin: '0.25rem 0 0 0',
                            lineHeight: 1.5
                          }}>
                            {item.definition.substring(0, 80)}
                            {item.definition.length > 80 ? '...' : ''}
                          </p>
                        )}
                      </div>

                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ marginLeft: '1rem', flexShrink: 0 }}
                      >
                        <ChevronDown size={24} color="var(--color-secondary)" />
                      </motion.div>
                    </div>

                    {/* Edit Form */}
                    <AnimatePresence>
                      {editingTerm === item.id && editForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          onClick={(e) => e.stopPropagation()}
                          style={{ marginTop: '1rem' }}
                        >
                          <div style={{
                            padding: '1rem',
                            background: 'rgba(45, 91, 120, 0.05)',
                            borderRadius: 'var(--radius)',
                            border: '2px solid rgba(45, 91, 120, 0.3)'
                          }}>
                            <h4 style={{ marginBottom: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Edit3 size={18} color="var(--color-secondary)" />
                              Upravit termín
                            </h4>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                              <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                                  Název termínu
                                </label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={editForm.term}
                                  onChange={(e) => handleEditFormChange('term', e.target.value)}
                                  style={{ fontSize: '0.875rem' }}
                                />
                              </div>

                              <div className="form-group">
                                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                                  Kategorie
                                </label>
                                <select
                                  className="form-input"
                                  value={editForm.category}
                                  onChange={(e) => handleEditFormChange('category', e.target.value)}
                                  style={{ fontSize: '0.875rem' }}
                                >
                                  <option value="Základy">Základy</option>
                                  <option value="Harmonie">Harmonie</option>
                                  <option value="Tóniny">Tóniny</option>
                                  <option value="Klavír">Klavír</option>
                                  <option value="Tempo">Tempo</option>
                                </select>
                              </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                                Definice
                              </label>
                              <textarea
                                className="form-input"
                                value={editForm.definition}
                                onChange={(e) => handleEditFormChange('definition', e.target.value)}
                                rows={2}
                                style={{ fontSize: '0.875rem' }}
                              />
                            </div>

                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                                Příklad
                              </label>
                              <textarea
                                className="form-input"
                                value={editForm.example}
                                onChange={(e) => handleEditFormChange('example', e.target.value)}
                                rows={2}
                                style={{ fontSize: '0.875rem' }}
                              />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={saveEditedTerm}
                                className="btn btn-primary"
                                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                              >
                                <Save size={16} />
                                Uložit změny
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={cancelEditingTerm}
                                className="btn btn-secondary"
                                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                              >
                                <X size={16} />
                                Zrušit
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {isExpanded && editingTerm !== item.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ marginTop: '1rem' }}
                        >
                          <div style={{
                            padding: '1rem',
                            background: 'rgba(45, 91, 120, 0.05)',
                            borderRadius: 'var(--radius)',
                            marginBottom: '1rem',
                            border: '1px solid rgba(45, 91, 120, 0.1)'
                          }}>
                            <strong style={{ fontSize: '0.875rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
                              Definice:
                            </strong>
                            <p style={{
                              fontSize: '0.9375rem',
                              color: '#64748b',
                              lineHeight: 1.7,
                              margin: 0
                            }}>
                              {item.definition}
                            </p>
                          </div>

                          <div style={{
                            padding: '1rem',
                            background: 'rgba(181, 31, 101, 0.05)',
                            borderRadius: 'var(--radius)',
                            border: '1px solid rgba(181, 31, 101, 0.1)'
                          }}>
                            <strong style={{ fontSize: '0.875rem', color: '#1e293b', display: 'block', marginBottom: '0.5rem' }}>
                              Příklad:
                            </strong>
                            <p style={{
                              fontSize: '0.9375rem',
                              color: '#64748b',
                              lineHeight: 1.7,
                              margin: 0,
                              fontStyle: 'italic'
                            }}>
                              {item.example}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                        )}
                      </SortableGlossaryItem>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </SortableContext>
      </DndContext>

      {filteredTerms.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          color: '#64748b',
          fontSize: '1rem'
        }}>
          Hm, tohle tady nemáme 🔍 Zkuste hledat znova a jinak.
        </div>
      )}
    </div>
  );
}

export default Glossary;
