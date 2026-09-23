/**
 * Game - Main game controller
 *
 * Orchestrates the game loop, input handling, obstacle spawning, collision detection,
 * and HUD/API synchronization. Manages game state including running, game over, speed,
 * and score updates.
 *
 * Dependencies: Dino, Obstacle, Cloud, Ground, ScoreManager, and ApiClient must be
 * loaded as globals via <script> tags before this file.
 *
 * @class Game
 */
class Game {
  /**
   * Initializes the Game instance with canvas setup, UI element references,
   * and initial game objects (dino, ground, clouds).
   *
   * @param {HTMLCanvasElement} canvas - The canvas element to render the game
   */
  constructor(canvas) {
    // Canvas and rendering context
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.groundY = this.height - 30;

    // Game services
    this.apiClient = new ApiClient();
    this.scoreManager = new ScoreManager(this.apiClient);

    // Game entities
    this.dino = new Dino(40, this.groundY);
    this.ground = new Ground(this.groundY, this.width);
    this.clouds = this._createClouds(4);
    this.obstacles = [];

    // Game speed management (px/sec)
    this.baseSpeed = 300;
    this.speed = this.baseSpeed;
    this.maxSpeed = 700;

    // Game state
    this.isRunning = false;
    this.isGameOver = false;
    this.lastTimestamp = null;
    this.obstacleTimer = 0;
    this.nextObstacleInterval = this._randomObstacleInterval();

    // UI element references
    this.scoreEl = document.getElementById('score');
    this.highScoreEl = document.getElementById('high-score');
    this.overlayEl = document.getElementById('overlay');
    this.overlayTitleEl = document.getElementById('overlay-title');
    this.restartBtn = document.getElementById('restart-btn');
    this.startOverlayEl = document.getElementById('start-overlay');
    this.startBtn = document.getElementById('start-btn');

    this._bindEvents();
    this._draw();
  }

  /**
   * Creates an array of Cloud objects positioned across the canvas.
   *
   * @private
   * @param {number} count - Number of clouds to create
   * @returns {Cloud[]} Array of Cloud objects
   */
  _createClouds(count) {
    const clouds = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * this.width * 1.5 + this.width * 0.2 * i;
      const y = 20 + Math.random() * 60;
      clouds.push(new Cloud(x, y));
    }
    return clouds;
  }

  /**
   * Generates a random interval (in seconds) for spawning the next obstacle.
   * Range: 0.9 to 2.2 seconds.
   *
   * @private
   * @returns {number} Random interval in seconds
   */
  _randomObstacleInterval() {
    return 0.9 + Math.random() * 1.3;
  }

  /**
   * Binds event listeners for keyboard (Space/ArrowUp) and mouse (click) input.
   * Space or ArrowUp triggers: jump if running, or start the game if not running.
   * If game is over, restart is triggered instead of jump.
   *
   * @private
   */
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

  /**
   * Asynchronously initializes the game by loading score data from the API
   * and updating the HUD with initial values.
   *
   * @async
   * @returns {Promise<void>}
   */
  async init() {
    await this.scoreManager.init();
    this._updateHud();
  }

  /**
   * Starts the game by setting isRunning to true, hiding the start overlay,
   * and initiating the game loop via requestAnimationFrame.
   * Does nothing if game is already running.
   */
  start() {
    if (this.isRunning) return;
    if (this.startOverlayEl) this.startOverlayEl.classList.add('hidden');
    this.isRunning = true;
    this.isGameOver = false;
    this.lastTimestamp = null;
    requestAnimationFrame((t) => this._loop(t));
  }

  /**
   * Resets game state and restarts the game.
   * Recreates the dino, clears obstacles, resets speed to base speed,
   * resets score, hides game over overlay, and calls start().
   */
  restart() {
    this.dino = new Dino(40, this.groundY);
    this.obstacles = [];
    this.speed = this.baseSpeed;
    this.scoreManager.reset();
    this.isGameOver = false;
    this.overlayEl.classList.add('hidden');
    this.start();
  }

  /**
   * Main game loop called via requestAnimationFrame.
   * Updates game state, renders the frame, and checks for game over.
   * Continues looping until game is no longer running.
   *
   * @private
   * @param {number} timestamp - Current animation frame timestamp (DOMHighResTimeStamp)
   */
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

  /**
   * Updates all game entities and logic for the current frame.
   * - Updates speed based on current score
   * - Updates dino, ground, and clouds
   * - Spawns new obstacles at random intervals
   * - Updates obstacles and removes those marked for removal
   * - Updates score
   * - Checks for collisions between dino and obstacles
   * - Updates HUD with current score
   *
   * @private
   * @param {number} deltaTime - Time elapsed since last frame (in seconds, capped at 0.05s)
   */
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

  /**
   * Renders the current frame to the canvas.
   * Draws in order: background gradient, clouds, ground, obstacles, and dino.
   *
   * @private
   */
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

  /**
   * Updates the HUD (heads-up display) elements with formatted score and high score.
   * Safely updates only if the corresponding DOM elements exist.
   *
   * @private
   */
  _updateHud() {
    if (this.scoreEl) this.scoreEl.textContent = this.scoreManager.getFormattedScore();
    if (this.highScoreEl) this.highScoreEl.textContent = this.scoreManager.getFormattedHighScore();
  }

  /**
   * Handles game over logic:
   * - Submits the current score to the API
   * - Updates HUD with final score and high score
   * - Displays the game over overlay with restart button
   *
   * @async
   * @private
   * @returns {Promise<void>}
   */
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
