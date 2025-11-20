import { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, BookOpen, Piano, Edit3, Save, X, Plus, GripVertical, Copy, Trash2, Upload, Volume2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
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
import audioEngine from '../../utils/audio';
import PianoKeyboard from '../lessons/PianoKeyboard';
import NoteComposer from './NoteComposer';
import useSongStore from '../../store/useSongStore';
import useUserStore from '../../store/useUserStore';
import { supabase } from '../../lib/supabase';

// Sortable Song Wrapper Component
function SortableSongCard({ song, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: song.id });

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

function SongLibrary() {
  const [playingSong, setPlayingSong] = useState(null);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [showKeyboard, setShowKeyboard] = useState(null);
  const [editingSong, setEditingSong] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [userPlaybackMode, setUserPlaybackMode] = useState({}); // {songId: 'notes'|'audio'|'both'}
  const [newSongForm, setNewSongForm] = useState({
    title: '',
    notes: '',
    lyrics: '',
    difficulty: 'začátečník',
    tempo: '',
    key: '',
    tips: '',
    audioUrl: ''
  });
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [expandedSongs, setExpandedSongs] = useState({}); // State pro accordion
  const playingRef = useRef(false);
  const audioRef = useRef(null);

  const songs = useSongStore((state) => state.songs);
  const fetchSongs = useSongStore((state) => state.fetchSongs);
  const updateSong = useSongStore((state) => state.updateSong);
  const addSong = useSongStore((state) => state.addSong);
  const duplicateSong = useSongStore((state) => state.duplicateSong);
  const deleteSong = useSongStore((state) => state.deleteSong);
  const reorderSongs = useSongStore((state) => state.reorderSongs);
  const currentUser = useUserStore((state) => state.currentUser);

  // Načíst písničky při prvním načtení komponenty
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Admin je uživatel s is_admin === true
  const isAdmin = currentUser?.is_admin === true;

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
      const oldIndex = songs.findIndex((song) => song.id === active.id);
      const newIndex = songs.findIndex((song) => song.id === over.id);
      const newOrder = arrayMove(songs, oldIndex, newIndex);
      reorderSongs(newOrder);
    }
  };

  const playMelody = async (song) => {
    if (playingRef.current && playingSong === song.id) {
      playingRef.current = false;
      setPlayingSong(null);
      setCurrentNoteIndex(-1);
      // Zastavit audio pokud hraje
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    playingRef.current = true;
    setPlayingSong(song.id);
    setCurrentNoteIndex(-1);

    // Použít preference uživatele, nebo výchozí 'notes'
    const playbackMode = userPlaybackMode[song.id] || 'notes';

    // Pokud má píseň audio a režim je 'audio' nebo 'both'
    if (song.audioUrl && (playbackMode === 'audio' || playbackMode === 'both')) {
      try {
        audioRef.current = new Audio(song.audioUrl);
        audioRef.current.onended = () => {
          playingRef.current = false;
          setPlayingSong(null);
          setCurrentNoteIndex(-1);
        };
        await audioRef.current.play();

        // Pokud je režim 'audio', skončit zde (nepřehrávat tóny)
        if (playbackMode === 'audio') {
          return;
        }
        // Pokud je 'both', pokračovat s přehráváním tónů
      } catch (error) {
        console.error('Error playing audio:', error);
        // Pokračovat se syntetizací pokud audio selže
      }
    }

    // Rozdělit melodii podle podtržítek (oddělovače)
    // notes může být buď pole nebo string
    let melodieString;
    if (Array.isArray(song.notes)) {
      melodieString = song.notes.join(' '); // Spojit mezerou místo čárkou
    } else {
      melodieString = song.notes;
    }

    // Odstranit znaky nového řádku a roury (oddělovače řádků) - jen přeskočit
    melodieString = melodieString.replace(/\|/g, '_').replace(/\n/g, '_');

    const elements = melodieString.split('_'); // Split podle podtržítka

    // Multiplikátor tempa podle označení (definovat jednou před smyčkou)
    const tempoMultipliers = {
      'Largo': 1.8,        // velmi pomalé (40-60 BPM)
      'Adagio': 1.5,       // pomalé (66-76 BPM)
      'Andante': 1.3,      // klidné (76-108 BPM)
      'Moderato': 1.0,     // střední (108-120 BPM) - výchozí
      'Allegro': 0.8,      // rychlé (120-156 BPM)
      'Presto': 0.6        // velmi rychlé (168-200 BPM)
    };

    const tempoMultiplier = tempoMultipliers[song.tempo] || 1.0;

    for (let i = 0; i < elements.length; i++) {
      if (!playingRef.current) break;

      let element = elements[i].trim();
      if (!element) continue;

      // Ignorovat text (slova bez notového formátu) - například text v závorkách nebo běžná slova
      // Text se pozná podle toho, že obsahuje více než 2 malá písmena za sebou nebo speciální znaky
      if (/[a-zčďěňřšťůžá]{3,}/.test(element.toLowerCase()) && !/^[a-h]+\.?'?$/.test(element.toLowerCase())) {
        continue; // Přeskočit text
      }

      // Detekovat pauzy (samotné pomlčky)
      // - = krátká pauza
      // -- = střední pauza
      // --- = dlouhá pauza
      // ---- = extra dlouhá pauza
      const dashMatch = element.match(/^-+$/);
      if (dashMatch) {
        const dashCount = element.length;
        if (dashCount === 1) {
          // Krátká pauza (200ms) * tempo
          await new Promise(resolve => setTimeout(resolve, 200 * tempoMultiplier));
        } else if (dashCount === 2) {
          // Střední pauza (400ms) * tempo
          await new Promise(resolve => setTimeout(resolve, 400 * tempoMultiplier));
        } else if (dashCount === 3) {
          // Dlouhá pauza (800ms) * tempo
          await new Promise(resolve => setTimeout(resolve, 800 * tempoMultiplier));
        } else if (dashCount >= 4) {
          // Extra dlouhá pauza (1200ms) * tempo
          await new Promise(resolve => setTimeout(resolve, 1200 * tempoMultiplier));
        }
        continue;
      }

      // Analyzovat notu
      // Formát: dd, d, D, Dd, DD, DDD, DDDD (+ is/es na konci + ' pro vyšší oktávu + . pro nižší oktávu)

      // Extrahovat oktávu (apostrof nebo tečka na konci)
      let octaveModifier = '';
      if (element.endsWith("'")) {
        octaveModifier = "'";
        element = element.slice(0, -1);
      } else if (element.endsWith('.')) {
        octaveModifier = '.';
        element = element.slice(0, -1);
      }

      // Extrahovat suffix (is nebo es)
      let suffix = '';
      if (element.toLowerCase().endsWith('is')) {
        suffix = 'is';
        element = element.slice(0, -2);
      } else if (element.toLowerCase().endsWith('es')) {
        suffix = 'es';
        element = element.slice(0, -2);
      }

      if (!element) continue;

      // Rozpoznat typ noty podle vzoru
      let noteType = '';
      let baseNoteLetter = '';

      // dd = šestnáctinová
      if (/^[a-h][a-h]$/.test(element)) {
        noteType = 'sixteenth';
        baseNoteLetter = element[0].toUpperCase();
      }
      // d = osminová
      else if (/^[a-h]$/.test(element)) {
        noteType = 'eighth';
        baseNoteLetter = element.toUpperCase();
      }
      // Dd = čtvrtinová s tečkou
      else if (/^[A-H][a-h]$/.test(element)) {
        noteType = 'quarter-dotted';
        baseNoteLetter = element[0];
      }
      // D = čtvrtinová
      else if (/^[A-H]$/.test(element)) {
        noteType = 'quarter';
        baseNoteLetter = element;
      }
      // DD = půlová
      else if (/^[A-H][A-H]$/.test(element)) {
        noteType = 'half';
        baseNoteLetter = element[0];
      }
      // DDD = půlová s tečkou
      else if (/^[A-H][A-H][A-H]$/.test(element)) {
        noteType = 'half-dotted';
        baseNoteLetter = element[0];
      }
      // DDDD = celá
      else if (/^[A-H][A-H][A-H][A-H]$/.test(element)) {
        noteType = 'whole';
        baseNoteLetter = element[0];
      }
      else {
        continue; // Nerozpoznaný formát
      }

      // Sestavit název noty s křížkem/béčkem a oktávou
      let noteName = baseNoteLetter;
      if (suffix === 'is') {
        noteName += '#';
      } else if (suffix === 'es') {
        noteName += 'b';
      }
      if (octaveModifier === "'") {
        noteName += "'";
      } else if (octaveModifier === '.') {
        noteName += '.';
      }

      // Základní délky v sekundách a čekací časy (pro Moderato)
      const baseDurations = {
        'sixteenth': { play: 0.08, wait: 100 },
        'eighth': { play: 0.15, wait: 180 },
        'quarter': { play: 0.3, wait: 350 },
        'quarter-dotted': { play: 0.45, wait: 500 },
        'half': { play: 0.6, wait: 650 },
        'half-dotted': { play: 0.9, wait: 950 },
        'whole': { play: 1.2, wait: 1250 }
      };

      // Aplikovat multiplikátor tempa
      const baseTiming = baseDurations[noteType] || baseDurations['quarter'];
      const timing = {
        play: baseTiming.play * tempoMultiplier,
        wait: baseTiming.wait * tempoMultiplier
      };

      setCurrentNoteIndex(i); // Zvýraznit aktuální tón
      audioEngine.playNote(noteName, timing.play);
      await new Promise(resolve => setTimeout(resolve, timing.wait));
    }

    playingRef.current = false;
    setPlayingSong(null);
    setCurrentNoteIndex(-1);
  };

  const toggleSongExpansion = (songId) => {
    setExpandedSongs(prev => ({
      ...prev,
      [songId]: !prev[songId]
    }));
  };

  const toggleKeyboard = (songId) => {
    setShowKeyboard(showKeyboard === songId ? null : songId);
  };

  const startEditing = (song) => {
    setEditingSong(song.id);
    setAudioFile(null);
    // Pokud je notes pole, spojíme ho mezerou
    const notesString = Array.isArray(song.notes) ? song.notes.join(' ') : song.notes;
    setEditForm({
      title: song.title,
      notes: notesString,
      lyrics: song.lyrics || '',
      difficulty: song.difficulty,
      tempo: song.tempo,
      key: song.key,
      tips: song.tips,
      audioUrl: song.audioUrl || ''
    });
  };

  const handleDeleteSong = (songId) => {
    if (confirm('Opravdu chcete smazat tuto písničku?')) {
      deleteSong(songId);
    }
  };

  const saveEdit = async () => {
    let audioUrl = editForm.audioUrl;

    // Pokud je vybrán nový audio soubor, nahrát ho
    if (audioFile) {
      audioUrl = await handleAudioUpload(audioFile);
      if (!audioUrl) return; // Upload selhal
    }

    // Uložit notes jako string (ne jako pole)
    updateSong(editingSong, {
      title: editForm.title,
      notes: editForm.notes, // Uložit přímo jako string
      lyrics: editForm.lyrics,
      difficulty: editForm.difficulty,
      tempo: editForm.tempo,
      key: editForm.key,
      tips: editForm.tips,
      audioUrl: audioUrl || ''
    });

    setEditingSong(null);
    setEditForm({});
    setAudioFile(null);
  };

  const cancelEdit = () => {
    setEditingSong(null);
    setEditForm({});
  };

  const handleAudioUpload = async (file) => {
    if (!file) return null;

    setUploadingAudio(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `song-audio/${fileName}`;

      // Upload soubor do Supabase Storage
      const { data, error } = await supabase.storage
        .from('piano-assets')
        .upload(filePath, file);

      if (error) throw error;

      // Získat veřejnou URL
      const { data: urlData } = supabase.storage
        .from('piano-assets')
        .getPublicUrl(filePath);

      setUploadingAudio(false);
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      alert('Chyba při nahrávání audio souboru: ' + error.message);
      setUploadingAudio(false);
      return null;
    }
  };

  const handleDeleteAudio = async (audioUrl) => {
    if (!audioUrl) return;

    if (!confirm('Opravdu chcete smazat audio soubor?')) return;

    try {
      // Extrahovat cestu ze URL
      const urlParts = audioUrl.split('/');
      const filePath = `song-audio/${urlParts[urlParts.length - 1]}`;

      // Smazat ze Storage
      const { error } = await supabase.storage
        .from('piano-assets')
        .remove([filePath]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting audio:', error);
      alert('Chyba při mazání audio souboru: ' + error.message);
      return false;
    }
  };

  const previewAudio = (audioUrl) => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audio.play();
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewSongChange = (field, value) => {
    setNewSongForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setAudioFile(null);
    setNewSongForm({
      title: '',
      notes: '',
      lyrics: '',
      difficulty: 'začátečník',
      tempo: '',
      key: '',
      tips: '',
      audioUrl: ''
    });
  };

  const saveNewSong = async () => {
    if (!newSongForm.title || !newSongForm.notes.trim()) {
      alert('Vyplňte alespoň název a noty');
      return;
    }

    let audioUrl = newSongForm.audioUrl;

    // Pokud je vybrán nový audio soubor, nahrát ho
    if (audioFile) {
      audioUrl = await handleAudioUpload(audioFile);
      if (!audioUrl) return; // Upload selhal
    }

    addSong({
      title: newSongForm.title,
      notes: newSongForm.notes, // Uložit přímo jako string
      lyrics: newSongForm.lyrics,
      difficulty: newSongForm.difficulty,
      tempo: newSongForm.tempo,
      key: newSongForm.key,
      tips: newSongForm.tips,
      audioUrl: audioUrl || ''
    });

    setIsAddingNew(false);
  };

  const cancelAddingNew = () => {
    setIsAddingNew(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'začátečník':
        return 'badge-success';
      case 'mírně pokročilý':
        return 'badge-warning';
      default:
        return '';
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
          <Music size={24} color="var(--color-primary)" />
        </div>
        Playlist lidových písní
      </h2>
      <p style={{ marginBottom: '2rem', color: '#64748b', fontSize: '1rem' }}>
        Procvičte si harmonizaci na těchto oblíbených lidových písních
      </p>

      {/* Tlačítko pro přidání nové písně (pouze pro adminy) */}
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
          Přidat novou písničku
        </motion.button>
      )}

      {/* Formulář pro přidání nové písně */}
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
              Nová písnička
            </h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Název písně
              </label>
              <input
                type="text"
                className="form-input"
                value={newSongForm.title}
                onChange={(e) => handleNewSongChange('title', e.target.value)}
                placeholder="Zadejte název písně"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Noty (klikni na klavír nebo zadej ručně)
              </label>

              {/* Textové pole pro zobrazení a ruční úpravu - NAD klaviaturou */}
              <textarea
                className="form-input"
                value={newSongForm.notes}
                onChange={(e) => handleNewSongChange('notes', e.target.value)}
                placeholder="D_D_E_-_F_|_G_A_H"
                rows={3}
                style={{
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  marginBottom: '0.5rem'
                }}
              />

              {/* NoteComposer - interaktivní klavír pro snadný zápis - POD textovým polem */}
              <NoteComposer
                value={newSongForm.notes}
                onChange={(value) => handleNewSongChange('notes', value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Text písničky (lyrics)
              </label>
              <textarea
                className="form-input"
                value={newSongForm.lyrics}
                onChange={(e) => handleNewSongChange('lyrics', e.target.value)}
                placeholder="Napište text písničky, každý verš na nový řádek..."
                rows={6}
                style={{ fontSize: '0.875rem' }}
              />
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Každý verš napište na nový řádek (Enter). Text se zobrazí uživatelům.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Obtížnost
                </label>
                <select
                  className="form-input"
                  value={newSongForm.difficulty}
                  onChange={(e) => handleNewSongChange('difficulty', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="začátečník">začátečník</option>
                  <option value="mírně pokročilý">mírně pokročilý</option>
                  <option value="pokročilý">pokročilý</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Tempo
                </label>
                <select
                  className="form-input"
                  value={newSongForm.tempo}
                  onChange={(e) => handleNewSongChange('tempo', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="">Vyberte tempo...</option>
                  <option value="Largo">Largo (velmi pomalé)</option>
                  <option value="Adagio">Adagio (pomalé)</option>
                  <option value="Andante">Andante (klidné)</option>
                  <option value="Moderato">Moderato (střední)</option>
                  <option value="Allegro">Allegro (rychlé)</option>
                  <option value="Presto">Presto (velmi rychlé)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                  Tónina
                </label>
                <select
                  className="form-input"
                  value={newSongForm.key}
                  onChange={(e) => handleNewSongChange('key', e.target.value)}
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="">Vyberte tóninu...</option>
                  <optgroup label="Durové tóniny">
                    <option value="C dur">C dur</option>
                    <option value="G dur">G dur</option>
                    <option value="D dur">D dur</option>
                    <option value="A dur">A dur</option>
                    <option value="E dur">E dur</option>
                    <option value="F dur">F dur</option>
                    <option value="B dur">B dur</option>
                    <option value="Es dur">Es dur</option>
                    <option value="As dur">As dur</option>
                  </optgroup>
                  <optgroup label="Mollové tóniny">
                    <option value="a moll">a moll</option>
                    <option value="e moll">e moll</option>
                    <option value="h moll">h moll</option>
                    <option value="fis moll">fis moll</option>
                    <option value="d moll">d moll</option>
                    <option value="g moll">g moll</option>
                    <option value="c moll">c moll</option>
                    <option value="f moll">f moll</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                Tip pro harmonizaci
              </label>
              <textarea
                className="form-input"
                value={newSongForm.tips}
                onChange={(e) => handleNewSongChange('tips', e.target.value)}
                rows={2}
                placeholder="Zadejte užitečné tipy pro harmonizaci této písně"
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Upload size={16} />
                Audio soubor (volitelné)
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
                style={{
                  fontSize: '0.875rem',
                  padding: '0.5rem',
                  border: '1px solid rgba(181, 31, 101, 0.3)',
                  borderRadius: 'var(--radius)',
                  width: '100%'
                }}
              />
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                Nahrajte audio soubor (MP3, WAV, OGG...)
              </div>
              {uploadingAudio && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                  Nahrávám audio soubor...
                </div>
              )}
              {audioFile && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>
                  ✓ Vybrán: {audioFile.name}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={saveNewSong}
                className="btn btn-primary"
                style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
              >
                <Save size={16} />
                Přidat písničku
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={songs.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ display: 'grid', gap: '1rem' }}>
            {songs.map((song, index) => (
              <SortableSongCard key={song.id} song={song}>
                {(dragAttributes, dragListeners) => (
                  <motion.div
                    className="card"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      y: -4,
                      boxShadow: '0 12px 40px rgba(181, 31, 101, 0.25)'
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: 'blur(40px)',
                      WebkitBackdropFilter: 'blur(40px)',
                      border: '2px solid rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)'
                    }}
                  >
                    <div className="song-card-wrapper">
                      <div className="song-card-controls">
                        {/* Drag Handle (pouze pro adminy) */}
                        {isAdmin && (
                          <div
                            {...dragAttributes}
                            {...dragListeners}
                            className="drag-handle"
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                          >
                            <GripVertical className="grip-icon" />
                          </div>
                        )}

                        {/* Play Button */}
                        <motion.button
                          className={`play-button ${playingSong === song.id ? 'playing' : ''}`}
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => playMelody(song)}
                        >
                          {playingSong === song.id ? (
                            <Pause className="play-icon" color="#ffffff" />
                          ) : (
                            <Play className="play-icon" color="#ffffff" style={{ marginLeft: '3px' }} />
                          )}
                        </motion.button>

                        {/* Playback Mode Selector (pokud má píseň audio) */}
                        {song.audioUrl && (
                          <div style={{ marginLeft: '0.75rem' }}>
                            <select
                              value={userPlaybackMode[song.id] || 'notes'}
                              onChange={(e) => setUserPlaybackMode(prev => ({ ...prev, [song.id]: e.target.value }))}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius)',
                                border: '1px solid rgba(45, 91, 120, 0.3)',
                                background: 'rgba(255, 255, 255, 0.9)',
                                cursor: 'pointer',
                                color: '#1e293b',
                                fontWeight: 500
                              }}
                            >
                              <option value="notes">Tóny</option>
                              <option value="audio">Audio</option>
                              <option value="both">Obojí</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Song Info */}
                      <div className="song-info-content" style={{ flex: 1 }}>
                        {/* Klikací hlavička s názvem, badge a šipkou */}
                        <motion.div
                          className="song-header"
                          onClick={() => toggleSongExpansion(song.id)}
                          whileHover={{ backgroundColor: 'rgba(45, 91, 120, 0.05)' }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            marginBottom: '0.5rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius)',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: 0, color: '#1e293b' }}>
                              {song.title}
                            </h3>
                            <span className={`badge ${getDifficultyColor(song.difficulty)}`}>
                              {song.difficulty}
                            </span>
                          </div>

                          {/* Šipka pro rozbalení/sbalení */}
                          <motion.div
                            animate={{ rotate: expandedSongs[song.id] ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ flexShrink: 0 }}
                          >
                            <ChevronDown size={24} color="var(--color-secondary)" />
                          </motion.div>
                        </motion.div>

                        {/* Admin tlačítka - zobrazit vždy když je rozbaleno */}
                        {isAdmin && editingSong !== song.id && expandedSongs[song.id] && (
                          <div className="song-actions" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => duplicateSong(song.id)}
                              style={{
                                background: 'rgba(181, 31, 101, 0.1)',
                                border: '1px solid rgba(181, 31, 101, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                color: 'var(--color-primary)'
                              }}
                              title="Duplikovat písničku"
                            >
                              <Copy size={14} />
                              Duplikovat
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteSong(song.id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                color: '#ef4444'
                              }}
                              title="Smazat písničku"
                            >
                              <Trash2 size={14} />
                              Smazat
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => startEditing(song)}
                              style={{
                                background: 'rgba(45, 91, 120, 0.2)',
                                border: '1px solid rgba(45, 91, 120, 0.3)',
                                borderRadius: 'var(--radius)',
                                padding: '0.25rem 0.5rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.75rem',
                                color: 'var(--color-secondary)'
                              }}
                            >
                              <Edit3 size={14} />
                              Upravit
                            </motion.button>
                          </div>
                        )}

                <AnimatePresence>
                  {expandedSongs[song.id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                {editingSong === song.id ? (
                  /* Editační formulář pro admina */
                  <div style={{ marginTop: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        Název písně
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={editForm.title}
                        onChange={(e) => handleEditChange('title', e.target.value)}
                        style={{ fontSize: '0.875rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        Noty (klikni na klavír nebo zadej ručně)
                      </label>

                      {/* Textové pole pro zobrazení a ruční úpravu - NAD klaviaturou */}
                      <textarea
                        className="form-input"
                        value={editForm.notes}
                        onChange={(e) => handleEditChange('notes', e.target.value)}
                        placeholder="D_D_E_-_F_|_G_A_H"
                        rows={3}
                        style={{
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          marginBottom: '0.5rem'
                        }}
                      />

                      {/* NoteComposer - interaktivní klavír pro snadný zápis - POD textovým polem */}
                      <NoteComposer
                        value={editForm.notes}
                        onChange={(value) => handleEditChange('notes', value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                          Obtížnost
                        </label>
                        <select
                          className="form-input"
                          value={editForm.difficulty}
                          onChange={(e) => handleEditChange('difficulty', e.target.value)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          <option value="začátečník">začátečník</option>
                          <option value="mírně pokročilý">mírně pokročilý</option>
                          <option value="pokročilý">pokročilý</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                          Tempo
                        </label>
                        <select
                          className="form-input"
                          value={editForm.tempo}
                          onChange={(e) => handleEditChange('tempo', e.target.value)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          <option value="">Vyberte tempo...</option>
                          <option value="Largo">Largo (velmi pomalé)</option>
                          <option value="Adagio">Adagio (pomalé)</option>
                          <option value="Andante">Andante (klidné)</option>
                          <option value="Moderato">Moderato (střední)</option>
                          <option value="Allegro">Allegro (rychlé)</option>
                          <option value="Presto">Presto (velmi rychlé)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                          Tónina
                        </label>
                        <select
                          className="form-input"
                          value={editForm.key}
                          onChange={(e) => handleEditChange('key', e.target.value)}
                          style={{ fontSize: '0.875rem' }}
                        >
                          <option value="">Vyberte tóninu...</option>
                          <optgroup label="Durové tóniny">
                            <option value="C dur">C dur</option>
                            <option value="G dur">G dur</option>
                            <option value="D dur">D dur</option>
                            <option value="A dur">A dur</option>
                            <option value="E dur">E dur</option>
                            <option value="F dur">F dur</option>
                            <option value="B dur">B dur</option>
                            <option value="Es dur">Es dur</option>
                            <option value="As dur">As dur</option>
                          </optgroup>
                          <optgroup label="Mollové tóniny">
                            <option value="a moll">a moll</option>
                            <option value="e moll">e moll</option>
                            <option value="h moll">h moll</option>
                            <option value="fis moll">fis moll</option>
                            <option value="d moll">d moll</option>
                            <option value="g moll">g moll</option>
                            <option value="c moll">c moll</option>
                            <option value="f moll">f moll</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        Text písničky (lyrics)
                      </label>
                      <textarea
                        className="form-input"
                        value={editForm.lyrics || ''}
                        onChange={(e) => handleEditChange('lyrics', e.target.value)}
                        placeholder="Napište text písničky, každý verš na nový řádek..."
                        rows={6}
                        style={{ fontSize: '0.875rem' }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Každý verš napište na nový řádek (Enter). Text se zobrazí uživatelům.
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b' }}>
                        Tip pro harmonizaci
                      </label>
                      <textarea
                        className="form-input"
                        value={editForm.tips}
                        onChange={(e) => handleEditChange('tips', e.target.value)}
                        rows={2}
                        style={{ fontSize: '0.875rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label" style={{ fontSize: '0.875rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={16} />
                        Audio soubor (volitelné)
                      </label>

                      {song.audioUrl && !audioFile && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          padding: '0.75rem',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: 'var(--radius)',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          <Volume2 size={16} color="var(--color-success)" />
                          <span style={{ fontSize: '0.875rem', color: 'var(--color-success)', flex: 1 }}>
                            Audio soubor nahrán
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => previewAudio(song.audioUrl)}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(45, 91, 120, 0.1)',
                              border: '1px solid rgba(45, 91, 120, 0.3)',
                              borderRadius: 'var(--radius)',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              color: 'var(--color-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Play size={12} />
                            Přehrát
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              const success = await handleDeleteAudio(song.audioUrl);
                              if (success) {
                                handleEditChange('audioUrl', '');
                              }
                            }}
                            style={{
                              padding: '0.25rem 0.5rem',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: 'var(--radius)',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              color: 'var(--color-danger)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <XCircle size={12} />
                            Smazat
                          </motion.button>
                        </div>
                      )}

                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => setAudioFile(e.target.files[0])}
                        style={{
                          fontSize: '0.875rem',
                          padding: '0.5rem',
                          border: '1px solid rgba(181, 31, 101, 0.3)',
                          borderRadius: 'var(--radius)',
                          width: '100%'
                        }}
                      />
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                        {song.audioUrl ? 'Nahrajte nový soubor pro nahrazení stávajícího' : 'Nahrajte audio soubor (MP3, WAV, OGG...)'}
                      </div>
                      {uploadingAudio && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                          Nahrávám audio soubor...
                        </div>
                      )}
                      {audioFile && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginTop: '0.5rem' }}>
                          ✓ Nový soubor vybrán: {audioFile.name}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={saveEdit}
                        className="btn btn-primary"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        <Save size={16} />
                        Uložit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={cancelEdit}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                      >
                        <X size={16} />
                        Zrušit
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        <strong>Tónina:</strong> {song.key}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        <strong>Tempo:</strong> {song.tempo}
                      </span>
                    </div>

                    {/* Noty s vizualizací */}
                    <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                    {(() => {
                      // Rozdělit notes na jednotlivé elementy (může být string nebo pole)
                      let notesArray;
                      if (Array.isArray(song.notes)) {
                        notesArray = song.notes;
                      } else {
                        // String - rozdělit podle podtržítek, rour a nových řádků
                        notesArray = song.notes.replace(/\|/g, '_').replace(/\n/g, '_').split('_').map(n => n.trim()).filter(n => n);
                      }
                      return notesArray;
                    })().map((note, noteIndex) => {
                      const isCurrent = playingSong === song.id && currentNoteIndex === noteIndex;
                      const isNext = playingSong === song.id && currentNoteIndex + 1 === noteIndex;

                      return (
                        <motion.div
                          key={noteIndex}
                          animate={{
                            scale: isCurrent ? 1.3 : isNext ? 1.1 : 1,
                            backgroundColor: isCurrent
                              ? 'rgba(181, 31, 101, 0.4)'
                              : isNext
                              ? 'rgba(181, 31, 101, 0.15)'
                              : 'rgba(45, 91, 120, 0.1)'
                          }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: isCurrent || isNext ? 'var(--color-primary)' : 'var(--color-secondary)',
                            border: isCurrent
                              ? '2px solid var(--color-primary)'
                              : isNext
                              ? '2px dashed var(--color-primary)'
                              : '1px solid rgba(45, 91, 120, 0.2)',
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                        >
                          {note}
                          {isNext && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                fontSize: '0.75rem'
                              }}
                            >
                              ▶
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleKeyboard(song.id)}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.875rem',
                      padding: '0.5rem 1rem',
                      marginBottom: '0.75rem'
                    }}
                  >
                    <Piano size={16} />
                    {showKeyboard === song.id ? 'Skrýt klavír' : 'Zkusit na klavíru'}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showKeyboard === song.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        marginTop: '1rem',
                        marginBottom: '1rem',
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch'
                      }}
                    >
                      <PianoKeyboard
                        highlightedNotes={
                          Array.isArray(song.notes)
                            ? song.notes
                            : song.notes.replace(/\|/g, '_').replace(/\n/g, '_').split('_').map(n => n.trim()).filter(n => n)
                        }
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {playingSong === song.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        padding: '1rem',
                        background: 'rgba(45, 91, 120, 0.15)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderRadius: 'var(--radius)',
                        marginTop: '0.75rem',
                        border: '2px solid rgba(45, 91, 120, 0.3)',
                        boxShadow: '0 4px 16px rgba(45, 91, 120, 0.2)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <BookOpen size={16} color="var(--color-secondary)" />
                        <strong style={{ fontSize: '0.875rem', color: '#1e293b' }}>Tip pro harmonizaci:</strong>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                        {song.tips}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Text písničky (lyrics) */}
                {song.lyrics && (
                  <div
                    style={{
                      padding: '1rem',
                      background: 'rgba(181, 31, 101, 0.08)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      borderRadius: 'var(--radius)',
                      marginTop: '0.75rem',
                      border: '2px solid rgba(181, 31, 101, 0.2)',
                      boxShadow: '0 4px 16px rgba(181, 31, 101, 0.15)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Music size={16} color="var(--color-primary)" />
                      <strong style={{ fontSize: '0.875rem', color: '#1e293b' }}>Text písničky:</strong>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#475569', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {song.lyrics}
                    </div>
                  </div>
                )}
                  </>
                )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </div>
            </motion.div>
                )}
              </SortableSongCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default SongLibrary;
