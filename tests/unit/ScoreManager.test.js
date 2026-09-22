const ScoreManager = require('../../ui/js/ScoreManager');

describe('ScoreManager', () => {
  test('starts at zero score', () => {
    const sm = new ScoreManager(null);
    expect(sm.score).toBe(0);
  });

  test('update increases score based on speed and time', () => {
    const sm = new ScoreManager(null);
    sm.update(1, 300);
    expect(sm.score).toBeGreaterThan(0);
  });

  test('reset sets score back to zero', () => {
    const sm = new ScoreManager(null);
    sm.update(1, 300);
    sm.reset();
    expect(sm.score).toBe(0);
  });

  test('getFormattedScore pads with zeros', () => {
    const sm = new ScoreManager(null);
    sm.score = 42;
    expect(sm.getFormattedScore()).toBe('00042');
  });

  test('submitCurrentScore updates the high score locally without an apiClient', async () => {
    const sm = new ScoreManager(null);
    sm.score = 150;
    sm.highScore = 100;
    const result = await sm.submitCurrentScore();
    expect(result).toBe(150);
    expect(sm.highScore).toBe(150);
  });

  test('submitCurrentScore uses the apiClient result when provided', async () => {
    const mockApiClient = {
      submitScore: jest.fn().mockResolvedValue({ highScore: 500, isNewHighScore: true }),
    };
    const sm = new ScoreManager(mockApiClient);
    sm.score = 200;
    sm.highScore = 100;
    const result = await sm.submitCurrentScore();
    expect(mockApiClient.submitScore).toHaveBeenCalledWith(200);
    expect(result).toBe(500);
  });
});
