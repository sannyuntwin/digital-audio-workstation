/**
 * Audio Engine - Core audio functionality for the DAW
 * Handles AudioContext initialization, audio loading, and playback control
 */

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.activeSources = []; // Store multiple sources for multi-track playback
    this.clipBuffers = new Map(); // Store buffers mapped to clip IDs
    this.isPlaying = false;
    this.startTime = 0;
    this.pauseTime = 0;
    
    // Track-specific nodes
    this.trackNodes = new Map(); // Map<trackId, { gain, panner, analyzer }>
    this.masterGain = null;
  }

  /**
   * Initialize the Web Audio API context
   * Must be called after user interaction for browser compatibility
   */
  async initialize() {
    try {
      // Create audio context with fallback for older browsers
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Set sample rate to standard 44.1kHz
      if (this.audioContext.sampleRate !== 44100) {
        console.warn(`Audio context sample rate: ${this.audioContext.sampleRate}Hz (expected 44.1kHz)`);
      }
      
      console.log('Audio engine initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return false;
    }
  }

  /**
   * Resume audio context if it was suspended
   */
  async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Extract peaks from an AudioBuffer for waveform visualization
   * @param {AudioBuffer} buffer - The buffer to analyze
   * @param {number} length - Number of peak pairs to return (default: 200)
   * @returns {Array<Array<number>>} - Array of [min, max] peak pairs
   */
  getPeaks(buffer, length = 200) {
    const sampleSize = Math.floor(buffer.length / length);
    const step = Math.max(1, Math.floor(sampleSize / 10)); // Optimization: take 10 samples per peak area
    const peaks = [];
    const chanData = buffer.getChannelData(0); // Analyze first channel

    for (let i = 0; i < length; i++) {
      const start = i * sampleSize;
      const end = start + sampleSize;
      let min = 0;
      let max = 0;

      for (let j = start; j < end; j += step) {
        const val = chanData[j];
        if (val > max) max = val;
        else if (val < min) min = val;
      }
      peaks.push([min, max]);
    }

    return peaks;
  }

  /**
   * Decode an audio file (File or Blob) into an AudioBuffer
   * @param {File|Blob} file - The audio file to decode
   * @returns {Promise<AudioBuffer>} - Decoded audio buffer
   */
  async decodeAudioFile(file) {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized.');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Failed to decode audio file:', error);
      throw error;
    }
  }

  /**
   * Store a decoded buffer linked to a specific clip
   * @param {string|number} clipId - Unique clip identifier
   * @param {AudioBuffer} buffer - Decoded audio data
   */
  storeBuffer(clipId, buffer) {
    this.clipBuffers.set(clipId, buffer);
  }

  /**
   * Load audio file from URL into an AudioBuffer (Utility)
   * @param {string} url - URL of the audio file to load
   * @returns {Promise<AudioBuffer>} - Loaded audio buffer
   */
  async loadAudio(url) {
    if (!this.audioContext) {
      throw new Error('Audio engine not initialized. Call initialize() first.');
    }

    try {
      // Fetch audio file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio file: ${response.statusText}`);
      }

      // Convert response to array buffer
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.audioBuffer = audioBuffer;
      console.log(`Audio loaded successfully: ${audioBuffer.duration}s, ${audioBuffer.numberOfChannels} channels`);
      
      return audioBuffer;
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  }

  /**
   * Start or resume audio playback for specific tracks and clips
   */
  play(offset = 0, tracksToPlay = [], clipsToPlay = []) {
    if (!this.audioContext) throw new Error('Audio engine not initialized');

    this.stop();

    const currentTime = this.audioContext.currentTime;

    clipsToPlay.forEach(clip => {
      if (clip.type !== 'audio') return;
      
      const buffer = this.clipBuffers.get(clip.id);
      if (!buffer) return;

      // Check if clip should be playing right now, or in the future
      const clipEndTime = clip.startTime + clip.duration;
      if (offset >= clipEndTime) return; // Clip is already in the past
      
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;

      // Route through track nodes if they exist
      const trackNodes = this.trackNodes.get(clip.trackId);
      if (trackNodes) {
        source.connect(trackNodes.gain);
        // Track nodes chain is setup in createTrackNodes
      } else {
        source.connect(this.audioContext.destination);
      }

      // Calculate tight schedule
      // if playhead (offset) is before clip: schedule start in the future
      // if playhead (offset) is inside clip: start immediately, but jump into the clip
      const startDelay = Math.max(0, clip.startTime - offset);
      
      // startOffset = where in the raw buffer this clip starts from (non-destructive trim)
      const clipStartOffset = clip.startOffset || 0;
      const bufferOffset = clipStartOffset + Math.max(0, offset - clip.startTime);
      
      // Remaining clip duration (accounting for how much we've already consumed)
      const remainingDuration = clip.duration - Math.max(0, offset - clip.startTime);
      
      // source.start(when, bufferOffset, duration) - duration enforces stop point
      source.start(currentTime + startDelay, bufferOffset, remainingDuration);
      this.activeSources.push(source);
    });

    this.isPlaying = true;
    this.startTime = currentTime - offset;
    this.pauseTime = 0;
    
    console.log(`Playback started with ${this.activeSources.length} active audio sources.`);
  }

  /**
   * Stop audio playback
   */
  stop() {
    if (this.activeSources && this.activeSources.length > 0) {
      this.activeSources.forEach(source => {
        try {
          source.stop();
          source.disconnect();
        } catch (e) {}
      });
      this.activeSources = [];
    }
    this.isPlaying = false;
  }

  /**
   * Create audio nodes for a specific track
   * @param {number} trackId - Track ID
   */
  createTrackNodes(trackId) {
    if (!this.audioContext) return;
    
    if (this.trackNodes.has(trackId)) return;

    const gain = this.audioContext.createGain();
    const panner = this.audioContext.createStereoPanner();
    const analyzer = this.audioContext.createAnalyser();
    
    // Chain: Source (eventually) -> Gain -> Panner -> Analyzer -> Destination
    gain.connect(panner);
    panner.connect(analyzer);
    analyzer.connect(this.audioContext.destination);
    
    this.trackNodes.set(trackId, { gain, panner, analyzer });
    console.log(`Created audio nodes for track: ${trackId}`);
  }

  /**
   * Update track volume
   */
  updateTrackVolume(trackId, volume) {
    const nodes = this.trackNodes.get(trackId);
    if (nodes) {
      nodes.gain.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.02);
    }
  }

  /**
   * Update track pan
   */
  updateTrackPan(trackId, pan) {
    const nodes = this.trackNodes.get(trackId);
    if (nodes && nodes.panner) {
      nodes.panner.pan.setTargetAtTime(pan, this.audioContext.currentTime, 0.02);
    }
  }

  dispose() {
    this.stop();
    this.trackNodes.clear();
    this.clipBuffers.clear();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default AudioEngine;
