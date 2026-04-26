const request = require('supertest');
const { app } = require('../../server');

describe('app integration', () => {
  test('GET /health returns service status', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(typeof res.body.timestamp).toBe('string');
  });

  test('GET / exposes API overview', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Web DAW Server API');
    expect(res.body.endpoints).toEqual(
      expect.objectContaining({
        health: '/health',
        projects: '/api/projects',
        audio: '/api/audio'
      })
    );
  });
});
