import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultTerms = [
  // Základy harmonie
  {
    id: 1,
    category: 'Harmonie',
    term: 'Akord',
    definition: 'Současné znění tří nebo více tónů. Základní stavební kámen harmonizace.',
    example: 'C dur akord se skládá z tónů C, E a G zahraných současně.'
  },
  {
    id: 2,
    category: 'Harmonie',
    term: 'Kadence',
    definition: 'Sled akordů, který přináší pocit uzavřenosti nebo závěru hudební fráze. Základní kadence: I - IV - V - I',
    example: 'V C dur: C dur → F dur → G dur → C dur'
  },
  {
    id: 3,
    category: 'Harmonie',
    term: 'Tónika (I. stupeň)',
    definition: 'Základní akord tóniny, přináší pocit stability a klidu. V C dur je to akord C dur (C-E-G).',
    example: 'Písně většinou začínají a končí na tónice.'
  },
  {
    id: 4,
    category: 'Harmonie',
    term: 'Dominanta (V. stupeň)',
    definition: 'Akord, který vytváří napětí a touží se vrátit k tónice. V C dur je to akord G dur (G-H-D).',
    example: 'Dominanta → Tónika je nejsilnější harmonický postup.'
  },
  {
    id: 5,
    category: 'Harmonie',
    term: 'Subdominanta (IV. stupeň)',
    definition: 'Akord mezi tónikou a dominantou. V C dur je to akord F dur (F-A-C).',
    example: 'Používá se pro přechod k dominantě.'
  },
  {
    id: 6,
    category: 'Tóniny',
    term: 'Dur',
    definition: 'Durová tónina má veselý, jasný charakter. Durový akord obsahuje velkou tercii.',
    example: 'C dur: C - E (velká tercie) - G'
  },
  {
    id: 7,
    category: 'Tóniny',
    term: 'Moll',
    definition: 'Mollová tónina má smutný, melancholický charakter. Mollový akord obsahuje malou tercii.',
    example: 'A moll: A - C (malá tercie) - E'
  },
  {
    id: 8,
    category: 'Tóniny',
    term: 'Tónina',
    definition: 'Systém tónů uspořádaných kolem základního tónu (tóniky). Např. C dur, D moll.',
    example: 'C dur používá pouze bílé klávesy, D dur má 2 křížky.'
  },
  {
    id: 9,
    category: 'Základy',
    term: 'Harmonizace',
    definition: 'Proces přidávání akordového doprovodu k melodii.',
    example: 'K melodii "Skákal pes" přidáme akordy C, F, G.'
  },
  {
    id: 10,
    category: 'Základy',
    term: 'Stupeň',
    definition: 'Pozice tónu nebo akordu ve stupnici. Označuje se římskými číslicemi (I, II, III, IV, V, VI, VII).',
    example: 'I = tónika, IV = subdominanta, V = dominanta'
  },
  {
    id: 11,
    category: 'Základy',
    term: 'Melodie',
    definition: 'Posloupnost jednotlivých tónů, které tvoří hlavní hudební linku písně.',
    example: 'To, co zpíváte nebo si hvízdáte.'
  },
  {
    id: 12,
    category: 'Základy',
    term: 'Doprovod',
    definition: 'Harmonický základ pod melodií, obvykle tvořený akordy.',
    example: 'Levá ruka na klavíru často hraje doprovod.'
  },
  // Klavírní pojmy
  {
    id: 13,
    category: 'Klavír',
    term: 'Bílé klávesy',
    definition: 'Představují základní tóny C, D, E, F, G, A, H. Opakují se v oktávách.',
    example: 'C dur stupnice používá pouze bílé klávesy.'
  },
  {
    id: 14,
    category: 'Klavír',
    term: 'Černé klávesy',
    definition: 'Představují zvýšené (#) nebo snížené (b) tóny. Např. C# (Cis) nebo Db (Des).',
    example: 'Mezi C a D je černá klávesa C# (Cis).'
  },
  {
    id: 15,
    category: 'Klavír',
    term: 'Oktáva',
    definition: 'Vzdálenost osmi tónů. Tóny se po oktávě opakují ve vyšší nebo nižší poloze.',
    example: 'Od C do dalšího C je jedna oktáva.'
  },
  {
    id: 16,
    category: 'Klavír',
    term: 'Tercie',
    definition: 'Interval mezi prvním a třetím tónem stupnice. Může být velká (dur) nebo malá (moll).',
    example: 'C → E je velká tercie (4 půltóny)'
  },
  {
    id: 17,
    category: 'Klavír',
    term: 'Kvinta',
    definition: 'Interval mezi prvním a pátým tónem stupnice. Základní součást akordu.',
    example: 'C → G je čistá kvinta'
  },
  {
    id: 18,
    category: 'Klavír',
    term: 'Pravá ruka',
    definition: 'Na klavíru obvykle hraje melodii nebo vyšší tóny akordu.',
    example: 'Prstoklad: palec = 1, ukazovák = 2, prostředník = 3, prsteník = 4, malík = 5'
  },
  {
    id: 19,
    category: 'Klavír',
    term: 'Levá ruka',
    definition: 'Na klavíru obvykle hraje basové tóny a doprovod.',
    example: 'Často hraje základní tón akordu nebo celý akord.'
  },
  {
    id: 20,
    category: 'Klavír',
    term: 'Pedál',
    definition: 'Pravý pedál (sustain) prodlužuje znění tónů, levý je ztišuje.',
    example: 'Sustain pedál spojuje tóny a vytváří plnější zvuk.'
  },
  // Tempo
  {
    id: 21,
    category: 'Tempo',
    term: 'Allegro',
    definition: 'Rychlé tempo (rychle, živě)',
    example: 'Veselé, energické písně'
  },
  {
    id: 22,
    category: 'Tempo',
    term: 'Andante',
    definition: 'Mírné tempo (kráčejícím tempem)',
    example: 'Klidné, procházkové tempo'
  },
  {
    id: 23,
    category: 'Tempo',
    term: 'Moderato',
    definition: 'Střední tempo (mírně, umírněně)',
    example: 'Ani rychle, ani pomalu'
  }
];

const useGlossaryStore = create(
  persist(
    (set) => ({
      terms: defaultTerms,

      updateTerm: (termId, updatedData) => {
        set((state) => ({
          terms: state.terms.map(term =>
            term.id === termId ? { ...term, ...updatedData } : term
          )
        }));
      },

      addTerm: (newTerm) => {
        set((state) => ({
          terms: [...state.terms, { ...newTerm, id: Date.now() }]
        }));
      },

      deleteTerm: (termId) => {
        set((state) => ({
          terms: state.terms.filter(term => term.id !== termId)
        }));
      },

      resetTerms: () => {
        set({ terms: defaultTerms });
      }
    }),
    {
      name: 'glossary-storage'
    }
  )
);

export default useGlossaryStore;
