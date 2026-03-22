// Chess sound effects using Web Audio API — warm, rich, non-pixelated
import { isSoundEnabled } from "@/lib/settingsStore";

let audioCtx: AudioContext | null = null;
let reverbBuffer: AudioBuffer | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

// Synthetic impulse response for warm reverb tail
function createReverbBuffer(ctx: AudioContext, duration = 0.6, decay = 2.5): AudioBuffer {
  const length = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}

function getReverb(ctx: AudioContext): ConvolverNode {
  if (!reverbBuffer) reverbBuffer = createReverbBuffer(ctx);
  const convolver = ctx.createConvolver();
  convolver.buffer = reverbBuffer;
  return convolver;
}

// Utility: connect a chain with dry/wet reverb mix
function withReverb(ctx: AudioContext, source: AudioNode, wetAmount = 0.15): GainNode {
  const dry = ctx.createGain();
  const wet = ctx.createGain();
  const out = ctx.createGain();

  dry.gain.value = 1;
  wet.gain.value = wetAmount;

  const reverb = getReverb(ctx);

  source.connect(dry);
  source.connect(reverb);
  reverb.connect(wet);

  dry.connect(out);
  wet.connect(out);
  out.connect(ctx.destination);

  return out;
}

// Shaped noise for organic texture
function createShapedNoise(ctx: AudioContext, duration: number, shape: "exp" | "bell" = "exp"): AudioBufferSourceNode {
  const length = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  const mid = length / 2;

  for (let i = 0; i < length; i++) {
    const envelope = shape === "bell"
      ? Math.exp(-Math.pow((i - mid) / (length * 0.25), 2))
      : Math.exp(-i / (length * 0.18));
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

export function playMoveSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // --- Layer 1: Warm body tone (smooth sine, no harsh harmonics) ---
  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  const bodyFilter = ctx.createBiquadFilter();

  body.type = "sine";
  body.frequency.setValueAtTime(200, now);
  body.frequency.exponentialRampToValueAtTime(80, now + 0.1);

  bodyFilter.type = "lowpass";
  bodyFilter.frequency.setValueAtTime(600, now);
  bodyFilter.Q.setValueAtTime(1.5, now);

  bodyGain.gain.setValueAtTime(0, now);
  bodyGain.gain.linearRampToValueAtTime(0.4, now + 0.005); // soft attack
  bodyGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  body.connect(bodyFilter);
  bodyFilter.connect(bodyGain);
  withReverb(ctx, bodyGain, 0.1);

  body.start(now);
  body.stop(now + 0.15);

  // --- Layer 2: Soft click (triangle wave, gentler than square) ---
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  const clickFilter = ctx.createBiquadFilter();

  click.type = "triangle";
  click.frequency.setValueAtTime(900, now);
  click.frequency.exponentialRampToValueAtTime(350, now + 0.025);

  clickFilter.type = "bandpass";
  clickFilter.frequency.setValueAtTime(700, now);
  clickFilter.Q.setValueAtTime(0.8, now);

  clickGain.gain.setValueAtTime(0, now);
  clickGain.gain.linearRampToValueAtTime(0.12, now + 0.002);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  click.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(ctx.destination);

  click.start(now);
  click.stop(now + 0.04);

  // --- Layer 3: Wood texture (shaped noise, filtered warm) ---
  const noise = createShapedNoise(ctx, 0.07);
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();

  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(500, now);
  noiseFilter.Q.setValueAtTime(2, now);

  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.003);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now);
}

export function playCaptureSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // --- Layer 1: Deep impact ---
  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  const thudFilter = ctx.createBiquadFilter();

  thud.type = "sine";
  thud.frequency.setValueAtTime(220, now);
  thud.frequency.exponentialRampToValueAtTime(45, now + 0.18);

  thudFilter.type = "lowpass";
  thudFilter.frequency.setValueAtTime(400, now);
  thudFilter.Q.setValueAtTime(2, now);

  thudGain.gain.setValueAtTime(0, now);
  thudGain.gain.linearRampToValueAtTime(0.5, now + 0.006);
  thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

  thud.connect(thudFilter);
  thudFilter.connect(thudGain);
  withReverb(ctx, thudGain, 0.15);

  thud.start(now);
  thud.stop(now + 0.22);

  // --- Layer 2: Crack (triangle sweep, less harsh than sawtooth) ---
  const crack = ctx.createOscillator();
  const crackGain = ctx.createGain();
  const crackFilter = ctx.createBiquadFilter();

  crack.type = "triangle";
  crack.frequency.setValueAtTime(1800, now);
  crack.frequency.exponentialRampToValueAtTime(250, now + 0.04);

  crackFilter.type = "highpass";
  crackFilter.frequency.setValueAtTime(400, now);

  crackGain.gain.setValueAtTime(0, now);
  crackGain.gain.linearRampToValueAtTime(0.15, now + 0.002);
  crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  crack.connect(crackFilter);
  crackFilter.connect(crackGain);
  crackGain.connect(ctx.destination);

  crack.start(now);
  crack.stop(now + 0.06);

  // --- Layer 3: Heavy textured noise ---
  const noise = createShapedNoise(ctx, 0.12);
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();

  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(700, now);
  noiseFilter.Q.setValueAtTime(1.5, now);

  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.004);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  withReverb(ctx, noiseGain, 0.12);

  noise.start(now);

  // --- Layer 4: Sub resonance tail ---
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();

  sub.type = "sine";
  sub.frequency.setValueAtTime(100, now + 0.04);
  sub.frequency.exponentialRampToValueAtTime(45, now + 0.2);

  subGain.gain.setValueAtTime(0, now + 0.03);
  subGain.gain.linearRampToValueAtTime(0.2, now + 0.05);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  sub.connect(subGain);
  subGain.connect(ctx.destination);

  sub.start(now + 0.03);
  sub.stop(now + 0.2);
}

export function playMasterySound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Ascending major arpeggio — warm, triumphant
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const noteSpacing = 0.12;
  const noteDuration = 0.4;

  notes.forEach((freq, i) => {
    const t = now + i * noteSpacing;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);

    // Gentle shimmer with slight detune
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 1.002, t); // slight chorus
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.12, t + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000 + i * 500, t);
    filter.Q.setValueAtTime(0.7, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.015);
    gain.gain.setValueAtTime(0.25, t + noteDuration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);

    osc.connect(filter);
    filter.connect(gain);
    osc2.connect(gain2);
    gain2.connect(gain);

    if (i === notes.length - 1) {
      // Last note gets reverb
      withReverb(ctx, gain, 0.3);
    } else {
      withReverb(ctx, gain, 0.15);
    }

    osc.start(t);
    osc.stop(t + noteDuration);
    osc2.start(t);
    osc2.stop(t + noteDuration);
  });

  // Soft shimmer wash over everything
  const shimmerDuration = notes.length * noteSpacing + noteDuration + 0.2;
  const shimmer = createShapedNoise(ctx, shimmerDuration, "bell");
  const shimmerGain = ctx.createGain();
  const shimmerFilter = ctx.createBiquadFilter();

  shimmerFilter.type = "highpass";
  shimmerFilter.frequency.setValueAtTime(3000, now);

  shimmerGain.gain.setValueAtTime(0, now);
  shimmerGain.gain.linearRampToValueAtTime(0.04, now + shimmerDuration * 0.4);
  shimmerGain.gain.linearRampToValueAtTime(0, now + shimmerDuration);

  shimmer.connect(shimmerFilter);
  shimmerFilter.connect(shimmerGain);
  withReverb(ctx, shimmerGain, 0.25);

  shimmer.start(now);
}

export function playLineCompleteSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Quick two-note chime (fifth interval)
  const notes = [659.25, 987.77]; // E5, B5
  
  notes.forEach((freq, i) => {
    const t = now + i * 0.08;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    withReverb(ctx, gain, 0.2);

    osc.start(t);
    osc.stop(t + 0.3);
  });
}
