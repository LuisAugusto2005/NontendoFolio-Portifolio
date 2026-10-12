// Synthesized sound effects + an original lounge BGM, all generated with Web Audio.
// Nothing here samples or reproduces real console audio.
import { getSetting, onSettingChange } from './settings.js';

let ctx = null;
let master, sfxBus, musicBus, reverb, reverbSend, noiseBuf;

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

function makeImpulse(seconds = 1.6, decay = 3.2) {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}

function init() {
  if (ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.9;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);

  reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse();
  reverbSend = ctx.createGain();
  reverbSend.gain.value = 0.22;
  reverbSend.connect(reverb).connect(master);

  sfxBus = ctx.createGain();
  sfxBus.gain.value = getSetting('sfx') ? 1 : 0;
  sfxBus.connect(master);
  sfxBus.connect(reverbSend);

  musicBus = ctx.createGain();
  musicBus.gain.value = 0;
  musicBus.connect(master);
  musicBus.connect(reverbSend);

  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });
  return true;
}

/** Must be called from a user gesture (click / key press). */
export function unlockAudio() {
  if (!init()) return;
  if (ctx.state === 'suspended') ctx.resume();
}

onSettingChange((key, value) => {
  if (!ctx) return;
  if (key === 'sfx') sfxBus.gain.setTargetAtTime(value ? 1 : 0, ctx.currentTime, 0.05);
  if (key === 'music') value ? music.start() : music.stop();
});

const ready = () => ctx && ctx.state === 'running';

// ── primitives ──────────────────────────────────────────────────────────────
function tone(freq, { type = 'sine', dur = 0.12, vol = 0.15, attack = 0.004, when = 0, glide = null, bus = sfxBus, filter = null } = {}) {
  const t0 = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  let out = osc.connect(g);
  if (filter) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filter;
    out = out.connect(f);
  }
  out.connect(bus);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise({ dur = 0.3, vol = 0.1, when = 0, from = 400, to = 3000, q = 1.2, type = 'bandpass', bus = sfxBus } = {}) {
  const t0 = ctx.currentTime + when;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(from, t0);
  f.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(bus);
  src.start(t0, Math.random() * 0.5);
  src.stop(t0 + dur + 0.05);
}

// ── sound effects ───────────────────────────────────────────────────────────
let lastHover = 0;
export const sfx = {
  hover() {
    if (!ready()) return;
    const now = performance.now();
    if (now - lastHover < 45) return;
    lastHover = now;
    tone(1760, { dur: 0.06, vol: 0.05 });
    tone(2637, { dur: 0.04, vol: 0.018, when: 0.008 });
  },
  select() {
    if (!ready()) return;
    tone(1046.5, { type: 'triangle', dur: 0.12, vol: 0.12 });
    tone(1568, { type: 'triangle', dur: 0.2, vol: 0.12, when: 0.06 });
  },
  open() {
    if (!ready()) return;
    noise({ dur: 0.5, vol: 0.07, from: 300, to: 2600 });
    [72, 76, 79, 84].forEach((m, i) => tone(mtof(m + 12), { dur: 0.5, vol: 0.06, when: 0.05 + i * 0.055 }));
  },
  start() {
    if (!ready()) return;
    [60, 64, 67, 72].forEach((m, i) => tone(mtof(m + 12), { type: 'triangle', dur: 0.9, vol: 0.06, attack: 0.02, when: i * 0.02 }));
    tone(mtof(96), { dur: 0.6, vol: 0.03, when: 0.12 });
    noise({ dur: 0.35, vol: 0.04, from: 2000, to: 8000, type: 'highpass', q: 0.5 });
  },
  back() {
    if (!ready()) return;
    tone(1568, { type: 'triangle', dur: 0.1, vol: 0.1 });
    tone(1046.5, { type: 'triangle', dur: 0.18, vol: 0.1, when: 0.07 });
    noise({ dur: 0.35, vol: 0.04, from: 2400, to: 400 });
  },
  boot() {
    if (!ready()) return;
    [64, 68, 71, 76, 80].forEach((m, i) => tone(mtof(m + 12), { dur: 1.4, vol: 0.05, attack: 0.01, when: i * 0.07 }));
  },
  pop() {
    if (!ready()) return;
    tone(900 + Math.random() * 300, { dur: 0.09, vol: 0.12, glide: 180 });
    noise({ dur: 0.05, vol: 0.05, from: 3000, to: 6000, type: 'highpass' });
  },
  blip(pitch = 0) {
    if (!ready()) return;
    tone(560 + pitch + Math.random() * 120, { type: 'square', dur: 0.035, vol: 0.022, filter: 1800 });
  },
  boing() {
    if (!ready()) return;
    tone(260, { dur: 0.14, vol: 0.14, glide: 720 });
    tone(720, { dur: 0.22, vol: 0.1, glide: 380, when: 0.12 });
  },
  toggle(on) {
    if (!ready()) return;
    if (on) {
      tone(988, { type: 'triangle', dur: 0.08, vol: 0.1 });
      tone(1319, { type: 'triangle', dur: 0.12, vol: 0.1, when: 0.05 });
    } else {
      tone(1319, { type: 'triangle', dur: 0.08, vol: 0.1 });
      tone(988, { type: 'triangle', dur: 0.12, vol: 0.1, when: 0.05 });
    }
  },
  coin() {
    if (!ready()) return;
    tone(1175, { type: 'triangle', dur: 0.08, vol: 0.1 });
    tone(1760, { type: 'triangle', dur: 0.35, vol: 0.1, when: 0.07 });
  },
  tick() {
    if (!ready()) return;
    tone(2093, { dur: 0.03, vol: 0.03 });
  },
  error() {
    if (!ready()) return;
    tone(220, { type: 'square', dur: 0.12, vol: 0.05, filter: 900 });
    tone(196, { type: 'square', dur: 0.16, vol: 0.05, filter: 900, when: 0.13 });
  },
  whoosh() {
    if (!ready()) return;
    noise({ dur: 0.45, vol: 0.06, from: 500, to: 3500 });
  },
  sparkle() {
    if (!ready()) return;
    [84, 88, 91, 96].forEach((m, i) => tone(mtof(m), { dur: 0.3, vol: 0.035, when: i * 0.045 }));
  },
};

// ── music: original bossa-lounge loop (C major, 108 BPM) ────────────────────
// Chords are [bassMidi, [voicing...]]; two per bar where needed.
const CH = {
  Cmaj7: [48, [64, 67, 71, 74]],
  Am7: [45, [60, 64, 67, 71]],
  Dm7: [50, [62, 65, 69, 72]],
  G7: [43, [59, 62, 65, 69]],
  Em7: [52, [62, 67, 71, 74]],
  A7: [45, [61, 64, 67, 71]],
  Fmaj7: [53, [60, 64, 65, 69]],
  Fm6: [53, [60, 62, 65, 68]],
};
// bars → list of [chordName, startBeat, lengthBeats]
const BARS = [
  [['Cmaj7', 0, 4]], [['Am7', 0, 4]], [['Dm7', 0, 4]], [['G7', 0, 4]],
  [['Em7', 0, 4]], [['A7', 0, 4]], [['Dm7', 0, 2], ['G7', 2, 2]], [['Cmaj7', 0, 4]],
  [['Fmaj7', 0, 4]], [['Fm6', 0, 4]], [['Em7', 0, 4]], [['A7', 0, 4]],
  [['Dm7', 0, 4]], [['G7', 0, 4]], [['Cmaj7', 0, 2], ['A7', 2, 2]], [['Dm7', 0, 2], ['G7', 2, 2]],
];
// melody per bar: [beat, lengthBeats, midi]
const MEL = [
  [[0, 1, 76], [1, 0.5, 79], [1.5, 0.5, 81], [2, 1.5, 79]],
  [[0, 0.5, 76], [0.5, 0.5, 72], [1, 1, 74], [2.5, 0.5, 76], [3, 1, 72]],
  [[0, 1, 77], [1, 0.5, 81], [1.5, 1, 84], [3, 0.5, 81], [3.5, 0.5, 77]],
  [[0, 1.5, 79], [1.5, 0.5, 77], [2, 1, 74], [3, 1, 71]],
  [[0, 0.5, 79], [0.5, 1, 83], [1.5, 0.5, 81], [2, 1, 79], [3, 1, 76]],
  [[0, 0.5, 76], [0.5, 0.5, 79], [1, 1, 81], [2, 1, 85], [3, 1, 81]],
  [[0, 1, 77], [1, 1, 81], [2, 0.5, 79], [2.5, 0.5, 77], [3, 1, 74]],
  [[0, 2, 76], [3, 0.5, 67], [3.5, 0.5, 69]],
  [[0, 1.5, 81], [1.5, 0.5, 79], [2, 1, 76], [3, 1, 72]],
  [[0, 1.5, 80], [1.5, 0.5, 79], [2, 1, 77], [3, 1, 74]],
  [[0, 0.5, 76], [0.5, 0.5, 79], [1, 1.5, 83], [2.5, 0.5, 81], [3, 1, 79]],
  [[0, 0.5, 81], [0.5, 0.5, 79], [1, 1, 76], [2, 1, 73], [3, 1, 69]],
  [[0, 0.5, 74], [0.5, 0.5, 77], [1, 1, 81], [2, 1.5, 84]],
  [[0, 1, 83], [1, 0.5, 81], [1.5, 0.5, 79], [2, 1, 77], [3, 1, 74]],
  [[0, 1, 76], [1, 1, 79], [2, 0.5, 79], [2.5, 0.5, 76], [3, 1, 73]],
  [[0, 1, 74], [1, 1, 77], [2, 1, 71], [3, 0.5, 74], [3.5, 0.5, 67]],
];

const BPM = 108;
const BEAT = 60 / BPM;
const SWING = 0.055;

function swingTime(beat) {
  // delay off-beat eighths for a relaxed groove
  const frac = beat % 1;
  return beat * BEAT + (Math.abs(frac - 0.5) < 1e-3 ? SWING : 0);
}

function ep(midi, t, dur, vol) {
  const f = mtof(midi);
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2200;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(vol * 0.35, t + 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.35);
  [1, 2].forEach((mult, i) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = f * mult;
    o.detune.value = i ? 4 : -3;
    const og = ctx.createGain();
    og.gain.value = i ? 0.18 : 1;
    o.connect(og).connect(lp);
    o.start(t);
    o.stop(t + dur + 0.45);
  });
  lp.connect(g).connect(musicBus);
}

function mallet(midi, t, dur, vol) {
  const f = mtof(midi);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.35, dur * BEAT + 0.25));
  const o = ctx.createOscillator();
  o.type = 'sine';
  o.frequency.value = f;
  o.connect(g);
  const o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = f * 4;
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(vol * 0.25, t);
  g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  o2.connect(g2).connect(musicBus);
  g.connect(musicBus);
  o.start(t);
  o2.start(t);
  o.stop(t + dur * BEAT + 0.5);
  o2.stop(t + 0.12);
}

function bass(midi, t, dur, vol) {
  const o = ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.value = mtof(midi);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(vol * 0.5, t + 0.25);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(lp).connect(g).connect(musicBus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function shaker(t, vol) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  src.connect(hp).connect(g).connect(musicBus);
  src.start(t, Math.random() * 0.8);
  src.stop(t + 0.08);
}

function kick(t, vol) {
  const o = ctx.createOscillator();
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
  o.connect(g).connect(musicBus);
  o.start(t);
  o.stop(t + 0.25);
}

function scheduleBar(barIndex, t0) {
  const bar = BARS[barIndex];
  for (const [name, start, len] of bar) {
    const [root, voicing] = CH[name];
    const at = (b) => t0 + swingTime(start + b);
    // bass: root – fifth pattern (bossa-ish)
    bass(root, at(0), BEAT * 1.4, 0.22);
    if (len >= 4) {
      bass(root + 7, at(1.5), BEAT * 0.45, 0.14);
      bass(root + 7, at(2), BEAT * 1.4, 0.18);
      bass(root, at(3.5), BEAT * 0.45, 0.13);
    } else {
      bass(root + 7, at(1.5), BEAT * 0.45, 0.14);
    }
    // electric-piano comping
    const hits = len >= 4 ? [0, 1.5, 3] : [0, 1.5];
    hits.forEach((h) => voicing.forEach((m) => ep(m, at(h), BEAT * 0.7, 0.028)));
  }
  // percussion
  for (let e = 0; e < 8; e++) shaker(t0 + swingTime(e * 0.5), e % 2 ? 0.035 : 0.018);
  kick(t0, 0.18);
  kick(t0 + swingTime(2.5), 0.1);
  // melody
  for (const [b, len, m] of MEL[barIndex]) mallet(m, t0 + swingTime(b), len, 0.07);
}

export const music = {
  playing: false,
  timer: null,
  nextBarTime: 0,
  bar: 0,
  start() {
    if (!ctx || this.playing || !getSetting('music')) return;
    this.playing = true;
    this.bar = 0;
    this.nextBarTime = ctx.currentTime + 0.15;
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 2.5);
    const tick = () => {
      if (!this.playing) return;
      while (this.nextBarTime < ctx.currentTime + 0.6) {
        scheduleBar(this.bar, this.nextBarTime);
        this.nextBarTime += BEAT * 4;
        this.bar = (this.bar + 1) % BARS.length;
      }
    };
    tick();
    this.timer = setInterval(tick, 120);
  },
  stop() {
    if (!ctx || !this.playing) return;
    this.playing = false;
    clearInterval(this.timer);
    musicBus.gain.cancelScheduledValues(ctx.currentTime);
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime);
    musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
  },
  /** Briefly lower the music (e.g. while the Mii talks or a download runs). */
  duck(amount = 0.3, seconds = 1) {
    if (!ctx || !this.playing) return;
    const t = ctx.currentTime;
    musicBus.gain.cancelScheduledValues(t);
    musicBus.gain.setValueAtTime(musicBus.gain.value, t);
    musicBus.gain.linearRampToValueAtTime(0.55 * amount, t + 0.15);
    musicBus.gain.linearRampToValueAtTime(0.55, t + seconds);
  },
};
