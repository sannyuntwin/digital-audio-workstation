/**
 * AudioEngine - Web Audio API-based audio engine for the DAW
 * Handles playback, metronome, recording, and scheduling
 */

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.metronomeGain = null;
    this.isPlaying = false;
    this.isRecording = false;
    this.currentTime = 0;
    this.bpm = 120;
    this.metronomeEnabled = false;
    this.timeSignature = '4/4';
    this.loopEnabled = false;
    this.loopStart = 0;
    this.loopEnd = 8;
    
    // Scheduling
    this.nextNoteTime = 0;
    this.scheduleAheadTime = 0.1;
    this.lookahead = 25;
    this.timerID = null;
    
    // Beat tracking
    this.currentBeat = 0;
    this.beatsPerBar = 4;
    
    // Callbacks
    this.onTimeUpdate = null;
    this.onBeat = null;
    
    // Recording
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.recordedBuffers = [];
  }

  /**
   * Initialize the audio context
   */
  init() {
    if (!this.audioContext) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.audioContext.destination);
      
      // Create metronome gain node
      this.metronomeGain = this.audioContext.createGain();
      this.metronomeGain.gain.value = 0.3;
      this.metronomeGain.connect(this.masterGain);
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Get audio context current time
   */
  get currentAudioTime() {
    return this.audioContext ? this.audioContext.currentTime : 0;
  }

  /**
   * Set master volume (0-100)
   */
  setMasterVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume / 100;
    }
  }

  /**
   * Set metronome volume (0-100)
   */
  setMetronomeVolume(volume) {
    if (this.metronomeGain) {
      this.metronomeGain.gain.value = volume / 100;
    }
  }

  /**
   * Play a metronome click
   */
  playClick(time, isAccent = false) {
    if (!this.audioContext || !this.metronomeEnabled) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.metronomeGain);
    
    // Accent beat has higher frequency
    oscillator.frequency.value = isAccent ? 1000 : 800;
    
    // Short envelope for click sound
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(1, time + 0.001);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    
    oscillator.start(time);
    oscillator.stop(time + 0.05);
  }

  /**
   * Schedule metronome clicks
   */
  scheduleMetronome() {
    while (this.nextNoteTime < this.currentAudioTime + this.scheduleAheadTime) {
      const isAccent = this.currentBeat === 0;
      this.playClick(this.nextNoteTime, isAccent);
      
      // Advance time by one beat
      const secondsPerBeat = 60.0 / this.bpm;
      this.nextNoteTime += secondsPerBeat;
      
      // Update beat counter
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
      
      // Trigger beat callback
      if (this.onBeat) {
        this.onBeat(this.currentBeat, this.nextNoteTime);
      }
    }
  }

  /**
   * Scheduler loop
   */
  scheduler = () => {
    if (!this.isPlaying) return;
    
    this.scheduleMetronome();
    
    // Update current time
    this.currentTime += this.lookahead / 1000;
    
    if (this.onTimeUpdate) {
      this.onTimeUpdate(this.currentTime);
    }
    
    // Handle loop
    if (this.loopEnabled && this.currentTime >= this.loopEnd) {
      this.currentTime = this.loopStart;
      this.nextNoteTime = this.currentAudioTime;
      this.currentBeat = 0;
    }
    
    this.timerID = setTimeout(this.scheduler, this.lookahead);
  };

  /**
   * Start playback
   */
  play() {
    this.init();
    
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.nextNoteTime = this.currentAudioTime;
    this.scheduler();
  }

  /**
   * Pause/stop playback
   */
  stop() {
    this.isPlaying = false;
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  /**
   * Reset to beginning
   */
  reset() {
    this.currentTime = 0;
    this.currentBeat = 0;
  }

  /**
   * Seek to specific time
   */
  seek(time) {
    this.currentTime = time;
    // Calculate beat position
    const secondsPerBeat = 60.0 / this.bpm;
    this.currentBeat = Math.floor((time / secondsPerBeat)) % this.beatsPerBar;
  }

  /**
   * Set BPM
   */
  setBPM(bpm) {
    this.bpm = Math.max(40, Math.min(240, bpm));
  }

  /**
   * Set time signature
   */
  setTimeSignature(sig) {
    this.timeSignature = sig;
    const [beats] = sig.split('/').map(Number);
    this.beatsPerBar = beats || 4;
  }

  /**
   * Enable/disable metronome
   */
  setMetronome(enabled) {
    this.metronomeEnabled = enabled;
  }

  /**
   * Set loop range
   */
  setLoop(enabled, start, end) {
    this.loopEnabled = enabled;
    this.loopStart = start;
    this.loopEnd = end;
  }

  /**
   * Generate a simple synth sound for testing
   */
  playTone(frequency = 440, duration = 0.5, time = null) {
    this.init();
    
    const t = time || this.currentAudioTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);
    
    oscillator.start(t);
    oscillator.stop(t + duration);
  }

  /**
   * Play a drum sound (simple kick)
   */
  playKick(time = null) {
    this.init();
    
    const t = time || this.currentAudioTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(150, t);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    
    gainNode.gain.setValueAtTime(0.8, t);
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    
    oscillator.start(t);
    oscillator.stop(t + 0.5);
  }

  /**
   * Play a snare sound
   */
  playSnare(time = null) {
    this.init();
    
    const t = time || this.currentAudioTime;
    
    // Noise buffer
    const bufferSize = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    
    // Filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    noise.start(t);
    noise.stop(t + 0.2);
  }

  /**
   * Play hi-hat sound
   */
  playHiHat(time = null) {
    this.init();
    
    const t = time || this.currentAudioTime;
    
    const bufferSize = this.audioContext.sampleRate * 0.05;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    
    noise.start(t);
    noise.stop(t + 0.05);
  }

  /**
   * Start recording from microphone
   */
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.recordedChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      
      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      return false;
    }
  }

  /**
   * Stop recording
   */
  stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }
      
      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        this.recordedBuffers.push(audioBuffer);
        this.isRecording = false;
        
        resolve(audioBuffer);
      };
      
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  /**
   * Play a recorded buffer
   */
  playBuffer(buffer, time = null) {
    if (!this.audioContext) return;
    
    const t = time || this.currentAudioTime;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.masterGain);
    source.start(t);
  }

  /**
   * Dispose and clean up
   */
  dispose() {
    this.stop();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.masterGain = null;
    this.metronomeGain = null;
  }
}

// Create singleton instance
const audioEngine = new AudioEngine();

export default audioEngine;
export { AudioEngine };
