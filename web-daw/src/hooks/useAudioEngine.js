/**
 * useAudioEngine Hook
 * Manages Web Audio API context and audio playback
 */

import { useState, useRef, useCallback, useEffect } from 'react';

const useAudioEngine = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioBuffers, setAudioBuffers] = useState({});
  const [masterVolume, setMasterVolume] = useState(1);
  
  const audioContextRef = useRef(null);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const gainNodeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sourceNodesRef = useRef([]);

  // Initialize AudioContext (must be triggered by user gesture)
  const initAudioContext = useCallback(async () => {
    if (audioContextRef.current) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create master gain node
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = masterVolume;
      gainNodeRef.current.connect(audioContextRef.current.destination);
      
      setIsInitialized(true);
      console.log('[Audio] AudioContext initialized, sample rate:', audioContextRef.current.sampleRate);
    } catch (error) {
      console.error('[Audio] Failed to initialize AudioContext:', error);
    }
  }, [masterVolume]);

  // Load audio file
  const loadAudioFile = useCallback(async (file) => {
    if (!audioContextRef.current) {
      await initAudioContext();
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      const id = `audio-${Date.now()}`;
      setAudioBuffers(prev => ({
        ...prev,
        [id]: { buffer: audioBuffer, name: file.name, duration: audioBuffer.duration }
      }));
      
      console.log('[Audio] Loaded file:', file.name, 'Duration:', audioBuffer.duration.toFixed(2), 's');
      return id;
    } catch (error) {
      console.error('[Audio] Failed to load audio file:', error);
      return null;
    }
  }, [initAudioContext]);

  // Schedule audio playback
  const schedulePlayback = useCallback((audioId, trackOffset, clipStartTime, clipDuration) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const audioData = audioBuffers[audioId];
    if (!audioData) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioData.buffer;
    source.connect(gainNodeRef.current);
    
    // Calculate when to start playing
    const when = audioContextRef.current.currentTime + trackOffset;
    const offset = clipStartTime;
    const duration = clipDuration || audioData.buffer.duration - offset;
    
    source.start(when, offset, duration);
    sourceNodesRef.current.push(source);
    
    console.log('[Audio] Scheduled playback:', audioData.name, 'at', when.toFixed(3), 's');
    
    // Clean up when done
    source.onended = () => {
      const index = sourceNodesRef.current.indexOf(source);
      if (index > -1) sourceNodesRef.current.splice(index, 1);
    };
  }, [audioBuffers]);

  // Start playback
  const startPlayback = useCallback(() => {
    if (!audioContextRef.current) return;

    // Resume context if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    startTimeRef.current = audioContextRef.current.currentTime - pausedTimeRef.current;
    setIsPlaying(true);
    console.log('[Audio] Playback started at', pausedTimeRef.current.toFixed(2), 's');

    // Update time via animation frame
    const updateTime = () => {
      if (audioContextRef.current && isPlaying) {
        const elapsed = audioContextRef.current.currentTime - startTimeRef.current;
        setCurrentTime(elapsed);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };
    updateTime();
  }, [isPlaying]);

  // Pause playback
  const pausePlayback = useCallback(() => {
    if (!audioContextRef.current) return;

    pausedTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
    setIsPlaying(false);
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop all playing sources
    sourceNodesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source may have already stopped
      }
    });
    sourceNodesRef.current = [];
    
    console.log('[Audio] Playback paused at', pausedTimeRef.current.toFixed(2), 's');
  }, []);

  // Stop playback (reset to beginning)
  const stopPlayback = useCallback(() => {
    pausePlayback();
    pausedTimeRef.current = 0;
    setCurrentTime(0);
    console.log('[Audio] Playback stopped, reset to 0');
  }, [pausePlayback]);

  // Seek to specific time
  const seekTo = useCallback((time) => {
    pausedTimeRef.current = time;
    setCurrentTime(time);
    
    if (isPlaying && audioContextRef.current) {
      startTimeRef.current = audioContextRef.current.currentTime - time;
    }
    
    console.log('[Audio] Seeked to', time.toFixed(2), 's');
  }, [isPlaying]);

  // Set master volume
  const setVolume = useCallback((volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMasterVolume(clampedVolume);
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(clampedVolume, audioContextRef.current?.currentTime || 0);
    }
    
    console.log('[Audio] Master volume set to', (clampedVolume * 100).toFixed(0), '%');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      sourceNodesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {}
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isInitialized,
    isPlaying,
    currentTime,
    audioBuffers,
    masterVolume,
    initAudioContext,
    loadAudioFile,
    schedulePlayback,
    startPlayback,
    pausePlayback,
    stopPlayback,
    seekTo,
    setVolume
  };
};

export default useAudioEngine;
