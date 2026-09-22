const path = require('path');
const os = require('os');

// Isolate this file's data store so parallel Jest workers don't race on the same JSON file.
process.env.TREX_DB_PATH = path.join(os.tmpdir(), 'trex-test-db-health.json');

const request = require('supertest');
const createApp = require('../../api/src/app');

const app = createApp();

describe('GET /api/health', () => {
  test('returns a healthy status payload', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});
