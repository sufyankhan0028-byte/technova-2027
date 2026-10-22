/**
 * TECHNOVA 2027 — RETRO ARCADE MINIGAME: "BUG HUNTER '27"
 * 2D Canvas Retro Arcade Mini-game running inside the arcade cabinet.
 */

import { arcadeAudio } from './audio.js';

export class ArcadeMinigame {
  constructor() {
    this.canvas = document.getElementById('minigame-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.overlay = document.getElementById('minigame-overlay');
    this.startScreen = document.getElementById('minigame-start-screen');
    this.gameoverScreen = document.getElementById('minigame-gameover-screen');
    this.startBtn = document.getElementById('start-game-btn');
    this.restartBtn = document.getElementById('restart-game-btn');

    // HUD Elements
    this.hudScore = document.getElementById('hud-score');
    this.hudLives = document.getElementById('hud-lives');
    this.hudHigh = document.getElementById('hud-high');
    this.finalScoreEl = document.getElementById('final-score');
    this.highScoreEl = document.getElementById('high-score');

    // Controls
    this.leftBtn = document.getElementById('minigame-left-btn');
    this.rightBtn = document.getElementById('minigame-right-btn');

    // State
    this.isRunning = false;
    this.score = 0;
    this.lives = 3;
    this.highScore = parseInt(localStorage.getItem('technova_hiscore') || '500', 10);
    this.items = [];
    this.popups = [];
    this.spawnTimer = 0;
    this.difficulty = 1;

    // Player state
    this.player = {
      x: this.canvas.width / 2 - 20,
      y: this.canvas.height - 35,
      width: 40,
      height: 20,
      speed: 6,
      movingLeft: false,
      movingRight: false
    };

    this.init();
  }

  init() {
    this.updateHUD();

    // Start & Restart Listeners
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        arcadeAudio.playCoin();
        this.startGame();
      });
    }

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        arcadeAudio.playCoin();
        this.startGame();
      });
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (!this.isRunning) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.player.movingLeft = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.player.movingRight = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.player.movingLeft = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.player.movingRight = false;
      }
    });

    // Touch / Onscreen button controls
    if (this.leftBtn) {
      this.leftBtn.addEventListener('mousedown', () => (this.player.movingLeft = true));
      this.leftBtn.addEventListener('mouseup', () => (this.player.movingLeft = false));
      this.leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.player.movingLeft = true; });
      this.leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.player.movingLeft = false; });
    }

    if (this.rightBtn) {
      this.rightBtn.addEventListener('mousedown', () => (this.player.movingRight = true));
      this.rightBtn.addEventListener('mouseup', () => (this.player.movingRight = false));
      this.rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.player.movingRight = true; });
      this.rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.player.movingRight = false; });
    }

    // Mouse direct follow on canvas
    this.canvas.addEventListener('mousemove', (e) => {
      if (!this.isRunning) return;
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const mouseX = (e.clientX - rect.left) * scaleX;
      this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, mouseX - this.player.width / 2));
    });

    // Initial idle draw
    this.renderIdleScreen();
  }

  startGame() {
    this.score = 0;
    this.lives = 3;
    this.difficulty = 1;
    this.items = [];
    this.popups = [];
    this.player.x = this.canvas.width / 2 - 20;
    this.isRunning = true;

    if (this.overlay) this.overlay.classList.add('hidden');
    if (this.startScreen) this.startScreen.classList.add('hidden');
    if (this.gameoverScreen) this.gameoverScreen.classList.add('hidden');

    this.updateHUD();
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  gameOver() {
    this.isRunning = false;
    arcadeAudio.playGameOver();

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('technova_hiscore', this.highScore);
    }

    if (this.finalScoreEl) this.finalScoreEl.textContent = this.score;
    if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;

    if (this.overlay) this.overlay.classList.remove('hidden');
    if (this.gameoverScreen) this.gameoverScreen.classList.remove('hidden');
    if (this.startScreen) this.startScreen.classList.add('hidden');

    this.updateHUD();
  }

  updateHUD() {
    if (this.hudScore) this.hudScore.textContent = String(this.score).padStart(4, '0');
    if (this.hudHigh) this.hudHigh.textContent = String(this.highScore).padStart(4, '0');
    if (this.hudLives) {
      let hearts = '';
      for (let i = 0; i < this.lives; i++) hearts += '❤️';
      this.hudLives.textContent = hearts || '💀';
    }
  }

  spawnItem() {
    const types = [
      { type: 'coffee', emoji: '☕', points: 50, speed: 2.2, color: '#f59e0b', weight: 45 },
      { type: 'star', emoji: '★', points: 100, speed: 2.8, color: '#ffc400', weight: 25 },
      { type: 'bug', emoji: '👾', points: -1, speed: 2.5, color: '#ef4444', weight: 25 },
      { type: 'rocket', emoji: '🚀', points: 200, speed: 3.5, color: '#ff007a', weight: 5 }
    ];

    // Weighted random
    const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosen = types[0];

    for (let t of types) {
      if (rand < t.weight) {
        chosen = t;
        break;
      }
      rand -= t.weight;
    }

    const x = Math.random() * (this.canvas.width - 30) + 10;
    this.items.push({
      x: x,
      y: -20,
      size: 24,
      type: chosen.type,
      emoji: chosen.emoji,
      points: chosen.points,
      color: chosen.color,
      speed: chosen.speed * (1 + (this.difficulty - 1) * 0.15)
    });
  }

  addPopup(text, x, y, color) {
    this.popups.push({
      text: text,
      x: x,
      y: y,
      color: color,
      alpha: 1.0,
      vy: -1.2
    });
  }

  gameLoop(timestamp) {
    if (!this.isRunning) return;

    // Movement
    if (this.player.movingLeft && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (this.player.movingRight && this.player.x < this.canvas.width - this.player.width) {
      this.player.x += this.player.speed;
    }

    // Spawning items
    this.spawnTimer++;
    if (this.spawnTimer > Math.max(25, 60 - this.difficulty * 4)) {
      this.spawnItem();
      this.spawnTimer = 0;
      this.difficulty += 0.05;
    }

    // Update items & collision
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += item.speed;

      // Check collision with player
      if (
        item.x + item.size > this.player.x &&
        item.x < this.player.x + this.player.width &&
        item.y + item.size > this.player.y &&
        item.y < this.player.y + this.player.height
      ) {
        if (item.type === 'bug') {
          // Bug hit
          this.lives--;
          arcadeAudio.playLaser();
          this.addPopup('-1 LIFE!', this.player.x, this.player.y - 10, '#ef4444');
          if (this.lives <= 0) {
            this.gameOver();
            return;
          }
        } else {
          // Positive pickup
          this.score += item.points;
          arcadeAudio.playCoin();
          this.addPopup(`+${item.points}`, item.x, item.y, item.color);
        }
        this.updateHUD();
        this.items.splice(i, 1);
        continue;
      }

      // Out of bounds
      if (item.y > this.canvas.height + 20) {
        this.items.splice(i, 1);
      }
    }

    // Update floating popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.y += p.vy;
      p.alpha -= 0.025;
      if (p.alpha <= 0) {
        this.popups.splice(i, 1);
      }
    }

    // RENDER FRAME
    this.draw();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Retro grid background on canvas
    ctx.strokeStyle = 'rgba(255, 0, 122, 0.08)';
    ctx.lineWidth = 1;
    const gridSize = 20;
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    // Draw Player (Retro Neon Hacker Pod)
    ctx.fillStyle = '#ff007a';
    ctx.shadowColor = '#ff007a';
    ctx.shadowBlur = 12;
    ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    // Pod cockpit & lights
    ctx.fillStyle = '#ffc400';
    ctx.shadowColor = '#ffc400';
    ctx.shadowBlur = 8;
    ctx.fillRect(this.player.x + 12, this.player.y + 4, 16, 6);

    // Neon edge highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);

    // Draw Falling Items
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '20px "Press Start 2P", monospace';

    this.items.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.shadowColor = item.color;
      ctx.shadowBlur = 10;
      ctx.fillText(item.emoji, item.x + item.size / 2, item.y + item.size / 2);
    });

    // Draw Popups
    ctx.font = '10px "Press Start 2P", monospace';
    this.popups.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillText(p.text, p.x, p.y);
    });
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
  }

  renderIdleScreen() {
    this.draw();
  }
}
