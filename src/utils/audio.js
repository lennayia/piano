// Tone.js for Piano Samples
import * as Tone from 'tone';

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    this.initialized = false;
    this.vltavaAudio = null;
    this.vltavaAudioPath = '/audio/vltava.mp3';
    this.pianoSampler = null;
    this.samplerReady = false;
    this.samplerReadyPromise = null;
  }

  // Returns a promise that resolves when sampler is ready
  waitForSampler() {
    if (this.samplerReady) {
      return Promise.resolve();
    }

    if (!this.samplerReadyPromise) {
      this.samplerReadyPromise = new Promise((resolve) => {
        this.samplerReadyResolve = resolve;
      });
    }

    return this.samplerReadyPromise;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Initialize Web Audio API for sound effects
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = -24;
      this.compressor.knee.value = 30;
      this.compressor.ratio.value = 12;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.25;

      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 2.0;

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      // DON'T call Tone.start() here - requires user gesture
      // Will be called in initPianoSampler when user clicks button

      this.initialized = true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
  }

  async initWithUserGesture() {
    // This must be called from a user interaction (click, touch, etc.)
    try {
      await this.init();

      // Initialize Tone.js context (requires user gesture)
      await Tone.start();

      // Initialize Piano Sampler with Salamander samples
      await this.initPianoSampler();
    } catch (error) {
      console.error('Audio initialization with user gesture failed:', error);
    }
  }

  async initPianoSampler() {
    try {
      // Salamander Grand Piano samples (lightweight version)
      // Using public CDN with selected notes (every 3rd note for smaller size)
      const baseUrl = 'https://tonejs.github.io/audio/salamander/';

      this.pianoSampler = new Tone.Sampler({
        urls: {
          'A0': 'A0.mp3',
          'C1': 'C1.mp3',
          'D#1': 'Ds1.mp3',
          'F#1': 'Fs1.mp3',
          'A1': 'A1.mp3',
          'C2': 'C2.mp3',
          'D#2': 'Ds2.mp3',
          'F#2': 'Fs2.mp3',
          'A2': 'A2.mp3',
          'C3': 'C3.mp3',
          'D#3': 'Ds3.mp3',
          'F#3': 'Fs3.mp3',
          'A3': 'A3.mp3',
          'C4': 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          'A4': 'A4.mp3',
          'C5': 'C5.mp3',
          'D#5': 'Ds5.mp3',
          'F#5': 'Fs5.mp3',
          'A5': 'A5.mp3',
          'C6': 'C6.mp3',
          'D#6': 'Ds6.mp3',
          'F#6': 'Fs6.mp3',
          'A6': 'A6.mp3',
          'C7': 'C7.mp3',
          'D#7': 'Ds7.mp3',
          'F#7': 'Fs7.mp3',
          'A7': 'A7.mp3',
          'C8': 'C8.mp3'
        },
        release: 1,
        baseUrl: baseUrl,
        onload: () => {
          this.samplerReady = true;
          // Resolve the promise for components waiting for sampler
          if (this.samplerReadyResolve) {
            this.samplerReadyResolve();
          }
        }
      }).toDestination();

      // Set balanced default volume (5 dB is loud but clear)
      this.pianoSampler.volume.value = 5;

    } catch (error) {
      console.error('Failed to initialize piano sampler:', error);
      this.samplerReady = false;
    }
  }

  // Convert Czech notation to Tone.js notation
  convertNotation(note) {
    let normalizedNote = note.trim().toUpperCase();

    // Convert Czech notation to international
    normalizedNote = normalizedNote
      .replace(/CIS/g, 'C#')
      .replace(/DIS/g, 'D#')
      .replace(/FIS/g, 'F#')
      .replace(/GIS/g, 'G#')
      .replace(/AIS/g, 'A#')
      .replace(/DES/g, 'Db')
      .replace(/ES/g, 'Eb')
      .replace(/GES/g, 'Gb')
      .replace(/AS/g, 'Ab')
      .replace(/B(?!B|b)/g, 'Bb')
      .replace(/H/g, 'B'); // Czech H = B

    // Convert octave notation
    // C. = C3 (velké C)
    if (normalizedNote.endsWith('.')) {
      const noteName = normalizedNote.slice(0, -1);
      return noteName + '3';
    }

    // C = C4 (jednočárkované c)
    // C' nebo C'' = C5 nebo C6
    if (normalizedNote.includes("''")) {
      return normalizedNote.replace("''", '5');
    } else if (normalizedNote.includes("'")) {
      return normalizedNote.replace("'", '5');
    }

    // Default to octave 4 if no octave specified
    if (!/\d/.test(normalizedNote)) {
      return normalizedNote + '4';
    }

    return normalizedNote;
  }

  playNote(note, duration = 0.5) {
    // Initialize on first use (user interaction required for Web Audio)
    if (!this.initialized) {
      this.init();
    }

    // Use piano sampler if ready, otherwise fallback to synth
    if (this.samplerReady && this.pianoSampler) {
      try {
        const toneNote = this.convertNotation(note);
        this.pianoSampler.triggerAttackRelease(toneNote, duration);
        return;
      } catch (error) {
        console.warn('Sampler playback failed, using fallback:', error);
      }
    }

    // Fallback to synth if sampler not ready yet
    // (First click initializes, samples load in background)
    this.playNoteSynth(note, duration);
  }

  playNoteSynth(note, duration = 0.5) {
    if (!this.audioContext) return;

    const frequency = this.getNoteFrequency(note);
    const now = this.audioContext.currentTime;

    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const oscillator3 = this.audioContext.createOscillator();

    const gain = this.audioContext.createGain();

    oscillator1.frequency.value = frequency;
    oscillator2.frequency.value = frequency * 0.5;
    oscillator3.frequency.value = frequency * 2;

    oscillator1.type = 'triangle';
    oscillator2.type = 'triangle';
    oscillator3.type = 'sine';

    const attackTime = 0.005;
    const totalDuration = duration;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1.8, now + attackTime);
    gain.gain.exponentialRampToValueAtTime(0.01, now + totalDuration);

    oscillator1.connect(gain);
    oscillator2.connect(gain);
    oscillator3.connect(gain);

    gain.connect(this.compressor);

    oscillator1.start(now);
    oscillator2.start(now);
    oscillator3.start(now);

    oscillator1.stop(now + totalDuration);
    oscillator2.stop(now + totalDuration);
    oscillator3.stop(now + totalDuration);
  }

  // Note frequencies - kept for fallback synth
  getNoteFrequency(note) {
    let normalizedNote = note.trim().toUpperCase();

    normalizedNote = normalizedNote
      .replace(/CIS/g, 'C#')
      .replace(/DIS/g, 'D#')
      .replace(/FIS/g, 'F#')
      .replace(/GIS/g, 'G#')
      .replace(/AIS/g, 'A#')
      .replace(/DES/g, 'DB')
      .replace(/ES/g, 'EB')
      .replace(/GES/g, 'GB')
      .replace(/AS/g, 'AB')
      .replace(/B(?!B)/g, 'BB');

    const frequencies = {
      'C.': 130.81, 'C#.': 138.59, 'DB.': 138.59,
      'D.': 146.83, 'D#.': 155.56, 'EB.': 155.56,
      'E.': 164.81, 'F.': 174.61, 'F#.': 185.00,
      'GB.': 185.00, 'G.': 196.00, 'G#.': 207.65,
      'AB.': 207.65, 'A.': 220.00, 'A#.': 233.08,
      'BB.': 233.08, 'H.': 246.94,
      'C': 261.63, 'C#': 277.18, 'DB': 277.18,
      'D': 293.66, 'D#': 311.13, 'EB': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99,
      'GB': 369.99, 'G': 392.00, 'G#': 415.30,
      'AB': 415.30, 'A': 440.00, 'A#': 466.16,
      'BB': 466.16, 'H': 493.88,
      "C''": 523.25, "C#''": 554.37, "D''": 587.33,
      "D#''": 622.25, "E''": 659.25, "F''": 698.46,
      "F#''": 739.99, "G''": 783.99, "G#''": 830.61,
      "A''": 880.00, "A#''": 932.33, "H''": 987.77,
      "C'": 523.25, "C#'": 554.37, "DB'": 554.37,
      "D'": 587.33, "D#'": 622.25, "EB'": 622.25,
      "E'": 659.25, "F'": 698.46, "F#'": 739.99,
      "GB'": 739.99, "G'": 783.99, "G#'": 830.61,
      "AB'": 830.61, "A'": 880.00, "A#'": 932.33,
      "BB'": 932.33, "H'": 987.77
    };

    return frequencies[normalizedNote] || 440;
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

    const melody = [
      { freq: 523.25, time: 0, duration: 0.15 },
      { freq: 659.25, time: 0.12, duration: 0.15 },
      { freq: 783.99, time: 0.24, duration: 0.15 },
      { freq: 1046.50, time: 0.36, duration: 0.4 }
    ];

    melody.forEach(({ freq, time, duration }) => {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.frequency.value = freq;
      oscillator.type = 'triangle';

      const startTime = now + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.6, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.connect(gain);
      gain.connect(this.masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
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

    const melody = [
      { freq: 523.25, time: 0, duration: 0.2 },
      { freq: 659.25, time: 0.15, duration: 0.2 },
      { freq: 783.99, time: 0.3, duration: 0.2 },
      { freq: 1046.50, time: 0.45, duration: 0.5 }
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

    const vltavaMelody = [
      { note: 329.63, time: 0, duration: 0.5 },
      { note: 392.00, time: 0.5, duration: 0.5 },
      { note: 440.00, time: 1.0, duration: 0.5 },
      { note: 493.88, time: 1.5, duration: 0.5 },
      { note: 523.25, time: 2.0, duration: 0.8 },
      { note: 493.88, time: 2.8, duration: 0.4 },
      { note: 440.00, time: 3.2, duration: 0.4 },
      { note: 392.00, time: 3.6, duration: 0.5 },
      { note: 329.63, time: 4.1, duration: 0.8 },
      { note: 329.63, time: 4.9, duration: 0.4 },
      { note: 392.00, time: 5.3, duration: 0.4 },
      { note: 440.00, time: 5.7, duration: 1.0 }
    ];

    vltavaMelody.forEach(({ note, time, duration }) => {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.frequency.value = note;
      oscillator.type = 'sine';

      const startTime = now + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.connect(gain);
      gain.connect(this.masterGain);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    return 6.7;
  }

  async loadVltavaAudio() {
    try {
      const response = await fetch(this.vltavaAudioPath);
      if (response.ok) {
        this.vltavaAudio = new Audio(this.vltavaAudioPath);
        this.vltavaAudio.loop = true;
        this.vltavaAudio.volume = 1.0;
        return true;
      }
    } catch (error) {
      console.log('Audio soubor nenalezen, použije se syntetizovaná melodie');
    }
    return false;
  }

  async startVltavaLoop() {
    if (this.vltavaInterval || (this.vltavaAudio && !this.vltavaAudio.paused)) return;

    const duration = this.playVltava();
    this.vltavaInterval = setInterval(() => {
      this.playVltava();
    }, duration * 1000);

    this.loadVltavaAudio().then((audioLoaded) => {
      if (audioLoaded && this.vltavaAudio) {
        if (this.vltavaInterval) {
          clearInterval(this.vltavaInterval);
          this.vltavaInterval = null;
        }

        this.vltavaAudio.play().catch(error => {
          console.log('Nepodařilo se přehrát audio soubor, pokračuje syntetizovaná melodie');
          const duration = this.playVltava();
          this.vltavaInterval = setInterval(() => {
            this.playVltava();
          }, duration * 1000);
        });
      }
    });
  }

  stopVltavaLoop() {
    if (this.vltavaAudio) {
      this.vltavaAudio.pause();
      this.vltavaAudio.currentTime = 0;
    }

    if (this.vltavaInterval) {
      clearInterval(this.vltavaInterval);
      this.vltavaInterval = null;
    }
  }

  fadeOut(duration = 1.0) {
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
          this.vltavaAudio.volume = 1.0;
        }
      }, stepDuration);

      return;
    }

    if (!this.masterGain) return;

    const now = this.audioContext.currentTime;
    const currentVolume = this.masterGain.gain.value;

    this.masterGain.gain.setValueAtTime(currentVolume, now);
    this.masterGain.gain.linearRampToValueAtTime(0.01, now + duration);

    setTimeout(() => {
      this.stopVltavaLoop();
      this.masterGain.gain.value = 2.0;
    }, duration * 1000);
  }

  setVolume(volume) {
    const normalizedVolume = Math.max(0, Math.min(1, volume));

    if (this.vltavaAudio) {
      this.vltavaAudio.volume = normalizedVolume;
    }

    if (this.masterGain) {
      this.masterGain.gain.value = normalizedVolume * 1.5;
    }

    if (this.pianoSampler) {
      // Map 0-1 to -10 to +8 dB (prevents clipping)
      // At 50% slider = -1 dB, at 100% slider = +8 dB
      this.pianoSampler.volume.value = (normalizedVolume * 18) - 10;
    }
  }
}

// Create singleton instance
const audioEngine = new AudioEngine();

export default audioEngine;
