import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultTemplates = [
  {
    id: 1,
    title: 'Základní kadence v C dur',
    description: 'Nejjednodušší harmonizace pro začáteční písně',
    difficulty: 'začátečník',
    chords: [
      { name: 'C dur', notes: ['C', 'E', 'G'], function: 'I. stupeň - tónika' },
      { name: 'F dur', notes: ['F', 'A', 'C'], function: 'IV. stupeň - subdominanta' },
      { name: 'G dur', notes: ['G', 'H', 'D'], function: 'V. stupeň - dominanta' }
    ],
    progression: 'I - IV - V - I',
    example: 'Použití: Skákal pes, Holka modrooká'
  },
  {
    id: 2,
    title: 'Kadence v G dur',
    description: 'Pro písně v tónině G dur',
    difficulty: 'začátečník',
    chords: [
      { name: 'G dur', notes: ['G', 'H', 'D'], function: 'I. stupeň - tónika' },
      { name: 'C dur', notes: ['C', 'E', 'G'], function: 'IV. stupeň - subdominanta' },
      { name: 'D dur', notes: ['D', 'F#', 'A'], function: 'V. stupeň - dominanta' }
    ],
    progression: 'I - IV - V - I',
    example: 'Použití: Když jsem já šel okolo vrat'
  },
  {
    id: 3,
    title: 'Rozšířená kadence s mollovou subdominantou',
    difficulty: 'mírně pokročilý',
    chords: [
      { name: 'C dur', notes: ['C', 'E', 'G'], function: 'I. stupeň - tónika' },
      { name: 'Am', notes: ['A', 'C', 'E'], function: 'VI. stupeň - mollová paralelá' },
      { name: 'F dur', notes: ['F', 'A', 'C'], function: 'IV. stupeň - subdominanta' },
      { name: 'G dur', notes: ['G', 'H', 'D'], function: 'V. stupeň - dominanta' }
    ],
    progression: 'I - VI - IV - V - I',
    example: 'Použití: Složitější lidové písničky s melancholickým nádechem'
  },
  {
    id: 4,
    title: 'Kadence v D dur',
    description: 'Pro písně v tónině D dur',
    difficulty: 'začátečník',
    chords: [
      { name: 'D dur', notes: ['D', 'F#', 'A'], function: 'I. stupeň - tónika' },
      { name: 'G dur', notes: ['G', 'H', 'D'], function: 'IV. stupeň - subdominanta' },
      { name: 'A dur', notes: ['A', 'C#', 'E'], function: 'V. stupeň - dominanta' }
    ],
    progression: 'I - IV - V - I',
    example: 'Použití: Slyšel jsem zvon'
  }
];

const useHarmonizationTemplatesStore = create(
  persist(
    (set) => ({
      templates: defaultTemplates,

      updateTemplate: (templateId, updatedData) => {
        set((state) => ({
          templates: state.templates.map(template =>
            template.id === templateId ? { ...template, ...updatedData } : template
          )
        }));
      },

      addTemplate: (newTemplate) => {
        set((state) => ({
          templates: [...state.templates, { ...newTemplate, id: Date.now() }]
        }));
      },

      deleteTemplate: (templateId) => {
        set((state) => ({
          templates: state.templates.filter(template => template.id !== templateId)
        }));
      },

      duplicateTemplate: (templateId) => {
        set((state) => {
          const templateToDuplicate = state.templates.find(template => template.id === templateId);
          if (!templateToDuplicate) return state;

          const duplicatedTemplate = {
            ...templateToDuplicate,
            id: Date.now(),
            title: `${templateToDuplicate.title} (kopie)`
          };

          return {
            templates: [...state.templates, duplicatedTemplate]
          };
        });
      },

      reorderTemplates: (newOrder) => {
        set({ templates: newOrder });
      },

      resetTemplates: () => {
        set({ templates: defaultTemplates });
      }
    }),
    {
      name: 'harmonization-templates-storage'
    }
  )
);

export default useHarmonizationTemplatesStore;
