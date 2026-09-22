/**
 * Tracks the current run's score (distance-based) and the persisted high score.
 */
class ScoreManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.score = 0;
    this.highScore = 0;
    this._distanceAccumulator = 0;
  }

  async init() {
    if (this.apiClient) {
      this.highScore = await this.apiClient.getHighScore();
    }
  }

  reset() {
    this.score = 0;
    this._distanceAccumulator = 0;
  }

  update(deltaTime, speed) {
    // Score scales with distance traveled rather than raw elapsed time,
    // so faster gameplay (higher speed) awards more points per second.
    this._distanceAccumulator += (speed * deltaTime) / 100;
    this.score = Math.floor(this._distanceAccumulator);
  }

  getFormattedScore() {
    return String(this.score).padStart(5, '0');
  }

  getFormattedHighScore() {
    return String(this.highScore).padStart(5, '0');
  }

  async submitCurrentScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    if (this.apiClient) {
      const result = await this.apiClient.submitScore(this.score);
      if (result && typeof result.highScore === 'number') {
        this.highScore = Math.max(this.highScore, result.highScore);
      }
    }
    return this.highScore;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScoreManager;
}
