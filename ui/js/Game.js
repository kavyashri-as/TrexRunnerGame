/**
 * Orchestrates the game loop, input handling, spawning, collisions and HUD/API sync.
 * Relies on Dino, Obstacle, Cloud, Ground, ScoreManager and ApiClient being loaded
 * as globals via <script> tags before this file.
 */
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.groundY = this.height - 30;

    this.apiClient = new ApiClient();
    this.scoreManager = new ScoreManager(this.apiClient);

    this.dino = new Dino(40, this.groundY);
    this.ground = new Ground(this.groundY, this.width);
    this.clouds = this._createClouds(4);
    this.obstacles = [];

    this.baseSpeed = 300; // px/sec
    this.speed = this.baseSpeed;
    this.maxSpeed = 700;

    this.isRunning = false;
    this.isGameOver = false;
    this.lastTimestamp = null;
    this.obstacleTimer = 0;
    this.nextObstacleInterval = this._randomObstacleInterval();

    this.scoreEl = document.getElementById('score');
    this.highScoreEl = document.getElementById('high-score');
    this.overlayEl = document.getElementById('overlay');
    this.overlayTitleEl = document.getElementById('overlay-title');
    this.restartBtn = document.getElementById('restart-btn');
    this.startOverlayEl = document.getElementById('start-overlay');
    this.startBtn = document.getElementById('start-btn');

    this._bindEvents();
    this._draw(); // static preview scene (dino + background) before the first start
  }

  _createClouds(count) {
    const clouds = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.width * 1.5 + this.width * 0.2 * i;
      const y = 20 + Math.random() * 60;
      clouds.push(new Cloud(x, y));
    }
    return clouds;
  }

  _randomObstacleInterval() {
    return 0.9 + Math.random() * 1.3; // seconds
  }

  _bindEvents() {
    const handleJump = () => {
      if (this.isGameOver) {
        this.restart();
        return;
      }
      if (!this.isRunning) {
        this.start();
      }
      this.dino.jump();
    };

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    });

    this.canvas.addEventListener('click', handleJump);
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this.restart());
    }
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.start());
    }
  }

  async init() {
    await this.scoreManager.init();
    this._updateHud();
  }

  start() {
    if (this.isRunning) return;
    if (this.startOverlayEl) this.startOverlayEl.classList.add('hidden');
    this.isRunning = true;
    this.isGameOver = false;
    this.lastTimestamp = null;
    requestAnimationFrame((t) => this._loop(t));
  }

  restart() {
    this.dino = new Dino(40, this.groundY);
    this.obstacles = [];
    this.speed = this.baseSpeed;
    this.scoreManager.reset();
    this.isGameOver = false;
    this.overlayEl.classList.add('hidden');
    this.start();
  }

  _loop(timestamp) {
    if (!this.isRunning) return;

    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
    }
    const deltaTime = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;

    this._update(deltaTime);
    this._draw();

    if (this.isGameOver) {
      this.isRunning = false;
      this._handleGameOver();
      return;
    }

    requestAnimationFrame((t) => this._loop(t));
  }

  _update(deltaTime) {
    this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.scoreManager.score * 0.5);

    this.dino.update(deltaTime);
    this.ground.update(deltaTime, this.speed);
    this.clouds.forEach((cloud) => cloud.update(deltaTime, this.width));

    this.obstacleTimer += deltaTime;
    if (this.obstacleTimer >= this.nextObstacleInterval) {
      this.obstacleTimer = 0;
      this.nextObstacleInterval = this._randomObstacleInterval();
      this.obstacles.push(new Obstacle(this.width + 20, this.groundY, Obstacle.randomSize()));
    }

    this.obstacles.forEach((obstacle) => obstacle.update(deltaTime, this.speed));
    this.obstacles = this.obstacles.filter((o) => !o.markedForRemoval);

    this.scoreManager.update(deltaTime, this.speed);
    this._updateHud();

    const dinoBounds = this.dino.getBounds();
    for (const obstacle of this.obstacles) {
      if (obstacle.intersects(dinoBounds)) {
        this.isGameOver = true;
        break;
      }
    }
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#87ceeb');
    gradient.addColorStop(1, '#e0f6ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    this.clouds.forEach((cloud) => cloud.draw(ctx));
    this.ground.draw(ctx);
    this.obstacles.forEach((obstacle) => obstacle.draw(ctx));
    this.dino.draw(ctx);
  }

  _updateHud() {
    if (this.scoreEl) this.scoreEl.textContent = this.scoreManager.getFormattedScore();
    if (this.highScoreEl) this.highScoreEl.textContent = this.scoreManager.getFormattedHighScore();
  }

  async _handleGameOver() {
    await this.scoreManager.submitCurrentScore();
    this._updateHud();
    this.overlayTitleEl.textContent = 'Game Over';
    this.overlayEl.classList.remove('hidden');
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
