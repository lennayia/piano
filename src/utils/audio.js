// Web Audio API for Piano Sounds

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3;
      this.initialized = true;
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

    // Create oscillators for a richer piano-like sound
    const oscillator1 = this.audioContext.createOscillator();
    const oscillator2 = this.audioContext.createOscillator();
    const oscillator3 = this.audioContext.createOscillator();

    // Create gain nodes for each oscillator
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    const gain3 = this.audioContext.createGain();

    // Set frequencies (slight detuning for richness)
    oscillator1.frequency.value = frequency;
    oscillator2.frequency.value = frequency * 2; // One octave higher
    oscillator3.frequency.value = frequency * 3; // Harmonic

    // Set waveforms
    oscillator1.type = 'sine';
    oscillator2.type = 'sine';
    oscillator3.type = 'triangle';

    // ADSR envelope for piano-like sound
    const attackTime = 0.01;
    const decayTime = 0.1;
    const sustainLevel = 0.7;
    const releaseTime = 0.3;

    // Set initial gain values
    gain1.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0, now);
    gain3.gain.setValueAtTime(0, now);

    // Attack
    gain1.gain.linearRampToValueAtTime(0.6, now + attackTime);
    gain2.gain.linearRampToValueAtTime(0.3, now + attackTime);
    gain3.gain.linearRampToValueAtTime(0.1, now + attackTime);

    // Decay
    gain1.gain.linearRampToValueAtTime(0.6 * sustainLevel, now + attackTime + decayTime);
    gain2.gain.linearRampToValueAtTime(0.3 * sustainLevel, now + attackTime + decayTime);
    gain3.gain.linearRampToValueAtTime(0.1 * sustainLevel, now + attackTime + decayTime);

    // Release
    const releaseStart = now + duration;
    gain1.gain.setValueAtTime(gain1.gain.value, releaseStart);
    gain2.gain.setValueAtTime(gain2.gain.value, releaseStart);
    gain3.gain.setValueAtTime(gain3.gain.value, releaseStart);

    gain1.gain.linearRampToValueAtTime(0, releaseStart + releaseTime);
    gain2.gain.linearRampToValueAtTime(0, releaseStart + releaseTime);
    gain3.gain.linearRampToValueAtTime(0, releaseStart + releaseTime);

    // Connect nodes
    oscillator1.connect(gain1);
    oscillator2.connect(gain2);
    oscillator3.connect(gain3);

    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);
    gain3.connect(this.masterGain);

    // Start and stop oscillators
    oscillator1.start(now);
    oscillator2.start(now);
    oscillator3.start(now);

    oscillator1.stop(releaseStart + releaseTime);
    oscillator2.stop(releaseStart + releaseTime);
    oscillator3.stop(releaseStart + releaseTime);
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

  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

// Create singleton instance
const audioEngine = new AudioEngine();

export default audioEngine;