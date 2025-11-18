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

  // Note frequencies (A4 = 440Hz)
  getNoteFrequency(note) {
    const frequencies = {
      'C': 261.63,
      'C#': 277.18,
      'Db': 277.18,
      'D': 293.66,
      'D#': 311.13,
      'Eb': 311.13,
      'E': 329.63,
      'F': 349.23,
      'F#': 369.99,
      'Gb': 369.99,
      'G': 392.00,
      'G#': 415.30,
      'Ab': 415.30,
      'A': 440.00,
      'A#': 466.16,
      'Bb': 466.16,
      'H': 493.88,
      'B': 493.88,
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

  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

// Create singleton instance
const audioEngine = new AudioEngine();

export default audioEngine;