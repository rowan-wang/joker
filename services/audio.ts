import { ChiptuneJsPlayer } from 'chiptune3';

let audioCtx: AudioContext | null = null;
let audioBuffers: Record<string, AudioBuffer> = {};
let isMuted = false;
let chipPlayer: any = null; // Using any to avoid TS issues with library types if missing

const SFX_FILES = {
    select: '/assets/audio/card_select.wav',
    deselect: '/assets/audio/card_deselect.wav',
    deal: '/assets/audio/card_draw.wav',
    focus: '/assets/audio/card_focus.wav',
    chip: '/assets/audio/chips_generic.wav',
    chip_card: '/assets/audio/chips_card.wav',
    mult: '/assets/audio/mult.wav',
    xmult: '/assets/audio/xmult.wav',
};

const BGM_URL = '/assets/audio/main_theme.xm';

export const initAudio = async () => {
  // Init SFX Context
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // Init Chiptune Player
  if (!chipPlayer) {
      try {
          chipPlayer = new ChiptuneJsPlayer({
              context: audioCtx,
              repeatCount: -1,
              stereoSeparation: 100
          });
          
          chipPlayer.onInitialized(() => {
             console.log('Chiptune player initialized');
             // Load and Play BGM
             if (!isMuted) {
                 chipPlayer.load(BGM_URL);
                 chipPlayer.setVol(0.4);
             }
          });
      } catch (e) {
          console.error("Chiptune player init error:", e);
      }
  } else if (!isMuted) {
      // If already initialized and not muted, ensure playing
      // Check if playing? chiptune3 doesn't expose isPlaying directly easily
      // We can just unpause or reload if needed. 
      // But for now let's rely on toggleMute/startBGM logic.
  }

  // Load all SFX (Async)
  const sfxPromises = Object.entries(SFX_FILES).map(async ([key, url]) => {
        if (audioBuffers[key]) return; // Already loaded
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            if (audioCtx) {
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                audioBuffers[key] = audioBuffer;
            }
        } catch (e) {
            console.error(`Failed to load audio: ${url}`, e);
        }
  });
  
  await Promise.all(sfxPromises);
};

const playBuffer = (bufferName: string, vol: number = 0.5, rate: number = 1.0) => {
    if (!audioCtx || isMuted || !audioBuffers[bufferName]) return;
    
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffers[bufferName];
    source.playbackRate.value = rate;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = vol;
    
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    source.start();
};

const createOscillator = (type: OscillatorType, freq: number, duration: number, vol: number = 0.1) => {
  if (!audioCtx || isMuted) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

export const playSfx = (type: 'deal' | 'select' | 'play' | 'discard' | 'chip' | 'win' | 'error' | 'mult' | 'xmult' | 'focus') => {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  switch (type) {
    case 'select':
      if (audioBuffers['select']) playBuffer('select', 0.4);
      else createOscillator('triangle', 800, 0.05, 0.05);
      break;
    case 'deal':
      if (audioBuffers['deal']) playBuffer('deal', 0.3, 0.9 + Math.random() * 0.2);
      else {
          // Fallback
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle'; 
          osc.frequency.setValueAtTime(300, audioCtx.currentTime);
          osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
      }
      break;
    case 'play':
      // Use 'card_select' or 'deal' with lower pitch? Or 'card_deselect'?
      // Let's use 'deal' but louder
      if (audioBuffers['deal']) playBuffer('deal', 0.5, 0.8);
      else {
        createOscillator('sine', 400, 0.2, 0.1);
        createOscillator('triangle', 600, 0.2, 0.05);
      }
      break;
    case 'discard':
       if (audioBuffers['deselect']) playBuffer('deselect', 0.4);
       else {
          const dOsc = audioCtx.createOscillator();
          const dGain = audioCtx.createGain();
          dOsc.type = 'sawtooth';
          dOsc.frequency.setValueAtTime(150, audioCtx.currentTime);
          dOsc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
          dGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
          dGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
          dOsc.connect(dGain);
          dGain.connect(audioCtx.destination);
          dOsc.start();
          dOsc.stop(audioCtx.currentTime + 0.3);
       }
      break;
    case 'chip':
      // Randomly choose between chip and chip_card for variety?
      // Usually 'chip' is for accumulating score, 'chip_card' is for card trigger
      if (audioBuffers['chip']) playBuffer('chip', 0.3, 0.9 + Math.random() * 0.2);
      else createOscillator('sine', 1200 + Math.random() * 200, 0.1, 0.05);
      break;
    case 'mult':
        if (audioBuffers['mult']) playBuffer('mult', 0.4);
        break;
    case 'xmult':
        if (audioBuffers['xmult']) playBuffer('xmult', 0.5);
        break;
    case 'focus':
        if (audioBuffers['focus']) playBuffer('focus', 0.2);
        break;
    case 'win':
      createOscillator('square', 440, 0.2, 0.1);
      setTimeout(() => createOscillator('square', 554, 0.2, 0.1), 100);
      setTimeout(() => createOscillator('square', 659, 0.4, 0.1), 200);
      break;
    case 'error':
      createOscillator('sawtooth', 150, 0.2, 0.1);
      break;
  }
};

export const startBGM = () => {
    if (!chipPlayer) {
        initAudio();
        return;
    }
    chipPlayer.unpause();
    // If never loaded
    if (chipPlayer.duration === 0) { // Hacky check or just always load if needed
         chipPlayer.load(BGM_URL);
    }
};

export const stopBGM = () => {
    if (chipPlayer) {
        chipPlayer.pause();
    }
};

export const toggleMute = () => {
    isMuted = !isMuted;
    if (isMuted) {
        stopBGM();
    } else {
        if (chipPlayer) {
            chipPlayer.unpause();
            // If not loaded yet (e.g. init while muted)
            // We need to load it now
            // Since we can't easily check state, let's just call load if it seems empty
            // But load() fetches.
            // Let's just call initAudio() which handles "if (!chipPlayer)"
            // If chipPlayer exists, we just need to make sure it's playing.
            // For now, just unpause. If it wasn't playing, user might need to click again or we force load.
             if (!chipPlayer.duration) {
                 chipPlayer.load(BGM_URL);
             }
             chipPlayer.setVol(0.4);
        } else {
            initAudio();
        }
    }
    return isMuted;
};
