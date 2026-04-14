/**
 * Project Model - In-memory project storage
 * For production, replace with database (MongoDB, PostgreSQL, etc.)
 */

const { v4: uuidv4 } = require('uuid');
const fs = require('fs-extra');
const path = require('path');

class Project {
  constructor() {
    this.projects = new Map();
    this.projectsPath = path.join(__dirname, '../../data/projects.json');
    this.loadProjects();
  }

  /**
   * Load projects from file
   */
  async loadProjects() {
    try {
      await fs.ensureDir(path.dirname(this.projectsPath));
      
      if (await fs.pathExists(this.projectsPath)) {
        const data = await fs.readJson(this.projectsPath);
        this.projects = new Map(Object.entries(data));
        console.log(`📁 Loaded ${this.projects.size} projects`);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      this.projects = new Map();
    }
  }

  /**
   * Save projects to file
   */
  async saveProjects() {
    try {
      await fs.ensureDir(path.dirname(this.projectsPath));
      const data = Object.fromEntries(this.projects);
      await fs.writeJson(this.projectsPath, data, { spaces: 2 });
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  /**
   * Create a new project
   */
  async create(projectData) {
    const project = {
      id: uuidv4(),
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bpm: projectData.bpm || 120,
      timeSignature: projectData.timeSignature || { numerator: 4, denominator: 4 },
      sampleRate: projectData.sampleRate || 44100,
      tracks: projectData.tracks || [],
      clips: projectData.clips || [],
      settings: {
        zoomLevel: projectData.settings?.zoomLevel || 1,
        masterVolume: projectData.settings?.masterVolume || 1,
        ...projectData.settings
      },
      metadata: {
        version: '1.0.0',
        ...projectData.metadata
      }
    };

    this.projects.set(project.id, project);
    await this.saveProjects();
    
    return project;
  }

  /**
   * Get all projects
   */
  async getAll() {
    return Array.from(this.projects.values());
  }

  /**
   * Get project by ID
   */
  async getById(id) {
    return this.projects.get(id);
  }

  /**
   * Update project
   */
  async update(id, updateData) {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...project,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.projects.set(id, updatedProject);
    await this.saveProjects();
    
    return updatedProject;
  }

  /**
   * Delete project
   */
  async delete(id) {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error('Project not found');
    }

    this.projects.delete(id);
    await this.saveProjects();
    
    return project;
  }

  /**
   * Add track to project
   */
  async addTrack(projectId, trackData) {
    const project = await this.getById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const newTrack = {
      id: uuidv4(),
      name: trackData.name || `Track ${project.tracks.length + 1}`,
      type: trackData.type || 'audio',
      isMuted: false,
      isSolo: false,
      isArmed: false,
      volume: 1.0,
      pan: 0.0,
      ...trackData
    };

    project.tracks.push(newTrack);
    await this.update(projectId, { tracks: project.tracks });
    
    return newTrack;
  }

  /**
   * Add clip to project
   */
  async addClip(projectId, clipData) {
    const project = await this.getById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const newClip = {
      id: uuidv4(),
      name: clipData.name || 'Clip',
      type: clipData.type || 'audio',
      startTime: clipData.startTime || 0,
      duration: clipData.duration || 4,
      trackId: clipData.trackId,
      ...clipData
    };

    project.clips.push(newClip);
    await this.update(projectId, { clips: project.clips });
    
    return newClip;
  }

  /**
   * Update clip in project
   */
  async updateClip(projectId, clipId, updateData) {
    const project = await this.getById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const clipIndex = project.clips.findIndex(clip => clip.id === clipId);
    if (clipIndex === -1) {
      throw new Error('Clip not found');
    }

    project.clips[clipIndex] = { ...project.clips[clipIndex], ...updateData };
    await this.update(projectId, { clips: project.clips });
    
    return project.clips[clipIndex];
  }

  /**
   * Delete clip from project
   */
  async deleteClip(projectId, clipId) {
    const project = await this.getById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const clipIndex = project.clips.findIndex(clip => clip.id === clipId);
    if (clipIndex === -1) {
      throw new Error('Clip not found');
    }

    const deletedClip = project.clips.splice(clipIndex, 1)[0];
    await this.update(projectId, { clips: project.clips });
    
    return deletedClip;
  }
}

module.exports = new Project();
