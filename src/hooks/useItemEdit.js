import { useState } from 'react';

/**
 * Custom hook pro správu editace a expanze položek (lekce, písničky, cvičení atd.)
 *
 * Poskytuje konzistentní logiku napříč celou aplikací:
 * - Otevírání/zavírání karet s automatickým rušením editace
 * - Zahájení editace
 * - Zrušení editace
 *
 * @param {Function} onCancelEdit - Optional callback volaný při zrušení editace (např. pro cleanup audio souborů)
 * @returns {Object} - Objekty se stavy a funkcemi
 */
export function useItemEdit(onCancelEdit) {
  const [editingItem, setEditingItem] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [editForm, setEditForm] = useState({});

  /**
   * Toggle otevření/zavření karty položky
   * Pokud zavíráme kartu s aktivní editací, automaticky zruší editaci
   */
  const toggleItemExpansion = (itemId) => {
    // Pokud zavíráme kartu (aktuálně je otevřená) a je aktivní editace této položky, zrušit editaci
    if (expandedItems[itemId] && editingItem === itemId) {
      setEditingItem(null);
      setEditForm({});
      // Zavolat custom cleanup callback pokud existuje
      if (onCancelEdit) {
        onCancelEdit();
      }
    }

    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  /**
   * Zahájit editaci položky
   * Automaticky otevře kartu a nastaví editForm s daty položky
   *
   * @param {Object} item - Položka k editaci
   * @param {Function} formMapper - Funkce pro mapování položky na editForm (optional)
   */
  const startEditing = (item, formMapper) => {
    setEditingItem(item.id);
    // Automaticky rozbalit kartu pro editaci
    setExpandedItems(prev => ({ ...prev, [item.id]: true }));

    // Pokud je poskytnut formMapper, použít ho, jinak použít celý item
    const formData = formMapper ? formMapper(item) : item;
    setEditForm(formData);
  };

  /**
   * Zrušit editaci
   * Zavře kartu a vyčistí editForm
   */
  const cancelEdit = () => {
    const itemId = editingItem;
    setEditingItem(null);
    setEditForm({});

    // Zavolat custom cleanup callback pokud existuje
    if (onCancelEdit) {
      onCancelEdit();
    }

    // Po zrušení editace sbalit kartu
    if (itemId) {
      setExpandedItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  /**
   * Aktualizovat pole v editForm
   * Podporuje nested fields pomocí tečkové notace (např. 'content.notes')
   *
   * @param {string} field - Název pole (podporuje 'content.notes' syntax)
   * @param {any} value - Nová hodnota
   */
  const updateEditForm = (field, value) => {
    if (field.includes('.')) {
      // Nested field (např. 'content.notes')
      const [parent, child] = field.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      // Simple field
      setEditForm(prev => ({ ...prev, [field]: value }));
    }
  };

  return {
    // States
    editingItem,
    expandedItems,
    editForm,

    // Setters (pokud potřebujete přímý přístup)
    setEditingItem,
    setExpandedItems,
    setEditForm,

    // Functions
    toggleItemExpansion,
    startEditing,
    cancelEdit,
    updateEditForm
  };
}
