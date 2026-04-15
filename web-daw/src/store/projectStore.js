/**
 * Project Store - Central state management for the DAW project
 * Manages project state, tracks, settings, and provides reactive updates
 */

import { useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import { safeJSONParse } from '../utils/storageCleanup';

// Project store singleton
class ProjectStore {
  constructor() {
    this.state = {
      // Transport state
      isPlaying: false,
      isRecording: false,
      currentTime: 0,
      bpm: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      
      // Project settings
      projectName: 'Untitled Project',
      sampleRate: 44100,
      currentProjectId: null,
      
      // UI state
      selectedTrackId: null,
      selectedClipId: null,
      zoomLevel: 1.0,
      showGlobalTracks: false,
      
      // Timeline state
      tracks: [],
      clips: [],
      
      // Audio state
      masterVolume: 1.0,
      isAudioEngineInitialized: false
    };
    
    this.listeners = new Set(); // Subscribe to state changes
    this.timeListeners = new Set(); // Subscribe to high-frequency time changes
    this.timeUpdateInterval = null;
    this.playheadTime = 0; // Fast non-state variable
    
    // Restore persisted project layout from localStorage
    this._loadFromLocalStorage();
  }

  _loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('daw_project');
      if (saved) {
        const parsed = safeJSONParse(saved); // Use safeJSONParse utility
        if (parsed && parsed.tracks) this.state.tracks = parsed.tracks;
        if (parsed && parsed.clips) this.state.clips = parsed.clips;
        if (parsed && parsed.bpm) this.state.bpm = parsed.bpm;
        if (parsed && parsed.projectName) this.state.projectName = parsed.projectName;
        console.log(`Restored project: ${parsed.projectName} (${parsed.tracks?.length || 0} tracks, ${parsed.clips?.length || 0} clips)`);
      }
    } catch (e) {
      console.warn('Could not restore project from localStorage:', e);
      // Clear corrupted project data
      localStorage.removeItem('daw_project');
    }
  }

  _saveToLocalStorage() {
    try {
      const toSave = {
        projectName: this.state.projectName,
        bpm: this.state.bpm,
        timeSignature: this.state.timeSignature,
        tracks: this.state.tracks,
        // Save clips but strip peaks (too large) — they are regenerated on file re-drop
        clips: this.state.clips.map(c => ({ ...c, peaks: undefined }))
      };
      localStorage.setItem('daw_project', JSON.stringify(toSave));
      this._saveToDatabase();
    } catch (e) {
      console.warn('Could not save project to localStorage:', e);
    }
  }

  /**
   * Save project to database
   */
  async _saveToDatabase() {
    if (!this.state.currentProjectId) {
      console.warn('No current project ID - cannot save to database');
      return;
    }

    try {
      const projectData = {
        name: this.state.projectName,
        description: '',
        bpm: this.state.bpm,
        timeSignature: this.state.timeSignature,
        tracks: this.state.tracks,
        clips: this.state.clips,
        settings: {
          sampleRate: this.state.sampleRate,
          zoomLevel: this.state.zoomLevel,
          showGlobalTracks: this.state.showGlobalTracks
        }
      };

      await apiService.updateProject(this.state.currentProjectId, projectData);
      console.log('Project saved to database:', this.state.projectName);
    } catch (error) {
      console.error('Failed to save project to database:', error);
      // Fallback to localStorage only
    }
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback function when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribe to high-frequency time changes (bypasses React state)
   */
  subscribeTime(listener) {
    this.timeListeners.add(listener);
    return () => {
      this.timeListeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state (immutable)
   * @param {Object|Function} updates - State updates or update function
   */
  setState(updates) {
    const oldPlaying = this.state.isPlaying;
    const oldTracks = this.state.tracks;
    const oldClips = this.state.clips;
    
    const newState = typeof updates === 'function' 
      ? { ...this.state, ...updates(this.state) }
      : { ...this.state, ...updates };
    
    this.state = newState;

    // Persist tracks/clips to localStorage on any relevant change
    if (
      newState.tracks !== oldTracks ||
      newState.clips !== oldClips
    ) {
      // Debounce: save on next tick to batch rapid changes
      if (!this._saveTimer) {
        this._saveTimer = setTimeout(() => {
          this._saveToLocalStorage();
          this._saveToDatabase();
          this._saveTimer = null;
        }, 300);
      }
    }

    // Handle timer side effects
    if (this.state.isPlaying && !oldPlaying) {
      this.startTimeUpdates();
    } else if (!this.state.isPlaying && oldPlaying) {
      this.stopTimeUpdates();
    }

    this.notify();
  }

  // Transport controls
  setPlaying(playing) {
    this.setState({ isPlaying: playing });
    
    if (playing) {
      this.startTimeUpdates();
    } else {
      this.stopTimeUpdates();
    }
  }

  setRecording(recording) {
    this.setState({ isRecording: recording });
  }

  setCurrentTime(time) {
    this.playheadTime = time;
    this.timeListeners.forEach(listener => listener(this.playheadTime));
    this.setState({ currentTime: time }); // Sync state for non-animation usages
  }

  setBpm(bpm) {
    const clampedBpm = Math.max(60, Math.min(200, bpm));
    this.setState({ bpm: clampedBpm });
  }

  setTimeSignature(numerator, denominator) {
    this.setState({
      timeSignature: { numerator, denominator }
    });
  }

  // Project settings
  setProjectName(name) {
    this.setState({ projectName: name });
  }

  setMasterVolume(volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.setState({ masterVolume: clampedVolume });
  }

  // UI state
  setSelectedTrackId(trackId) {
    this.setState({ selectedTrackId: trackId });
  }

  setSelectedClipId(clipId) {
    this.setState({ selectedClipId: clipId });
  }

  setZoomLevel(zoom) {
    const clampedZoom = Math.max(0.1, Math.min(5, zoom));
    this.setState({ zoomLevel: clampedZoom });
  }

  toggleGlobalTracks() {
    this.setState(prevState => ({ showGlobalTracks: !prevState.showGlobalTracks }));
  }

  clearAllSolos() {
    this.setState(prevState => ({
      tracks: (prevState.tracks || []).map(track => ({ ...track, isSolo: false }))
    }));
  }

  // Timeline management
  reorderTracks(fromIndex, toIndex) {
    this.setState(prevState => {
      const tracks = [...(prevState.tracks || [])];
      const [removed] = tracks.splice(fromIndex, 1);
      tracks.splice(toIndex, 0, removed);
      return { tracks };
    });
  }

  addTrack(track) {
    const newIndex = (this.state.tracks?.length || 0) + 1;
    const colors = ['#5bc4ff', '#ff5b5b', '#5bff5b', '#f5ff5b', '#ff5bf5', '#5bffda'];
    const newTrack = {
      id: Date.now() + Math.random(),
      name: track.name || `Track ${newIndex}`,
      type: track.type || 'audio',
      index: newIndex,
      isMuted: false,
      isSolo: false,
      isArmed: false,
      volume: 1.0,
      pan: 0.0,
      color: colors[(newIndex - 1) % colors.length],
      height: 80,
      ...track
    };
    
    this.setState(prevState => ({
      tracks: [...(prevState.tracks || []), newTrack]
    }));
    
    return newTrack.id;
  }

  updateTrack(trackId, updates) {
    this.setState(prevState => ({
      tracks: (prevState.tracks || []).map(track =>
        String(track.id) === String(trackId) ? { ...track, ...updates } : track
      )
    }));
  }

  deleteTrack(trackId) {
    this.setState(prevState => ({
      tracks: (prevState.tracks || []).filter(track => String(track.id) !== String(trackId)),
      clips: (prevState.clips || []).filter(clip => String(clip.trackId) !== String(trackId))
    }));
  }

  addClip(clip) {
    const newClip = {
      id: Date.now() + Math.random(),
      name: clip.name || 'Clip',
      type: clip.type || 'audio',
      startTime: clip.startTime || 0,
      duration: clip.duration || 4,
      startOffset: clip.startOffset || 0, // Non-destructive offset into the source buffer
      trackId: clip.trackId,
      ...clip
    };
    
    this.setState(prevState => ({
      clips: [...(prevState.clips || []), newClip]
    }));
    
    return newClip.id;
  }

  updateClip(clipId, updates) {
    this.setState(prevState => ({
      clips: (prevState.clips || []).map(clip =>
        String(clip.id) === String(clipId) ? { ...clip, ...updates } : clip
      )
    }));
  }

  /**
   * Split a clip at a given absolute timeline time.
   * Returns [leftClipId, rightClipId] or null if invalid.
   */
  splitClip(clipId, splitAtTime) {
    const clip = (this.state.clips || []).find(c => String(c.id) === String(clipId));
    if (!clip) return null;
    
    const splitOffset = splitAtTime - clip.startTime; // seconds into this clip
    if (splitOffset <= 0 || splitOffset >= clip.duration) return null; // not inside clip
    
    // Shorten the left (original) clip
    this.setState(prevState => ({
      clips: (prevState.clips || []).map(c =>
        String(c.id) === String(clipId) ? { ...c, duration: splitOffset } : c
      )
    }));
    
    // Create the right clip — shares the same buffer source
    const rightClipId = this.addClip({
      name: clip.name,
      type: clip.type,
      startTime: splitAtTime,
      duration: clip.duration - splitOffset,
      startOffset: (clip.startOffset || 0) + splitOffset, // offset into source buffer
      trackId: clip.trackId,
      peaks: clip.peaks // share waveform peaks too
    });
    
    return rightClipId;
  }

  moveClip(clipId, newTrackId, newStartTime) {
    this.setState(prevState => ({
      clips: (prevState.clips || []).map(clip =>
        String(clip.id) === String(clipId) 
          ? { ...clip, trackId: newTrackId, startTime: newStartTime }
          : clip
      )
    }));
  }

  deleteClip(clipId) {
    this.setState(prevState => ({
      clips: (prevState.clips || []).filter(clip => String(clip.id) !== String(clipId))
    }));
  }

  getClipsForTrack(trackId) {
    return (this.state.clips || []).filter(clip => clip.trackId === trackId);
  }

  // Audio engine state
  setAudioEngineInitialized(initialized) {
    this.setState({ isAudioEngineInitialized: initialized });
  }

  // Time tracking for playback
  startTimeUpdates() {
    if (this.timeUpdateInterval) return;
    
    // Sync internal playhead to current state before starting
    this.playheadTime = this.state.currentTime;
    
    let lastTime = performance.now();
    
    this.timeUpdateInterval = setInterval(() => {
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      
      this.playheadTime += delta;
      
      // Update high-frequency listeners without triggering React render
      this.timeListeners.forEach(listener => listener(this.playheadTime));
    }, 16); // ~60fps
  }

  stopTimeUpdates() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
      // Sync the playhead back to persistent state when stopping
      this.setState({ currentTime: this.playheadTime });
    }
  }

  /**
   * Reset project state
   */
  reset() {
    this.stopTimeUpdates();
    this.state = {
      isPlaying: false,
      isRecording: false,
      currentTime: 0,
      bpm: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      projectName: 'Untitled Project',
      sampleRate: 44100,
      selectedTrackId: null,
      selectedClipId: null,
      zoomLevel: 1.0,
      tracks: [],
      clips: [],
      masterVolume: 1.0,
      isAudioEngineInitialized: false
    };
    this.notify();
  }

  /**
   * Export project data
   * @returns {Object} Serializable project data
   */
  exportProject() {
    return {
      project: {
        name: this.state.projectName,
        bpm: this.state.bpm,
        timeSignature: this.state.timeSignature,
        sampleRate: this.state.sampleRate
      },
      timeline: {
        tracks: this.state.tracks,
        clips: this.state.clips
      },
      state: {
        currentTime: this.state.currentTime,
        zoomLevel: this.state.zoomLevel,
        masterVolume: this.state.masterVolume,
        selectedTrackId: this.state.selectedTrackId,
        selectedClipId: this.state.selectedClipId
      }
    };
  }

  /**
   * Import project data
   * @param {Object} data - Project data to import
   */
  importProject(data) {
    if (!data || !data.project) {
      console.error('Invalid project data for import');
      return;
    }

    this.setState({
      projectName: data.project.name || 'Untitled Project',
      bpm: data.project.bpm || 120,
      timeSignature: data.project.timeSignature || { numerator: 4, denominator: 4 },
      sampleRate: data.project.sampleRate || 44100,
      tracks: data.timeline?.tracks || [],
      clips: data.timeline?.clips || [],
      currentTime: data.state?.currentTime || 0,
      zoomLevel: data.state?.zoomLevel || 1.0,
      masterVolume: data.state?.masterVolume || 1.0,
      selectedTrackId: data.state?.selectedTrackId || null,
      selectedClipId: data.state?.selectedClipId || null
    });

    console.log('Project imported successfully');
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.stopTimeUpdates();
    this.listeners.clear();
    this._saveToDatabase();
  }

  /**
   * Load project data from database
   */
  async _loadFromDatabase(projectId) {
    try {
      const project = await apiService.getProject(projectId);
      if (project) {
        this.setState({
          currentProjectId: projectId,
          projectName: project.name || 'Untitled Project',
          bpm: project.bpm || 120,
          timeSignature: project.timeSignature || { numerator: 4, denominator: 4 },
          sampleRate: project.settings?.sampleRate || 44100,
          tracks: project.tracks || [],
          clips: project.clips || [],
          zoomLevel: project.settings?.zoomLevel || 1.0,
          showGlobalTracks: project.settings?.showGlobalTracks || false
        });
        
        console.log(`Loaded project from database: ${project.name}`);
      }
    } catch (error) {
      console.error('Failed to load project from database:', error);
      throw error;
    }
  }

  /**
   * Set current project and load from database
   */
  async setCurrentProject(projectId) {
    if (projectId && projectId !== this.state.currentProjectId) {
      await this._loadFromDatabase(projectId);
    }
  }

  /**
   * Get current project ID
   */
  getCurrentProjectId() {
    return this.state.currentProjectId;
  }

  /**
   * Create new project via API
   */
  async createNewProject(projectName) {
    try {
      const projectData = {
        name: projectName || 'Untitled Project',
        description: '',
        bpm: this.state.bpm,
        timeSignature: this.state.timeSignature,
        tracks: this.state.tracks,
        clips: this.state.clips,
        settings: {
          sampleRate: this.state.sampleRate,
          zoomLevel: this.state.zoomLevel,
          showGlobalTracks: this.state.showGlobalTracks
        }
      };

      const project = await apiService.createProject(projectData);
      
      if (project && project.id) {
        // Set current project ID immediately to ensure saves work
        this.state.currentProjectId = project.id;
        this.setState({ currentProjectId: project.id });
        console.log(`Created new project: ${project.name} (ID: ${project.id})`);
      }
      
      return project;
    } catch (error) {
      console.error('Failed to create new project:', error);
      throw error;
    }
  }

  /**
   * Create new project and set it as current
   */
  async createAndSetProject(projectName) {
    const project = await this.createNewProject(projectName);
    return project;
  }

  /**
   * Update current project
   */
  async updateCurrentProject(updates) {
    if (this.state.currentProjectId) {
      const projectData = {
        ...updates,
        id: this.state.currentProjectId
      };
      await apiService.updateProject(this.state.currentProjectId, projectData);
      
      // Update local state
      this.setState(updates);
    }
  }

  /**
   * Delete current project
   */
  async deleteCurrentProject() {
    if (this.state.currentProjectId) {
      await apiService.deleteProject(this.state.currentProjectId);
      
      // Reset to default state
      this.state = {
        // Transport state
        isPlaying: false,
        isRecording: false,
        currentTime: 0,
        bpm: 120,
        timeSignature: { numerator: 4, denominator: 4 },
        
        // Project settings
        projectName: 'Untitled Project',
        sampleRate: 44100,
        currentProjectId: null,
        
        // UI state
        selectedTrackId: null,
        selectedClipId: null,
        zoomLevel: 1.0,
        showGlobalTracks: false,
        
        // Timeline state
        tracks: [],
        clips: [],
        
        // Audio engine state
        isAudioEngineInitialized: false
      };
      
      // Clear localStorage
      localStorage.removeItem('daw_project');
      
      this.notify();
    }
  }
}

// Create singleton instance
const projectStore = new ProjectStore();

/**
 * React hook to access project store
 * @returns {[Object, Function]} [state, setState] tuple
 */
export function useProjectStore() {
  const [state, setState] = useState(projectStore.getState());

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = projectStore.subscribe(setState);
    return unsubscribe;
  }, []);

  // Create bound setState function
  const setProjectState = useCallback((updates) => {
    projectStore.setState(updates);
  }, []);

  return [state, setProjectState];
}

/**
 * Get direct access to project store (for non-react usage)
 * @returns {ProjectStore} Project store instance
 */
export function getProjectStore() {
  return projectStore;
}

export default projectStore;
