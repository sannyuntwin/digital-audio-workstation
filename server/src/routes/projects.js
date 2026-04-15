/**
 * Projects API Routes
 * CRUD operations for DAW projects
 */

const express = require('express');
const router = express.Router();
const ProjectModel = require('../models/ProjectModel');
const { authenticate } = require('../middleware/auth');

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
    const { name, description, bpm, timeSignature, sampleRate, tracks, clips, settings } = req.body;
    
    const updateData = {
      name,
      description,
      bpm,
      timeSignature,
      sampleRate,
      tracks,
      clips,
      settings
    };

    const project = await ProjectModel.update(req.params.id, req.user.id, updateData);
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

// Delete project
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await ProjectModel.delete(req.params.id, req.user.id);
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

// Add track to project
router.post('/:id/tracks', authenticate, async (req, res) => {
  try {
    const { name, type, isMuted, isSolo, isArmed, volume, pan } = req.body;
    
    const trackData = {
      name,
      type,
      isMuted,
      isSolo,
      isArmed,
      volume,
      pan
    };

    const track = await ProjectModel.addTrack(req.params.id, req.user.id, trackData);
    res.status(201).json({
      success: true,
      data: track
    });
  } catch (error) {
    if (error.message === 'Project not found' || error.message === 'Project not found or access denied') {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add clip to project
router.post('/:id/clips', authenticate, async (req, res) => {
  try {
    const { name, type, startTime, duration, trackId } = req.body;
    
    const clipData = {
      name,
      type,
      startTime,
      duration,
      trackId
    };

    const clip = await ProjectModel.addClip(req.params.id, req.user.id, clipData);
    res.status(201).json({
      success: true,
      data: clip
    });
  } catch (error) {
    if (error.message === 'Project not found' || error.message === 'Project not found or access denied') {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update clip in project
router.put('/:id/clips/:clipId', authenticate, async (req, res) => {
  try {
    const { name, type, startTime, duration, trackId } = req.body;
    
    const updateData = {
      name,
      type,
      startTime,
      duration,
      trackId
    };

    const clip = await ProjectModel.updateClip(req.params.id, req.user.id, req.params.clipId, updateData);
    res.json({
      success: true,
      data: clip
    });
  } catch (error) {
    if (error.message === 'Project not found' || error.message === 'Clip not found' || error.message === 'Project not found or access denied') {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete clip from project
router.delete('/:id/clips/:clipId', authenticate, async (req, res) => {
  try {
    const clip = await ProjectModel.deleteClip(req.params.id, req.user.id, req.params.clipId);
    res.json({
      success: true,
      data: clip
    });
  } catch (error) {
    if (error.message === 'Project not found' || error.message === 'Clip not found' || error.message === 'Project not found or access denied') {
      return res.status(404).json({
        success: false,
        error: 'Project not found or access denied'
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
    const originalProject = await ProjectModel.getById(req.params.id, req.user.id);
    if (!originalProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const { name } = req.body;
    const duplicatedProject = await ProjectModel.create({
      name: name || `${originalProject.name} (Copy)`,
      description: originalProject.description,
      bpm: originalProject.bpm,
      timeSignature: originalProject.timeSignature,
      sampleRate: originalProject.sampleRate,
      tracks: originalProject.tracks,
      clips: originalProject.clips,
      settings: originalProject.settings,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: duplicatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
