/**
 * Generátor zvuků pomocí Web Audio API
 * Používá se jako fallback, pokud MP3 soubory nejsou k dispozici
 */

export const generateSound = (type) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  const soundConfigs = {
    achievement: {
      // Pozitivní, stoupající tón - VÝRAZNĚJŠÍ
      notes: [
        { freq: 523.25, time: 0, duration: 0.2, volume: 0.5 },      // C
        { freq: 659.25, time: 0.15, duration: 0.2, volume: 0.6 },   // E
        { freq: 783.99, time: 0.3, duration: 0.3, volume: 0.7 }     // G
      ]
    },
    fanfare: {
      // Slavnostní fanfára - HLASITĚJŠÍ
      notes: [
        { freq: 261.63, time: 0, duration: 0.15, volume: 0.6 },     // C
        { freq: 329.63, time: 0.12, duration: 0.15, volume: 0.65 }, // E
        { freq: 392.00, time: 0.24, duration: 0.15, volume: 0.7 },  // G
        { freq: 523.25, time: 0.36, duration: 0.35, volume: 0.75 }  // C (vyšší)
      ]
    },
    success: {
      // Krátký úspěšný zvuk - JASNĚJŠÍ
      notes: [
        { freq: 523.25, time: 0, duration: 0.12, volume: 0.6 },     // C
        { freq: 659.25, time: 0.08, duration: 0.12, volume: 0.7 },  // E
        { freq: 783.99, time: 0.16, duration: 0.25, volume: 0.75 }  // G
      ]
    },
    applause: {
      // Simulace potlesku - INTENZIVNĚJŠÍ
      notes: [
        { freq: 'noise', time: 0, duration: 0.6, volume: 0.5 }
      ]
    },
    cheer: {
      // Radostný vzestupný zvuk - VESELEJŠÍ
      notes: [
        { freq: 392.00, time: 0, duration: 0.1, volume: 0.5 },      // G
        { freq: 523.25, time: 0.08, duration: 0.1, volume: 0.6 },   // C
        { freq: 659.25, time: 0.16, duration: 0.1, volume: 0.7 },   // E
        { freq: 783.99, time: 0.24, duration: 0.25, volume: 0.8 }   // G (vyšší)
      ]
    }
  };

  const config = soundConfigs[type];
  if (!config) return;

  const now = audioContext.currentTime;

  config.notes.forEach(note => {
    if (note.freq === 'noise') {
      // White noise pro potlesk - hlasitější a s více variací
      const bufferSize = audioContext.sampleRate * note.duration;
      const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const data = buffer.getChannelData(channel);
        for (let i = 0; i < bufferSize; i++) {
          // Přidáme burst pattern pro realističtější potlesk
          const burstIntensity = Math.sin(i / bufferSize * Math.PI * 8) * 0.5 + 0.5;
          data[i] = (Math.random() * 2 - 1) * burstIntensity;
        }
      }

      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;

      const noiseGain = audioContext.createGain();
      noiseGain.gain.setValueAtTime(note.volume || 0.5, now + note.time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

      noise.connect(noiseGain);
      noiseGain.connect(audioContext.destination);
      noise.start(now + note.time);
      noise.stop(now + note.time + note.duration);
    } else {
      // Triangle wave pro jasnější tón
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'triangle'; // Změna z 'sine' na 'triangle' pro výraznější zvuk
      oscillator.frequency.value = note.freq;

      const volume = note.volume || 0.5;
      gainNode.gain.setValueAtTime(0, now + note.time);
      gainNode.gain.linearRampToValueAtTime(volume, now + note.time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + note.time + note.duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(now + note.time);
      oscillator.stop(now + note.time + note.duration);
    }
  });
};
