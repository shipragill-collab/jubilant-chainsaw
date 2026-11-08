"use client";

/**
 * Midnight Folio sound and touch. Everything is synthesized with Web Audio (no
 * audio files): a crisp gold "clink" on presses, a bell chime on correct
 * answers, a warm ember swell when the streak grows, and the unboxing sequence.
 * Haptics use navigator.vibrate where the device supports it (Android browsers;
 * iPhones ignore it). Browsers only allow sound after the user has interacted.
 */

const SOUND_KEY = "quiz-duel:skin-sound";
let ctx: AudioContext | null = null;

export function soundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
}

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !soundEnabled()) return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** One decaying partial: the building block of every sound here. */
function tone(ac: AudioContext, freq: number, start: number, dur: number, gain: number, type: OscillatorType = "sine", glideTo?: number) {
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + dur);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noiseSwell(ac: AudioContext, start: number, dur: number, gain: number) {
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(300, start);
  filter.frequency.exponentialRampToValueAtTime(2400, start + dur);
  const amp = ac.createGain();
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + dur * 0.6);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter).connect(amp).connect(ac.destination);
  src.start(start);
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

export const sfx = {
  /** Button press: a small gold coin tapped on glass. Two inharmonic partials, 120 ms. */
  clink() {
    const ac = audio();
    if (ac) {
      const t = ac.currentTime;
      tone(ac, 2480, t, 0.12, 0.08, "sine", 2300);
      tone(ac, 3710, t, 0.08, 0.04, "sine");
    }
    vibrate(8);
  },
  /** Correct answer: a soft two-note bell, C6 then G6. */
  chime() {
    const ac = audio();
    if (ac) {
      const t = ac.currentTime;
      tone(ac, 1046.5, t, 0.7, 0.09, "triangle");
      tone(ac, 2093, t, 0.4, 0.025);
      tone(ac, 1568, t + 0.11, 0.8, 0.08, "triangle");
      tone(ac, 3136, t + 0.11, 0.45, 0.02);
    }
    vibrate([12, 40, 12]);
  },
  /** Streak grows: a warm ember swell with a low thump underneath. */
  ember() {
    const ac = audio();
    if (ac) {
      const t = ac.currentTime;
      noiseSwell(ac, t, 0.45, 0.05);
      tone(ac, 110, t + 0.3, 0.35, 0.12, "sine", 70);
      tone(ac, 1318.5, t + 0.38, 0.6, 0.05, "triangle");
    }
    vibrate([20, 30, 20, 30, 60]);
  },
  /** Unboxing: three rising ticks while the card shakes. */
  tick(step: number) {
    const ac = audio();
    if (ac) tone(ac, 900 + step * 220, ac.currentTime, 0.06, 0.06, "square");
    vibrate(15 + step * 5);
  },
  /** Unboxing reveal: a low thud, then a bright C-E-G-C arpeggio. */
  reveal() {
    const ac = audio();
    if (ac) {
      const t = ac.currentTime;
      tone(ac, 82, t, 0.5, 0.18, "sine", 50);
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        tone(ac, f, t + 0.12 + i * 0.09, 1.2, 0.07, "triangle");
        tone(ac, f * 2, t + 0.12 + i * 0.09, 0.6, 0.02);
      });
    }
    vibrate([30, 60, 120]);
  },
};

/** Is the Midnight Folio skin on right now? */
export const skinActive = () => typeof document !== "undefined" && document.documentElement.dataset.skin === "midnight-folio";
