/**
 * DAW Interface Page Component
 * Main audio production workspace
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Transport from '../components/transport/Transport';
import Timeline from '../components/timeline/Timeline';
import Sidebar from '../components/Sidebar/Sidebar';
import AudioEngine from '../audio/audioEngine';
import TrackManager from '../audio/trackManager';
import { useProjectStore, getProjectStore } from '../store/projectStore';
import './DAWInterfacePage.css';

const DAWInterfacePage = () => {
  // Audio engine and track manager instances
  const audioEngineRef = useRef(null);
  const trackManagerRef = useRef(null);
  
  // Project state from store
  const [state, setState] = useProjectStore();
  
  // Local UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Sidebar state
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [selectedClipId, setSelectedClipId] = useState(null);
  
  // Project management state
  const [currentProject, setCurrentProject] = useState(null);

  /**
   * Initialize DAW core systems
   */
  const initializeDAW = useCallback(async () => {
    try {
      console.log('Initializing Web DAW...');
      
      // Initialize audio engine
      audioEngineRef.current = new AudioEngine();
      const audioInitialized = await audioEngineRef.current.initialize();
      
      if (!audioInitialized) {
        throw new Error('Failed to initialize audio engine');
      }
      
      // Initialize track manager
      trackManagerRef.current = new TrackManager();
      
      // Initialize default timeline data
      const store = getProjectStore();
      
      // Add default tracks
      const audioTrackId = store.addTrack({
        name: 'Audio Track 1',
        type: 'audio'
      });
      
      const midiTrackId = store.addTrack({
        name: 'MIDI Track 1',
        type: 'midi'
      });
      
      const audioTrack2Id = store.addTrack({
        name: 'Audio Track 2',
        type: 'audio'
      });
      
      // Add some default clips
      store.addClip({
        name: 'Drums',
        type: 'audio',
        startTime: 0,
        duration: 4,
        trackId: audioTrackId
      });
      
      store.addClip({
        name: 'Melody',
        type: 'midi',
        startTime: 2,
        duration: 6,
        trackId: midiTrackId
      });
      
      store.addClip({
        name: 'Bass',
        type: 'audio',
        startTime: 8,
        duration: 3,
        trackId: audioTrack2Id
      });
      
      // Update store state
      setState({ isAudioEngineInitialized: true });
      
      console.log('DAW initialized successfully');
      setIsLoading(false);
      
    } catch (err) {
      console.error('Failed to initialize DAW:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [setState]);

  
  /**
   * Handle transport play event
   */
  const handlePlay = useCallback(() => {
    if (audioEngineRef.current && state.isAudioEngineInitialized) {
      audioEngineRef.current.resumeContext();
      audioEngineRef.current.play(state.currentTime, state.tracks, state.clips);
      setState({ isPlaying: true });
    }
  }, [state.currentTime, state.tracks, state.clips, state.isAudioEngineInitialized, setState]);

  /**
   * Handle transport stop event
   */
  const handleStop = useCallback(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
      setState({ isPlaying: false, currentTime: 0 });
    }
  }, [setState]);

  /**
   * Handle transport record event
   * @param {boolean} isRecording - Recording state
   */
  const handleRecord = useCallback((isRecording) => {
    console.log(` Recording ${isRecording ? 'started' : 'stopped'}`);
    // Recording logic can be implemented here
  }, []);

  /**
   * Handle clip selection
   */
  const handleClipSelect = useCallback((clipId) => {
    setSelectedClipId(clipId);
  }, []);

  /**
   * Handle track selection
   */
  const handleTrackSelect = useCallback((trackId) => {
    setSelectedTrackId(trackId);
  }, []);

  /**
   * Handle clip movement in timeline
   * @param {string} clipId - Clip ID
   * @param {number} newTrackId - New track ID
   * @param {number} newStartTime - New start time
   */
  const handleClipMove = useCallback(async (clipId, newTrackId, newStartTime) => {
    const store = getProjectStore();
    store.moveClip(clipId, newTrackId, newStartTime);
    console.log(` Clip ${clipId} moved to track ${newTrackId} at ${newStartTime.toFixed(2)}s`);
    
    // Save to backend if we have a current project
    if (currentProject) {
      try {
        // Save project to backend
        console.log('Saving project after clip move');
      } catch (err) {
        console.error('Failed to save project:', err);
      }
    }
  }, [currentProject]);

  /**
   * Handle track deletion
   */
  const handleTrackDelete = useCallback(async (trackId) => {
    const store = getProjectStore();
    store.deleteTrack(trackId);
    setSelectedTrackId(null);
    
    // Save to backend if we have a current project
    if (currentProject) {
      try {
        // Save project to backend
        console.log('Saving project after track deletion');
      } catch (err) {
        console.error('Failed to save project:', err);
      }
    }
  }, [currentProject]);

  /**
   * Add new track
   * @param {string} type - Track type ('audio' or 'midi')
   */
  const handleAddTrack = useCallback(async (type = 'audio') => {
    const store = getProjectStore();
    const trackId = store.addTrack({ type });
    console.log(` Added new ${type} track with ID: ${trackId}`);
    
    // Save to backend if we have a current project
    if (currentProject) {
      try {
        // Save project to backend
        console.log('Saving project after track addition');
      } catch (err) {
        console.error('Failed to save project:', err);
      }
    }
  }, [currentProject]);

    // Initialize DAW and load project data on component mount
  useEffect(() => {
    const initializeDAWWithProject = async () => {
      try {
        console.log('Initializing Web DAW...');
        
        // Initialize audio engine
        audioEngineRef.current = new AudioEngine();
        const audioInitialized = await audioEngineRef.current.initialize();
        
        if (!audioInitialized) {
          throw new Error('Failed to initialize audio engine');
        }
        
        // Initialize track manager
        trackManagerRef.current = new TrackManager();
        
        // Check if we have project data from localStorage
        const savedProject = localStorage.getItem('currentProject');
        if (savedProject) {
          const project = JSON.parse(savedProject);
          console.log('Loading project from localStorage:', project);
          
          // Handle database field mapping (snake_case to camelCase)
          const tracks = (project.tracks || []).map(track => ({
            id: track.id,
            name: track.name,
            type: track.type,
            volume: track.volume,
            pan: track.pan,
            isMuted: track.is_muted,
            isSolo: track.is_solo,
            color: track.color,
            createdAt: track.created_at,
            updatedAt: track.updated_at
          }));
          
          const clips = (project.clips || []).map(clip => ({
            id: clip.id,
            name: clip.name,
            type: clip.type,
            startTime: clip.start_time,
            duration: clip.duration,
            trackId: clip.track_id,
            fileName: clip.file_name,
            filePath: clip.file_path,
            fileSize: clip.file_size,
            mimeType: clip.mime_type,
            sampleRate: clip.sample_rate,
            bitDepth: clip.bit_depth,
            channels: clip.channels,
            settings: clip.settings,
            createdAt: clip.created_at,
            updatedAt: clip.updated_at
          }));
          
          // Load project data into store
          const store = getProjectStore();
          store.setState({
            tracks,
            clips,
            bpm: project.bpm || 120,
            zoomLevel: project.settings?.zoomLevel || 1,
            currentTime: project.settings?.currentTime || 0,
            isAudioEngineInitialized: true
          });
          
          setCurrentProject(project);
          console.log('Loaded project data:', { tracks: tracks.length, clips: clips.length });
        } else {
          // No project data, initialize with default data
          console.log('No project data found, initializing with default data');
          const store = getProjectStore();
          
          // Add default tracks
          const audioTrackId = store.addTrack({
            name: 'Audio Track 1',
            type: 'audio'
          });
          
          const midiTrackId = store.addTrack({
            name: 'MIDI Track 1',
            type: 'midi'
          });
          
          const audioTrack2Id = store.addTrack({
            name: 'Audio Track 2',
            type: 'audio'
          });
          
          // Add some default clips
          store.addClip({
            name: 'Drums',
            type: 'audio',
            startTime: 0,
            duration: 4,
            trackId: audioTrackId
          });
          
          store.addClip({
            name: 'Melody',
            type: 'midi',
            startTime: 2,
            duration: 6,
            trackId: midiTrackId
          });
          
          store.addClip({
            name: 'Bass',
            type: 'audio',
            startTime: 8,
            duration: 3,
            trackId: audioTrack2Id
          });
          
          store.setState({ isAudioEngineInitialized: true });
        }
        
        console.log('DAW initialized successfully');
        setIsLoading(false);
        
      } catch (err) {
        console.error('Failed to initialize DAW:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeDAWWithProject();
    
    // Cleanup on unmount
    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.dispose();
      }
      if (trackManagerRef.current) {
        trackManagerRef.current.clearAllTracks();
      }
      
      // Cleanup store
      const store = getProjectStore();
      store.dispose();
    };
  }, []);

  // Monitor track changes and sync with AudioEngine
  useEffect(() => {
    if (!audioEngineRef.current || !state.isAudioEngineInitialized || !state.tracks) return;

    state.tracks.forEach(track => {
      // Ensure nodes exist for each track
      audioEngineRef.current.createTrackNodes(track.id);
      
      // Update volume (clamped 0 to 1.5, multiplied by mute state)
      audioEngineRef.current.updateTrackVolume(track.id, track.isMuted ? 0 : (track.volume ?? 0.7));
      
      // Update pan
      audioEngineRef.current.updateTrackPan(track.id, track.pan ?? 0);
    });
  }, [state.tracks, state.isAudioEngineInitialized]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Priority: delete selected clip first, then selected track
        if (selectedClipId) {
          e.preventDefault();
          console.log('Delete clip:', selectedClipId);
        } else if (selectedTrackId) {
          handleTrackDelete(selectedTrackId);
        }
      }

      // Ctrl/Cmd + E = split clip at playhead
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        console.log('Split clip:', selectedClipId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, selectedTrackId, handleTrackDelete]);

  // Auto-save project when tracks or clips change
  useEffect(() => {
    if (currentProject && (state.tracks || state.clips)) {
      const timeoutId = setTimeout(() => {
        // Save project to backend
        console.log('Auto-saving project...');
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [state.tracks, state.clips, currentProject]);

  // Loading state
  if (isLoading) {
    return (
      <div className="daw-interface loading">
        <div className="loading-content">
          <div className="loading-spinner">Audio Engine Initializing...</div>
          <h2>Setting up your DAW...</h2>
          <p>Please wait while we initialize the audio engine and components</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="daw-interface error">
        <div className="error-content">
          <h2>Initialization Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => {
              setError(null);
              initializeDAW();
            }} 
            className="retry-btn"
          >
            Retry Initialization
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="daw-interface">
      {/* Transport Controls - Top Section (Integrated Header) */}
      <div className="transport-top">
        <Transport
          audioEngine={audioEngineRef.current}
          onPlay={handlePlay}
          onStop={handleStop}
          onRecord={handleRecord}
        />
      </div>

      {/* Logic Toolbar - Second Bar */}
      <div className="daw-toolbar">
        <div className="toolbar-group">
          <button className="toolbar-btn active" onClick={() => handleAddTrack('audio')}>+</button>
          <button className="toolbar-btn active">i</button>
          <button className="toolbar-btn">S</button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button className="toolbar-btn">Edit</button>
          <button className="toolbar-btn">Functions</button>
          <button className="toolbar-btn">View</button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button className="toolbar-btn active" title="Split">✂️ Split</button>
        </div>
        
        <div className="toolbar-divider"></div>
        
        <div className="toolbar-group">
          <button className="toolbar-btn">Snap: Smart</button>
          <button className="toolbar-btn">Drag: No Overlap</button>
        </div>
      </div>

      {/* Main Content */}
      <main className="daw-main">
        <div className="main-layout">
          {/* Sidebar */}
          <Sidebar
            tracks={state.tracks || []}
            selectedTrackId={selectedTrackId}
            onTrackSelect={(trackId) => {
              setSelectedTrackId(trackId);
              handleTrackSelect(trackId);
            }}
            onTrackUpdate={(trackId, updates) => {
                const store = getProjectStore();
                store.updateTrack(trackId, updates);
            }}
          />

          {/* Content Area */}
          <div className="content-area">
            {/* Timeline Component */}
            <div className="daw-content">
              <Timeline
                tracks={state.tracks || []}
                clips={state.clips || []}
                zoomLevel={state.zoomLevel || 1}
                currentTime={state.currentTime || 0}
                onClipMove={handleClipMove}
                onClipSelect={handleClipSelect}
                selectedClipId={selectedClipId}
                bpm={state.bpm || 120}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};


export default DAWInterfacePage;
