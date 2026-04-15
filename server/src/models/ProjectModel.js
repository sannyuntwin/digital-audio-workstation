/**
 * Project Model - Database operations using Knex.js
 * Replaces the file-based Project model with PostgreSQL database operations
 */

const { db } = require('../config/database');

class ProjectModel {
  /**
   * Get all projects
   */
  static async getAll(userId) {
    try {
      const projects = await db('projects')
        .select('*')
        .where('user_id', userId)
        .orderBy('updated_at', 'desc');
      
      // Get tracks and clips for each project
      const projectsWithDetails = await Promise.all(
        projects.map(async (project) => {
          // Get related tracks
          const tracks = await db('tracks')
            .select('*')
            .where('project_id', project.id)
            .orderBy('created_at', 'asc');

          // Get related clips
          const clips = await db('clips')
            .select('*')
            .where('project_id', project.id)
            .orderBy('start_time', 'asc');

          return {
            ...project,
            tracks,
            clips
          };
        })
      );
      
      return projectsWithDetails;
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  static async getById(id, userId) {
    try {
      const project = await db('projects')
        .select('*')
        .where({ id, user_id: userId })
        .first();
      
      if (!project) {
        return null;
      }

      // Get related tracks
      const tracks = await db('tracks')
        .select('*')
        .where('project_id', id)
        .orderBy('created_at', 'asc');

      // Get related clips
      const clips = await db('clips')
        .select('*')
        .where('project_id', id)
        .orderBy('start_time', 'asc');

      return {
        ...project,
        tracks,
        clips
      };
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  /**
   * Create new project
   */
  static async create(projectData) {
    try {
      const [project] = await db('projects')
        .insert({
          name: projectData.name || 'Untitled Project',
          description: projectData.description || '',
          bpm: projectData.bpm || 120,
          time_signature: projectData.timeSignature || { numerator: 4, denominator: 4 },
          sample_rate: projectData.sampleRate || 44100,
          settings: projectData.settings || { zoomLevel: 1, masterVolume: 1 },
          metadata: projectData.metadata || { version: '1.0.0' },
          user_id: projectData.userId
        })
        .returning('*');

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update project
   */
  static async update(id, userId, projectData) {
    try {
      const [project] = await db('projects')
        .where({ id, user_id: userId })
        .update({
          name: projectData.name,
          description: projectData.description,
          bpm: projectData.bpm,
          time_signature: projectData.timeSignature,
          sample_rate: projectData.sampleRate,
          settings: projectData.settings,
          metadata: projectData.metadata,
          updated_at: db.fn.now()
        })
        .returning('*');

      if (!project) {
        throw new Error('Project not found');
      }

      return project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  static async delete(id, userId) {
    try {
      const deleted = await db('projects')
        .where({ id, user_id: userId })
        .del();

      return deleted > 0;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Add track to project
   */
  static async addTrack(projectId, userId, trackData) {
    try {
      // First verify user owns the project
      const project = await db('projects')
        .where({ id: projectId, user_id: userId })
        .first();
      
      if (!project) {
        throw new Error('Project not found or access denied');
      }

      const [track] = await db('tracks')
        .insert({
          project_id: projectId,
          name: trackData.name || 'New Track',
          type: trackData.type || 'audio',
          volume: trackData.volume || 0.7,
          pan: trackData.pan || 0,
          is_muted: trackData.isMuted || false,
          is_solo: trackData.isSolo || false,
          color: trackData.color || '#4CAF50'
        })
        .returning('*');

      return track;
    } catch (error) {
      console.error('Error adding track:', error);
      throw error;
    }
  }

  /**
   * Update track
   */
  static async updateTrack(projectId, userId, trackId, trackData) {
    try {
      // First verify user owns the project
      const project = await db('projects')
        .where({ id: projectId, user_id: userId })
        .first();
      
      if (!project) {
        throw new Error('Project not found or access denied');
      }

      const [track] = await db('tracks')
        .where({
          id: trackId,
          project_id: projectId
        })
        .update({
          name: trackData.name,
          volume: trackData.volume,
          pan: trackData.pan,
          is_muted: trackData.isMuted,
          is_solo: trackData.isSolo,
          color: trackData.color,
          updated_at: db.fn.now()
        })
        .returning('*');

      if (!track) {
        throw new Error('Track not found');
      }

      return track;
    } catch (error) {
      console.error('Error updating track:', error);
      throw error;
    }
  }

  /**
   * Delete track
   */
  static async deleteTrack(projectId, userId, trackId) {
    try {
      // First verify user owns the project
      const project = await db('projects')
        .where({ id: projectId, user_id: userId })
        .first();
      
      if (!project) {
        throw new Error('Project not found or access denied');
      }

      const deleted = await db('tracks')
        .where({
          id: trackId,
          project_id: projectId
        })
        .del();

      return deleted > 0;
    } catch (error) {
      console.error('Error deleting track:', error);
      throw error;
    }
  }

  /**
   * Add clip to project
   */
  static async addClip(projectId, userId, clipData) {
    try {
      // First verify user owns the project
      const project = await db('projects')
        .where({ id: projectId, user_id: userId })
        .first();
      
      if (!project) {
        throw new Error('Project not found or access denied');
      }

      const [clip] = await db('clips')
        .insert({
          project_id: projectId,
          track_id: clipData.trackId,
          name: clipData.name || 'New Clip',
          type: clipData.type || 'audio',
          start_time: clipData.startTime || 0,
          duration: clipData.duration || 4,
          file_name: clipData.fileName,
          file_path: clipData.filePath,
          file_size: clipData.fileSize,
          mime_type: clipData.mimeType,
          sample_rate: clipData.sampleRate,
          bit_depth: clipData.bitDepth,
          channels: clipData.channels,
          settings: clipData.settings || {}
        })
        .returning('*');

      return clip;
    } catch (error) {
      console.error('Error adding clip:', error);
      throw error;
    }
  }

  /**
   * Update clip
   */
  static async updateClip(projectId, userId, clipId, clipData) {
    try {
      // First verify user owns the project
      const project = await db('projects')
        .where({ id: projectId, user_id: userId })
        .first();
      
      if (!project) {
        throw new Error('Project not found or access denied');
      }

      const [clip] = await db('clips')
        .where({
          id: clipId,
          project_id: projectId
        })
        .update({
          name: clipData.name,
          start_time: clipData.startTime,
          duration: clipData.duration,
          track_id: clipData.trackId,
          settings: clipData.settings,
          updated_at: db.fn.now()
        })
        .returning('*');

      if (!clip) {
        throw new Error('Clip not found');
      }

      return clip;
    } catch (error) {
      console.error('Error updating clip:', error);
      throw error;
    }
  }

  /**
   * Move clip to different track
   */
  static async moveClip(projectId, userId, clipId, newTrackId, newStartTime) {
    try {
      // First verify user owns the project
      const project = await db('projects')
        .where({ id: projectId, user_id: userId })
        .first();
      
      if (!project) {
        throw new Error('Project not found or access denied');
      }

      const [clip] = await db('clips')
        .where({
          id: clipId,
          project_id: projectId
        })
        .update({
          track_id: newTrackId,
          start_time: newStartTime,
          updated_at: db.fn.now()
        })
        .returning('*');

      if (!clip) {
        throw new Error('Clip not found');
      }

      return clip;
    } catch (error) {
      console.error('Error moving clip:', error);
      throw error;
    }
  }

  /**
   * Delete clip
   */
  static async deleteClip(projectId, userId, clipId) {
    try {
      // First verify user owns the project
      const project = await db('projects')
        .where({ id: projectId, user_id: userId })
        .first();
      
      if (!project) {
        throw new Error('Project not found or access denied');
      }

      const deleted = await db('clips')
        .where({
          id: clipId,
          project_id: projectId
        })
        .del();

      return deleted > 0;
    } catch (error) {
      console.error('Error deleting clip:', error);
      throw error;
    }
  }

  /**
   * Get project statistics
   */
  static async getStats(projectId, userId) {
    try {
      const stats = await db('projects')
        .select(
          db.raw('COUNT(DISTINCT tracks.id) as track_count'),
          db.raw('COUNT(DISTINCT clips.id) as clip_count'),
          db.raw('SUM(clips.duration) as total_duration')
        )
        .leftJoin('tracks', 'projects.id', 'tracks.project_id')
        .leftJoin('clips', 'projects.id', 'clips.project_id')
        .where({ 'projects.id': projectId, 'projects.user_id': userId })
        .first();

      return stats;
    } catch (error) {
      console.error('Error getting project stats:', error);
      throw error;
    }
  }
}

module.exports = ProjectModel;
