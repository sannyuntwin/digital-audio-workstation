const express = require('express');
const request = require('supertest');

jest.mock('../../middleware/auth', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 'user-1' };
    next();
  }
}));

jest.mock('../../models/ProjectModel', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  getStats: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  addTrack: jest.fn(),
  updateTrack: jest.fn(),
  deleteTrack: jest.fn(),
  addClip: jest.fn(),
  updateClip: jest.fn(),
  moveClip: jest.fn(),
  deleteClip: jest.fn()
}));

const ProjectModel = require('../../models/ProjectModel');
const projectsRouter = require('../projects');

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/projects', projectsRouter);
  return app;
};

describe('projects routes integration', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  test('GET /api/projects returns projects for authenticated user', async () => {
    ProjectModel.getAll.mockResolvedValue([{ id: 'p-1', name: 'Demo' }]);

    const res = await request(app).get('/api/projects');

    expect(res.statusCode).toBe(200);
    expect(ProjectModel.getAll).toHaveBeenCalledWith('user-1');
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
  });

  test('PUT /api/projects/:id returns 404 when project is missing', async () => {
    ProjectModel.update.mockRejectedValue(new Error('Project not found'));

    const res = await request(app)
      .put('/api/projects/missing-id')
      .send({ name: 'Updated Name' });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/projects/:id/tracks creates a track', async () => {
    ProjectModel.addTrack.mockResolvedValue({
      id: 't-1',
      project_id: 'p-1',
      name: 'Track 1'
    });

    const res = await request(app)
      .post('/api/projects/p-1/tracks')
      .send({ name: 'Track 1', type: 'audio' });

    expect(res.statusCode).toBe(201);
    expect(ProjectModel.addTrack).toHaveBeenCalledWith('p-1', 'user-1', {
      name: 'Track 1',
      type: 'audio'
    });
    expect(res.body.success).toBe(true);
  });

  test('POST /api/projects/:id/clips creates a clip', async () => {
    ProjectModel.addClip.mockResolvedValue({
      id: 'c-1',
      project_id: 'p-1',
      track_id: 't-1',
      name: 'Clip 1'
    });

    const res = await request(app)
      .post('/api/projects/p-1/clips')
      .send({ trackId: 't-1', name: 'Clip 1', type: 'audio', startTime: 0, duration: 2 });

    expect(res.statusCode).toBe(201);
    expect(ProjectModel.addClip).toHaveBeenCalledWith('p-1', 'user-1', {
      trackId: 't-1',
      name: 'Clip 1',
      type: 'audio',
      startTime: 0,
      duration: 2
    });
    expect(res.body.success).toBe(true);
  });

  test('POST /api/projects/:id/duplicate returns 404 if source project is missing', async () => {
    ProjectModel.getById.mockResolvedValue(null);

    const res = await request(app).post('/api/projects/missing-id/duplicate');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Project not found');
  });
});
