# Session Context - 23. listopadu 2025 (večer)

## Datum: 2025-11-23 20:55

---

## 🚨 KRITICKÉ PROBLÉMY

### 1. **Teoretické kvízy ZMIZELY a NEVRÁTILy SE**
- **Status:** NEVYŘEŠENO ❌
- **Popis:** Teoretické kvízy (quiz_type='theory') se přestaly zobrazovat
- **Lokace:** V Supabase databázi JSOU, ale nezobrazují se ani v lokální ani v produkční verzi
- **Toto se stalo už NĚKOLIKRÁT - NESMÍ SE TO OPAKOVAT!**

### 2. **Změny v QuizManageru nejsou vidět**
- **Status:** NEVYŘEŠENO ❌
- **Popis:** Ani po hard refresh nejsou vidět žádné změny designu
- **Očekávané změny:** TabButtons komponenty, moderní design podle UniversalQuizManager

---

## 🔧 CO BYLO PROVEDENO V TÉTO SESSION

### 1. **Oprava importů RADIUS**
```javascript
// PŘED (ŠPATNĚ):
import { RADIUS } from '../../utils/styleConstants';

// PO (SPRÁVNĚ):
import { ..., RADIUS } from '../ui/TabButtons';
```

**Opraveno v:**
- ✅ `/src/components/admin/ChordManager.jsx` (řádek 6)
- ✅ `/src/components/admin/QuizManager.jsx` (řádek 6)
- ✅ `/src/components/admin/UniversalQuizManager.jsx`
- ✅ `/src/components/ui/HelpPanel.jsx`

### 2. **Oprava chybějícího TheoryQuizManager**
- ChordManager.jsx importoval neexistující `TheoryQuizManager`
- **Oprava:** Změněno na `UniversalQuizManager`

**V souboru:** `/src/components/admin/ChordManager.jsx`
```javascript
// Řádek 7:
import UniversalQuizManager from './UniversalQuizManager';

// Řádky 642-660: Použití pro teorii
if (activeQuizType === 'theory') {
  return (
    <PageCard>
      <UniversalQuizManager quizType="theory" title="Správa kvízů - Teorie" icon={BookOpen} />
    </PageCard>
  );
}
```

### 3. **Oprava JSX chyb v QuizManager.jsx**
- Extra `</div>` tag na řádku 877 byl odstraněn
- Kompilace nyní funguje (HMR update 20:53:49)

### 4. **Implementace TabButtons komponent v ChordManager**
**Změny v:** `/src/components/admin/ChordManager.jsx`
- ✅ PageCard - hlavní kontejner
- ✅ AddButton - tlačítko "Přidat akord"
- ✅ CancelButton a SaveButton - formulářová tlačítka
- ✅ FormContainer - kontejner formuláře
- ✅ Chip komponenty - obtížnost, status, odpovědi
- ✅ ActionButton - edit, duplikovat, smazat
- ✅ RADIUS.xl - border-radius pro karty

**POZNÁMKA:** ChordManager.jsx NENÍ používán v aplikaci! Admin používá QuizManager.jsx

---

## 📁 STRUKTURA SOUBORŮ

### **Aktivní komponenty (skutečně používané)**
```
src/
├── pages/
│   └── Admin.jsx                    # Importuje QuizManager (NE ChordManager!)
├── components/
│   ├── admin/
│   │   ├── QuizManager.jsx          # ✅ TENTO se používá pro admin
│   │   ├── ChordManager.jsx         # ❌ TENTO se NEPOUŽÍVÁ!
│   │   └── UniversalQuizManager.jsx # Pro všechny kvízy kromě 'chord'
│   └── ui/
│       ├── TabButtons.jsx           # Centrální UI komponenty + RADIUS export
│       └── HelpPanel.jsx            # Responzivní nápověda
```

### **QuizManager.jsx - Jak funguje**
```javascript
// Řádek 591-623: Logika zobrazení
if (activeQuizType !== 'chord') {
  // Pro theory, interval, scale, rhythm, mixed:
  return <UniversalQuizManager quizType={activeQuizType} ... />
}

// Řádek 625+: Pro chord typ
// Komentář říká "původní ChordManager", ale je to INLINE kód v QuizManageru!
return (
  <div className="card" style={{ borderRadius: RADIUS.xl }}>
    {/* Vlastní formulář pro akordy */}
  </div>
)
```

**DŮLEŽITÉ:**
- ChordManager.jsx existuje jako samostatný soubor
- ALE QuizManager.jsx má kód pro 'chord' typ INLINE (ne import)
- Není jasné, jestli se ChordManager.jsx někde používá

---

## 🎨 TABBUTTONS KOMPONENTY

### Export z `/src/components/ui/TabButtons.jsx`
```javascript
export const RADIUS = {
  sm: '10px',    // Small (buttons, inputs, chips)
  md: '12px',    // Medium (form containers, modals)
  lg: '16px',    // Large (cards, panels)
  xl: '22px',    // Extra large (main containers)
};

export {
  Chip, ActionButton, AddButton, HelpButton, HelpPanel,
  CancelButton, SaveButton, RadioLabel,
  FormLabel, FormTextarea, FormSelect, FormInput, CheckboxLabel,
  FormContainer, PageCard, FormSection
}
```

---

## 🗄️ DATABÁZE

### Tabulky
- `piano_quiz_chords` - všechny kvízy (chord, theory, interval, scale, rhythm, mixed)
- `piano_quiz_chord_options` - možnosti odpovědí

### Query pro teoretické kvízy
```sql
SELECT id, name, quiz_type, difficulty, is_active
FROM piano_quiz_chords
WHERE quiz_type = 'theory'
ORDER BY display_order;
```

**PROBLÉM:** Teoretické kvízy jsou v DB, ale nezobrazují se!

---

## ⚡ HMR / DEV SERVER STATUS

### Poslední úspěšné kompilace:
```
20:49:53 [vite] hmr update /src/components/admin/QuizManager.jsx
20:53:49 [vite] hmr update /src/components/admin/QuizManager.jsx  ← Poslední
```

### Soubory které SE aktualizují:
- QuizManager.jsx ✅
- UniversalQuizManager.jsx ✅
- TabButtons.jsx ✅
- HelpPanel.jsx ✅

### Soubory které SE NEAKTUALIZUJÍ:
- ChordManager.jsx ❌ (není importován nikde)

---

## 🐛 ZNÁMÉ PROBLÉMY

### 1. Teoretické kvízy se nezobrazují
**Symptomy:**
- Záložka "Teorie" v admin panelu NEukazuje otázky
- V Supabase databázi data JSOU
- Ani lokální ani produkční verze je neukazuje
- **Toto se stalo už několikrát!**

**Možné příčiny:**
- [ ] RLS policies na tabulce `piano_quiz_chords`
- [ ] UniversalQuizManager nefunguje správně pro typ 'theory'
- [ ] Problém s fetchováním dat v UniversalQuizManager
- [ ] Cache issue v browseru nebo Supabase klientovi

### 2. QuizManager design se nemění
**Symptomy:**
- Implementované TabButtons komponenty nejsou vidět
- Design vypadá stále stejně (starý)
- Hard refresh nepomáhá

**Možné příčiny:**
- [ ] QuizManager nepoužívá TabButtons komponenty všude
- [ ] CSS konflikty s existujícími třídami
- [ ] Browser cache
- [ ] Komponenty jsou správně naimportované, ale nepoužité

---

## 📝 CO UDĚLAT DÁLE

### Priorita 1: OPRAVIT TEORETICKÉ KVÍZY ⚠️
1. **Zkontrolovat UniversalQuizManager**
   - Otevřít `/src/components/admin/UniversalQuizManager.jsx`
   - Najít `fetchChords()` nebo podobnou funkci
   - Zkontrolovat query pro quiz_type='theory'
   - Přidat console.log pro debugging

2. **Zkontrolovat RLS policies**
   - V Supabase dashboard → Authentication → Policies
   - Tabulka `piano_quiz_chords`
   - Ujistit se, že SELECT funguje pro všechny quiz_type

3. **Test query**
   - Použít Supabase SQL Editor
   - Spustit: `SELECT * FROM piano_quiz_chords WHERE quiz_type = 'theory'`
   - Ověřit, že data existují

### Priorita 2: IMPLEMENTOVAT TABBUTTONS DO QUIZMANAGER
1. **Najít všechny hardcoded komponenty v QuizManager.jsx**
   - Hledat `<div className=`, `<button`, `<input`, atd.
   - Nahradit za TabButtons komponenty

2. **Porovnat s UniversalQuizManager.jsx**
   - UniversalQuizManager má správnou strukturu
   - Použít jako referenci pro QuizManager

3. **Test po každé změně**
   - Hard refresh (Cmd/Ctrl + Shift + R)
   - Zkontrolovat HMR update v konzoli

### Priorita 3: SMAZAT ChordManager.jsx
- Soubor se NEPOUŽÍVÁ
- Může způsobovat zmatek
- Zálohovat a potom smazat

---

## 🎯 CÍLE PŮVODNÍHO ÚKOLU

1. ✅ Finalizovat HelpPanel s responzivním layoutem
2. ✅ Centralizovat RADIUS do TabButtons
3. ❌ Refactorovat ChordManager podle UniversalQuizManager (pracovali jsme na špatném souboru!)
4. ❌ Opravit teoretické kvízy (stále nefungují!)

---

## 💡 DŮLEŽITÉ POZNATKY

### 1. **Admin panel používá QuizManager, NE ChordManager!**
```javascript
// src/pages/Admin.jsx:6
import QuizManager from '../components/admin/QuizManager';
```

### 2. **RADIUS musí být VŽDY z TabButtons**
```javascript
// SPRÁVNĚ:
import { RADIUS } from '../ui/TabButtons';

// ŠPATNĚ:
import { RADIUS } from '../../utils/styleConstants';
```

### 3. **QuizManager routing**
```javascript
if (activeQuizType !== 'chord') {
  // Zobrazí UniversalQuizManager pro theory, interval, scale, rhythm, mixed
} else {
  // Zobrazí vlastní formulář pro chord
}
```

### 4. **HMR update indikátor**
- Pokud se soubor NEOBJEVUJE v HMR update logu, není importován!
- ChordManager.jsx není v HMR updates → není používán

---

## 🔍 DEBUG CHECKLIST PRO PŘÍŠTÍ SESSION

### Před začátkem práce:
- [ ] Ověřit, který soubor se SKUTEČNĚ používá (Admin.jsx imports)
- [ ] Zkontrolovat HMR update log - které soubory se aktualizují
- [ ] Přečíst tento kontext celý!

### Při práci na QuizManageru:
- [ ] QuizManager.jsx je správný soubor (NE ChordManager!)
- [ ] Po každé změně: hard refresh + check HMR update
- [ ] Console.log data z fetchChords() pro debugging

### Při řešení teoretických kvízů:
- [ ] Console.log v UniversalQuizManager fetchChords()
- [ ] Console.log response z Supabase
- [ ] Zkontrolovat network tab v DevTools
- [ ] Ověřit RLS policies

---

## 📞 KONTAKT NA DATABÁZI

```javascript
// Connection string (production):
postgresql://postgres.fvtfpzbwakxbbavwndby:Lg+kytara2011@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## 🎨 DESIGN REFERENCE

UniversalQuizManager má správný design:
- PageCard kontejner
- FormContainer pro formuláře
- Chip pro obtížnost a status
- ActionButton pro akce
- AddButton, CancelButton, SaveButton
- RADIUS.xl pro karty otázek

QuizManager by měl vypadat STEJNĚ!

---

## ⏭️ DALŠÍ KROKY (v pořadí důležitosti)

1. **NAJÍT A OPRAVIT proč teoretické kvízy nejsou vidět** ⚠️⚠️⚠️
2. Implementovat TabButtons komponenty do QuizManager.jsx
3. Otestovat všechny typy kvízů (chord, theory, interval, scale, rhythm, mixed)
4. Smazat nepoužívaný ChordManager.jsx
5. Commit změn do Git

---

## 🚀 PŘÍKAZY PRO TESTOVÁNÍ

```bash
# Spustit dev server (pokud neběží):
npm run dev

# Hard refresh v browseru:
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R

# Zkontrolovat HMR updates:
# Sledovat terminal output nebo použít BashOutput tool

# Git status:
git status

# Commit změn:
git add .
git commit -m "Fix: Oprava teoretických kvízů a TabButtons integrace"
```

---

## 📚 DŮLEŽITÉ SOUBORY K PŘEČTENÍ V NOVÉ SESSION

1. `/src/pages/Admin.jsx` - Zjistit, co se importuje
2. `/src/components/admin/QuizManager.jsx` - Hlavní soubor pro práci
3. `/src/components/admin/UniversalQuizManager.jsx` - Reference design
4. `/src/components/ui/TabButtons.jsx` - Všechny komponenty
5. Tento kontext!

---

**Připraveno pro novou session:** 2025-11-23 20:55
**Kritická priorita:** Opravit zobrazení teoretických kvízů! ⚠️
