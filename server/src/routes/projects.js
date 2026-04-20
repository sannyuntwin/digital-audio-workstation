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

module.exports = router;
