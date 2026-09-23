const path = require('path');
const os = require('os');

// Isolate this file's data store so parallel Jest workers don't race on the same JSON file.
process.env.TREX_DB_PATH = path.join(os.tmpdir(), 'trex-test-db-stats.json');

const request = require('supertest');
const createApp = require('../../api/src/app');
const dataStore = require('../../api/src/dataStore');

const app = createApp();

describe('GET /api/stats', () => {
  beforeEach(() => {
    dataStore.resetData();
  });

  test('returns zeroed stats initially', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      gamesPlayed: 0,
      highScore: 0,
      totalScore: 0,
      averageScore: 0,
      gamesByDifficulty: { easy: 0, medium: 0, hard: 0 },
    });
  });

  test('reflects games played and average score after submissions', async () => {
    await request(app).post('/api/highscore').send({ score: 100 });
    await request(app).post('/api/highscore').send({ score: 200 });

    const res = await request(app).get('/api/stats');
    expect(res.body.gamesPlayed).toBe(2);
    expect(res.body.highScore).toBe(200);
    expect(res.body.totalScore).toBe(300);
    expect(res.body.averageScore).toBe(150);
    expect(res.body.lastPlayed).not.toBeNull();
  });

  test('tallies gamesByDifficulty per submission', async () => {
    await request(app).post('/api/highscore').send({ score: 100, difficulty: 'easy' });
    await request(app).post('/api/highscore').send({ score: 200, difficulty: 'hard' });
    await request(app).post('/api/highscore').send({ score: 150 });

    const res = await request(app).get('/api/stats');
    expect(res.body.gamesByDifficulty).toEqual({ easy: 1, medium: 1, hard: 1 });
  });
});
