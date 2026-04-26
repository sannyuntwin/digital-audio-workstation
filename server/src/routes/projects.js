/**
 * Projects API Routes
 * CRUD operations for DAW projects
 */

const express = require('express');
const router = express.Router();
const ProjectModel = require('../models/ProjectModel');
const { authenticate } = require('../middleware/auth');

const isNotFoundError = (message = '') => {
  const lower = message.toLowerCase();
  return lower.includes('not found') || lower.includes('access denied');
};

// Get all projects
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await ProjectModel.getAll(req.user.id);
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get project stats
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const stats = await ProjectModel.getStats(req.params.id, req.user.id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Get single project
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await ProjectModel.getById(req.params.id, req.user.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new project
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, bpm, timeSignature, sampleRate, tracks, clips, settings } = req.body;
    
    const projectData = {
      name,
      description,
      bpm,
      timeSignature,
      sampleRate,
      tracks,
      clips,
      settings,
      userId: req.user.id
    };

    const project = await ProjectModel.create(projectData);
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update project
router.put('/:id', authenticate, async (req, res) => {
  try {
    const project = await ProjectModel.update(req.params.id, req.user.id, req.body);
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await ProjectModel.delete(req.params.id, req.user.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Duplicate project
router.post('/:id/duplicate', authenticate, async (req, res) => {
  try {
    const source = await ProjectModel.getById(req.params.id, req.user.id);
    if (!source) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const duplicatedProject = await ProjectModel.create({
      name: `${source.name} (Copy)`,
      description: source.description,
      bpm: source.bpm,
      timeSignature: source.time_signature,
      sampleRate: source.sample_rate,
      settings: source.settings,
      metadata: source.metadata,
      userId: req.user.id
    });

    const trackIdMap = new Map();

    for (const track of source.tracks || []) {
      const newTrack = await ProjectModel.addTrack(duplicatedProject.id, req.user.id, {
        name: track.name,
        type: track.type,
        volume: track.volume,
        pan: track.pan,
        isMuted: track.is_muted,
        isSolo: track.is_solo,
        color: track.color
      });
      trackIdMap.set(track.id, newTrack.id);
    }

    for (const clip of source.clips || []) {
      await ProjectModel.addClip(duplicatedProject.id, req.user.id, {
        trackId: trackIdMap.get(clip.track_id),
        name: clip.name,
        type: clip.type,
        startTime: clip.start_time,
        duration: clip.duration,
        fileName: clip.file_name,
        filePath: clip.file_path,
        fileSize: clip.file_size,
        mimeType: clip.mime_type,
        sampleRate: clip.sample_rate,
        bitDepth: clip.bit_depth,
        channels: clip.channels,
        settings: clip.settings || {}
      });
    }

    const fullProject = await ProjectModel.getById(duplicatedProject.id, req.user.id);
    res.status(201).json({
      success: true,
      data: fullProject
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Add track
router.post('/:id/tracks', authenticate, async (req, res) => {
  try {
    const track = await ProjectModel.addTrack(req.params.id, req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: track
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Update track
router.put('/:id/tracks/:trackId', authenticate, async (req, res) => {
  try {
    const track = await ProjectModel.updateTrack(
      req.params.id,
      req.user.id,
      req.params.trackId,
      req.body
    );
    res.json({
      success: true,
      data: track
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Delete track
router.delete('/:id/tracks/:trackId', authenticate, async (req, res) => {
  try {
    const deleted = await ProjectModel.deleteTrack(req.params.id, req.user.id, req.params.trackId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Track not found'
      });
    }

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Add clip
router.post('/:id/clips', authenticate, async (req, res) => {
  try {
    const clip = await ProjectModel.addClip(req.params.id, req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: clip
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Update clip
router.put('/:id/clips/:clipId', authenticate, async (req, res) => {
  try {
    const clip = await ProjectModel.updateClip(
      req.params.id,
      req.user.id,
      req.params.clipId,
      req.body
    );
    res.json({
      success: true,
      data: clip
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Move clip
router.put('/:id/clips/:clipId/move', authenticate, async (req, res) => {
  try {
    const { newTrackId, newStartTime } = req.body;
    const clip = await ProjectModel.moveClip(
      req.params.id,
      req.user.id,
      req.params.clipId,
      newTrackId,
      newStartTime
    );
    res.json({
      success: true,
      data: clip
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

// Delete clip
router.delete('/:id/clips/:clipId', authenticate, async (req, res) => {
  try {
    const deleted = await ProjectModel.deleteClip(req.params.id, req.user.id, req.params.clipId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Clip not found'
      });
    }

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    const status = isNotFoundError(error.message) ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
