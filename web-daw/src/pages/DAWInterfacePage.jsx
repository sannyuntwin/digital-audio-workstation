import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../services/apiService';
import DAWToolbar from '../components/DAWToolbar';
import DAWSidebar from '../components/DAWSidebar';
import DAWTimeline from '../components/DAWTimeline';
import audioEngine from '../audio/AudioEngine';

// ============ STYLES ============
const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: '#1a1a1e',
  color: '#f0f0f0',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};

// ----- Main Content Area -----
const contentStyle = {
  flex: 1,
  display: 'flex',
  overflow: 'hidden'
};

const messageStyle = {
  margin: 0,
  fontSize: '18px',
  color: '#c8ccd3'
};

const errorStyle = {
  ...messageStyle,
  color: '#de6e55'
};

const DAWInterfacePage = () => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Transport state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [playheadTime, setPlayheadTime] = useState(30); // seconds, for visual playhead
  const [bpm, setBpm] = useState(120);
  const [zoom, setZoom] = useState(100);

  // Track state
  const [tracks, setTracks] = useState([
    { id: 1, name: 'Kick Drum', type: 'audio', icon: '🥁', muted: false, solo: false, armed: false, selected: true },
    { id: 2, name: 'Snare', type: 'audio', icon: '🥁', muted: false, solo: false, armed: false, selected: false },
    { id: 3, name: 'Hi-Hat', type: 'audio', icon: '🥁', muted: false, solo: false, armed: false, selected: false },
    { id: 4, name: 'Bass', type: 'audio', icon: '🎸', muted: false, solo: false, armed: false, selected: false },
    { id: 5, name: 'Lead Synth', type: 'midi', icon: '🎹', muted: false, solo: false, armed: false, selected: false },
    { id: 6, name: 'Pad', type: 'midi', icon: '🎹', muted: false, solo: false, armed: false, selected: false },
  ]);

  // Track rename state
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editName, setEditName] = useState('');

  // Clips state
  const [clips, setClips] = useState([
    { id: 1, trackId: 1, name: 'Kick Pattern', type: 'audio', startTime: 0, duration: 4 },
    { id: 2, trackId: 1, name: 'Kick Fill', type: 'audio', startTime: 8, duration: 2 },
    { id: 3, trackId: 2, name: 'Snare Hit', type: 'audio', startTime: 1, duration: 4 },
    { id: 4, trackId: 3, name: 'HiHat Loop', type: 'audio', startTime: 0, duration: 8 },
    { id: 5, trackId: 4, name: 'Bassline', type: 'audio', startTime: 0, duration: 16 },
    { id: 6, trackId: 5, name: 'Lead Melody', type: 'midi', startTime: 4, duration: 12 },
    { id: 7, trackId: 5, name: 'Lead Bridge', type: 'midi', startTime: 18, duration: 8 },
    { id: 8, trackId: 6, name: 'Pad Chords', type: 'midi', startTime: 0, duration: 24 },
  ]);
  const [selectedClipIds, setSelectedClipIds] = useState([]);

  // Playback controls state
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(8);
  const [punchInEnabled, setPunchInEnabled] = useState(false);
  const [punchInTime, setPunchOutTime] = useState(4);

  // Toolbar state
  const [activeTool, setActiveTool] = useState('select');
  const [snapGrid, setSnapGrid] = useState(0.25);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [masterVolume, setMasterVolume] = useState(80);
  const [clipboard, setClipboard] = useState(null);

  // Undo/Redo history - stores snapshots of tracks and clips
  const [history, setHistory] = useState([{ tracks: [], clips: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Initialize history on first render
  useEffect(() => {
    if (history[0].tracks.length === 0) {
      setHistory([{ tracks: JSON.parse(JSON.stringify(tracks)), clips: JSON.parse(JSON.stringify(clips)) }]);
    }
  }, []);

  // Save state to history after significant changes
  const pushHistory = (newTracks, newClips) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({
        tracks: JSON.parse(JSON.stringify(newTracks)),
        clips: JSON.parse(JSON.stringify(newClips))
      });
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex(prev => prev - 1);
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  };

  const handleUndo = () => {
    setHistoryIndex(prev => {
      if (prev > 0) {
        const newIndex = prev - 1;
        const state = history[newIndex];
        setTracks(JSON.parse(JSON.stringify(state.tracks)));
        setClips(JSON.parse(JSON.stringify(state.clips)));
        return newIndex;
      }
      return prev;
    });
  };

  const handleRedo = () => {
    setHistoryIndex(prev => {
      if (prev < history.length - 1) {
        const newIndex = prev + 1;
        const state = history[newIndex];
        setTracks(JSON.parse(JSON.stringify(state.tracks)));
        setClips(JSON.parse(JSON.stringify(state.clips)));
        return newIndex;
      }
      return prev;
    });
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiService.getProject(projectId);
        const project = response?.data || response;
        setProjectName(project?.name || 'Unnamed Project');
      } catch (err) {
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipIds.length > 0 && editingTrackId === null) {
          e.preventDefault();
          selectedClipIds.forEach(id => handleClipDelete(id));
        }
      }
      // Drum kit keyboard shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        audioEngine.init();
        switch (e.key.toLowerCase()) {
          case 'z':
            audioEngine.playKick();
            break;
          case 'x':
            audioEngine.playSnare();
            break;
          case 'c':
            audioEngine.playHiHat();
            break;
          case ' ':
            e.preventDefault();
            handlePlay();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedClipIds, editingTrackId, isPlaying]);

  // Audio engine refs
  const playbackStartTimeRef = useRef(0);
  const animationFrameRef = useRef(null);
  const isPlayingRef = useRef(false);

  // Keep isPlaying ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Transport controls with audio
  const handlePlay = () => {
    if (!isPlaying) {
      isPlayingRef.current = true; // Set ref immediately
      audioEngine.init();
      audioEngine.play();
      audioEngine.setBPM(bpm);
      audioEngine.setMetronome(metronomeEnabled);
      audioEngine.setTimeSignature(timeSignature);
      audioEngine.setLoop(loopEnabled, loopStart, loopEnd);
      audioEngine.setMasterVolume(masterVolume);
      
      // Schedule clip playback
      scheduleClipPlayback();
      
      // Start time update animation
      startTimeUpdateLoop();
    } else {
      isPlayingRef.current = false; // Set ref immediately
      audioEngine.stop();
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    audioEngine.stop();
    audioEngine.reset();
    cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
    setIsRecording(false);
    setCurrentTime('00:00:00');
    setPlayheadTime(0);
  };

  const handleRecord = async () => {
    if (!isRecording) {
      audioEngine.init();
      const success = await audioEngine.startRecording();
      if (success) {
        setIsRecording(true);
        if (!isPlaying) {
          handlePlay();
        }
      }
    } else {
      const buffer = await audioEngine.stopRecording();
      setIsRecording(false);
      if (buffer) {
        // Add recorded clip to timeline
        const newClipId = Math.max(...clips.map(c => c.id), 0) + 1;
        const currentTimeSecs = currentTime.split(':').reduce((acc, val, idx) => acc + parseInt(val) * [3600, 60, 1][idx], 0);
        
        setClips(prev => {
          const trackId = tracks.find(t => t.armed)?.id || 1;
          const newClips = [...prev, {
            id: newClipId,
            trackId,
            name: `Recording ${newClipId}`,
            type: 'audio',
            startTime: currentTimeSecs,
            duration: buffer.duration,
            buffer: buffer
          }];
          pushHistory(tracks, newClips);
          return newClips;
        });
      }
    }
  };

  // Schedule clip playback based on clip data
  const scheduleClipPlayback = () => {
    // Simple demo: schedule drum sounds on beats
    const now = audioEngine.currentAudioTime;
    
    // Play kick on beats 1
    audioEngine.playKick(now + 0.1);
    
    // Schedule more if needed
    if (isPlaying) {
      setTimeout(scheduleClipPlayback, 500);
    }
  };

  // Time update loop
  const startTimeUpdateLoop = () => {
    const startPlayhead = playheadTime;
    const startTime = Date.now();
    playbackStartTimeRef.current = startTime;
    
    const update = () => {
      if (!isPlayingRef.current) return;
      
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const totalSeconds = Math.floor(elapsed);
      const newPlayheadTime = startPlayhead + elapsed;
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      setCurrentTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      setPlayheadTime(newPlayheadTime);
      
      animationFrameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  // Playback controls
  const handleMetronomeToggle = () => {
    const newEnabled = !metronomeEnabled;
    setMetronomeEnabled(newEnabled);
    audioEngine.setMetronome(newEnabled);
  };
  
  const handleLoopToggle = () => {
    const newEnabled = !loopEnabled;
    setLoopEnabled(newEnabled);
    audioEngine.setLoop(newEnabled, loopStart, loopEnd);
  };
  
  const handlePunchInToggle = () => setPunchInEnabled(!punchInEnabled);

  // Toolbar handlers
  const handleToolChange = (tool) => setActiveTool(tool);

  const handleTapTempo = (newBpm) => {
    setBpm(newBpm);
    audioEngine.setBPM(newBpm);
  };

  const handleMasterVolumeChange = (volume) => {
    setMasterVolume(volume);
    audioEngine.setMasterVolume(volume);
  };

  const handleTimeSignatureChange = (sig) => {
    setTimeSignature(sig);
    audioEngine.setTimeSignature(sig);
  };

  const handleSnapGridChange = (grid) => setSnapGrid(grid);

  const handleQuantize = () => {
    // Quantize selected clips to snap grid
    if (selectedClipIds.length === 0) return;
    setClips(prev => {
      const newClips = prev.map(c => {
        if (!selectedClipIds.includes(c.id)) return c;
        const quantizedStart = Math.round(c.startTime / snapGrid) * snapGrid;
        return { ...c, startTime: Math.max(0, quantizedStart) };
      });
      pushHistory(tracks, newClips);
      return newClips;
    });
  };

  const handleZoomToFit = () => {
    const maxTime = Math.max(...clips.map(c => c.startTime + c.duration), 60);
    const newZoom = Math.min(200, Math.max(50, Math.floor((800 / maxTime) * 5)));
    setZoom(newZoom);
  };

  // Transport navigation handlers
  const handleRewind = () => {
    const [hours, minutes, seconds] = currentTime.split(':').map(Number);
    let totalSeconds = hours * 3600 + minutes * 60 + seconds - 5;
    totalSeconds = Math.max(0, totalSeconds);
    const newHours = Math.floor(totalSeconds / 3600);
    const newMinutes = Math.floor((totalSeconds % 3600) / 60);
    const newSeconds = totalSeconds % 60;
    setCurrentTime(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`);
  };

  const handleFastForward = () => {
    const [hours, minutes, seconds] = currentTime.split(':').map(Number);
    let totalSeconds = hours * 3600 + minutes * 60 + seconds + 5;
    const newHours = Math.floor(totalSeconds / 3600);
    const newMinutes = Math.floor((totalSeconds % 3600) / 60);
    const newSeconds = totalSeconds % 60;
    setCurrentTime(`${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')}`);
  };

  const handleSkipToStart = () => {
    setCurrentTime('00:00:00');
    setPlayheadTime(0);
  };
  const handleSkipToEnd = () => {
    const maxTime = Math.max(...clips.map(c => c.startTime + c.duration), 0);
    const seconds = Math.floor(maxTime % 60);
    const minutes = Math.floor(maxTime / 60);
    const hours = Math.floor(minutes / 60);
    setCurrentTime(`${String(hours).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    setPlayheadTime(maxTime);
  };

  // Edit handlers
  const handleCut = () => {
    if (selectedClipIds.length === 0) return;
    const clipsToCut = clips.filter(c => selectedClipIds.includes(c.id));
    setClipboard(clipsToCut);
    handleClipDelete(selectedClipIds[0]);
  };

  const handleCopy = () => {
    if (selectedClipIds.length === 0) return;
    const clipsToCopy = clips.filter(c => selectedClipIds.includes(c.id));
    setClipboard(clipsToCopy);
  };

  const handlePaste = () => {
    if (!clipboard || clipboard.length === 0) return;
    const maxId = Math.max(...clips.map(c => c.id), 0);
    const currentTimeSecs = currentTime.split(':').reduce((acc, val, idx) => acc + parseInt(val) * [3600, 60, 1][idx], 0);

    setClips(prev => {
      const newClips = [...prev];
      clipboard.forEach((clip, idx) => {
        newClips.push({
          ...clip,
          id: maxId + idx + 1,
          startTime: currentTimeSecs,
          name: `${clip.name} (copy)`
        });
      });
      pushHistory(tracks, newClips);
      return newClips;
    });
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  // Track handlers
  const handleTrackSelect = (trackId) => {
    setTracks(prev => prev.map(t => ({ ...t, selected: t.id === trackId })));
  };

  const handleTrackMute = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const handleTrackSolo = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, solo: !t.solo } : t));
  };

  const handleTrackArm = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, armed: !t.armed } : t));
  };

  const handleDeleteTrack = (trackId) => {
    setTracks(prev => {
      const newTracks = prev.filter(t => t.id !== trackId);
      pushHistory(newTracks, clips);
      return newTracks;
    });
  };

  const handleRenameTrack = (trackId, currentName) => {
    if (trackId === null) {
      setEditingTrackId(null);
      setEditName('');
    } else {
      setEditingTrackId(trackId);
      setEditName(currentName);
    }
  };

  const handleEditNameChange = (value) => {
    setEditName(value);
  };

  const handleEditNameSubmit = () => {
    if (editingTrackId !== null && editName.trim()) {
      setTracks(prev => {
        const newTracks = prev.map(t => t.id === editingTrackId ? { ...t, name: editName.trim() } : t);
        pushHistory(newTracks, clips);
        return newTracks;
      });
    }
    setEditingTrackId(null);
    setEditName('');
  };

  const handleDuplicateTrack = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    const newId = Math.max(...tracks.map(t => t.id), 0) + 1;
    const newTrack = {
      ...track,
      id: newId,
      name: `${track.name} Copy`,
      selected: false,
      armed: false
    };
    setTracks(prev => {
      const newTracks = [...prev, newTrack];
      pushHistory(newTracks, clips);
      return newTracks;
    });
  };

  const handleChangeTrackType = (trackId) => {
    setTracks(prev => {
      const newTracks = prev.map(t => {
        if (t.id !== trackId) return t;
        const newType = t.type === 'audio' ? 'midi' : 'audio';
        return { ...t, type: newType, icon: newType === 'audio' ? '🎙️' : '🎹' };
      });
      pushHistory(newTracks, clips);
      return newTracks;
    });
  };

  const handleVolumeChange = (trackId, volume) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, volume } : t));
  };

  const handlePanChange = (trackId, pan) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, pan } : t));
  };

  // Add track handler
  const handleAddTrack = () => {
    const newId = Math.max(...tracks.map(t => t.id), 0) + 1;
    const trackNumber = tracks.filter(t => t.type === 'audio').length + 1;
    const newTrack = {
      id: newId,
      name: `Audio Track ${trackNumber}`,
      type: 'audio',
      icon: '🎙️',
      muted: false,
      solo: false,
      armed: false,
      selected: false
    };
    setTracks(prev => {
      const newTracks = [...prev, newTrack];
      pushHistory(newTracks, clips);
      return newTracks;
    });
  };

  // Timeline handlers
  const handleTimelineClick = (time) => {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60);
    const hours = Math.floor(minutes / 60);
    setCurrentTime(`${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const handleClipClick = (clip) => {
    // Selection is handled in the timeline component
  };

  const handleClipsSelected = (clipIds) => {
    setSelectedClipIds(clipIds);
  };

  const handleClipDelete = (clipId) => {
    setClips(prev => {
      const newClips = prev.filter(c => c.id !== clipId);
      pushHistory(tracks, newClips);
      return newClips;
    });
    setSelectedClipIds(prev => prev.filter(id => id !== clipId));
  };

  const handleClipMove = (clipId, newTrackId, newStartTime) => {
    setClips(prev => {
      const newClips = prev.map(c =>
        c.id === clipId ? { ...c, trackId: newTrackId, startTime: newStartTime } : c
      );
      pushHistory(tracks, newClips);
      return newClips;
    });
  };

  const handleClipResize = (clipId, newStartTime, newDuration) => {
    setClips(prev => {
      const newClips = prev.map(c =>
        c.id === clipId ? { ...c, startTime: newStartTime, duration: newDuration } : c
      );
      pushHistory(tracks, newClips);
      return newClips;
    });
  };

  const handleClipSplit = (clipId, splitTime) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    const firstDuration = splitTime - clip.startTime;
    const secondDuration = clip.duration - firstDuration;
    const newClipId = Math.max(...clips.map(c => c.id), 0) + 1;

    setClips(prev => {
      const newClips = [
        ...prev.filter(c => c.id !== clipId),
        { ...clip, duration: firstDuration },
        { ...clip, id: newClipId, name: `${clip.name} (split)`, startTime: splitTime, duration: secondDuration }
      ];
      pushHistory(tracks, newClips);
      return newClips;
    });
  };

  const handleAddClip = (trackId, startTime) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const newClipId = Math.max(...clips.map(c => c.id), 0) + 1;
    const clipCount = clips.filter(c => c.trackId === trackId).length;

    const newClip = {
      id: newClipId,
      trackId,
      name: `${track.name} Clip ${clipCount + 1}`,
      type: track.type,
      startTime,
      duration: 4
    };

    setClips(prev => {
      const newClips = [...prev, newClip];
      pushHistory(tracks, newClips);
      return newClips;
    });
  };

  return (
    <div style={pageStyle}>
      <DAWToolbar
        projectName={projectName}
        isPlaying={isPlaying}
        isRecording={isRecording}
        currentTime={currentTime}
        bpm={bpm}
        zoom={zoom}
        metronomeEnabled={metronomeEnabled}
        loopEnabled={loopEnabled}
        punchInEnabled={punchInEnabled}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        activeTool={activeTool}
        snapGrid={snapGrid}
        timeSignature={timeSignature}
        masterVolume={masterVolume}
        onPlay={handlePlay}
        onStop={handleStop}
        onRecord={handleRecord}
        onRewind={handleRewind}
        onFastForward={handleFastForward}
        onSkipToStart={handleSkipToStart}
        onSkipToEnd={handleSkipToEnd}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onZoomToFit={handleZoomToFit}
        onMetronomeToggle={handleMetronomeToggle}
        onLoopToggle={handleLoopToggle}
        onPunchInToggle={handlePunchInToggle}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToolChange={handleToolChange}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onSnapGridChange={handleSnapGridChange}
        onTapTempo={handleTapTempo}
        onTimeSignatureChange={handleTimeSignatureChange}
        onQuantize={handleQuantize}
        onMasterVolumeChange={handleMasterVolumeChange}
      />

      <div style={contentStyle}>
        {loading ? (
          <p style={messageStyle}>Loading project...</p>
        ) : error ? (
          <p style={errorStyle}>{error}</p>
        ) : (
          <>
            <DAWSidebar
              tracks={tracks}
              onTrackSelect={handleTrackSelect}
              onTrackMute={handleTrackMute}
              onTrackSolo={handleTrackSolo}
              onTrackArm={handleTrackArm}
              onAddTrack={handleAddTrack}
              onDeleteTrack={handleDeleteTrack}
              onRenameTrack={handleRenameTrack}
              onDuplicateTrack={handleDuplicateTrack}
              onChangeTrackType={handleChangeTrackType}
              onVolumeChange={handleVolumeChange}
              onPanChange={handlePanChange}
              editingTrackId={editingTrackId}
              editName={editName}
              onEditNameChange={handleEditNameChange}
              onEditNameSubmit={handleEditNameSubmit}
            />
            <DAWTimeline
              tracks={tracks}
              clips={clips}
              currentTime={playheadTime}
              zoom={zoom}
              duration={60}
              selectedClipIds={selectedClipIds}
              loopEnabled={loopEnabled}
              loopStart={loopStart}
              loopEnd={loopEnd}
              snapEnabled={true}
              snapGrid={0.25}
              onTimelineClick={handleTimelineClick}
              onClipClick={handleClipClick}
              onClipsSelected={handleClipsSelected}
              onClipDelete={handleClipDelete}
              onClipSplit={handleClipSplit}
              onAddClip={handleAddClip}
              onClipMove={handleClipMove}
              onClipResize={handleClipResize}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default DAWInterfacePage;
