# Dokumentace změn - 26. listopadu 2025

## 🎯 Hlavní změny

### 1. Modularizace UI komponent v SongLibrary
**Účel:** Unifikace UI komponent napříč aplikací, odstranění duplicitního kódu

**Provedené změny:**
- Import modularních komponent z `ButtonComponents.jsx`:
  - `Chip` pro zobrazení obtížnosti, tóniny a tempa
  - `ActionButtonGroup` pro správu akcí (Upravit, Duplikovat, Smazat)
  - `SaveButton` a `CancelButton` pro editační režim

**Nahrazené komponenty:**
- Hardcoded difficulty badge → `<Chip text={song.difficulty} variant="difficulty" />`
- Hardcoded tónina/tempo text → `<Chip text={song.key} variant="info" />` a `<Chip text={song.tempo} variant="info" />`
- Tři individuální ActionButton komponenty → `<ActionButtonGroup onEdit={...} onDuplicate={...} onDelete={...} />`

**Benefity:**
- Konzistentní vzhled napříč aplikací
- Snadnější údržba (změna na jednom místě)
- Menší velikost kódu

### 2. Nový Chip variant: "info"
**Účel:** Zobrazení metadat písní (tónina, tempo) s vizuálně odlišným stylem

**Specifikace:**
```javascript
info: {
  background: 'rgba(255, 255, 255, 0.95)',
  color: 'var(--color-secondary)',
  border: 'none',
  boxShadow: 'inset 0 0 16px rgba(45, 91, 120, 1), 0 1px 3px rgba(45, 91, 120, 0.15)'
}
```

**Použití:**
- Tónina písně
- Tempo písně
- Další metadata v budoucnu

### 3. Odstranění sekce Písničky z Admin panelu
**Důvod:** Redundance - admin rozhraní pro písničky je již dostupné přímo v sekci Písničky

**Odstraněné soubory/části:**
- Removed `SongLibrary` import z Admin.jsx
- Removed `Music` icon import
- Removed `songs` tab z admin menu
- Removed `activeCategory` state a `songCategories` array
- Removed celá sekce písní z admin UI

**Výsledek:**
Admin panel nyní obsahuje pouze:
- Přehled (Dashboard)
- Uživatelé
- Gamifikace
- Odměny
- Kvízy

### 4. Unifikace fontů - Google Fonts (Lato + Roboto)
**Problém:** Monospace fonty se zobrazovaly v různých částech aplikace (písničky, lekce, admin) kvůli výchozím stylům prohlížeče

**Řešení:**
- Přidán Google Fonts import do `index.css`:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Roboto:wght@400;500;700&display=swap');
  ```

- Nastaveny globální fonty:
  ```css
  body {
    font-family: 'Lato', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Roboto', sans-serif;
  }
  ```

- Přidáno přepsání výchozích stylů prohlížeče:
  ```css
  /* Override browser defaults for form elements */
  input, textarea, select, button {
    font-family: inherit;
  }

  /* Override browser defaults for code elements */
  code, pre, kbd, samp {
    font-family: inherit;
  }
  ```

**Odstraněné inline styly:**
- Všechny `fontFamily: 'monospace'` deklarace
- Všechny `fontFamily: 'inherit'` deklarace (zbytečné)
- Všechny dlouhé system font stacky

**Soubory upravené:**
- `src/styles/index.css` - globální fonty
- `src/components/resources/SongLibrary.jsx` - odstranění inline fontů
- `src/components/resources/NoteComposer.jsx` - odstranění monospace
- `src/components/admin/AchievementManager.jsx` - odstranění inherit
- `src/components/ui/FormComponents.jsx` - odstranění inherit

### 5. Migrace notového zápisu: Podtržítka → Mezery
**Důvod:** Mezery jsou intuitivnější a čitelnější než podtržítka

#### 5.1 Změny v kódu

**SongLibrary.jsx:**
- Změněno parsování not:
  - Před: `melodieString.split('_')`
  - Po: `melodieString.split(/\s+/).filter(e => e)`
- Změněny placeholdery:
  - Před: `"D_D_E_-_F_|_G_A_H"`
  - Po: `"D D E - F | G A H"`
- Aktualizováno všude, kde se noty parsují nebo zobrazují

**NoteComposer.jsx:**
- Změněno přidávání not:
  - Před: ``${currentValue}_${formattedNote}``
  - Po: ``${currentValue} ${formattedNote}``
- Změněno přidávání pauz a nových řádků (mezera místo podtržítka)
- Změněno mazání posledního elementu:
  - Před: `split('_')` a `join('_')`
  - Po: `split(/\s+/)` a `join(' ')`
- Aktualizována nápověda v tabulce:
  - Oddělovač: `_` → `mezera`
  - Příklad: `C_D_E` → `C D E`

**LessonList.jsx a LessonCard.jsx:**
- Změněno zobrazení not:
  - Před: `notes.join(', ')` (čárky)
  - Po: `notes.join(' ')` (mezery)
- Změněno parsování:
  - Před: `split(',')`
  - Po: `split(/\s+/)`
- Aktualizované labely: "oddělené čárkou" → "oddělené mezerou"
- Placeholdery: `"Např. C, D, E"` → `"Např. C D E"`

#### 5.2 Databázová migrace

**Piano Songs (piano.piano_songs):**
```sql
UPDATE piano.piano_songs
SET notes = REPLACE(notes, '_', ' ')
WHERE notes LIKE '%_%';
```
- Migrace proběhla úspěšně
- Všechny písničky nyní používají mezery jako oddělovač

**Piano Lessons (piano.piano_lessons):**
- **Migrace nebyla potřeba**
- Lekce ukládají noty jako JSON pole: `["C", "D", "E"]`
- Změnilo se pouze UI zobrazení (čárky → mezery)
- Data v databázi zůstávají stejná

#### 5.3 Výsledný formát

**Písničky:**
- **UI vstup:** `C D E - F | G A H`
- **Databáze:** `"C D E - F | G A H"` (string s mezerami)
- **Parsování:** `split(/\s+/)` → `["C", "D", "E", "-", "F", "|", "G", "A", "H"]`

**Lekce:**
- **UI vstup:** `C D E F G`
- **Databáze:** `["C", "D", "E", "F", "G"]` (JSON pole)
- **Zobrazení:** `join(' ')` → `"C D E F G"`

## 📁 Soubory změněné v této aktualizaci

### Komponenty
1. `src/components/resources/SongLibrary.jsx`
   - Modularizace UI (Chip, ActionButtonGroup)
   - Změna parsování not (mezery)
   - Odstranění inline fontů

2. `src/components/resources/NoteComposer.jsx`
   - Změna separátoru not (mezery)
   - Odstranění monospace fontu
   - Aktualizace nápovědy

3. `src/components/lessons/LessonList.jsx`
   - Změna separátoru not (mezery místo čárek)

4. `src/components/lessons/LessonCard.jsx`
   - Změna separátoru not (mezery místo čárek)

5. `src/pages/Admin.jsx`
   - Odstranění sekce Písničky
   - Cleanup importů a stavů

6. `src/components/admin/AchievementManager.jsx`
   - Odstranění `fontFamily: 'inherit'`

7. `src/components/ui/FormComponents.jsx`
   - Odstranění `fontFamily: 'inherit'`

8. `src/components/ui/ButtonComponents.jsx`
   - Přidán nový `info` variant pro Chip

### Styly
9. `src/styles/index.css`
   - Přidán Google Fonts import
   - Nastaveny globální fonty (Lato, Roboto)
   - Přepsány výchozí styly prohlížeče pro form elementy

### Utility/Skripty
10. `migrate-notes-to-spaces.js` (NOVÝ)
    - Node.js skript pro migraci databáze
    - Záloha/reference pro budoucí migrace

## 🗄️ Databázové změny

### Migrace piano.piano_songs
- **Tabulka:** `piano.piano_songs`
- **Pole:** `notes` (text)
- **Změna:** Nahrazení všech `_` za mezery
- **SQL:** `UPDATE piano.piano_songs SET notes = REPLACE(notes, '_', ' ') WHERE notes LIKE '%_%';`

### Piano lessons (bez změny)
- **Tabulka:** `piano.piano_lessons`
- **Pole:** `content` (jsonb)
- **Struktura:** `{ notes: ["C", "D", "E"], instructions: [...] }`
- **Změna:** Žádná (data již v optimálním formátu)

## ✅ Testování a ověření

### Před deployem ověřit:
- [ ] Písničky se správně přehrávají
- [ ] Nové písničky lze vytvořit s mezerami
- [ ] NoteComposer přidává noty s mezerami
- [ ] Lekce se správně zobrazují
- [ ] Fonty jsou jednotné (Lato + Roboto)
- [ ] Žádné monospace fonty v aplikaci
- [ ] Admin panel funguje bez sekce Písničky

### Známé problémy
- Žádné

## 📝 Poznámky pro budoucnost

1. **Notový zápis:** Aplikace nyní používá mezery jako univerzální oddělovač not
2. **Fonty:** Všechny texty používají Lato, nadpisy Roboto (Google Fonts)
3. **Modularizace:** Preferovat použití komponent z `ButtonComponents.jsx` před vlastními implementacemi
4. **Admin struktura:** Písničky se spravují přímo v sekci Písničky, ne v Admin panelu

## 🔄 Kompatibilita

### Zpětná kompatibilita
- ✅ Stará data s podtržítky automaticky zmigrována
- ✅ Aplikace funguje se všemi existujícími písničkami
- ✅ Lekce fungují bez změny (pole zůstalo pole)

### Dopředná kompatibilita
- ✅ Nové písničky používají mezery
- ✅ Nové lekce používají mezery v UI (pole v DB)
- ✅ Konzistentní chování napříč celou aplikací
