/**
 * DAW Interface Page Component
 * Main audio production workspace
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Transport from '../components/transport/Transport';
import Timeline from '../components/timeline/Timeline';
import Sidebar from '../components/Sidebar/Sidebar';
import AudioEngine from '../audio/audioEngine';
import TrackManager from '../audio/trackManager';
import { useProjectStore, getProjectStore } from '../store/projectStore';
import '../index.css';

const DAWInterfacePage = () => {
  // Get project ID from URL params
  const { projectId } = useParams();
  const navigate = useNavigate();
  
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
  
  // Advanced transport state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [snapMode, setSnapMode] = useState('smart');
  const [dragMode, setDragMode] = useState('no-overlap');
  const [hZoom, setHZoom] = useState(1.1);
  const [vZoom, setVZoom] = useState(1.0);
  const [waveformZoom, setWaveformZoom] = useState(1.0);

  /**
   * Initialize DAW core systems
   */
  const initializeDAW = useCallback(async function() {
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
      
      const store = getProjectStore();
      
      // Handle existing project or create new one
      if (projectId) {
        console.log('Loading existing project:', projectId);
        await store.setCurrentProject(projectId);
      } else {
        console.log('Creating new project');
        // Create a new project in database
        const project = await store.createAndSetProject('My DAW Project');
        console.log('Created new project:', project.name);
        
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
      }
      
      // Update store state
      setState({ isAudioEngineInitialized: true });
      
      console.log('DAW initialized successfully');
      setIsLoading(false);
      
    } catch (err) {
      console.error('Failed to initialize DAW:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [projectId, setState]);

  
  /**
   * Handle transport play event
   */
  const handlePlay = useCallback(function() {
    if (audioEngineRef.current && state.isAudioEngineInitialized) {
      audioEngineRef.current.resumeContext();
      audioEngineRef.current.play(state.currentTime, state.tracks, state.clips);
      setState({ isPlaying: true });
      setIsPlaying(true);
    }
  }, [state.currentTime, state.tracks, state.clips, state.isAudioEngineInitialized, setState, setIsPlaying]);

  /**
   * Handle transport stop event
   */
  const handleStop = useCallback(function() {
    if (audioEngineRef.current) {
      audioEngineRef.current.stop();
      setState({ isPlaying: false, currentTime: 0 });
      setIsPlaying(false);
    }
  }, [setState, setIsPlaying]);

  /**
   * Handle transport record event
   * @param {boolean} isRecording - Recording state
   */
  const handleRecord = useCallback(function(isRecording) {
    console.log(' Recording ' + (isRecording ? 'started' : 'stopped'));
    setIsRecording(isRecording);
    // Recording logic can be implemented here
  }, [setIsRecording]);

  /**
   * Handle clip selection
   */
  const handleClipSelect = useCallback(function(clipId) {
    setSelectedClipId(clipId);
  }, []);

  /**
   * Handle track selection
   */
  const handleTrackSelect = useCallback(function(trackId) {
    setSelectedTrackId(trackId);
  }, []);

  /**
   * Handle clip movement in timeline
   * @param {string} clipId - Clip ID
   * @param {number} newTrackId - New track ID
   * @param {number} newStartTime - New start time
   */
  const handleClipMove = useCallback(async function(clipId, newTrackId, newStartTime) {
    const store = getProjectStore();
    store.moveClip(clipId, newTrackId, newStartTime);
    console.log(' Clip ' + clipId + ' moved to track ' + newTrackId + ' at ' + newStartTime.toFixed(2) + 's');
  }, []);

  /**
   * Handle track deletion
   */
  const handleTrackDelete = useCallback(async function(trackId) {
    const store = getProjectStore();
    store.deleteTrack(trackId);
    setSelectedTrackId(null);
  }, []);

  /**
   * Add new track
   * @param {string} type - Track type ('audio' or 'midi')
   */
  const handleAddTrack = useCallback(async function(type) { type = type || 'audio';
    const store = getProjectStore();
    const trackNumber = (state.tracks ? state.tracks.length : 0) + 1;
    
    const newTrack = {
      name: (type === 'audio' ? 'Audio' : 'MIDI') + ' Track ' + trackNumber,
      type: type,
      volume: 0.7,
      pan: 0,
      isMuted: false,
      isSolo: false,
      color: type === 'audio' ? '#4CAF50' : '#2196F3'
    };
    
    try {
      const trackId = store.addTrack(newTrack);
      console.log('Added ' + type + ' track: ' + newTrack.name);
      return trackId;
    } catch (error) {
      console.error('Error adding track:', error);
    }
  }, [state.tracks]);

  /**
   * Handle file drop on track
   * @param {File} file - Dropped audio file
   * @param {string} trackId - Target track ID
   * @param {number} dropTime - Time position where file was dropped
   */
  const handleFileDrop = useCallback(async function(file, trackId, dropTime) {
    console.log('File dropped:', file.name, 'on track:', trackId, 'at time:', dropTime);
    
    // Check if it's an audio file
    const audioTypes = ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/flac', 'audio/mpeg'];
    const isAudioFile = audioTypes.includes(file.type) || file.name.match(/\.(mp3|wav|ogg|m4a|flac)$/i);
    
    if (!isAudioFile) {
      console.warn('Unsupported file type: ' + file.type);
      return;
    }
    
    try {
      const store = getProjectStore();
      const engine = audioEngineRef.current;
      
      if (!engine) return;

      // Decode audio to get duration and peaks
      const buffer = await engine.decodeAudioFile(file);
      const peaks = engine.getPeaks(buffer, 300); // 300 peaks for good resolution
      
      // Create object URL for the audio file (used as identifier/path)
      const audioUrl = URL.createObjectURL(file);
      
      // Create new clip in store
      const clipId = store.addClip({
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        type: 'audio',
        startTime: dropTime,
        duration: buffer.duration,
        trackId: trackId,
        fileName: file.name,
        filePath: audioUrl,
        fileSize: file.size,
        mimeType: file.type,
        sampleRate: buffer.sampleRate,
        channels: buffer.numberOfChannels,
        peaks: peaks // Store peaks for waveform rendering
      });
      
      // Store the decoded buffer in engine for playback
      engine.storeBuffer(clipId, buffer);
      
      console.log('Added audio clip: ' + file.name + ' (Duration: ' + buffer.duration.toFixed(2) + 's)');
      return clipId;
      
    } catch (error) {
      console.error('Error adding audio file:', error);
    }
  }, []);

  /**
   * Toggle track inspector
   */
  const handleToggleInspector = useCallback(function() {
    console.log('Toggle inspector - Show track properties');
    // TODO: Implement inspector panel
    alert('Inspector: Track properties panel (to be implemented)');
  }, []);

  /**
   * Toggle solo mode for all tracks
   */
  const handleToggleSolo = useCallback(function() {
    console.log('Toggle solo mode');
    const store = getProjectStore();
    const currentTracks = store.getState().tracks || [];
    
    // Check if any track is in solo mode
    const hasSolo = currentTracks.some(track => track.isSolo);
    
    // Toggle solo for all tracks
    currentTracks.forEach(track => {
      store.updateTrack(track.id, { isSolo: !hasSolo });
    });
    
    console.log((!hasSolo ? 'Enabled' : 'Disabled') + ' solo mode for all tracks');
  }, []);

  /**
   * Handle edit menu
   */
  const handleEditMenu = useCallback(function() {
    console.log('Edit menu opened');
    alert('Edit Menu:\n• Undo\n• Redo\n• Cut\n• Copy\n• Paste\n• Delete\n• Select All');
  }, []);

  /**
   * Handle functions menu
   */
  const handleFunctionsMenu = useCallback(function() {
    console.log('Functions menu opened');
    alert('Functions Menu:\n• Mixdown\n• Bounce\n• Export\n• Consolidate\n• Normalize\n• Reverse');
  }, []);

  /**
   * Handle view menu
   */
  const handleViewMenu = useCallback(function() {
    console.log('View menu opened');
    alert('View Menu:\n• Zoom In\n• Zoom Out\n• Fit to Window\n• Show/Hide Tracks\n• Timeline Settings');
  }, []);

  /**
   * Split selected clip at current playhead position
   */
  const handleSplitClip = useCallback(function() {
    const store = getProjectStore();
    const currentTime = store.playheadTime || 0;
    
    if (selectedClipId) {
      console.log('Splitting clip: ' + selectedClipId + ' at ' + currentTime.toFixed(2) + 's');
      const newClipId = store.splitClip(selectedClipId, currentTime);
      if (newClipId) {
        console.log('Clip split successful. New clip ID: ' + newClipId);
        setSelectedClipId(null); // Deselect after split
      } else {
        console.warn('Split failed: Playhead may not be inside the selected clip.');
      }
    } else {
      console.log('No clip selected for splitting');
    }
  }, [selectedClipId]);

  /**
   * Cycle through snap modes
   */
  const handleSnapMode = useCallback(function() {
    console.log('Change snap mode');
    const modes = ['smart', 'bar', 'beat', 'off'];
    const currentIndex = modes.indexOf(snapMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setSnapMode(modes[nextIndex]);
    alert('Snap Mode: ' + modes[nextIndex].charAt(0).toUpperCase() + modes[nextIndex].slice(1));
  }, [snapMode, setSnapMode]);

  /**
   * Cycle through drag modes
   */
  const handleDragMode = useCallback(function() {
    console.log('Change drag mode');
    const modes = ['no-overlap', 'overlap', 'shuffle'];
    const currentIndex = modes.indexOf(dragMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setDragMode(modes[nextIndex]);
    alert('Drag Mode: ' + modes[nextIndex].charAt(0).toUpperCase() + modes[nextIndex].slice(1));
  }, [dragMode, setDragMode]);

  /**
   * Handle file drop button
   */
  const handleFileDropButton = useCallback(function() {
    console.log('File drop button clicked');
    alert('File browser: Select audio files to import');
  }, []);

  /**
   * Handle volume control
   */
  const handleVolumeControl = useCallback(function() {
    console.log('Volume control clicked');
    alert('Volume Control: Master volume settings');
  }, []);

  /**
   * Handle waveform view
   */
  const handleWaveformView = useCallback(function() {
    console.log('Waveform view toggled');
    alert('Waveform View: Toggle waveform display options');
  }, []);

  /**
   * Handle maximize view
   */
  const handleMaximize = useCallback(function() {
    console.log('Maximize view toggled');
    alert('Maximize: Toggle fullscreen timeline view');
  }, []);

  /**
   * Handle save project
   */
  const handleSaveProject = useCallback(async function() {
    const store = getProjectStore();
    if (store.getCurrentProjectId()) {
      try {
        await store._saveToDatabase();
        console.log('Project saved successfully');
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to save project:', error);
        // You could add an error notification here
      }
    } else {
      // Create a new project if none exists
      try {
        const project = await store.createAndSetProject(state.projectName || 'Untitled Project');
        console.log('New project created and saved:', project.name);
      } catch (error) {
        console.error('Failed to create project:', error);
      }
    }
  }, [state.projectName]);

  // Initialize DAW and load project data on component mount
  useEffect(function() {
    initializeDAW();
    
    // Cleanup on unmount
    return function() {
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
  }, [projectId, initializeDAW]);

  // Monitor track changes and sync with AudioEngine
  useEffect(function() {
    if (!audioEngineRef.current || !state.isAudioEngineInitialized || !state.tracks) return;

    state.tracks.forEach(track => {
      // Ensure nodes exist for each track
      audioEngineRef.current.createTrackNodes(track.id);
      
      // Update volume (clamped 0 to 1.5, multiplied by mute state)
      audioEngineRef.current.updateTrackVolume(track.id, track.isMuted ? 0 : (track.volume || 0.7));
      
      // Update pan
      audioEngineRef.current.updateTrackPan(track.id, track.pan || 0);
    });
  }, [state.tracks, state.isAudioEngineInitialized]);

  // Handle keyboard shortcuts
  useEffect(function() {
    const handleKeyDown = function(e) {
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
    return function() { window.removeEventListener('keydown', handleKeyDown); };
  }, [selectedClipId, selectedTrackId, handleTrackDelete]);

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
            onClick={function() {
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
      {/* Navigation Header */}
      <nav className="daw-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <Link to="/projects" className="back-link">
              <span className="back-icon">{"<-"} Back to Projects</span>
            </Link>
            <div className="project-info">
              <h2 className="project-name">{state.projectName || 'Untitled Project'}</h2>
              <span className="project-details">{state.bpm || 120} BPM</span>
            </div>
          </div>
          <div className="nav-actions">
            <button className="nav-btn secondary" onClick={handleToggleInspector}>
              <span className="btn-icon">Inspector</span>
            </button>
            <button className="nav-btn secondary" onClick={handleToggleSolo}>
              <span className="btn-icon">Solo</span>
            </button>
            <button className="nav-btn primary" onClick={handleSaveProject}>
              <span className="btn-icon">Save</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Transport Bar */}
      <div className="transport-section">
        <Transport
          audioEngine={audioEngineRef.current}
          onPlay={handlePlay}
          onStop={handleStop}
          onRecord={handleRecord}
          isPlaying={isPlaying}
        />
      </div>

      {/* Enhanced Toolbar */}
      <div className="daw-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-group">
            <button className="toolbar-btn" title="Add Audio Track" onClick={function() { return handleAddTrack('audio'); }}>
              <span className="btn-icon">+ Audio</span>
            </button>
            <button className="toolbar-btn" title="Add MIDI Track" onClick={function() { return handleAddTrack('midi'); }}>
              <span className="btn-icon">+ MIDI</span>
            </button>
            <button className="toolbar-btn" title="Global Tracks" onClick={function() {
              const store = getProjectStore();
              store.toggleGlobalTracks();
            }}>
              <span className="btn-icon">Global</span>
            </button>
            <button className="toolbar-btn" title="Clear All Solos" onClick={function() {
              const store = getProjectStore();
              store.clearAllSolos();
            }}>
              <span className="btn-icon">Clear Solo</span>
            </button>
          </div>
          
          <div className="toolbar-divider"></div>
          
          <div className="toolbar-group">
            <button className="toolbar-btn dropdown" onClick={handleEditMenu}>
              <span>Edit</span>
              <span className="dropdown-arrow">{"\u25bc"}</span>
            </button>
            <button className="toolbar-btn dropdown" onClick={handleFunctionsMenu}>
              <span>Functions</span>
              <span className="dropdown-arrow">{"\u25bc"}</span>
            </button>
            <button className="toolbar-btn dropdown" onClick={handleViewMenu}>
              <span>View</span>
              <span className="dropdown-arrow">{"\u25bc"}</span>
            </button>
          </div>
          
          <div className="toolbar-divider"></div>
          
          <div className="toolbar-group tools">
             <button className={'toolbar-btn ' + (!selectedClipId ? 'active' : '')} title="Select Tool">
               <span className="tool-icon">Select</span>
             </button>
             <button className={'toolbar-btn ' + (selectedClipId ? 'active' : '')} title="Split Tool" onClick={handleSplitClip}>
               <span className="tool-icon">Split</span>
             </button>
             <button className="toolbar-btn" title="Glue Tool">
               <span className="tool-icon">Glue</span>
             </button>
             <button className="toolbar-btn" title="Mute Tool">
               <span className="tool-icon">Mute</span>
             </button>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="toolbar-group">
            <span className="toolbar-label">Snap:</span>
            <button className="toolbar-btn menu" onClick={handleSnapMode}>
              <span>{snapMode === 'smart' ? 'Smart' : 'Off'}</span>
              <span className="dropdown-arrow">{"\u25bc"}</span>
            </button>
            
            <span className="toolbar-label">Drag:</span>
            <button className="toolbar-btn menu" onClick={handleDragMode}>
              <span>{dragMode === 'no-overlap' ? 'No Overlap' : 'Overlap'}</span>
              <span className="dropdown-arrow">{"\u25bc"}</span>
            </button>
          </div>

          <div className="toolbar-divider"></div>

          <div className="toolbar-group zoom-controls">
             <div className="zoom-control">
                <label className="zoom-label">Wave</label>
                <input type="range" min="0.5" max="2.0" step="0.1" value={waveformZoom} onChange={function(e) { setWaveformZoom(parseFloat(e.target.value)); }} />
                <span className="zoom-value">{(waveformZoom * 100).toFixed(0)}%</span>
             </div>
             <div className="zoom-control">
                <label className="zoom-label">Vert</label>
                <input type="range" min="0.5" max="2.0" step="0.1" value={vZoom} onChange={function(e) { setVZoom(parseFloat(e.target.value)); }} />
                <span className="zoom-value">{(vZoom * 100).toFixed(0)}%</span>
             </div>
             <div className="zoom-control">
                <label className="zoom-label">Horiz</label>
                <input type="range" min="0.5" max="2.5" step="0.1" value={hZoom} onChange={function(e) { setHZoom(parseFloat(e.target.value)); }} />
                <span className="zoom-value">{(hZoom * 100).toFixed(0)}%</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main DAW Workspace */}
      <main className="daw-main">
        <div className="daw-workspace">
          {/* Sidebar */}
          <aside className="daw-sidebar">
            <Sidebar
              tracks={state.tracks ? state.tracks : []}
              selectedTrackId={selectedTrackId}
              onTrackSelect={function(trackId) {
                setSelectedTrackId(trackId);
                handleTrackSelect(trackId);
              }}
              onTrackUpdate={function(trackId, updates) {
                  const store = getProjectStore();
                  store.updateTrack(trackId, updates);
              }}
            />
          </aside>

          {/* Timeline Area */}
          <div className="daw-timeline-area">
            <div className="timeline-header">
              <div className="timeline-info">
                <span className="track-count">{(state.tracks ? state.tracks.length : 0)} Tracks</span>
                <span className="clip-count">{(state.clips ? state.clips.length : 0)} Clips</span>
                <span className="duration">{Math.max.apply(Math, (state.clips ? state.clips.map(function(clip) { return clip.startTime + clip.duration; }) : [0]))}s</span>
              </div>
              <div className="timeline-actions">
                <button className="timeline-btn" onClick={handleFileDropButton}>
                  <span className="btn-icon">Import Audio</span>
                </button>
                <button className="timeline-btn" onClick={handleVolumeControl}>
                  <span className="btn-icon">Master Volume</span>
                </button>
                <button className="timeline-btn" onClick={handleWaveformView}>
                  <span className="btn-icon">Waveform</span>
                </button>
                <button className="timeline-btn" onClick={handleMaximize}>
                  <span className="btn-icon">Maximize</span>
                </button>
              </div>
            </div>
            
            <div className="daw-content">
              <Timeline
                tracks={state.tracks ? state.tracks : []}
                clips={state.clips ? state.clips : []}
                zoomLevel={state.zoomLevel ? state.zoomLevel : 1}
                currentTime={state.currentTime ? state.currentTime : 0}
                onClipMove={handleClipMove}
                onClipSelect={handleClipSelect}
                selectedClipId={selectedClipId}
                selectedTrackId={selectedTrackId}
                onTrackSelect={function(trackId) {
                  setSelectedTrackId(trackId);
                }}
                bpm={state.bpm ? state.bpm : 120}
                onFileDrop={handleFileDrop}
                onTrackDelete={handleTrackDelete}
                onTrackAdd={handleAddTrack}
                onToggleGlobalTracks={function() {
                  const store = getProjectStore();
                  store.toggleGlobalTracks();
                }}
                onClearSolo={function() {
                  const store = getProjectStore();
                  store.clearAllSolos();
                }}
                showGlobalTracks={state.showGlobalTracks}
                onTrackUpdate={function(trackId, updates) {
                    const store = getProjectStore();
                    store.updateTrack(trackId, updates);
                }}
                onReorderTrack={function(fromIndex, toIndex) {
                    const store = getProjectStore();
                    store.reorderTracks(fromIndex, toIndex);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="daw-status-bar">
        <div className="status-left">
          <span className="status-item">
            <span className="status-label">Engine:</span>
            <span className="status-value">{state.isAudioEngineInitialized ? 'Ready' : 'Initializing...'}</span>
          </span>
          <span className="status-item">
            <span className="status-label">Sample Rate:</span>
            <span className="status-value">48kHz</span>
          </span>
          <span className="status-item">
            <span className="status-label">Buffer:</span>
            <span className="status-value">256</span>
          </span>
        </div>
        <div className="status-right">
          <span className="status-item">
            <span className="status-label">Selected:</span>
            <span className="status-value">{selectedClipId ? "Clip " + selectedClipId : selectedTrackId ? "Track " + selectedTrackId : "None"}</span>
          </span>
          <span className="status-item">
            <span className="status-label">Time:</span>
            <span className="status-value">{(state.currentTime ? state.currentTime.toFixed(2) : '0.00') + 's'}</span>
          </span>
        </div>
      </footer>
    </div>
  );
};
  
export default DAWInterfacePage;
