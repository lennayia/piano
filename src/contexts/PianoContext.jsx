import { createContext, useContext, useState, useCallback } from 'react';
import audioEngine from '../utils/audio';

const PianoContext = createContext(null);

export function PianoProvider({ children }) {
  const [pianoReady, setPianoReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const initPiano = useCallback(async () => {
    if (pianoReady || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('🎹 Initializing Salamander Piano with user gesture...');
      await audioEngine.initWithUserGesture();
      await audioEngine.waitForSampler();
      setPianoReady(true);
      console.log('✅ Salamander Piano ready globally!');
    } catch (err) {
      console.error('❌ Piano initialization failed:', err);
      setError(err.message);
      // Set ready anyway to allow fallback synth
      setPianoReady(true);
    } finally {
      setIsLoading(false);
    }
  }, [pianoReady, isLoading]);

  const value = {
    pianoReady,
    isLoading,
    error,
    initPiano
  };

  return (
    <PianoContext.Provider value={value}>
      {children}
    </PianoContext.Provider>
  );
}

export function usePiano() {
  const context = useContext(PianoContext);
  if (!context) {
    throw new Error('usePiano must be used within PianoProvider');
  }
  return context;
}
