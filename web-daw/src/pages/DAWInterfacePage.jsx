import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/apiService';
import DAWToolbar from '../components/DAWToolbar';
import DAWSidebar from '../components/DAWSidebar';
import DAWTimeline from '../components/DAWTimeline';
import audioEngine from '../audio/AudioEngine';

// ============ STYLES ============
const pageStyle = {
  minHeight: '100vh',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: 0,
  background: 'radial-gradient(circle at 15% 0%, #2a3f5f 0%, #131722 48%, #0d1118 100%)',
  color: '#f5f7fa',
  fontFamily: '"Avenir Next", "SF Pro Display", "Segoe UI", sans-serif'
};

const workspaceFrameStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 0,
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

const compactContentStyle = {
  ...contentStyle,
  flexDirection: 'column'
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

const panelToggleBtnStyle = {
  border: '1px solid rgba(147, 197, 253, 0.42)',
  borderRadius: '8px',
  padding: '6px 12px',
  background: 'rgba(30, 58, 138, 0.34)',
  color: '#eff6ff',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const quickNavBtnStyle = {
  ...panelToggleBtnStyle,
  borderColor: 'rgba(59, 130, 246, 0.55)',
  background: 'rgba(30, 64, 175, 0.48)',
  color: '#dbeafe'
};

const stateContainerStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const stateCardStyle = {
  width: 'min(620px, 100%)',
  padding: '24px',
  borderRadius: '14px',
  textAlign: 'center',
  background: 'rgba(15, 23, 42, 0.72)',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.32)'
};

const messageStyle = {
  margin: 0,
  fontSize: '20px',
  color: '#e2e8f0',
  fontWeight: 700
};

const helperMessageStyle = {
  margin: '10px 0 0',
  fontSize: '14px',
  color: '#94a3b8'
};

const errorStyle = {
  ...helperMessageStyle,
  color: '#fecaca'
};

const retryBtnStyle = {
  marginTop: '16px',
  border: '1px solid rgba(248, 113, 113, 0.55)',
  borderRadius: '10px',
  padding: '8px 14px',
  background: 'rgba(127, 29, 29, 0.46)',
  color: '#fee2e2',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600
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

const studioRowCompactStyle = {
  ...studioRowStyle,
  flexDirection: 'column'
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

const panelCompactStyle = {
  width: '100%',
  minWidth: '100%',
  maxHeight: '210px',
  borderRight: 'none',
  borderBottom: '1px solid rgba(148, 163, 184, 0.18)'
};

const rightPanelCompactStyle = {
  ...panelCompactStyle,
  borderTop: '1px solid rgba(148, 163, 184, 0.18)',
  borderBottom: 'none'
};

const panelHeaderStyle = {
  height: '38px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 12px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  fontWeight: 700,
  color: '#dbeafe'
};

const panelTabRowStyle = {
  display: 'flex',
  gap: '6px',
  padding: '8px 10px 6px'
};

const panelTabStyle = {
  border: '1px solid rgba(148, 163, 184, 0.28)',
  background: 'rgba(15, 23, 42, 0.4)',
  color: '#bfdbfe',
  borderRadius: '7px',
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer'
};

const panelTabActiveStyle = {
  ...panelTabStyle,
  borderColor: 'rgba(96, 165, 250, 0.65)',
  background: 'rgba(30, 64, 175, 0.35)',
  color: '#eff6ff'
};

const panelBodyStyle = {
  flex: 1,
  padding: '0 10px 10px',
  overflowY: 'auto'
};

const panelItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '8px',
  padding: '8px 9px',
  marginBottom: '8px',
  background: 'rgba(15, 23, 42, 0.44)'
};

const panelItemTitleStyle = {
  fontSize: '12px',
  color: '#eff6ff',
  fontWeight: 600
};

const panelItemMetaStyle = {
  fontSize: '11px',
  color: '#93c5fd'
};

const panelBadgeStyle = {
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: '999px',
  padding: '2px 6px',
  fontSize: '10px',
  color: '#cbd5e1'
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

const arrangementRowCompactStyle = {
  ...arrangementRowStyle,
  flexDirection: 'column'
};

const trackWrapStyle = {
  display: 'flex',
  borderRight: '1px solid rgba(148, 163, 184, 0.2)'
};

const trackWrapCompactStyle = {
  ...trackWrapStyle,
  width: '100%',
  maxHeight: '250px',
  borderRight: 'none',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
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

const pianoRollGridStyle = {
  height: '100%',
  borderRadius: '10px',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  background: 'repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.08) 0px, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.08) 0px, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 56px)',
  position: 'relative',
  overflow: 'hidden'
};

const pianoNoteStyle = {
  position: 'absolute',
  height: '14px',
  borderRadius: '4px',
  background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
  border: '1px solid rgba(191, 219, 254, 0.6)'
};

const mixerRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(130px, 1fr) 120px 120px 120px 120px',
  gap: '10px',
  padding: '8px 10px',
  borderRadius: '8px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.44)',
  marginBottom: '8px',
  alignItems: 'center'
};

const mixerHeadRowStyle = {
  ...mixerRowStyle,
  marginBottom: '10px',
  background: 'rgba(15, 23, 42, 0.7)',
  color: '#93c5fd',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase'
};

const mixerTrackCellStyle = {
  fontSize: '12px',
  color: '#e2e8f0',
  fontWeight: 600
};

const mixerValueStyle = {
  fontSize: '12px',
  color: '#cbd5e1'
};

const statusAlertStyle = {
  fontSize: '12px',
  color: '#fde68a'
};

const assetLibrary = [];

const instrumentLibrary = [];

const effectLibrary = [];

const getIsCompactLayout = () => (
  typeof window !== 'undefined' ? window.innerWidth < 1180 : false
);

const normalizeTrackId = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const isSameTrackId = (left, right) => {
  const normalizedLeft = normalizeTrackId(left);
  const normalizedRight = normalizeTrackId(right);
  return normalizedLeft !== null && normalizedRight !== null && normalizedLeft === normalizedRight;
};

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

const getBarDurationSeconds = (bpmValue, signatureValue) => {
  const safeBpm = Math.max(1, Number(bpmValue) || 120);
  let numerator = 4;
  let denominator = 4;

  if (typeof signatureValue === 'string') {
    const [n, d] = signatureValue.split('/').map((part) => parseInt(part, 10));
    if (Number.isFinite(n) && n > 0) numerator = n;
    if (Number.isFinite(d) && d > 0) denominator = d;
  } else if (signatureValue && typeof signatureValue === 'object') {
    if (Number.isFinite(signatureValue.numerator) && signatureValue.numerator > 0) {
      numerator = signatureValue.numerator;
    }
    if (Number.isFinite(signatureValue.denominator) && signatureValue.denominator > 0) {
      denominator = signatureValue.denominator;
    }
  }

  const secondsPerQuarter = 60 / safeBpm;
  const beatFactor = 4 / denominator;
  const secondsPerBeat = secondsPerQuarter * beatFactor;
  return Math.max(0.1, numerator * secondsPerBeat);
};

const DAWInterfacePage = () => {
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
  const loopStart = 0;
  const loopEnd = 8;
  const [punchInEnabled, setPunchInEnabled] = useState(false);

  // Toolbar state
  const [activeTool, setActiveTool] = useState('select');
  const [snapGrid, setSnapGrid] = useState(0.25);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [masterVolume, setMasterVolume] = useState(80);
  const [clipboard, setClipboard] = useState(null);

  // Undo/Redo history - stores snapshots of tracks and clips
  const [history, setHistory] = useState([{ tracks: [], clips: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);

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

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getProject(projectId);
      const project = response?.data || response;
      setProjectName(project?.name || 'Unnamed Project');
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
    name: projectName || 'Unnamed Project',
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
    try {
      const snapshot = buildProjectSnapshot();
      const payload = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${(projectName || 'project').replace(/\s+/g, '-').toLowerCase()}-${projectId}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      setStudioMessage('Session exported as JSON.');
    } catch (exportError) {
      setStudioMessage(`Export failed: ${exportError.message}`);
    }
  }, [buildProjectSnapshot, projectId, projectName]);

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
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history, tracks, clips, selectedClipIds, editingTrackId, isPlaying, handleSaveProject, handleExportProject, handleClipDelete, handlePlay, handleUndo, handleRedo]);

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
    const maxTime = timelineDuration;
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
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;
    setTracks(prev => prev.map(t => ({ ...t, selected: isSameTrackId(t.id, normalizedTrackId) })));
  };

  const handleTrackMute = (trackId) => {
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;
    setTracks(prev => prev.map(t => isSameTrackId(t.id, normalizedTrackId) ? { ...t, muted: !t.muted } : t));
  };

  const handleTrackSolo = (trackId) => {
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;
    setTracks(prev => prev.map(t => isSameTrackId(t.id, normalizedTrackId) ? { ...t, solo: !t.solo } : t));
  };

  const handleTrackArm = (trackId) => {
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;
    setTracks(prev => prev.map(t => isSameTrackId(t.id, normalizedTrackId) ? { ...t, armed: !t.armed } : t));
  };

  const handleDeleteTrack = (trackId) => {
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;

    const deletedTrackIndex = tracks.findIndex((track) => isSameTrackId(track.id, normalizedTrackId));
    const remainingTracks = tracks.filter((track) => !isSameTrackId(track.id, normalizedTrackId));
    const selectedRemainingTrack = remainingTracks.find((track) => track.selected);
    const fallbackIndex = Math.min(
      Math.max(deletedTrackIndex, 0),
      Math.max(remainingTracks.length - 1, 0)
    );
    const fallbackTrackId = remainingTracks[fallbackIndex]?.id ?? remainingTracks[0]?.id ?? null;
    const nextSelectedTrackId = selectedRemainingTrack?.id ?? fallbackTrackId;

    const normalizedTracks = remainingTracks.map((track) => ({
      ...track,
      selected: nextSelectedTrackId !== null && isSameTrackId(track.id, nextSelectedTrackId)
    }));
    const nextClips = clips.filter((clip) => !isSameTrackId(clip.trackId, normalizedTrackId));

    setTracks(normalizedTracks);
    setClips(nextClips);
    pushHistory(normalizedTracks, nextClips);
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
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;

    const track = tracks.find((t) => isSameTrackId(t.id, normalizedTrackId));
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
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;

    setTracks(prev => {
      const newTracks = prev.map(t => {
        if (!isSameTrackId(t.id, normalizedTrackId)) return t;
        const newType = t.type === 'audio' ? 'midi' : 'audio';
        return { ...t, type: newType, icon: newType === 'audio' ? '🎙️' : '🎹' };
      });
      pushHistory(newTracks, clips);
      return newTracks;
    });
  };

  const handleVolumeChange = (trackId, volume) => {
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;
    setTracks(prev => prev.map(t => isSameTrackId(t.id, normalizedTrackId) ? { ...t, volume } : t));
  };

  const handlePanChange = (trackId, pan) => {
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;
    setTracks(prev => prev.map(t => isSameTrackId(t.id, normalizedTrackId) ? { ...t, pan } : t));
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
    const normalizedTrackId = normalizeTrackId(newTrackId);
    if (normalizedTrackId === null) return;

    setClips((prev) => prev.map((clip) =>
      clip.id === clipId ? { ...clip, trackId: normalizedTrackId, startTime: newStartTime } : clip
    ));
  };

  const handleClipMoveEnd = (clipId, newTrackId, newStartTime) => {
    const normalizedTrackId = normalizeTrackId(newTrackId);
    if (normalizedTrackId === null) return;

    setClips(prev => {
      const newClips = prev.map(c =>
        c.id === clipId ? { ...c, trackId: normalizedTrackId, startTime: newStartTime } : c
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
    const normalizedTrackId = normalizeTrackId(trackId);
    if (normalizedTrackId === null) return;

    const track = tracks.find((t) => isSameTrackId(t.id, normalizedTrackId));
    if (!track) return;

    const newClipId = Math.max(...clips.map(c => c.id), 0) + 1;
    const clipCount = clips.filter((c) => isSameTrackId(c.trackId, normalizedTrackId)).length;

    const newClip = {
      id: newClipId,
      trackId: normalizedTrackId,
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
  const timelineDuration = Math.max(arrangementLength + 15, 300);
  const barSnapSeconds = getBarDurationSeconds(bpm, timeSignature);
  const pianoRollNotes = clips
    .filter(clip => clip.type === 'midi')
    .slice(0, 10)
    .map((clip, index) => ({
      id: clip.id,
      left: `${Math.min(88, clip.startTime * 3.4)}%`,
      width: `${Math.max(8, clip.duration * 2.8)}%`,
      top: `${8 + ((index * 14) % 78)}%`
    }));

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
              onClick={() => navigate(`/project/${projectId}/piano-roll`)}
            >
              Open Piano Roll Page
            </button>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => navigate(`/project/${projectId}/mixer`)}
            >
              Open Mixer View
            </button>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => navigate(`/project/${projectId}/sound-library`)}
            >
              Sound Library
            </button>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => navigate(`/project/${projectId}/settings`)}
            >
              Settings
            </button>
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => navigate(`/project/${projectId}/export`)}
            >
              Export
            </button>
            {studioMessage && <span style={statusAlertStyle}>{studioMessage}</span>}
            {isCompactLayout && (
              <>
                <button type="button" style={panelToggleBtnStyle} onClick={() => setShowAssetPanel(prev => !prev)}>
                  {showAssetPanel ? 'Hide Left' : 'Show Left'}
                </button>
                <button type="button" style={panelToggleBtnStyle} onClick={() => setShowTrackPanel(prev => !prev)}>
                  {showTrackPanel ? 'Hide Tracks' : 'Show Tracks'}
                </button>
                <button type="button" style={panelToggleBtnStyle} onClick={() => setShowInspectorPanel(prev => !prev)}>
                  {showInspectorPanel ? 'Hide Right' : 'Show Right'}
                </button>
              </>
            )}
          </div>
        </div>

        <div style={isCompactLayout ? compactContentStyle : contentStyle}>
          {loading ? (
            <div style={stateContainerStyle}>
              <div style={stateCardStyle}>
                <p style={messageStyle}>Loading project workspace...</p>
                <p style={helperMessageStyle}>Preparing tracks, timeline, and session controls.</p>
              </div>
            </div>
          ) : error ? (
            <div style={stateContainerStyle}>
              <div style={stateCardStyle}>
                <p style={messageStyle}>Could not open this project</p>
                <p style={errorStyle}>{error}</p>
                <button type="button" style={retryBtnStyle} onClick={fetchProject}>
                  Retry Load
                </button>
              </div>
            </div>
          ) : (
            <div style={studioLayoutStyle}>
              <div style={isCompactLayout ? studioRowCompactStyle : studioRowStyle}>
                {(!isCompactLayout || showAssetPanel) && (
                  <aside style={isCompactLayout ? { ...panelStyle, ...panelCompactStyle } : panelStyle}>
                    <div style={panelHeaderStyle}>Left Panel</div>
                    <div style={panelTabRowStyle}>
                      <button
                        type="button"
                        style={leftPanelTab === 'files' ? panelTabActiveStyle : panelTabStyle}
                        onClick={() => setLeftPanelTab('files')}
                      >
                        Files
                      </button>
                      <button
                        type="button"
                        style={leftPanelTab === 'instruments' ? panelTabActiveStyle : panelTabStyle}
                        onClick={() => setLeftPanelTab('instruments')}
                      >
                        Instruments
                      </button>
                    </div>
                    <div style={panelBodyStyle}>
                      {(leftPanelTab === 'files' ? assetLibrary : instrumentLibrary).map((item) => (
                        <div key={item.name} style={panelItemStyle}>
                          <div>
                            <div style={panelItemTitleStyle}>{item.name}</div>
                            <div style={panelItemMetaStyle}>{item.type || item.family}</div>
                          </div>
                          <span style={panelBadgeStyle}>{item.detail || item.preset}</span>
                        </div>
                      ))}
                    </div>
                  </aside>
                )}

                <div style={centerWorkspaceStyle}>
                  <div style={isCompactLayout ? arrangementRowCompactStyle : arrangementRowStyle}>
                    {(!isCompactLayout || showTrackPanel) && (
                      <div style={isCompactLayout ? trackWrapCompactStyle : trackWrapStyle}>
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
                        duration={timelineDuration}
                        selectedClipIds={selectedClipIds}
                        loopEnabled={loopEnabled}
                        loopStart={loopStart}
                        loopEnd={loopEnd}
                        snapEnabled={snapGrid > 0}
                        snapGrid={snapGrid || 0.25}
                        barSnapSeconds={barSnapSeconds}
                        onTimelineClick={handleTimelineClick}
                        onClipClick={handleClipClick}
                        onClipsSelected={handleClipsSelected}
                        onClipDelete={handleClipDelete}
                        onClipSplit={handleClipSplit}
                        onAddClip={handleAddClip}
                        onClipMove={handleClipMove}
                        onClipMoveEnd={handleClipMoveEnd}
                        onClipResize={handleClipResize}
                        onZoomChange={(nextZoom) => setZoom(Math.max(50, Math.min(200, nextZoom)))}
                      />
                    </div>
                  </div>

                  <div style={bottomPanelStyle}>
                    <div style={bottomHeaderStyle}>
                      <span style={bottomTitleStyle}>Bottom Panel</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          style={panelTabStyle}
                          onClick={() => navigate(`/project/${projectId}/piano-roll`)}
                        >
                          Open Full Piano Roll
                        </button>
                        <button
                          type="button"
                          style={bottomPanelTab === 'piano' ? panelTabActiveStyle : panelTabStyle}
                          onClick={() => setBottomPanelTab('piano')}
                        >
                          Piano Roll
                        </button>
                        <button
                          type="button"
                          style={bottomPanelTab === 'mixer' ? panelTabActiveStyle : panelTabStyle}
                          onClick={() => setBottomPanelTab('mixer')}
                        >
                          Mixer
                        </button>
                      </div>
                    </div>
                    <div style={bottomBodyStyle}>
                      {bottomPanelTab === 'piano' ? (
                        <div style={pianoRollGridStyle}>
                          {pianoRollNotes.length === 0 ? (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#93c5fd', fontSize: '13px' }}>
                              Add a MIDI clip in the timeline to populate piano notes.
                            </div>
                          ) : (
                            pianoRollNotes.map(note => (
                              <div
                                key={note.id}
                                style={{ ...pianoNoteStyle, left: note.left, width: note.width, top: note.top }}
                                title="MIDI Note Block"
                              />
                            ))
                          )}
                        </div>
                      ) : (
                        <>
                          <div style={mixerHeadRowStyle}>
                            <span>Track</span>
                            <span>Type</span>
                            <span>Volume</span>
                            <span>Pan</span>
                            <span>State</span>
                          </div>
                          {tracks.map(track => (
                            <div key={track.id} style={mixerRowStyle}>
                              <span style={mixerTrackCellStyle}>{track.name}</span>
                              <span style={mixerValueStyle}>{track.type.toUpperCase()}</span>
                              <span style={mixerValueStyle}>{track.volume ?? 80}%</span>
                              <span style={mixerValueStyle}>{track.pan ?? 0}</span>
                              <span style={mixerValueStyle}>{track.muted ? 'Muted' : track.solo ? 'Solo' : 'Active'}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {(!isCompactLayout || showInspectorPanel) && (
                  <aside style={isCompactLayout ? { ...rightPanelStyle, ...rightPanelCompactStyle } : rightPanelStyle}>
                    <div style={panelHeaderStyle}>Right Panel</div>
                    <div style={panelTabRowStyle}>
                      <button
                        type="button"
                        style={rightPanelTab === 'effects' ? panelTabActiveStyle : panelTabStyle}
                        onClick={() => setRightPanelTab('effects')}
                      >
                        Effects
                      </button>
                      <button
                        type="button"
                        style={rightPanelTab === 'settings' ? panelTabActiveStyle : panelTabStyle}
                        onClick={() => setRightPanelTab('settings')}
                      >
                        Track Settings
                      </button>
                    </div>
                    <div style={panelBodyStyle}>
                      {rightPanelTab === 'effects' ? (
                        effectLibrary.map(effect => (
                          <div key={effect.name} style={panelItemStyle}>
                            <div>
                              <div style={panelItemTitleStyle}>{effect.name}</div>
                              <div style={panelItemMetaStyle}>{effect.value}</div>
                            </div>
                            <span style={panelBadgeStyle}>{effect.state}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={panelItemStyle}>
                            <div>
                              <div style={panelItemTitleStyle}>Selected Track</div>
                              <div style={panelItemMetaStyle}>{selectedTrack?.name || 'None selected'}</div>
                            </div>
                            <span style={panelBadgeStyle}>{selectedTrack?.type || 'n/a'}</span>
                          </div>
                          <div style={panelItemStyle}>
                            <div>
                              <div style={panelItemTitleStyle}>Volume</div>
                              <div style={panelItemMetaStyle}>{selectedTrack?.volume ?? 80}%</div>
                            </div>
                            <span style={panelBadgeStyle}>Track</span>
                          </div>
                          <div style={panelItemStyle}>
                            <div>
                              <div style={panelItemTitleStyle}>Pan</div>
                              <div style={panelItemMetaStyle}>{selectedTrack?.pan ?? 0}</div>
                            </div>
                            <span style={panelBadgeStyle}>L/R</span>
                          </div>
                          <div style={panelItemStyle}>
                            <div>
                              <div style={panelItemTitleStyle}>Monitoring</div>
                              <div style={panelItemMetaStyle}>{selectedTrack?.armed ? 'Armed for recording' : 'Input monitor off'}</div>
                            </div>
                            <span style={panelBadgeStyle}>{selectedTrack?.armed ? 'REC' : 'IDLE'}</span>
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
    </div>
  );
};

export default DAWInterfacePage;
