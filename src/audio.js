/**
 * TECHNOVA 2027 — PURE WEB AUDIO API 8-BIT ARCADE SOUND SYNTHESIZER
 * Zero external audio assets needed! Generates authentic retro chiptune sounds.
 */

class ArcadeAudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;

    // Load persisted state
    const saved = localStorage.getItem('technova_sfx');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('technova_sfx', this.enabled);
    if (this.enabled) {
      this.playCoin();
    }
    return this.enabled;
  }

  // 1. Classic Arcade Coin Ding (B5 -> E6)
  playCoin() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // 2. UI Click / Hover Blip
  playBlip() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 3. Power-Up Fanfare
  playPowerup() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      const start = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.08);
    });
  }

  // 4. Arcade Laser / Warp Swoop
  playLaser() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  // 5. Game Over / Error Buzzer
  playGameOver() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 415, 392, 349];
    notes.forEach((freq, idx) => {
      const start = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.2);
    });
  }

  // 6. Registration Success / Victory Chord
  playVictory() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, t: 0.0 },   // C5
      { f: 659.25, t: 0.1 },   // E5
      { f: 783.99, t: 0.2 },   // G5
      { f: 1046.50, t: 0.32 }, // C6
      { f: 1318.51, t: 0.44 }  // E6
    ];

    notes.forEach(n => {
      const start = this.ctx.currentTime + n.t;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.4);
    });
  }
}

export const arcadeAudio = new ArcadeAudioSystem();
