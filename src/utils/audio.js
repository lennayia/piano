// Web Audio API for Piano Sounds

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    this.initialized = false;
    this.vltavaAudio = null;
    this.vltavaAudioPath = '/audio/vltava.mp3'; // Cesta k audio souboru
  }

  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Vytvořit kompressor pro hlasitější a plnější zvuk
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 1.0; // Maximum hlasitost

      // Připojit compressor -> masterGain -> destination
      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      this.initialized = true;
      console.log('Audio engine initialized with compressor for louder sound');
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }
  }

  // Note frequencies (C4 = middle C)
  // Chromatická stupnice vzestupně
  getNoteFrequency(note) {
    const frequencies = {
      'C': 261.63,    // C4 (malé c)
      'C#': 277.18,   // C#4/Db4
      'Db': 277.18,
      'D': 293.66,    // D4
      'D#': 311.13,   // D#4/Eb4
      'Eb': 311.13,
      'E': 329.63,    // E4
      'F': 349.23,    // F4
      'F#': 369.99,   // F#4/Gb4
      'Gb': 369.99,
      'G': 392.00,    // G4
      'G#': 415.30,   // G#4/Ab4
      'Ab': 415.30,
      'A': 440.00,    // A4 (komorní A)
      'A#': 466.16,   // A#4/Bb4
      'Bb': 466.16,
      'H': 493.88,    // H4/B4
      'B': 493.88,
      "C'": 523.25,   // C5 (c' - jednočárkované)
    };

    return frequencies[note] || 440;
  }

  playNote(note, duration = 0.5) {
    if (!this.initialized) this.init();
    if (!this.audioContext) return;

    const frequency = this.getNoteFrequency(note);
    const now = this.audioContext.currentTime;

    // Použijeme 3 oscilátory pro plný, bohatý zvuk
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const oscillator3 = this.audioContext.createOscillator();

    const gain = this.audioContext.createGain();

    // Základní tón + oktáva níže + třetí harmonická
    oscillator1.frequency.value = frequency;
    oscillator2.frequency.value = frequency * 0.5; // Oktáva níže
    oscillator3.frequency.value = frequency * 2; // Oktáva výš

    // Triangle waveform je hlasitější než sine
    oscillator1.type = 'triangle';
    oscillator2.type = 'triangle';
    oscillator3.type = 'sine'; // Vysoká harmonická zůstává sine

    // VELMI silný envelope pro maximální hlasitost
    const attackTime = 0.005;
    const totalDuration = duration;

    // MAXIMUM hlasitost - 1.5 je nad normál, ale kompressor to zvládne
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1.5, now + attackTime);
    gain.gain.exponentialRampToValueAtTime(0.01, now + totalDuration);

    // Připojit všechny oscilátory k jednomu gain nodu
    oscillator1.connect(gain);
    oscillator2.connect(gain);
    oscillator3.connect(gain);

    // Připojit ke kompresoru pro ještě větší hlasitost
    gain.connect(this.compressor);

    oscillator1.start(now);
    oscillator2.start(now);
    oscillator3.start(now);

    oscillator1.stop(now + totalDuration);
    oscillator2.stop(now + totalDuration);
    oscillator3.stop(now + totalDuration);
  }

  // UI Sound Effects
  playClick() {
    if (!this.initialized) this.init();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.connect(gain);
    gain.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  playSuccess() {
    if (!this.initialized) this.init();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Play a pleasant chord
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.frequency.value = freq;
      oscillator.type = 'sine';

      const delay = index * 0.05;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.15, now + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.5);

      oscillator.connect(gain);
      gain.connect(this.masterGain);

      oscillator.start(now + delay);
      oscillator.stop(now + delay + 0.5);
    });
  }

  playError() {
    if (!this.initialized) this.init();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.linearRampToValueAtTime(200, now + 0.1);
    oscillator.type = 'sawtooth';

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.connect(gain);
    gain.connect(this.masterGain);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  playApplause() {
    if (!this.initialized) this.init();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Simulace potlesku pomocí white noise
    for (let i = 0; i < 8; i++) {
      const bufferSize = 2 * this.audioContext.sampleRate;
      const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let j = 0; j < bufferSize; j++) {
        output[j] = Math.random() * 2 - 1;
      }

      const noise = this.audioContext.createBufferSource();
      noise.buffer = noiseBuffer;

      const bandpass = this.audioContext.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1000 + Math.random() * 2000;

      const gain = this.audioContext.createGain();
      const delay = i * 0.1;
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.05, now + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.4);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now + delay);
      noise.stop(now + delay + 0.4);
    }
  }

  playFanfare() {
    if (!this.initialized) this.init();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Fanfára - slavnostní tóny
    const melody = [
      { freq: 523.25, time: 0, duration: 0.2 },      // C5
      { freq: 659.25, time: 0.15, duration: 0.2 },   // E5
      { freq: 783.99, time: 0.3, duration: 0.2 },    // G5
      { freq: 1046.50, time: 0.45, duration: 0.5 }   // C6
    ];

    melody.forEach(({ freq, time, duration }) => {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.frequency.value = freq;
      oscillator.type = 'triangle';

      const startTime = now + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.connect(gain);
      gain.connect(this.masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  playVltava() {
    if (!this.initialized) this.init();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Hlavní téma Vltavy (zjednodušená melodie)
    // E-G-A-H-C-H-A-G-E-E-G-A
    const vltavaMelody = [
      { note: 329.63, time: 0, duration: 0.5 },     // E
      { note: 392.00, time: 0.5, duration: 0.5 },   // G
      { note: 440.00, time: 1.0, duration: 0.5 },   // A
      { note: 493.88, time: 1.5, duration: 0.5 },   // H
      { note: 523.25, time: 2.0, duration: 0.8 },   // C
      { note: 493.88, time: 2.8, duration: 0.4 },   // H
      { note: 440.00, time: 3.2, duration: 0.4 },   // A
      { note: 392.00, time: 3.6, duration: 0.5 },   // G
      { note: 329.63, time: 4.1, duration: 0.8 },   // E
      { note: 329.63, time: 4.9, duration: 0.4 },   // E
      { note: 392.00, time: 5.3, duration: 0.4 },   // G
      { note: 440.00, time: 5.7, duration: 1.0 }    // A
    ];

    vltavaMelody.forEach(({ note, time, duration }) => {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.frequency.value = note;
      oscillator.type = 'sine';

      const startTime = now + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05); // Potichu
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.connect(gain);
      gain.connect(this.masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    return 6.7; // Délka melodie v sekundách
  }

  // Pokusí se načíst a přehrát audio soubor, jinak použije syntetizovanou melodii
  async loadVltavaAudio() {
    try {
      const response = await fetch(this.vltavaAudioPath);
      if (response.ok) {
        this.vltavaAudio = new Audio(this.vltavaAudioPath);
        this.vltavaAudio.loop = true;
        this.vltavaAudio.volume = 0.9;
        return true;
      }
    } catch (error) {
      console.log('Audio soubor nenalezen, použije se syntetizovaná melodie');
    }
    return false;
  }

  async startVltavaLoop() {
    if (this.vltavaInterval || (this.vltavaAudio && !this.vltavaAudio.paused)) return; // Už běží

    // Spustit OKAMŽITĚ syntetizovanou melodii
    const duration = this.playVltava();
    this.vltavaInterval = setInterval(() => {
      this.playVltava();
    }, duration * 1000);

    // V pozadí zkusit načíst audio soubor (neblokující)
    this.loadVltavaAudio().then((audioLoaded) => {
      if (audioLoaded && this.vltavaAudio) {
        // Zastavit syntetizovanou melodii
        if (this.vltavaInterval) {
          clearInterval(this.vltavaInterval);
          this.vltavaInterval = null;
        }

        // Přehrát audio soubor místo syntetizované melodie
        this.vltavaAudio.play().catch(error => {
          console.log('Nepodařilo se přehrát audio soubor, pokračuje syntetizovaná melodie');
          // Restart syntetizované melodie pokud audio selže
          const duration = this.playVltava();
          this.vltavaInterval = setInterval(() => {
            this.playVltava();
          }, duration * 1000);
        });
      }
    });
  }

  stopVltavaLoop() {
    // Zastavit audio soubor, pokud hraje
    if (this.vltavaAudio) {
      this.vltavaAudio.pause();
      this.vltavaAudio.currentTime = 0;
    }

    // Zastavit syntetizovanou melodii
    if (this.vltavaInterval) {
      clearInterval(this.vltavaInterval);
      this.vltavaInterval = null;
    }
  }

  fadeOut(duration = 1.0) {
    // Fade out pro audio soubor
    if (this.vltavaAudio && !this.vltavaAudio.paused) {
      const startVolume = this.vltavaAudio.volume;
      const steps = 20;
      const stepDuration = (duration * 1000) / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        const newVolume = startVolume * (1 - currentStep / steps);
        this.vltavaAudio.volume = Math.max(0, newVolume);

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          this.stopVltavaLoop();
          this.vltavaAudio.volume = 0.9; // Reset volume
        }
      }, stepDuration);

      return;
    }

    // Fade out pro syntetizovanou melodii
    if (!this.masterGain) return;

    const now = this.audioContext.currentTime;
    const currentVolume = this.masterGain.gain.value;

    this.masterGain.gain.setValueAtTime(currentVolume, now);
    this.masterGain.gain.linearRampToValueAtTime(0.01, now + duration);

    setTimeout(() => {
      this.stopVltavaLoop();
      this.masterGain.gain.value = 0.9; // Reset volume
    }, duration * 1000);
  }

  setVolume(volume) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));

    // Nastavit volume pro audio soubor
    if (this.vltavaAudio) {
      this.vltavaAudio.volume = normalizedVolume;
    }

    // Nastavit volume pro syntetizovaný zvuk
    if (this.masterGain) {
      this.masterGain.gain.value = normalizedVolume;
    }
  }
}

// Create singleton instance
const audioEngine = new AudioEngine();

export default audioEngine;