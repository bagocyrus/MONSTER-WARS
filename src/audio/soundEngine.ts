// 8-bit Web Audio Synthesizer for Retro Sound FX and Procedural Chiptune Music

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;

  public sfxEnabled: boolean = true;
  public musicEnabled: boolean = true;
  public sfxVolume: number = 0.7;
  public musicVolume: number = 0.5;

  private currentTrack: 'menu' | 'battle' | 'boss' | null = null;
  private musicInterval: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // Lazy init audio on first user touch/click
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    } catch {
      // Audio not supported or blocked
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
    }
  }

  public toggleSfx(enabled: boolean) {
    this.sfxEnabled = enabled;
    this.setSfxVolume(this.sfxVolume);
  }

  public toggleMusic(enabled: boolean) {
    this.musicEnabled = enabled;
    this.setMusicVolume(this.musicVolume);
    if (!enabled) {
      this.stopMusic();
    } else if (this.currentTrack) {
      this.playMusic(this.currentTrack);
    }
  }

  // --- Retro Sound Effects ---

  public playSpawn() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.08);
    osc.frequency.setValueAtTime(587, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.16);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playSwordHit() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // White noise metallic burst
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(4.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  public playArrowShoot() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.12);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playArrowHit() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.06);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  public playMagic() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playExplosion() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.linearRampToValueAtTime(80, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  public playLightning() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1800, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.3);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.3);

    // Follow-up rumble
    setTimeout(() => this.playExplosion(), 80);
  }

  public playRally() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [293.66, 369.99, 440.0, 587.33]; // D4, F#4, A4, D5
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playCoin() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.07); // E6

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playButtonClick() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.04);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  public playVictory() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    // Fanfare: C4, E4, G4, C5, E5, G5
    const fanfare = [
      { f: 261.63, d: 0.12 },
      { f: 329.63, d: 0.12 },
      { f: 392.00, d: 0.12 },
      { f: 523.25, d: 0.24 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.45 }
    ];

    let delay = 0;
    fanfare.forEach((item) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t);

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.linearRampToValueAtTime(0, t + item.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + item.d);
      delay += item.d * 0.9;
    });
  }

  public playDefeat() {
    if (!this.sfxEnabled) return;
    this.init();
    this.resume();
    if (!this.ctx || !this.sfxGain) return;

    const sorrow = [
      { f: 392.00, d: 0.2 },
      { f: 369.99, d: 0.2 },
      { f: 329.63, d: 0.25 },
      { f: 293.66, d: 0.5 }
    ];

    let delay = 0;
    sorrow.forEach((item) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(item.f, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.linearRampToValueAtTime(0, t + item.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + item.d);
      delay += item.d * 0.9;
    });
  }

  // --- Procedural Chiptune Music Generator ---

  public playMusic(track: 'menu' | 'battle' | 'boss') {
    this.currentTrack = track;
    if (!this.musicEnabled) return;
    this.init();
    this.resume();
    this.stopMusic(false);

    const bpm = track === 'boss' ? 148 : track === 'battle' ? 136 : 108;
    const stepDuration = 60 / bpm / 2; // 8th note duration

    // Melodies (Hz frequencies, 0 = rest)
    const menuMelody = [
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 440.00, 392.00,
      349.23, 392.00, 440.00, 523.25, 392.00, 329.63, 261.63, 0
    ];
    const menuBass = [
      130.81, 0, 130.81, 0, 146.83, 0, 146.83, 0,
      174.61, 0, 174.61, 0, 196.00, 0, 196.00, 0
    ];

    const battleMelody = [
      220.00, 220.00, 261.63, 293.66, 329.63, 293.66, 261.63, 246.94,
      220.00, 261.63, 293.66, 329.63, 392.00, 329.63, 293.66, 261.63,
      293.66, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66,
      261.63, 293.66, 329.63, 293.66, 220.00, 0, 220.00, 0
    ];
    const battleBass = [
      110.00, 110.00, 110.00, 110.00, 130.81, 130.81, 146.83, 146.83,
      110.00, 110.00, 110.00, 110.00, 164.81, 164.81, 146.83, 146.83,
      146.83, 146.83, 146.83, 146.83, 174.61, 174.61, 164.81, 164.81,
      130.81, 130.81, 146.83, 146.83, 110.00, 110.00, 110.00, 110.00
    ];

    const bossMelody = [
      164.81, 164.81, 196.00, 220.00, 246.94, 220.00, 196.00, 164.81,
      261.63, 246.94, 220.00, 196.00, 164.81, 196.00, 220.00, 246.94,
      329.63, 329.63, 293.66, 261.63, 246.94, 220.00, 196.00, 164.81,
      146.83, 164.81, 196.00, 220.00, 164.81, 0, 164.81, 0
    ];
    const bossBass = [
      82.41, 82.41, 82.41, 82.41, 98.00, 98.00, 110.00, 110.00,
      130.81, 130.81, 110.00, 110.00, 82.41, 82.41, 98.00, 110.00,
      164.81, 164.81, 146.83, 146.83, 130.81, 130.81, 110.00, 110.00,
      73.42, 82.41, 98.00, 110.00, 82.41, 82.41, 82.41, 82.41
    ];

    const melody = track === 'boss' ? bossMelody : track === 'battle' ? battleMelody : menuMelody;
    const bass = track === 'boss' ? bossBass : track === 'battle' ? battleBass : menuBass;

    this.musicStep = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.musicEnabled || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;
      const idx = this.musicStep % melody.length;
      const mNote = melody[idx];
      const bNote = bass[idx % bass.length];

      // Lead Note
      if (mNote > 0) {
        const lead = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        lead.type = track === 'menu' ? 'triangle' : 'square';
        lead.frequency.setValueAtTime(mNote, t);

        lGain.gain.setValueAtTime(0.08, t);
        lGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.9);

        lead.connect(lGain);
        lGain.connect(this.musicGain);

        lead.start(t);
        lead.stop(t + stepDuration * 0.95);
      }

      // Bass Note
      if (bNote > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bNote, t);

        bGain.gain.setValueAtTime(0.06, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.85);

        bassOsc.connect(bGain);
        bGain.connect(this.musicGain);

        bassOsc.start(t);
        bassOsc.stop(t + stepDuration * 0.9);
      }

      // Snare/Hat on beats for battle/boss
      if (track !== 'menu' && (this.musicStep % 2 === 1)) {
        this.playDrumHat(t, stepDuration * 0.5);
      }

      this.musicStep++;
    }, stepDuration * 1000);
  }

  private playDrumHat(t: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.03, t);
    gain.gain.linearRampToValueAtTime(0, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
  }

  public stopMusic(clearTrack = true) {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    if (clearTrack) {
      this.currentTrack = null;
    }
  }
}

export const soundEngine = new SoundEngine();
