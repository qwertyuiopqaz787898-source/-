let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

function playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
}

export const playHover = () => playTone(400, 'sine', 0.1, 0.01);
export const playClick = () => playTone(600, 'sine', 0.1, 0.03);
export const playSuccess = () => {
  playTone(400, 'sine', 0.1, 0.03);
  setTimeout(() => playTone(600, 'sine', 0.2, 0.03), 100);
  setTimeout(() => playTone(800, 'sine', 0.3, 0.03), 200);
};
export const playError = () => {
  playTone(300, 'square', 0.2, 0.03);
  setTimeout(() => playTone(250, 'square', 0.3, 0.03), 150);
};
