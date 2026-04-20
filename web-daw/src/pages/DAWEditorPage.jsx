import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/apiService';
import DAWToolbar from '../components/DAWToolbar';
import DAWSidebar from '../components/DAWSidebar';
import DAWTimeline from '../components/DAWTimeline';
import audioEngine from '../audio/AudioEngine';

// Import modal components (we'll create these inline for now)
import PianoRollModal from '../components/modals/PianoRollModal';
import MixerModal from '../components/modals/MixerModal';
import SoundLibraryModal from '../components/modals/SoundLibraryModal';
import SettingsModal from '../components/modals/SettingsModal';
import ExportModal from '../components/modals/ExportModal';

// ============ STYLES ============
const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '12px',
  background: 'radial-gradient(circle at 15% 0%, #2a3f5f 0%, #131722 48%, #0d1118 100%)',
  color: '#f5f7fa',
  fontFamily: '"Avenir Next", "SF Pro Display", "Segoe UI", sans-serif'
};

const workspaceFrameStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.26)',
  background: 'rgba(8, 12, 18, 0.82)',
  boxShadow: '0 28px 52px rgba(0, 0, 0, 0.46)',
  backdropFilter: 'blur(6px)',
  overflow: 'hidden'
};

const contentStyle = {
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(14, 18, 28, 0.62) 0%, rgba(8, 11, 17, 0.86) 100%)'
};

const statusStripStyle = {
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '8px 14px',
  flexWrap: 'wrap',
  background: 'linear-gradient(90deg, rgba(17, 24, 39, 0.92) 0%, rgba(17, 28, 46, 0.78) 50%, rgba(17, 24, 39, 0.92) 100%)',
  borderBottom: '1px solid rgba(148, 163, 184, 0.18)'
};

const statusGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap'
};

const statusChipStyle = {
  borderRadius: '999px',
  padding: '5px 10px',
  border: '1px solid rgba(148, 163, 184, 0.34)',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#dbeafe',
  fontSize: '12px',
  fontWeight: 600
};

const statusAccentChipStyle = {
  ...statusChipStyle,
  border: '1px solid rgba(96, 165, 250, 0.5)',
  background: 'rgba(30, 64, 175, 0.32)'
};

const statusMetaTextStyle = {
  fontSize: '12px',
  color: '#cbd5e1'
};

const statusValueStyle = {
  color: '#eff6ff',
  fontWeight: 700
};

const quickNavBtnStyle = {
  border: '1px solid rgba(59, 130, 246, 0.55)',
  borderRadius: '8px',
  padding: '6px 12px',
  background: 'rgba(30, 64, 175, 0.48)',
  color: '#dbeafe',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const studioLayoutStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  background: 'linear-gradient(180deg, rgba(11, 17, 29, 0.72) 0%, rgba(8, 12, 20, 0.9) 100%)'
};

const studioRowStyle = {
  flex: 1,
  display: 'flex',
  minHeight: 0,
  overflow: 'hidden'
};

const panelStyle = {
  width: '228px',
  minWidth: '228px',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(180deg, rgba(20, 28, 42, 0.94) 0%, rgba(15, 22, 34, 0.9) 100%)',
  borderRight: '1px solid rgba(148, 163, 184, 0.2)'
};

const rightPanelStyle = {
  ...panelStyle,
  width: '248px',
  minWidth: '248px',
  borderRight: 'none',
  borderLeft: '1px solid rgba(148, 163, 184, 0.2)'
};

const centerWorkspaceStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  minHeight: 0
};

const arrangementRowStyle = {
  flex: 1,
  display: 'flex',
  minHeight: 0,
  minWidth: 0,
  overflow: 'hidden'
};

const trackWrapStyle = {
  display: 'flex',
  borderRight: '1px solid rgba(148, 163, 184, 0.2)'
};

const timelineWrapStyle = {
  flex: 1,
  minWidth: 0,
  minHeight: 0
};

const bottomPanelStyle = {
  height: '210px',
  borderTop: '1px solid rgba(148, 163, 184, 0.2)',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(180deg, rgba(20, 26, 40, 0.9) 0%, rgba(12, 18, 28, 0.96) 100%)'
};

const bottomHeaderStyle = {
  height: '34px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 12px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
};

const bottomTitleStyle = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#dbeafe',
  letterSpacing: '0.5px',
  textTransform: 'uppercase'
};

const bottomBodyStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '10px 12px'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: 'rgba(8, 12, 18, 0.95)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  maxWidth: '90vw',
  maxHeight: '90vh',
  overflow: 'hidden'
};

const getIsCompactLayout = () => (
  typeof window !== 'undefined' ? window.innerWidth < 1180 : false
);

const formatDuration = (seconds) => {
  const rounded = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const DAWEditorPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompactLayout, setIsCompactLayout] = useState(getIsCompactLayout);
  const [showAssetPanel, setShowAssetPanel] = useState(() => !getIsCompactLayout());
  const [showTrackPanel, setShowTrackPanel] = useState(() => !getIsCompactLayout());
  const [showInspectorPanel, setShowInspectorPanel] = useState(() => !getIsCompactLayout());
  const [leftPanelTab, setLeftPanelTab] = useState('files');
  const [rightPanelTab, setRightPanelTab] = useState('effects');
  const [bottomPanelTab, setBottomPanelTab] = useState('piano');
  const [saveStatus, setSaveStatus] = useState('idle');
  const [studioMessage, setStudioMessage] = useState('');

  // Modal states
  const [showPianoRoll, setShowPianoRoll] = useState(false);
  const [showMixer, setShowMixer] = useState(false);
  const [showSoundLibrary, setShowSoundLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Transport state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00:00');
  const [playheadTime, setPlayheadTime] = useState(30);
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
  const loopStart = 0;
  const loopEnd = 8;
  const [punchInEnabled, setPunchInEnabled] = useState(false);

  // Toolbar state
  const [activeTool, setActiveTool] = useState('select');
  const [snapGrid, setSnapGrid] = useState(0.25);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [masterVolume, setMasterVolume] = useState(80);
  const [clipboard, setClipboard] = useState(null);

  // Undo/Redo history
  const [history, setHistory] = useState([{ tracks: [], clips: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Initialize history on first render
  useEffect(() => {
    if (history[0].tracks.length === 0) {
      setHistory([{ tracks: JSON.parse(JSON.stringify(tracks)), clips: JSON.parse(JSON.stringify(clips)) }]);
    }
  }, [tracks, clips, history]);

  // Save state to history after significant changes
  const pushHistory = (newTracks, newClips) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({
        tracks: JSON.parse(JSON.stringify(newTracks)),
        clips: JSON.parse(JSON.stringify(newClips))
      });
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

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getProject(projectId);
      const project = response?.data || response;
      setProjectName(project?.name || 'Untitled Project');
      if (project?.bpm) {
        setBpm(project.bpm);
      }
      if (project?.timeSignature) {
        setTimeSignature(project.timeSignature);
      }
    } catch (err) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const buildProjectSnapshot = useCallback(() => ({
    id: projectId,
    name: projectName || 'Untitled Project',
    bpm,
    timeSignature,
    masterVolume,
    zoom,
    tracks,
    clips,
    savedAt: new Date().toISOString()
  }), [projectId, projectName, bpm, timeSignature, masterVolume, zoom, tracks, clips]);

  const handleSaveProject = useCallback(() => {
    try {
      setSaveStatus('saving');
      setStudioMessage('');
      const snapshot = buildProjectSnapshot();
      localStorage.setItem(`daw_project_${projectId}`, JSON.stringify(snapshot));
      setSaveStatus('saved');
      setStudioMessage('Project saved to local session storage.');
      setTimeout(() => setSaveStatus('idle'), 1800);
    } catch (saveError) {
      setSaveStatus('error');
      setStudioMessage(`Save failed: ${saveError.message}`);
      setTimeout(() => setSaveStatus('idle'), 2200);
    }
  }, [buildProjectSnapshot, projectId]);

  const handleExportProject = useCallback(() => {
    setShowExport(true);
  }, []);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    const handleResize = () => {
      const compact = getIsCompactLayout();
      setIsCompactLayout(compact);
      if (!compact) {
        setShowAssetPanel(true);
        setShowTrackPanel(true);
        setShowInspectorPanel(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!studioMessage) return undefined;
    const timer = setTimeout(() => setStudioMessage(''), 4200);
    return () => clearTimeout(timer);
  }, [studioMessage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          handleSaveProject();
          return;
        }
        if (key === 'e') {
          e.preventDefault();
          handleExportProject();
          return;
        }
        if (key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if ((key === 'y') || (key === 'z' && e.shiftKey)) {
          e.preventDefault();
          handleRedo();
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedClipIds.length > 0 && editingTrackId === null) {
          e.preventDefault();
          selectedClipIds.forEach(id => {
            setClips(prev => prev.filter(c => c.id !== id));
          });
        }
      }
      // Modal shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'p':
            e.preventDefault();
            setShowPianoRoll(true);
            break;
          case 'm':
            e.preventDefault();
            setShowMixer(true);
            break;
          case 'l':
            e.preventDefault();
            setShowSoundLibrary(true);
            break;
          case ',':
            e.preventDefault();
            setShowSettings(true);
            break;
          case 'escape':
            // Close all modals
            setShowPianoRoll(false);
            setShowMixer(false);
            setShowSoundLibrary(false);
            setShowSettings(false);
            setShowExport(false);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, selectedClipIds, editingTrackId, handleSaveProject, handleExportProject, handleUndo, handleRedo]);

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
      isPlayingRef.current = true;
      audioEngine.init();
      audioEngine.play();
      audioEngine.setBPM(bpm);
      audioEngine.setMetronome(metronomeEnabled);
      audioEngine.setTimeSignature(timeSignature);
      audioEngine.setLoop(loopEnabled, loopStart, loopEnd);
      audioEngine.setMasterVolume(masterVolume);
    } else {
      isPlayingRef.current = false;
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
    setClips(prev => prev.filter(c => !selectedClipIds.includes(c.id)));
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

  const selectedTrack = tracks.find(track => track.selected);
  const arrangementLength = Math.max(...clips.map(c => c.startTime + c.duration), 0);
  const pianoRollNotes = clips
    .filter(clip => clip.type === 'midi')
    .slice(0, 10)
    .map((clip, index) => ({
      id: clip.id,
      left: `${Math.min(88, clip.startTime * 3.4)}%`,
      width: `${Math.max(8, clip.duration * 2.8)}%`,
      top: `${8 + ((index * 14) % 78)}%`
    }));

  // Mock data for panels
  const assetLibrary = [
    { name: 'Kick_808.wav', type: 'Sample', detail: 'One Shot' },
    { name: 'Snare_Snap.wav', type: 'Sample', detail: 'One Shot' },
    { name: 'House_Hat_Loop.wav', type: 'Loop', detail: '124 BPM' },
    { name: 'Deep_Bass_01.wav', type: 'Loop', detail: '8 Bars' },
    { name: 'Analog_Stab.wav', type: 'Sample', detail: 'One Shot' }
  ];

  const instrumentLibrary = [
    { name: 'Analog Poly', family: 'Synth', preset: 'Warm Pad' },
    { name: 'Mono Bass', family: 'Synth', preset: 'Solid Sub' },
    { name: 'FM Keys', family: 'Keys', preset: 'Glass Bell' },
    { name: 'Drum Rack', family: 'Drums', preset: 'Studio Kit' },
    { name: 'String Ensemble', family: 'Orchestral', preset: 'Wide Layer' }
  ];

  const effectLibrary = [
    { name: 'Channel EQ', state: 'On', value: 'HP 90Hz' },
    { name: 'Compressor', state: 'On', value: '3.0:1' },
    { name: 'Reverb', state: 'On', value: 'Hall 18%' },
    { name: 'Delay', state: 'Off', value: '1/8 PingPong' },
    { name: 'Limiter', state: 'On', value: '-0.8dB' }
  ];

  return (
    <div style={pageStyle}>
      <div style={workspaceFrameStyle}>
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
          onSave={handleSaveProject}
          onExport={handleExportProject}
          saveStatus={saveStatus}
        />

        <div style={statusStripStyle}>
          <div style={statusGroupStyle}>
            <span style={statusAccentChipStyle}>Project {projectId}</span>
            <span style={statusChipStyle}>Tracks {tracks.length}</span>
            <span style={statusChipStyle}>Clips {clips.length}</span>
            <span style={statusChipStyle}>Length {formatDuration(arrangementLength)}</span>
          </div>
          <div style={statusGroupStyle}>
            <span style={statusMetaTextStyle}>
              Selected <span style={statusValueStyle}>{selectedTrack?.name || 'None'}</span>
            </span>
            <span style={statusMetaTextStyle}>
              Tempo <span style={statusValueStyle}>{bpm} BPM</span>
            </span>
            <span style={statusMetaTextStyle}>
              Signature <span style={statusValueStyle}>{timeSignature}</span>
            </span>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => setShowPianoRoll(true)}
            >
              Piano Roll (P)
            </button>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => setShowMixer(true)}
            >
              Mixer (M)
            </button>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => setShowSoundLibrary(true)}
            >
              Sound Library (L)
            </button>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => setShowSettings(true)}
            >
              Settings (,)
            </button>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => setShowExport(true)}
            >
              Export (E)
            </button>
            {studioMessage && <span style={{ color: '#fde68a', fontSize: '12px' }}>{studioMessage}</span>}
            {isCompactLayout && (
              <>
                <button type="button" style={{ ...quickNavBtnStyle, padding: '4px 8px', fontSize: '10px' }} onClick={() => setShowAssetPanel(prev => !prev)}>
                  {showAssetPanel ? 'Hide Left' : 'Show Left'}
                </button>
                <button type="button" style={{ ...quickNavBtnStyle, padding: '4px 8px', fontSize: '10px' }} onClick={() => setShowTrackPanel(prev => !prev)}>
                  {showTrackPanel ? 'Hide Tracks' : 'Show Tracks'}
                </button>
                <button type="button" style={{ ...quickNavBtnStyle, padding: '4px 8px', fontSize: '10px' }} onClick={() => setShowInspectorPanel(prev => !prev)}>
                  {showInspectorPanel ? 'Hide Right' : 'Show Right'}
                </button>
              </>
            )}
          </div>
        </div>

        <div style={contentStyle}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
              <div style={{ color: '#94a3b8', fontSize: '18px' }}>Loading project workspace...</div>
            </div>
          ) : error ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
              <div style={{ color: '#fecaca', fontSize: '18px', textAlign: 'center' }}>
                Could not open this project
                <div style={{ color: '#fecaca', fontSize: '14px', marginTop: '8px' }}>{error}</div>
                <button 
                  type="button" 
                  style={{ 
                    border: '1px solid rgba(248, 113, 113, 0.55)',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    background: 'rgba(127, 29, 29, 0.46)',
                    color: '#fee2e2',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginTop: '16px'
                  }} 
                  onClick={fetchProject}
                >
                  Retry Load
                </button>
              </div>
            </div>
          ) : (
            <div style={studioLayoutStyle}>
              <div style={studioRowStyle}>
                {(!isCompactLayout || showAssetPanel) && (
                  <aside style={{ ...panelStyle, width: isCompactLayout ? '200px' : '228px' }}>
                    <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, color: '#dbeafe' }}>
                      Left Panel
                    </div>
                    <div style={{ display: 'flex', gap: '6px', padding: '8px 10px 6px' }}>
                      <button
                        type="button"
                        style={{ 
                          border: leftPanelTab === 'files' ? '1px solid rgba(96, 165, 250, 0.65)' : '1px solid rgba(148, 163, 184, 0.28)',
                          borderRadius: '7px',
                          padding: '4px 8px',
                          background: leftPanelTab === 'files' ? 'rgba(30, 64, 175, 0.35)' : 'rgba(15, 23, 42, 0.4)',
                          color: leftPanelTab === 'files' ? '#eff6ff' : '#bfdbfe',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => setLeftPanelTab('files')}
                      >
                        Files
                      </button>
                      <button
                        type="button"
                        style={{ 
                          border: leftPanelTab === 'instruments' ? '1px solid rgba(96, 165, 250, 0.65)' : '1px solid rgba(148, 163, 184, 0.28)',
                          borderRadius: '7px',
                          padding: '4px 8px',
                          background: leftPanelTab === 'instruments' ? 'rgba(30, 64, 175, 0.35)' : 'rgba(15, 23, 42, 0.4)',
                          color: leftPanelTab === 'instruments' ? '#eff6ff' : '#bfdbfe',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => setLeftPanelTab('instruments')}
                      >
                        Instruments
                      </button>
                    </div>
                    <div style={{ flex: 1, padding: '0 10px 10px', overflowY: 'auto' }}>
                      {(leftPanelTab === 'files' ? assetLibrary : instrumentLibrary).map((item) => (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', padding: '8px 9px', marginBottom: '8px', background: 'rgba(15, 23, 42, 0.44)' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#eff6ff', fontWeight: 600 }}>{item.name}</div>
                            <div style={{ fontSize: '11px', color: '#93c5fd' }}>{item.type || item.family}</div>
                          </div>
                          <span style={{ border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '999px', padding: '2px 6px', fontSize: '10px', color: '#cbd5e1' }}>{item.detail || item.preset}</span>
                        </div>
                      ))}
                    </div>
                  </aside>
                )}

                <div style={centerWorkspaceStyle}>
                  <div style={arrangementRowStyle}>
                    {(!isCompactLayout || showTrackPanel) && (
                      <div style={{ ...trackWrapStyle, width: isCompactLayout ? '200px' : null }}>
                        <DAWSidebar
                          compact={isCompactLayout}
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
                      </div>
                    )}
                    <div style={timelineWrapStyle}>
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
                        snapEnabled={snapGrid > 0}
                        snapGrid={snapGrid || 0.25}
                        onTimelineClick={handleTimelineClick}
                        onClipClick={handleClipClick}
                        onClipsSelected={handleClipsSelected}
                        onClipDelete={handleClipDelete}
                        onClipSplit={handleClipSplit}
                        onAddClip={handleAddClip}
                        onClipMove={handleClipMove}
                        onClipResize={handleClipResize}
                      />
                    </div>
                  </div>

                  <div style={bottomPanelStyle}>
                    <div style={bottomHeaderStyle}>
                      <span style={bottomTitleStyle}>Bottom Panel</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          style={{ 
                            border: '1px solid rgba(148, 163, 184, 0.28)',
                            borderRadius: '7px',
                            padding: '4px 8px',
                            background: 'rgba(15, 23, 42, 0.4)',
                            color: '#bfdbfe',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => setShowPianoRoll(true)}
                        >
                          Open Piano Roll
                        </button>
                        <button
                          type="button"
                          style={{ 
                            border: bottomPanelTab === 'piano' ? '1px solid rgba(96, 165, 250, 0.65)' : '1px solid rgba(148, 163, 184, 0.28)',
                            borderRadius: '7px',
                            padding: '4px 8px',
                            background: bottomPanelTab === 'piano' ? 'rgba(30, 64, 175, 0.35)' : 'rgba(15, 23, 42, 0.4)',
                            color: bottomPanelTab === 'piano' ? '#eff6ff' : '#bfdbfe',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => setBottomPanelTab('piano')}
                        >
                          Piano Roll
                        </button>
                        <button
                          type="button"
                          style={{ 
                            border: bottomPanelTab === 'mixer' ? '1px solid rgba(96, 165, 250, 0.65)' : '1px solid rgba(148, 163, 184, 0.28)',
                            borderRadius: '7px',
                            padding: '4px 8px',
                            background: bottomPanelTab === 'mixer' ? 'rgba(30, 64, 175, 0.35)' : 'rgba(15, 23, 42, 0.4)',
                            color: bottomPanelTab === 'mixer' ? '#eff6ff' : '#bfdbfe',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          onClick={() => setBottomPanelTab('mixer')}
                        >
                          Mixer
                        </button>
                      </div>
                    </div>
                    <div style={bottomBodyStyle}>
                      {bottomPanelTab === 'piano' ? (
                        <div style={{ height: '100%', borderRadius: '10px', border: '1px solid rgba(148, 163, 184, 0.22)', background: 'repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.08) 0px, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.08) 0px, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 56px)', position: 'relative', overflow: 'hidden' }}>
                          {pianoRollNotes.length === 0 ? (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', fontSize: '13px' }}>
                              Add a MIDI clip in the timeline to populate piano notes.
                            </div>
                          ) : (
                            pianoRollNotes.map(note => (
                              <div
                                key={note.id}
                                style={{ position: 'absolute', height: '14px', borderRadius: '4px', background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)', border: '1px solid rgba(191, 219, 254, 0.6)', left: note.left, width: note.width, top: note.top }}
                                title="MIDI Note Block"
                              />
                            ))
                          )}
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, 1fr) 120px 120px 120px 120px', gap: '10px', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.2)', background: 'rgba(15, 23, 42, 0.44)', marginBottom: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>Track</span>
                            <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>Type</span>
                            <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>Volume</span>
                            <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>Pan</span>
                            <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>State</span>
                          </div>
                          {tracks.map(track => (
                            <div key={track.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(130px, 1fr) 120px 120px 120px 120px', gap: '10px', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(148, 163, 184, 0.2)', background: 'rgba(15, 23, 42, 0.44)', marginBottom: '8px', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>{track.name}</span>
                              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{track.type.toUpperCase()}</span>
                              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{track.volume ?? 80}%</span>
                              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{track.pan ?? 0}</span>
                              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{track.muted ? 'Muted' : track.solo ? 'Solo' : 'Active'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {(!isCompactLayout || showInspectorPanel) && (
                  <aside style={{ ...rightPanelStyle, width: isCompactLayout ? '220px' : '248px' }}>
                    <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700, color: '#dbeafe' }}>
                      Right Panel
                    </div>
                    <div style={{ display: 'flex', gap: '6px', padding: '8px 10px 6px' }}>
                      <button
                        type="button"
                        style={{ 
                          border: rightPanelTab === 'effects' ? '1px solid rgba(96, 165, 250, 0.65)' : '1px solid rgba(148, 163, 184, 0.28)',
                          borderRadius: '7px',
                          padding: '4px 8px',
                          background: rightPanelTab === 'effects' ? 'rgba(30, 64, 175, 0.35)' : 'rgba(15, 23, 42, 0.4)',
                          color: rightPanelTab === 'effects' ? '#eff6ff' : '#bfdbfe',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => setRightPanelTab('effects')}
                      >
                        Effects
                      </button>
                      <button
                        type="button"
                        style={{ 
                          border: rightPanelTab === 'settings' ? '1px solid rgba(96, 165, 250, 0.65)' : '1px solid rgba(148, 163, 184, 0.28)',
                          borderRadius: '7px',
                          padding: '4px 8px',
                          background: rightPanelTab === 'settings' ? 'rgba(30, 64, 175, 0.35)' : 'rgba(15, 23, 42, 0.4)',
                          color: rightPanelTab === 'settings' ? '#eff6ff' : '#bfdbfe',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        onClick={() => setRightPanelTab('settings')}
                      >
                        Track Settings
                      </button>
                    </div>
                    <div style={{ flex: 1, padding: '0 10px 10px', overflowY: 'auto' }}>
                      {rightPanelTab === 'effects' ? (
                        effectLibrary.map(effect => (
                          <div key={effect.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', padding: '8px 9px', marginBottom: '8px', background: 'rgba(15, 23, 42, 0.44)' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: '#eff6ff', fontWeight: 600 }}>{effect.name}</div>
                              <div style={{ fontSize: '11px', color: '#93c5fd' }}>{effect.value}</div>
                            </div>
                            <span style={{ border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '999px', padding: '2px 6px', fontSize: '10px', color: '#cbd5e1' }}>{effect.state}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', padding: '8px 9px', marginBottom: '8px', background: 'rgba(15, 23, 42, 0.44)' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: '#eff6ff', fontWeight: 600 }}>Selected Track</div>
                              <div style={{ fontSize: '11px', color: '#93c5fd' }}>{selectedTrack?.name || 'None selected'}</div>
                            </div>
                            <span style={{ border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '999px', padding: '2px 6px', fontSize: '10px', color: '#cbd5e1' }}>{selectedTrack?.type || 'n/a'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', padding: '8px 9px', marginBottom: '8px', background: 'rgba(15, 23, 42, 0.44)' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: '#eff6ff', fontWeight: 600 }}>Volume</div>
                              <div style={{ fontSize: '11px', color: '#93c5fd' }}>{selectedTrack?.volume ?? 80}%</div>
                            </div>
                            <span style={{ border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '999px', padding: '2px 6px', fontSize: '10px', color: '#cbd5e1' }}>Track</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', padding: '8px 9px', marginBottom: '8px', background: 'rgba(15, 23, 42, 0.44)' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: '#eff6ff', fontWeight: 600 }}>Pan</div>
                              <div style={{ fontSize: '11px', color: '#93c5fd' }}>{selectedTrack?.pan ?? 0}</div>
                            </div>
                            <span style={{ border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '999px', padding: '2px 6px', fontSize: '10px', color: '#cbd5e1' }}>L/R</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', padding: '8px 9px', marginBottom: '8px', background: 'rgba(15, 23, 42, 0.44)' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: '#eff6ff', fontWeight: 600 }}>Monitoring</div>
                              <div style={{ fontSize: '11px', color: '#93c5fd' }}>{selectedTrack?.armed ? 'Armed for recording' : 'Input monitor off'}</div>
                            </div>
                            <span style={{ border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '999px', padding: '2px 6px', fontSize: '10px', color: '#cbd5e1' }}>{selectedTrack?.armed ? 'REC' : 'IDLE'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </aside>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showPianoRoll && (
        <div style={modalOverlayStyle} onClick={() => setShowPianoRoll(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <PianoRollModal 
              tracks={tracks}
              clips={clips.filter(c => c.type === 'midi')}
              onClose={() => setShowPianoRoll(false)}
            />
          </div>
        </div>
      )}

      {showMixer && (
        <div style={modalOverlayStyle} onClick={() => setShowMixer(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <MixerModal 
              tracks={tracks}
              onClose={() => setShowMixer(false)}
            />
          </div>
        </div>
      )}

      {showSoundLibrary && (
        <div style={modalOverlayStyle} onClick={() => setShowSoundLibrary(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <SoundLibraryModal 
              onClose={() => setShowSoundLibrary(false)}
            />
          </div>
        </div>
      )}

      {showSettings && (
        <div style={modalOverlayStyle} onClick={() => setShowSettings(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <SettingsModal 
              onClose={() => setShowSettings(false)}
            />
          </div>
        </div>
      )}

      {showExport && (
        <div style={modalOverlayStyle} onClick={() => setShowExport(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <ExportModal 
              tracks={tracks}
              clips={clips}
              projectName={projectName}
              onClose={() => setShowExport(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DAWEditorPage;
