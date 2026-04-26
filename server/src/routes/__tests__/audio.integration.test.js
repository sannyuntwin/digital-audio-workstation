const express = require('express');
const request = require('supertest');

jest.mock('../../middleware/auth', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 'user-1' };
    next();
  }
}));

jest.mock('../../config/database', () => ({
  db: jest.fn()
}));

const { db } = require('../../config/database');
const audioRouter = require('../audio');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/audio', audioRouter);
  return app;
};

describe('audio routes integration', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  test('GET /api/audio/formats returns supported formats', async () => {
    const res = await request(app).get('/api/audio/formats');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/audio/files returns file list from database', async () => {
    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([
        {
          id: 'a-1',
          original_name: 'kick.wav',
          file_name: 'kick-1.wav',
          file_path: 'uploads/kick-1.wav',
          mime_type: 'audio/wav'
        }
      ])
    };

    db.mockReturnValue(queryBuilder);

    const res = await request(app).get('/api/audio/files');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].stream_url).toBe('/api/audio/stream/kick-1.wav');
  });

  test('GET /api/audio/files/:filename returns 404 when file does not exist', async () => {
    const queryBuilder = {
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(undefined)
    };

    db.mockReturnValue(queryBuilder);

    const res = await request(app).get('/api/audio/files/missing.wav');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
