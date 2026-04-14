/**
 * Project Store - Central state management for the DAW project
 * Manages project state, tracks, settings, and provides reactive updates
 */

import { useState, useCallback, useEffect } from 'react';

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
      
      // UI state
      selectedTrackId: null,
      selectedClipId: null,
      zoomLevel: 1.0,
      
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
        const parsed = JSON.parse(saved);
        if (parsed.tracks) this.state.tracks = parsed.tracks;
        if (parsed.clips) this.state.clips = parsed.clips;
        if (parsed.bpm) this.state.bpm = parsed.bpm;
        if (parsed.projectName) this.state.projectName = parsed.projectName;
        console.log(`💾 Restored project: ${parsed.projectName} (${parsed.tracks?.length || 0} tracks, ${parsed.clips?.length || 0} clips)`);
      }
    } catch (e) {
      console.warn('Could not restore project from localStorage:', e);
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
    } catch (e) {
      console.warn('Could not save project to localStorage:', e);
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
    const newState = typeof updates === 'function' 
      ? { ...this.state, ...updates(this.state) }
      : { ...this.state, ...updates };
    
    this.state = newState;

    // Persist tracks/clips to localStorage on any relevant change
    if (
      newState.tracks !== (oldPlaying !== undefined ? undefined : null) ||
      newState.clips !== undefined
    ) {
      // Debounce: save on next tick to batch rapid changes
      if (!this._saveTimer) {
        this._saveTimer = setTimeout(() => {
          this._saveToLocalStorage();
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

  // Timeline management
  addTrack(track) {
    const newTrack = {
      id: Date.now() + Math.random(),
      name: track.name || `Track ${(this.state.tracks?.length || 0) + 1}`,
      type: track.type || 'audio',
      isMuted: false,
      isSolo: false,
      isArmed: false,
      volume: 1.0,
      pan: 0.0,
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
        track.id === trackId ? { ...track, ...updates } : track
      )
    }));
  }

  deleteTrack(trackId) {
    this.setState(prevState => ({
      tracks: (prevState.tracks || []).filter(track => track.id !== trackId),
      clips: (prevState.clips || []).filter(clip => clip.trackId !== trackId)
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
        clip.id === clipId ? { ...clip, ...updates } : clip
      )
    }));
  }

  /**
   * Split a clip at a given absolute timeline time.
   * Returns [leftClipId, rightClipId] or null if invalid.
   */
  splitClip(clipId, splitAtTime) {
    const clip = (this.state.clips || []).find(c => c.id === clipId);
    if (!clip) return null;
    
    const splitOffset = splitAtTime - clip.startTime; // seconds into this clip
    if (splitOffset <= 0 || splitOffset >= clip.duration) return null; // not inside clip
    
    // Shorten the left (original) clip
    this.setState(prevState => ({
      clips: (prevState.clips || []).map(c =>
        c.id === clipId ? { ...c, duration: splitOffset } : c
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
        clip.id === clipId 
          ? { ...clip, trackId: newTrackId, startTime: newStartTime }
          : clip
      )
    }));
  }

  deleteClip(clipId) {
    this.setState(prevState => ({
      clips: (prevState.clips || []).filter(clip => clip.id !== clipId)
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
