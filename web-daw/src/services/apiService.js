/**
 * API Service - Handles communication with backend
 * Provides functions for project and audio management
 */

const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Project Management
  async getProjects() {
    return this.request('/api/projects');
  }

  async getProject(id) {
    return this.request(`/api/projects/${id}`);
  }

  async createProject(projectData) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id, projectData) {
    return this.request(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id) {
    return this.request(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Track Management
  async addTrack(projectId, trackData) {
    return this.request(`/api/projects/${projectId}/tracks`, {
      method: 'POST',
      body: JSON.stringify(trackData),
    });
  }

  async updateTrack(projectId, trackId, trackData) {
    return this.request(`/api/projects/${projectId}/tracks/${trackId}`, {
      method: 'PUT',
      body: JSON.stringify(trackData),
    });
  }

  async deleteTrack(projectId, trackId) {
    return this.request(`/api/projects/${projectId}/tracks/${trackId}`, {
      method: 'DELETE',
    });
  }

  // Clip Management
  async addClip(projectId, clipData) {
    return this.request(`/api/projects/${projectId}/clips`, {
      method: 'POST',
      body: JSON.stringify(clipData),
    });
  }

  async updateClip(projectId, clipId, clipData) {
    return this.request(`/api/projects/${projectId}/clips/${clipId}`, {
      method: 'PUT',
      body: JSON.stringify(clipData),
    });
  }

  async moveClip(projectId, clipId, newTrackId, newStartTime) {
    return this.request(`/api/projects/${projectId}/clips/${clipId}/move`, {
      method: 'PUT',
      body: JSON.stringify({ newTrackId, newStartTime }),
    });
  }

  async deleteClip(projectId, clipId) {
    return this.request(`/api/projects/${projectId}/clips/${clipId}`, {
      method: 'DELETE',
    });
  }

  // Audio Management
  async getAudioFiles() {
    return this.request('/api/audio/files');
  }

  async getAudioFile(filename) {
    return this.request(`/api/audio/files/${filename}`);
  }

  async uploadAudioFile(file) {
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch(`${this.baseURL}/api/audio/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Upload failed with status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('Audio upload failed:', error);
      throw error;
    }
  }

  async deleteAudioFile(filename) {
    return this.request(`/api/audio/files/${filename}`, {
      method: 'DELETE',
    });
  }

  async getAudioFormats() {
    return this.request('/api/audio/formats');
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
