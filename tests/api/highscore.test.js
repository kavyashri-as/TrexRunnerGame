const path = require('path');
const os = require('os');

// Isolate this file's data store so parallel Jest workers don't race on the same JSON file.
process.env.TREX_DB_PATH = path.join(os.tmpdir(), 'trex-test-db-highscore.json');

const request = require('supertest');
const createApp = require('../../api/src/app');
const dataStore = require('../../api/src/dataStore');

const app = createApp();

describe('Highscore API', () => {
  beforeEach(() => {
    dataStore.resetData();
  });

  test('GET /api/highscore returns 0 initially', async () => {
    const res = await request(app).get('/api/highscore');
    expect(res.status).toBe(200);
    expect(res.body.highScore).toBe(0);
  });

  test('POST /api/highscore stores a new high score', async () => {
    const res = await request(app).post('/api/highscore').send({ score: 250 });
    expect(res.status).toBe(201);
    expect(res.body.highScore).toBe(250);
    expect(res.body.isNewHighScore).toBe(true);

    const getRes = await request(app).get('/api/highscore');
    expect(getRes.body.highScore).toBe(250);
  });

  test('POST /api/highscore does not lower an existing high score', async () => {
    await request(app).post('/api/highscore').send({ score: 300 });
    const res = await request(app).post('/api/highscore').send({ score: 100 });
    expect(res.body.highScore).toBe(300);
    expect(res.body.isNewHighScore).toBe(false);
  });

  test('POST /api/highscore rejects an invalid score', async () => {
    const res = await request(app).post('/api/highscore').send({ score: -5 });
    expect(res.status).toBe(400);
  });

  test('POST /api/highscore rejects a missing score', async () => {
    const res = await request(app).post('/api/highscore').send({});
    expect(res.status).toBe(400);
  });
});
