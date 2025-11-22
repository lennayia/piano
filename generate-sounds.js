// Skript pro generování placeholder zvuků
// Spusťte: node generate-sounds.js

const fs = require('fs');
const path = require('path');

// Vytvoříme jednoduché sine wave tóny
const sounds = [
  { name: 'achievement', frequencies: [523.25, 659.25, 783.99], duration: 0.3 }, // C-E-G (C dur akord)
  { name: 'fanfare', frequencies: [261.63, 329.63, 392.00, 523.25], duration: 0.4 }, // C-E-G-C (fanfára)
  { name: 'success', frequencies: [440.00, 554.37, 659.25], duration: 0.25 }, // A-C#-E (A dur akord)
  { name: 'applause', frequencies: [200, 400, 800, 1600], duration: 0.5 }, // Šum simulující potlesk
  { name: 'cheer', frequencies: [349.23, 466.16, 587.33, 698.46], duration: 0.5 } // F-A#-D-F (stoupající)
];

console.log('Pro generování audio souborů použijte online nástroj nebo připravené soubory.');
console.log('Doporučuji stáhnout royalty-free zvuky z:');
console.log('- https://freesound.org/');
console.log('- https://pixabay.com/sound-effects/');
console.log('- https://mixkit.co/free-sound-effects/');
console.log('\nNebo použijte tyto frekvence pro generování vlastních zvuků:');

sounds.forEach(sound => {
  console.log(`\n${sound.name}.mp3:`);
  console.log(`  Frekvence: ${sound.frequencies.join(', ')} Hz`);
  console.log(`  Délka: ${sound.duration}s`);
});

console.log('\n\nPro rychlé řešení můžete použít Web Audio API v browseru:');
console.log('Otevřete konzoli v prohlížeči a spusťte následující kód pro každý zvuk:\n');

sounds.forEach(sound => {
  console.log(`// ${sound.name}`);
  console.log(`const ctx = new AudioContext();`);
  console.log(`const osc = ctx.createOscillator();`);
  console.log(`const gain = ctx.createGain();`);
  console.log(`osc.connect(gain);`);
  console.log(`gain.connect(ctx.destination);`);
  console.log(`osc.frequency.value = ${sound.frequencies[0]};`);
  console.log(`gain.gain.setValueAtTime(0.3, ctx.currentTime);`);
  console.log(`gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + ${sound.duration});`);
  console.log(`osc.start();`);
  console.log(`osc.stop(ctx.currentTime + ${sound.duration});\n`);
});
