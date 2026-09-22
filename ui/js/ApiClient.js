/**
 * Thin wrapper around the T-Rex Runner REST API. Fails soft (falls back to
 * local defaults) so gameplay never blocks on network issues.
 */
class ApiClient {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  async getHighScore() {
    try {
      const res = await fetch(`${this.baseUrl}/highscore`);
      if (!res.ok) throw new Error('Failed to fetch high score');
      const data = await res.json();
      return data.highScore;
    } catch (err) {
      console.warn('ApiClient.getHighScore failed:', err.message);
      return 0;
    }
  }

  async submitScore(score) {
    try {
      const res = await fetch(`${this.baseUrl}/highscore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score }),
      });
      if (!res.ok) throw new Error('Failed to submit score');
      return await res.json();
    } catch (err) {
      console.warn('ApiClient.submitScore failed:', err.message);
      return { highScore: score, isNewHighScore: false };
    }
  }

  async getStats() {
    try {
      const res = await fetch(`${this.baseUrl}/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return await res.json();
    } catch (err) {
      console.warn('ApiClient.getStats failed:', err.message);
      return null;
    }
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return res.ok;
    } catch (err) {
      return false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}
