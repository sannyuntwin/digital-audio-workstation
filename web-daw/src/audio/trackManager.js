/**
 * Track Manager - Handles track operations and state management
 * Manages multiple audio tracks, their properties, and audio buffers
 */

class TrackManager {
  constructor() {
    this.tracks = new Map(); // Map<trackId, trackData>
    this.nextTrackId = 1;
  }

  /**
   * Create a new track
   * @param {Object} options - Track options
   * @param {string} options.name - Track name
   * @param {string} options.type - Track type ('audio', 'midi')
   * @param {AudioBuffer} options.audioBuffer - Audio buffer for audio tracks
   * @returns {number} New track ID
   */
  createTrack(options = {}) {
    const trackId = this.nextTrackId++;
    
    const track = {
      id: trackId,
      name: options.name || `Track ${trackId}`,
      type: options.type || 'audio',
      audioBuffer: options.audioBuffer || null,
      url: options.url || null,
      volume: options.volume || 1.0,
      muted: options.muted || false,
      solo: options.solo || false,
      pan: options.pan || 0.0,
      createdAt: new Date().toISOString()
    };

    this.tracks.set(trackId, track);
    console.log(`Created track: ${track.name} (ID: ${trackId})`);
    
    return trackId;
  }

  /**
   * Get track by ID
   * @param {number} trackId - Track ID
   * @returns {Object|null} Track data or null if not found
   */
  getTrack(trackId) {
    return this.tracks.get(trackId) || null;
  }

  /**
   * Get all tracks
   * @returns {Array} Array of track objects
   */
  getAllTracks() {
    return Array.from(this.tracks.values());
  }

  /**
   * Update track properties
   * @param {number} trackId - Track ID
   * @param {Object} updates - Properties to update
   * @returns {boolean} True if updated successfully
   */
  updateTrack(trackId, updates) {
    const track = this.tracks.get(trackId);
    if (!track) {
      console.warn(`Track ${trackId} not found`);
      return false;
    }

    // Validate and apply updates
    Object.keys(updates).forEach(key => {
      if (track.hasOwnProperty(key)) {
        track[key] = updates[key];
      } else {
        console.warn(`Invalid track property: ${key}`);
      }
    });

    console.log(`Updated track ${trackId}:`, updates);
    return true;
  }

  /**
   * Delete track
   * @param {number} trackId - Track ID
   * @returns {boolean} True if deleted successfully
   */
  deleteTrack(trackId) {
    const deleted = this.tracks.delete(trackId);
    if (deleted) {
      console.log(`Deleted track ${trackId}`);
    } else {
      console.warn(`Track ${trackId} not found for deletion`);
    }
    return deleted;
  }

  /**
   * Set track volume
   * @param {number} trackId - Track ID
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  setTrackVolume(trackId, volume) {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.updateTrack(trackId, { volume: clampedVolume });
  }

  /**
   * Mute/unmute track
   * @param {number} trackId - Track ID
   * @param {boolean} muted - Mute state
   */
  setTrackMuted(trackId, muted) {
    this.updateTrack(trackId, { muted });
  }

  /**
   * Solo/unsolo track
   * @param {number} trackId - Track ID
   * @param {boolean} solo - Solo state
   */
  setTrackSolo(trackId, solo) {
    this.updateTrack(trackId, { solo });
  }

  /**
   * Set track pan
   * @param {number} trackId - Track ID
   * @param {number} pan - Pan value (-1.0 to 1.0)
   */
  setTrackPan(trackId, pan) {
    const clampedPan = Math.max(-1, Math.min(1, pan));
    this.updateTrack(trackId, { pan: clampedPan });
  }

  /**
   * Get tracks that should be heard (not muted, or soloed)
   * @returns {Array} Array of audible tracks
   */
  getAudibleTracks() {
    const tracks = this.getAllTracks();
    const hasSolo = tracks.some(track => track.solo);
    
    return tracks.filter(track => {
      if (hasSolo) {
        return track.solo && !track.muted;
      }
      return !track.muted;
    });
  }

  /**
   * Get track count
   * @returns {number} Number of tracks
   */
  getTrackCount() {
    return this.tracks.size;
  }

  /**
   * Clear all tracks
   */
  clearAllTracks() {
    this.tracks.clear();
    this.nextTrackId = 1;
    console.log('All tracks cleared');
  }

  /**
   * Export track data for serialization
   * @returns {Object} Serializable track data
   */
  exportTracks() {
    return {
      tracks: this.getAllTracks(),
      nextTrackId: this.nextTrackId
    };
  }

  /**
   * Import track data from serialization
   * @param {Object} data - Track data to import
   */
  importTracks(data) {
    if (!data || !data.tracks) {
      console.error('Invalid track data for import');
      return;
    }

    this.clearAllTracks();
    data.tracks.forEach(track => {
      this.tracks.set(track.id, track);
    });
    this.nextTrackId = data.nextTrackId || this.tracks.size + 1;
    
    console.log(`Imported ${this.tracks.size} tracks`);
  }
}

export default TrackManager;
