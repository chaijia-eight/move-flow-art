// Chess sound effects using Web Audio API - thick, woody sounds

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function playMoveSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Woody "thock" - low frequency knock
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(800, now);
  filter.Q.setValueAtTime(2, now);

  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);

  // Click layer - higher freq snap
  const click = ctx.createOscillator();
  const clickGain = ctx.createGain();
  const clickFilter = ctx.createBiquadFilter();

  click.type = "square";
  click.frequency.setValueAtTime(1200, now);
  click.frequency.exponentialRampToValueAtTime(300, now + 0.03);

  clickFilter.type = "bandpass";
  clickFilter.frequency.setValueAtTime(1000, now);
  clickFilter.Q.setValueAtTime(1, now);

  clickGain.gain.setValueAtTime(0.15, now);
  clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  click.connect(clickFilter);
  clickFilter.connect(clickGain);
  clickGain.connect(ctx.destination);

  click.start(now);
  click.stop(now + 0.05);

  // Noise burst for wood texture
  const bufferSize = ctx.sampleRate * 0.06;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();

  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(600, now);
  noiseFilter.Q.setValueAtTime(3, now);

  noiseGain.gain.setValueAtTime(0.25, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now);
}

export function playCaptureSound() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Heavy impact thud
  const thud = ctx.createOscillator();
  const thudGain = ctx.createGain();
  const thudFilter = ctx.createBiquadFilter();

  thud.type = "sine";
  thud.frequency.setValueAtTime(250, now);
  thud.frequency.exponentialRampToValueAtTime(40, now + 0.15);

  thudFilter.type = "lowpass";
  thudFilter.frequency.setValueAtTime(500, now);
  thudFilter.Q.setValueAtTime(4, now);

  thudGain.gain.setValueAtTime(0.6, now);
  thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

  thud.connect(thudFilter);
  thudFilter.connect(thudGain);
  thudGain.connect(ctx.destination);

  thud.start(now);
  thud.stop(now + 0.2);

  // Sharp crack
  const crack = ctx.createOscillator();
  const crackGain = ctx.createGain();

  crack.type = "sawtooth";
  crack.frequency.setValueAtTime(2000, now);
  crack.frequency.exponentialRampToValueAtTime(200, now + 0.04);

  crackGain.gain.setValueAtTime(0.2, now);
  crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  crack.connect(crackGain);
  crackGain.connect(ctx.destination);

  crack.start(now);
  crack.stop(now + 0.06);

  // Heavy noise burst
  const bufferSize = ctx.sampleRate * 0.1;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();

  noiseFilter.type = "bandpass";
  noiseFilter.frequency.setValueAtTime(900, now);
  noiseFilter.Q.setValueAtTime(2, now);

  noiseGain.gain.setValueAtTime(0.35, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);

  noise.start(now);

  // Secondary resonance
  const res = ctx.createOscillator();
  const resGain = ctx.createGain();

  res.type = "sine";
  res.frequency.setValueAtTime(120, now + 0.03);
  res.frequency.exponentialRampToValueAtTime(50, now + 0.18);

  resGain.gain.setValueAtTime(0.3, now + 0.03);
  resGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  res.connect(resGain);
  resGain.connect(ctx.destination);

  res.start(now + 0.03);
  res.stop(now + 0.18);
}
