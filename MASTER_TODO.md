# 📋 MASTER TODO - Piano Learning App

Datum poslední aktualizace: 2. prosince 2025

---

## 🔥 Priorita 1 - Kritické (Nutné pro správné fungování)

---

### 1. ⏳ Vlastní systém notifikací
**Status:** Pending
**Priorita:** 🔴 Kritická

**Popis:**
- Nahradit ošklivé browser notifikace a `alert()` moderním notifikačním systémem
- Design v souladu s aplikací
- Notifikace zmizí automaticky po X sekundách
- Alerty zůstanou pro důležité zprávy (error, warning)

**Typy notifikací:**
- **Toast (notifikace)** - automaticky zmizí (success, info, warning)
  - Pozice: top-right nebo bottom-right
  - Animace: slide-in + fade-out
  - Automatické zavření po 3-5 sekundách

- **Alert (modální dialog)** - musí být potvrzeno uživatelem (error, confirm)
  - Backdrop overlay
  - Tlačítka: OK, Cancel, Confirm
  - Zůstává dokud není zavřeno

**Soubory k vytvoření:**
- `src/components/ui/Toast.jsx` - toast notifikace
- `src/components/ui/AlertDialog.jsx` - modální alerty
- `src/context/NotificationContext.jsx` - context pro správu notifikací
- `src/hooks/useNotification.js` - hook pro jednoduché použití

**Použití:**
```jsx
const { showToast, showAlert } = useNotification();

// Toast notifikace (zmizí automaticky)
showToast('Kvíz dokončen!', 'success');
showToast('Chyba při ukládání', 'error');

// Alert dialog (musí být potvrzen)
const confirmed = await showAlert('Opravdu smazat?', 'warning', {
  confirmText: 'Smazat',
  cancelText: 'Zrušit'
});
```

**Design:**
- Použít RADIUS, SHADOW, BORDER konstanty
- Ikony z lucide-react
- Barvy podle typu (success: zelená, error: červená, warning: žlutá, info: modrá)
- Framer Motion animace

---

## 🔥 Priorita 2 - Vysoká (Důležité pro UX)

### 2. ⏳ Metronom
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Essential nástroj pro cvičení rytmu
- Nastavitelné tempo (BPM) - rozsah 40-200
- Různé rytmy (2/4, 3/4, 4/4, 6/8)
- Vizuální + zvukový feedback
- Accent na první dobu
- Tracking kolikrát cvičili s metronomem → achievement

**Soubory k vytvoření:**
- `src/components/practice/Metronome.jsx` - hlavní komponenta
- `src/utils/metronomeEngine.js` - audio engine pro metronom
- `src/store/useMetronomeStore.js` - Zustand store pro nastavení

**Databáze:**
- `piano_metronome_sessions` - tracking použití metronomu
- Sloupce: user_id, duration_seconds, tempo, time_signature, created_at

**Features:**
- BPM slider (40-200)
- Time signature selector (2/4, 3/4, 4/4, 6/8)
- Start/Stop/Pause
- Tap tempo (klikání pro nastavení tempa)
- Visual metronome (blikající indikátor)
- Volume control
- Subdivision options (quarter notes, eighth notes)

**Design:**
- Použít RADIUS, SHADOW, BORDER konstanty
- Ikony z lucide-react (Play, Pause, Volume2)
- Kruhový vizuál s animací
- Framer Motion pro smooth animace

**Integrace:**
- Přidat do `src/pages/Cviceni.jsx` jako novou sekci
- Floating metronome button pro použití během jiných aktivit
- Achievement: "Rytmický mistr" - 10 hodin s metronomem

---

### 3. ⏳ Denní cvičební rutina
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Strukturovaný denní plán pro začátečníky
- Doporučená rutina: "10 min škály, 15 min písně, 5 min teorie"
- Tracking času cvičení
- Streak za každodenní cvičení
- Reminder notifications (pokud má povolen notifications)

**Soubory k vytvoření:**
- `src/components/practice/DailyRoutine.jsx` - hlavní komponenta
- `src/components/practice/PracticeTimer.jsx` - timer pro jednotlivé sekce
- `src/store/usePracticeRoutineStore.js` - Zustand store

**Databáze:**
- `piano_practice_sessions` - tracking cvičebních session
- Sloupce: user_id, activity_type, duration_minutes, completed_at
- `piano_daily_routine_completions` - denní completion tracking

**Features:**
- Přednastavené rutiny podle úrovně:
  - Začátečník: 20 min/den
  - Pokročilý: 30 min/den
  - Expert: 45+ min/den
- Vlastní rutina (custom plán)
- Timer s automatickým přechodem mezi sekcemi
- Pause/Resume
- Statistiky: celkový čas za týden/měsíc
- Heatmap kalendář (jako GitHub contributions)
- Achievement: "30denní výzva" - 30 dní v řadě

**Design:**
- Karta s timeline jednotlivých aktivit
- Progress bar pro každou sekci
- Barevné kategorie (škály: modrá, písně: zelená, teorie: fialová)
- Countdown timer s kruhovou animací

---

### 4. ⏳ Dokončit refaktoring TabButtons
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Zkontrolovat re-exporty v TabButtons.jsx
- Ověřit, že všechny komponenty používají správné importy
- Zajistit konzistenci napříč celou aplikací

**Soubory k ověření:**
- `src/components/ui/TabButtons.jsx` - centrální export hub
- `src/components/ui/ButtonComponents.jsx`
- `src/components/ui/CardComponents.jsx`
- `src/components/ui/FormComponents.jsx`
- `src/components/ui/PageSection.jsx`

---

### 3. ⏳ Paginace pro dlouhé seznamy
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Využít modularitu UI komponent
- Vytvořit univerzální Pagination komponentu
- Přidat do všech admin seznamů (kvízy, písničky, lekce, achievementy)
- Server-side pagination (limit/offset) pro velké datasety

**Kde implementovat:**
- QuizManager - seznam kvízů
- SongLibrary - seznam písní
- LessonList - seznam lekcí
- AchievementManager - seznam achievementů
- UserList - seznam uživatelů

**Soubory k vytvoření:**
- `src/components/ui/Pagination.jsx` - univerzální komponenta
- Props: `currentPage`, `totalPages`, `onPageChange`, `pageSize`

**Design:**
- Použít RADIUS, SHADOW konstanty
- Tlačítka: Previous, 1, 2, 3, ..., Next
- Zobrazit "Showing X-Y of Z items"
- Responsive (mobile: jen Previous/Next)

---

### 4. ⏳ Free/Premium obsah v admin panelu
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Možnost označit lekce, cvičení, kvízy, materiály jako:
  - **Free** - dostupné pro všechny
  - **Premium** - dostupné po zaplacení a registraci
- Filtrování v uživatelském rozhraní podle subscription statusu

**Databázové změny:**
- Přidat sloupec `access_level` do tabulek:
  - `piano_lessons` - ENUM('free', 'premium')
  - `piano_quiz_chords` - ENUM('free', 'premium')
  - `piano_songs` - ENUM('free', 'premium')
  - `piano_theory_materials` - ENUM('free', 'premium')

**Admin UI:**
- Přidat checkbox nebo select "Přístup" v každém formuláři
- Ikona 🔓 Free / 🔒 Premium v seznamech

**User tabulka:**
- `piano_users.subscription_status` - ENUM('free', 'premium')
- `piano_users.subscription_expires_at` - TIMESTAMP

**Frontend filtrace:**
- Zobrazit pouze free obsah pro free uživatele
- Zobrazit vše pro premium uživatele
- Tlačítko "Upgrade na Premium" pro locked obsah

---

### 5. ⏳ Drag & Drop pro pořadí otázek v admin panelu
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- Nahradit manuální pole `display_order` drag & drop funkcionalitou
- Uživatel může přetahovat otázky/písničky/lekce pro změnu pořadí
- Automatické přečíslování `display_order` po přetažení

**Knihovna:**
- `@dnd-kit/core` + `@dnd-kit/sortable` (moderní, lightweight)
- Nebo `react-beautiful-dnd` (starší, ale stabilní)

**Kde implementovat:**
- QuizManager - přetahování kvízů
- SongLibrary - přetahování písní
- LessonList - přetahování lekcí
- AchievementManager - přetahování achievementů

**Soubory:**
- `src/components/ui/DraggableList.jsx` - univerzální komponenta
- `src/components/ui/DraggableItem.jsx` - jednotlivá položka

**Design:**
- Ikona ⋮⋮⋮ (grip-vertical z lucide-react) pro uchopení
- Hover efekt při přetahování
- Placeholder při přesunu
- Smooth animace

---

### 6. ⏳ Zobrazit teoretické otázky pro akordy v UI
**Status:** Pending
**Priorita:** 🟠 Vysoká

**Popis:**
- V sekci Teorie → Kvízy → Akordy zobrazit teoretické otázky pro akordy
- Filtrace teoretických otázek podle `quiz_type = 'chord'` a `questionText IS NOT NULL`
- Zobrazení v TheoryQuizHub nebo samostatné komponentě
- Oddělení od poslechového kvízu (ChordQuiz) a obecných teoretických otázek

**Soubory k úpravě:**
- `src/pages/Teorie.jsx` nebo `src/components/theory/TheoryQuizHub.jsx`
- Přidat filtraci pro teoretické otázky typu "chord"
- UI pro zobrazení a hraní těchto otázek

**Poznámka:** Teoretické otázky pro akordy jsou uložené v `piano_quiz_chords` s vyplněným `questionText` a možnostmi v `piano_quiz_chord_options`.

---

## 🔥 Priorita 3 - Střední (Nice to have)

### 7. ⏳ Breadcrumb navigace
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Drobečková navigace pro lepší orientaci v aplikaci
- Moderní design v souladu s aplikací
- Zobrazit aktuální cestu: Home → Teorie → Kvízy → Akordy

**Soubory k vytvoření:**
- `src/components/ui/Breadcrumb.jsx` - komponenta
- `src/hooks/useBreadcrumbs.js` - hook pro automatické generování

**Design:**
- Použít RADIUS konstanty
- Separator: `/` nebo `>` nebo ikona (ChevronRight)
- Poslední položka: bold, neaktivní
- Předchozí: klikací, navigace zpět

**Použití:**
```jsx
<Breadcrumb
  items={[
    { label: 'Home', to: '/' },
    { label: 'Teorie', to: '/teorie' },
    { label: 'Kvízy', to: '/teorie/kvízy' },
    { label: 'Akordy' } // aktivní, bez "to"
  ]}
/>
```

---

### 8. ⏳ Škály a technická cvičení
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Strukturované cvičení stupnic pro rozvoj techniky
- Gamifikace: "Zahraj škálu C dur 5x bez chyby"
- Různé varianty (legato, staccato, různá tempa)
- Tracking které škály už umí
- Prstoklady (fingering) zobrazené u každé noty

**Typy stupnic:**
- Durové stupnice (C, D, E, F, G, A, H)
- Mollové stupnice (a, d, e, g, h)
- Chromatická stupnice
- Arpeggia (rozložené akordy)

**Soubory k vytvoření:**
- `src/components/practice/ScalePractice.jsx` - hlavní komponenta
- `src/components/practice/FingeringDisplay.jsx` - zobrazení prstokladů
- `src/data/scales.js` - definice stupnic s fingering
- Přidat do `src/pages/Cviceni.jsx`

**Databáze:**
- `piano_scales` - tabulka s definicemi stupnic
  - Sloupce: id, name, notes (JSON), fingering (JSON), difficulty, type
- `piano_scale_completions` - historie procvičování
  - Sloupce: user_id, scale_id, mistakes_count, tempo, completed_at

**Features:**
- Metronom integrace
- Tempo adjustment (slow, medium, fast)
- Visualization: čísla prstů (1-5) nad notami
- Challenge mode: bez prstokladů
- Practice mode: s prstoklady
- Achievement: "Mistr stupnic" - všechny stupnice perfektně

**Design:**
- Barevné kódování prstů (např. palec = modrá, ukazovák = zelená)
- Animace postupu (zleva doprava)
- Progress tracking per scale

---

### 9. ⏳ Notová osnova - čtení not
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Mini-hra na trénink čtení not z notové osnovy
- "Která nota je to na osnově?" - zobrazí notu, user klikne na klavír
- Violinový (G klíč) i basový klíč (F klíč)
- Gamifikace čtení not - score, streak, time limit
- Postupné odemykání (začít s C-G, pak přidat H/Fis atd.)

**Soubory k vytvoření:**
- `src/components/games/NoteReadingGame.jsx` - hlavní hra
- `src/components/music/StaffNotation.jsx` - komponenta notové osnovy
- `src/utils/musicNotation.js` - helper funkce pro notový zápis

**Databáze:**
- `piano_note_reading_scores` - tracking progress
- Sloupce: user_id, clef_type, notes_correct, notes_total, avg_time, completed_at

**Features:**
- Dva režimy:
  - Treble clef (violinový klíč) - pravá ruka
  - Bass clef (basový klíč) - levá ruka
- Difficulty levels:
  - Easy: C-G (bez předznamenání)
  - Medium: C-C (oktáva, s křížky/béčky)
  - Hard: 2 oktávy
- Timer: kolik sekund na notu
- Streak counter
- Leaderboard
- Achievement: "Notový mistr" - 100 not správně

**Design:**
- SVG notová osnova (canvas nebo react-music)
- Animace noty při správné/špatné odpovědi
- Sound feedback
- Score display v rohu

---

### 10. ⏳ Rytmická cvičení
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Trénink rytmu bez hraní not
- Tleskání/tapping rytmů
- Rozpoznávání notových hodnot (celá, půlová, čtvrťová, osminová)
- Quiz na rytmy - "Jaká je hodnota této noty?"
- Rytmické diktáty - slyš rytmus, zopakuj ho

**Soubory k vytvoření:**
- `src/components/games/RhythmTraining.jsx` - hlavní komponenta
- `src/components/games/RhythmDictation.jsx` - rytmické diktáty
- `src/utils/rhythmEngine.js` - přehrávání rytmů

**Databáze:**
- `piano_rhythm_scores` - tracking progress
- Sloupce: user_id, exercise_type, score, completed_at

**Features:**
- Rytmické vzory:
  - Základní: celá, půlová, čtvrťová
  - Pokročilé: osminové, tečkované noty, trioly
- Tap game: klikej podle rytmu
- Rhythm dictation: slyš → zopakuj
- Visual metronome během cvičení
- Různé time signatures (2/4, 3/4, 4/4, 6/8)

**Design:**
- Vizuální reprezentace rytmu (obdélníky různých délek)
- Animace při tapping
- Score a accuracy feedback

---

### 11. ⏳ Repertoár - "Co umím zahrát"
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Seznam písní které už perfektně umí
- Možnost označit jako:
  - 🎵 "Zatím se učím"
  - ✅ "Umím zahrát"
  - ⭐ "Perfektně ovládám"
- Sharing s kamarády (pokud implementujeme social features)
- Export repertoáru do PDF

**Soubory k vytvoření:**
- `src/components/repertoire/RepertoireManager.jsx` - správa repertoáru
- `src/components/repertoire/RepertoireCard.jsx` - karta písně
- `src/pages/Repertoire.jsx` - samostatná stránka

**Databáze:**
- Přidat sloupec do `piano_song_completions`:
  - `mastery_level` - ENUM('learning', 'can_play', 'mastered')
- `piano_repertoire_items` - custom user repertoár
  - Sloupce: user_id, title, composer, mastery_level, last_practiced, notes

**Features:**
- Filtrování podle mastery level
- Sorting podle data, abecedy, obtížnosti
- "Kdy jsem naposledy hrál?" - reminder
- Statistics: kolik písní v každé kategorii
- Achievement: "Velký repertoár" - 50 písní na úrovni "Umím"

**Design:**
- Grid nebo seznam s kartami
- Barevné kódování podle mastery (šedá, žlutá, zelená)
- Progress bar: učící se → umím → perfektní

---

### 12. ⏳ Progress tracking & vizualizace
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Graf pokroku v čase
- "Před měsícem jsi udělal X lekcí, teď Y"
- Milníky: "První píseň!", "10 lekcí dokončeno!", "Level 5!"
- Heatmap aktivity (jako GitHub contributions)
- Porovnání s minulým týdnem/měsícem

**Soubory k vytvoření:**
- `src/components/stats/ProgressChart.jsx` - grafy
- `src/components/stats/Heatmap.jsx` - heatmap kalendář
- `src/components/stats/Milestones.jsx` - milníky
- `src/pages/Progress.jsx` - samostatná stránka pro pokrok

**Knihovny:**
- `recharts` - pro grafy
- `react-calendar-heatmap` - pro heatmap

**Features:**
- Line chart: XP v čase
- Bar chart: aktivity za týden
- Heatmap: dny kdy praktikoval
- Milestones timeline
- Comparison: tento týden vs minulý týden
- Export dat do CSV/JSON

**Design:**
- Moderní dashboard s kartami
- Barevné grafy (modrá pro XP, zelená pro písně)
- Tooltip s detaily při hover
- Responsive (na mobilu stacked layout)

---

### 13. ⏳ Audio ukázky písní
**Status:** Pending
**Priorita:** 🟡 Střední

**Popis:**
- Možnost poslechnout si, jak má píseň znít
- Zpomalené přehrávání (50%, 75%, 100%)
- Loop sekce písně
- Přehrávání s vizuálním highlightem not

**Soubory k vytvoření:**
- `src/components/audio/AudioPlayer.jsx` - audio přehrávač
- `src/components/audio/SpeedControl.jsx` - control rychlosti
- `src/utils/audioProcessor.js` - zpracování audio (tempo change)

**Databáze:**
- Přidat sloupec do `piano_songs`:
  - `audio_url` - URL k audio souboru (Supabase Storage)
  - `audio_duration` - délka v sekundách

**Features:**
- Upload audio v admin panelu
- Playback speed control (0.5x, 0.75x, 1x, 1.25x)
- Loop mode
- A-B repeat (označit sekci a opakovat)
- Waveform visualization
- Sync s notami (highlight aktuální nota)

**Knihovny:**
- `howler.js` - audio playback
- `wavesurfer.js` - waveform viz
- Web Audio API pro tempo change bez pitch change

**Design:**
- Moderní audio player pod písní
- Waveform s progress
- Speed dropdown
- Loop button

---

---

## 🔥 Priorita 4 - Nízká (Budoucí features)

### 14. ⏳ Videonávody k lekcím
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Krátká videa (1-3 min) ukazující správnou techniku
- Tipy od "učitele" nebo virtuálního asistenta
- Embedding YouTube nebo Vimeo videí
- Nebo vlastní video hosting v Supabase Storage

**Soubory k vytvoření:**
- `src/components/video/VideoPlayer.jsx` - video přehrávač
- `src/components/lessons/LessonVideo.jsx` - integrace do lekcí

**Databáze:**
- Přidat sloupec do `piano_lessons`:
  - `video_url` - URL k video souboru
  - `video_provider` - ENUM('youtube', 'vimeo', 'supabase')
  - `video_duration` - délka v sekundách

**Features:**
- Embed YouTube/Vimeo s YouTube IFrame API
- Vlastní upload video do Supabase Storage
- Video progress tracking (sledovat, kolik procent shlédli)
- Playback controls
- Fullscreen mode
- Captions/subtitles support

**Design:**
- Moderní video player
- Thumbnail preview
- Play overlay button
- Progress bar

---

### 15. ⏳ Skladatel - skládání melodií
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Možnost skládat jednoduché melodie (note by note)
- Přidávat akordy, které se k melodii hodí
- Uložit a sdílet kompozice
- Přehrát s metronomen

**Soubory k vytvoření:**
- `src/components/composer/Composer.jsx` - hlavní komponenta
- `src/components/composer/MelodyEditor.jsx` - editace melodie
- `src/components/composer/ChordSuggestions.jsx` - návrhy akordů
- `src/components/composer/Playback.jsx` - přehrávání

**Databáze:**
- `piano_compositions` - uložené skladby
- Sloupce: user_id, title, melody (JSON), chords (JSON), tempo, created_at

**Features:**
- Piano roll editor (vizuální editor not)
- Chord suggestions based on melody (AI?)
- Export to MIDI
- Share link

---

### 12. ⏳ Offline režim (PWA)
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Možnost používat apku offline
- Service Worker pro caching
- Progressive Web App (PWA) manifest
- Sync při obnovení připojení

**Implementace:**
- `public/manifest.json` - PWA manifest
- `public/sw.js` - Service Worker
- `src/utils/offline.js` - offline strategie

**Co cache-ovat:**
- Static assets (CSS, JS, fonts, images)
- API responses (kvízy, písničky, lekce)
- User progress (sync při online)

**Knihovny:**
- Workbox (Google) - pro snadnou konfiguraci SW
- localForage - IndexedDB storage

**Poznámka:** Vyžaduje HTTPS a Vite PWA plugin

---

### 13. ⏳ Vytvořit front-end komponentu pro teoretický kvíz
**Status:** Pending
**Priorita:** 🔵 Nízká (UniversalTheoryQuiz už existuje?)

**Popis:**
- Kvíz pro hraní teoretických otázek (bez klaviatury)
- Podobný ChordQuiz, ale textové otázky
- Multiple choice s 4 možnostmi

**Soubory:**
- `src/components/games/UniversalTheoryQuiz.jsx` - už existuje, ověřit funkčnost
- Přidat do `src/pages/Cviceni.jsx` jako nový typ cvičení (pokud není)

---

### 14. ⏳ Opravit duplikaci lekcí - chybějící duration column
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Při duplikaci lekcí chybí sloupec `duration`
- Přidat sloupec do databáze
- Opravit funkci duplikace v admin panelu

**Soubory k úpravě:**
- Databázová migrace pro přidání `duration` sloupce
- `src/components/lessons/LessonModal.jsx` - opravit duplikaci

---

### 15. ⏳ Vytvořit RLS policy pro piano_song_completions INSERT
**Status:** Pending
**Priorita:** 🔵 Nízká

**Popis:**
- Uživatelé nemůžou ukládat dokončení písní
- Chybí RLS policy pro INSERT operaci

**Soubory k úpravě:**
- SQL migrace v Supabase pro přidání policy

---

## 📚 Dokumentace k vytvoření

### Priorita 1: Systémová dokumentace
- [ ] `SYSTEM_ARCHITECTURE.md` - celková architektura aplikace
- [ ] `DATABASE_SCHEMA.md` - popis databázových tabulek a vztahů
- [ ] `API_ENDPOINTS.md` - popis všech Supabase dotazů a RLS policies

### Priorita 2: Vývojářská dokumentace
- [ ] `DEVELOPMENT_GUIDE.md` - návod pro vývojáře
- [ ] `COMPONENT_STRUCTURE.md` - struktura React komponent
- [ ] `STATE_MANAGEMENT.md` - popis Zustand store

### Priorita 3: Uživatelská dokumentace
- [ ] `USER_MANUAL.md` - manuál pro uživatele
- [ ] `ADMIN_MANUAL.md` - manuál pro administrátory

---

## 🎯 Best Practices & Code Quality

### Každá nová feature musí projít quality check:

**1. Funkčnost**
- ✅ Všechny features fungují podle specifikace
- ✅ Testováno na desktop i mobile
- ✅ Cross-browser kompatibilita (Chrome, Firefox, Safari)

**2. Duplicita v kódu**
- ✅ DRY princip (Don't Repeat Yourself)
- ✅ Znovupoužitelné komponenty
- ✅ Sdílené utility funkce

**3. Logy a debugy**
- ✅ Odstranit všechny `console.log()` debug zprávy
- ✅ Použít `console.error()` pouze pro kritické chyby
- ✅ Implementovat proper error handling

**4. Komentáře**
- ✅ Odstranit zakomentovaný kód
- ✅ Odstranit TODO komentáře (přesunout do MASTER_TODO)
- ✅ Ponechat jen JSDoc dokumentaci a vysvětlující komentáře

**5. Modularita**
- ✅ Každá nová komponenta musí být modulární
- ✅ Props dokumentace v JSDoc
- ✅ Použití centralizovaných konstant (RADIUS, SHADOW, BORDER)
- ✅ Konzistentní import struktura

**6. Performance**
- ✅ Lazy loading pro velké komponenty
- ✅ Memoizace pro expensive operace
- ✅ Optimalizované obrázky
- ✅ Code splitting

**7. Accessibility**
- ✅ ARIA labels pro interaktivní prvky
- ✅ Keyboard navigation
- ✅ Correct semantic HTML
- ✅ Contrast ratio (WCAG AA)

**8. Security**
- ✅ RLS policies v Supabase
- ✅ Input validation
- ✅ XSS protection
- ✅ CSRF tokens (pokud potřeba)

---

## 🐛 Známé problémy (Backlog)

1. **Historie aktivit** - chybějící sloupec user_id
2. **Song completions RLS** - chybějící policy pro INSERT
3. **Lesson duplication** - chybějící duration column

---

## 🎯 Budoucí vylepšení (Icebox)

1. **MIDI podpora** - přehrávání pomocí MIDI klávesnice
2. **Audio nahrávání** - nahrávání vlastního hraní
3. **Multiplayer režim** - hraní s přáteli
4. **Export/Import** - zálohování pokroku uživatele
5. **Responsivita audit** - kompletní audit mobile UX
6. **Unit testy** - Jest + React Testing Library
7. **E2E testy** - Playwright nebo Cypress
8. **SEO optimalizace** - meta tags, sitemap, robots.txt
9. **Analytics** - Google Analytics nebo Plausible
10. **Performance monitoring** - Sentry nebo LogRocket

---

## ✅ Nedávno dokončené úkoly

### Refaktoring Help dokumentace - Modularizace nápovědy (29.11.2025)
**Dokončeno:** ✅
**Popis:** Sjednocení help systému napříč aplikací, odstranění duplicitní accordion nápovědy z NoteComposer

**Změny:**
- ✅ **Přidání modularní help nápovědy do SongLibrary:**
  - Import a použití HelpButton + HelpPanel komponent
  - Nový state `showNoteFormatHelp`
  - Help umístěný pod pole "Název písně" v obou formulářích (new song + edit song)
  - Znovu použitá komponenta NoteFormatHelpContent s novým HelpPanel systémem

- ✅ **Odstranění staré accordion nápovědy z NoteComposer:**
  - Odstranění celé sekce s ikonou knihy 📖 (251 řádků kódu)
  - Vyčištěné unused importy (BookOpen, ChevronUp, ChevronDown, AnimatePresence)
  - Vyčištěný unused state (showHelp)
  - NoteComposer je nyní jednodušší a má jen jednu odpovědnost (interaktivní zadávání not)

**Soubory:**
- `src/components/resources/SongLibrary.jsx` (+32 řádků)
- `src/components/resources/NoteComposer.jsx` (-255 řádků)
- Net změna: -223 řádků kódu

**Benefity:**
- Konzistentní help systém (ikona ❓) v celé aplikaci
- Lepší UX - nápověda přímo u pole, kde se zadávají noty
- Menší bundle size
- Snadnější údržba

**Dokumentace:**
- `SESSION_CONTEXT-20251129.md`
- `DOKUMENTACE-20251129.md`

---

### Database Integration - Quiz Results & Leaderboards (29.11.2025 odpoledne)
**Dokončeno:** ✅
**Popis:** Migrace z localStorage na Supabase pro statistiky kvízů a žebříčky

**Změny:**
- ✅ **Vytvoření utility funkce saveQuizResults.js:**
  - Centralizovaná logika pro ukládání výsledků kvízů
  - Insert do piano_quiz_scores (user_id, quiz_type, score, total_questions, streak)
  - Update/insert piano_user_stats (total_xp, level, current_streak, best_streak)
  - Automatický výpočet levelu podle XP (Level 1-5, thresholdy: 100, 250, 500, 1000)
  - Error handling s graceful degradation

- ✅ **Aktualizace ChordQuiz pro ukládání výsledků:**
  - Import a použití saveQuizResults()
  - Předání parametrů: 'chord_quiz', score, totalQuestions, bestStreak, xpEarned
  - Odstranění závislosti na piano_quiz_completions tabulce
  - Konzistentní error handling

- ✅ **Aktualizace UniversalTheoryQuiz:**
  - Zachování detailního trackingu jednotlivých otázek (completionsTable)
  - Přidání agregovaného ukládání pro žebříčky (saveQuizResults)
  - Quiz type: `theory_${quizType}` (např. theory_interval, theory_scale)
  - Dual-mode: detailní analýza + celkové statistiky

- ✅ **SQL migrace pro XP bonusy:**
  - Soubor: `supabase/migrations/002_add_quiz_xp_bonuses.sql`
  - 4 nové záznamy v piano_rewards_config:
    - quiz_perfect (100 XP) - 100% správně
    - quiz_excellent (75 XP) - 80%+ správně
    - quiz_good (50 XP) - 70%+ správně
    - quiz_decent (25 XP) - 50%+ správně
  - ON CONFLICT handling pro opakované migrace

- ✅ **Integrace s GamificationManager:**
  - Import useQuizXPStore (loadQuizBonuses, saveQuizBonuses, error handling)
  - Temporary state pattern (tempQuizBonuses) pro editaci před save
  - 4 input fields s color-coded borders (zelená, oranžová, modrá, fialová)
  - Save button s loading state a success/error notifikacemi
  - Admin může upravit XP hodnoty pro všechny výkonnostní úrovně

**Soubory:**
- `src/utils/saveQuizResults.js` (+119 řádků, nový soubor)
- `src/components/games/ChordQuiz.jsx` (~30 řádků změněno)
- `src/components/games/UniversalTheoryQuiz.jsx` (~60 řádků změněno)
- `src/components/admin/GamificationManager.jsx` (+170 řádků)
- `supabase/migrations/002_add_quiz_xp_bonuses.sql` (+23 řádků, nový soubor)
- Net změna: +402 řádků kódu

**Výsledky:**
✅ Žebříčky napříč uživateli fungují (TOP 50 podle total_xp)
✅ Perzistentní statistiky v databázi s RLS policies
✅ Admin kontrola XP bonusů (configurable rewards)
✅ Odstranění localStorage pro quiz data
✅ Automatický výpočet levelů a streaks
✅ Konzistentní data flow: Quiz → saveQuizResults → piano_quiz_scores + piano_user_stats

**Dokumentace:**
- `DOKUMENTACE-20251129.md` (přidáno +439 řádků s kompletním popisem implementace)

**Git:**
- Branch: `feature/database-quiz-integration-20251129`
- Commit: `5c59136`
- Pushnuto do: main + feature branch
- PR: https://github.com/username/piano/pull/XX

**Testování:**
- ✅ ChordQuiz ukládá výsledky do databáze
- ✅ UniversalTheoryQuiz ukládá výsledky + detail tracking
- ✅ piano_user_stats se správně aktualizuje (XP, level, streak)
- ✅ Žebříček v Admin → Gamifikace zobrazuje data
- ✅ XP bonusy lze editovat v admin panelu
- ✅ localStorage neobsahuje žádná quiz data

---

### Modularizace UI + Unifikace fontů + Migrace not na mezery (26.11.2025)
**Dokončeno:** ✅
**Popis:** Kompletní modularizace UI komponent v SongLibrary, unifikace fontů (Google Fonts), změna separátoru not z podtržítek na mezery

**Změny:**
- ✅ **Modularizace SongLibrary:**
  - Import a použití Chip, ActionButtonGroup, SaveButton, CancelButton z ButtonComponents
  - Nový Chip variant "info" pro metadata (tónina, tempo)
  - Odstranění hardcoded komponent a duplikátního kódu

- ✅ **Odstranění sekce Písničky z Admin panelu:**
  - Admin rozhraní pro písničky je nyní pouze v sekci Písničky
  - Cleanup Admin.jsx - odstranění SongLibrary, songCategories, activeCategory
  - Admin menu nyní: Přehled, Uživatelé, Gamifikace, Odměny, Kvízy

- ✅ **Unifikace fontů - Google Fonts (Lato + Roboto):**
  - Import Lato (300, 400, 700) a Roboto (400, 500, 700) do index.css
  - Body: 'Lato', sans-serif
  - Nadpisy: 'Roboto', sans-serif
  - Override browser defaults: input, textarea, select, button, code, pre → font-family: inherit
  - Odstranění všech inline fontFamily deklarací z celé aplikace
  - Soubory: SongLibrary.jsx, NoteComposer.jsx, AchievementManager.jsx, FormComponents.jsx

- ✅ **Migrace notového zápisu: Podtržítka → Mezery:**

  **Kód:**
  - SongLibrary.jsx: `split('_')` → `split(/\s+/)`, placeholders s mezerami
  - NoteComposer.jsx: `_` → mezera v přidávání not, pauz, nových řádků
  - LessonList.jsx + LessonCard.jsx: `join(', ')` → `join(' ')`, čárky → mezery
  - Aktualizace help tabulky v NoteComposer (oddělovač: _ → mezera)

  **Databáze:**
  - Piano songs: SQL UPDATE `REPLACE(notes, '_', ' ')` - migrace proběhla ✅
  - Piano lessons: Migrace nebyla potřeba (JSON pole zůstává stejné)

  **Výsledek:**
  - Písničky: `"D D E - F | G A H"` (string s mezerami)
  - Lekce: `["C", "D", "E"]` (JSON pole, UI s mezerami)

**Soubory:**
- `src/components/resources/SongLibrary.jsx`
- `src/components/resources/NoteComposer.jsx`
- `src/components/lessons/LessonList.jsx`
- `src/components/lessons/LessonCard.jsx`
- `src/pages/Admin.jsx`
- `src/components/admin/AchievementManager.jsx`
- `src/components/ui/FormComponents.jsx`
- `src/components/ui/ButtonComponents.jsx` (nový variant: info)
- `src/styles/index.css`
- `migrate-notes-to-spaces.js` (nový skript)
- Dokumentace: `DOKUMENTACE-20251126.md`

**Benefity:**
- Konzistentní UI napříč aplikací (modularizace)
- Jednotný font systém (Lato + Roboto) - žádný monospace
- Intuitivnější notový zápis (mezery místo podtržítek)
- Snadnější údržba díky modularizaci

---

### Optimalizace Cvičení + PianoKeyboard vylepšení (25.11.2025 večer)
**Dokončeno:** ✅
**Popis:** Optimalizace stránky Cvičení pro mobil, vylepšení klaviatury a aplikace modulárního designu

**Změny:**
- ✅ **Optimalizace stránky Cvičení:**
  - Nahrazeny velké navigační tlačítka IconButtons (ChevronLeft, ChevronRight)
  - Odstraněn text "Zahrajte postupně tyto tóny:"
  - Přidán filtr `quiz_type = 'chord'` pro správné zobrazení cvičení
  - Aplikovány modulární konstanty (RADIUS.md, RADIUS.lg, RADIUS.sm, SHADOW.lg)

- ✅ **PianoKeyboard vylepšení:**
  - Puntíky přesunuty dolů (bottom: 10px/15px)
  - Text not umístěn 15px nad puntíky
  - Sjednoceny barvy na `var(--color-secondary)` (#2d5b78)
  - Konzistentní glow efekty (opacity 0.7 pro klávesy, 0.8 pro puntíky)
  - Border na klávesách zmenšen z 3px na 2px
  - Vnitřní stíny na puntících (bílé: světlý, černé: tmavší)
  - Svislá čára 1px místo 3px, zIndex 10

- ✅ **CSS optimalizace:**
  - Přidáno `overflow-y: scroll` na html pro konzistentní scrollbar

- ✅ **Modulární design aplikace:**
  - Klaviatura: `var(--radius-xl)`, `var(--shadow-lg)`
  - Nahrazeny deprecated `var(--radius)` za specifické hodnoty
  - Použity konstanty z `styleConstants.js`

**Soubory:**
- `src/pages/Cviceni.jsx`
- `src/components/lessons/PianoKeyboard.jsx`
- `src/styles/index.css`
- Dokumentace: `SESSION_CONTEXT-20251125.md`

**Výsledek:**
- Stránka Cvičení se vejde na jednu obrazovku i na mobilech
- Vizuálně konzistentnější a elegantnější vzhled
- Lepší viditelnost zvýraznění díky vnitřním stínům

---

### Modularizace UI komponent + Fix ChordQuiz (25.11.2025)
**Dokončeno:** ✅
**Popis:** Rozdělení TabButtons do modulárních souborů a oprava automatického generování možností v ChordQuiz

**Změny:**
- ✅ **Modularizace UI komponent:**
  - `ButtonComponents.jsx` - Chip, ActionButton, AddButton, IconButton atd.
  - `CardComponents.jsx` - PageCard, QuestionCard
  - `FormComponents.jsx` - FormInput, FormSelect, FormSection atd.
  - `PageSection.jsx` - Komplexní layout komponenta s menu strukturou
  - `TabButtons.jsx` - Centrální export hub pro všechny UI komponenty

- ✅ **Fix ChordQuiz - Automatické generování možností:**
  - Odstranění JOIN na `piano_quiz_chord_options`
  - Možnosti se generují automaticky z názvů akordů (1 správná + 3 náhodné)
  - Přidána `shuffleArray()` helper funkce
  - Teoretické možnosti se již nezobrazují v poslechovém kvízu

- ✅ **QuizManager refactoring:**
  - Oddělení chord/theory options
  - Odstranění manuálních input fieldů pro chord možnosti
  - Informační text o automatickém generování
  - Save logika rozlišuje mezi chord a theory záznamy

- ✅ **Archivace:**
  - `ChordManager.jsx` → `ChordManager.jsx.backup`
  - QuizManager je nyní jediný univerzální správce všech kvízů

**Soubory:**
- Branch: `refactor/split-tabbuttons-module`
- Commit: `e6195e7`
- Dokumentace: `DOKUMENTACE-20251125.md`
- 19 souborů změněno (+1962, -1294 řádků)

---

### Univerzální struktura kvízů (22.11.2025)
**Dokončeno:** ✅
**Popis:** Rozšíření kvízové struktury pro podporu více typů kvízů

**Změny:**
- ✅ SQL migrace: `supabase_migration_universal_quiz.sql`
  - Přidán sloupec `quiz_type` (chord, theory, rhythm, interval, scale, mixed)
  - Přidán sloupec `category` pro kategorizaci
  - Sloupec `notes` je nyní volitelný (NULL pro ne-akordové kvízy)
  - Vytvořeny VIEW pohledy pro každý typ kvízu

- ✅ `src/components/admin/ChordManager.jsx` - rozšířeno na univerzální správu
  - Záložky pro 6 typů kvízů: Akordy, Teorie, Intervaly, Stupnice, Rytmus, Mix
  - Filtrování podle typu kvízu
  - Dynamický formulář (input pro akordy, textarea pro teorii)
  - Pole kategorie pro teoretické otázky

**Soubory:**
- `supabase_migration_universal_quiz.sql`
- `src/components/admin/ChordManager.jsx`

---

### Oprava pořadí not v akordu (21.11.2025)
**Dokončeno:** ✅
**Popis:** Noty v akordu se nyní zobrazují a přehrávají podle pořadí na klaviatuře (zleva doprava)

**Změny:**
- ✅ `src/utils/noteUtils.js` - přidána funkce `sortNotesByKeyboard()`
  - KEYBOARD_ORDER pole s notami od A. po E''
  - Seřazení podle pozice na klaviatuře

- ✅ `src/components/games/ChordQuiz.jsx` - seřazení před přehráním
- ✅ `src/pages/Cviceni.jsx` - odstranění špatné transformace
- ✅ `src/components/admin/ChordManager.jsx` - seřazení při zobrazení i ukládání

**Soubory:**
- `src/utils/noteUtils.js`
- `src/components/games/ChordQuiz.jsx`
- `src/pages/Cviceni.jsx`
- `src/components/admin/ChordManager.jsx`

---

### Vizuální zvýraznění černých kláves (21.11.2025)
**Dokončeno:** ✅
**Popis:** Přidána svislá čára od indikátoru dolů pro lepší orientaci

**Změny:**
- ✅ `src/components/lessons/PianoKeyboard.jsx`
  - Přidán motion.div s čarou pod kolečkem
  - Responsivní výška čáry (34/56/78px)
  - Animace s delay 0.15s

**Soubory:**
- `src/components/lessons/PianoKeyboard.jsx`

---

### Refaktoring HarmonizationTemplates + PlayButton (30.11.2025)
**Dokončeno:** ✅
**Popis:** Kompletní modularizace Šablon harmonizace a vytvoření univerzálního PlayButton

**Změny:**
- ✅ **HarmonizationTemplates.jsx - 100% modulární:**
  - Nahrazeny všechny hardcoded komponenty modulárními
  - AddButton, FormInput, FormSelect, FormTextarea
  - SaveButton, CancelButton, ActionButtonGroup
  - Chip pro obtížnost, PlayButton pro přehrávání
  - Úspora: 774 → 598 řádků (-176, -22.7%)
  - 0 inline fontSize/fontFamily stylů

- ✅ **Nový PlayButton komponent:**
  - Modulární play button pro celou aplikaci
  - Variant system: 'pause' (Play/Pause) vs 'volume' (Play/Volume2)
  - Design z SongLibrary: modrý/růžový gradient, backdrop blur
  - Velikost 44px (sjednoceno s AddButton)
  - Border radius: RADIUS.lg (16px)

- ✅ **Implementace PlayButton:**
  - SongLibrary: variant="pause" (melodie lze pausnout)
  - HarmonizationTemplates: variant="volume" (kadence bez pauzy)
  - Odstranění inline motion.button

- ✅ **Optimalizace design systému:**
  - AddButton: borderRadius '17px' → RADIUS.lg
  - Sjednocení velikostí tlačítek na 44px
  - Konzistentní použití RADIUS, SHADOW, BORDER

- ✅ **Bug fix:**
  - Eye/EyeOff toggle v HarmonizationTemplates měl chybějící onClick handler
  - Přidán toggleTemplate(template.id)

**Soubory:**
- `src/components/resources/HarmonizationTemplates.jsx` (774 → 598 řádků)
- `src/components/ui/ButtonComponents.jsx` (+64 řádků - PlayButton)
- `src/components/resources/SongLibrary.jsx` (nahrazen inline button)
- Dokumentace: `DOKUMENTACE-20251130.md`

**Výsledek:**
- 100% modulární architektura v HarmonizationTemplates
- Reusable PlayButton pro celou aplikaci
- Konzistentní design napříč SongLibrary a HarmonizationTemplates
- Lepší UX díky variant systému (pause vs volume ikony)

---

### Migrace User ID (20.11.2025)
**Dokončeno:** ✅
**Popis:** Synchronizace User ID mezi Supabase Auth a piano_users tabulkou

**Problém:**
- User měl rozdílné ID v auth.users a piano_users
- RLS policies blokovaly operace kvůli neshode ID

**Řešení:**
- SQL migrace s kaskádovým přepsáním všech FK
- Zachování všech dat (stats, progress, achievements)

**Soubory:**
- SQL migrace v Supabase

---

## 📊 Statistiky projektu

- **Počet komponent:** ~50+
- **Počet DB tabulek:** ~20+
- **Počet migrací:** 6+
- **Řádků kódu:** ~18,000+
- **UI modulárních komponent:** 4 (ButtonComponents, CardComponents, FormComponents, PageSection)

---

## 🔗 Užitečné odkazy

- [Supabase Dashboard](https://supabase.com)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Documentation](https://react.dev)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Lucide Icons](https://lucide.dev)
- [DnD Kit](https://dndkit.com) - Drag & Drop
- [Workbox](https://developers.google.com/web/tools/workbox) - PWA

---

**Poznámky:**
- Tento soubor by měl být aktualizován při každé větší změně
- Udržujte ho synchronizovaný s aktuálním stavem projektu
- Pro detailní changelog viz `CHANGELOG.md`
- Každá nová feature musí projít quality check (funkčnost, duplicita, logy, komentáře)
- Vše dělat modulárně a znovupoužitelně
