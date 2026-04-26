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

const checklistPanelStyle = {
  borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
  background: 'linear-gradient(90deg, rgba(13, 18, 31, 0.96) 0%, rgba(16, 23, 39, 0.88) 100%)',
  padding: '10px 14px'
};

const checklistHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  flexWrap: 'wrap',
  marginBottom: '8px'
};

const checklistTitleStyle = {
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.45px',
  textTransform: 'uppercase',
  color: '#dbeafe'
};

const checklistCountStyle = {
  borderRadius: '999px',
  border: '1px solid rgba(96, 165, 250, 0.55)',
  background: 'rgba(30, 64, 175, 0.38)',
  color: '#eff6ff',
  padding: '3px 8px',
  fontSize: '11px',
  fontWeight: 700
};

const checklistActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  flexWrap: 'wrap'
};

const checklistActionBtnStyle = {
  border: '1px solid rgba(148, 163, 184, 0.35)',
  borderRadius: '7px',
  padding: '4px 8px',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#cbd5e1',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer'
};

const checklistItemsWrapStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
  gap: '8px'
};

const checklistItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '8px',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  borderRadius: '8px',
  padding: '8px 10px',
  background: 'rgba(15, 23, 42, 0.42)',
  color: '#e2e8f0'
};

const checklistItemTitleStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#eff6ff'
};

const checklistItemHintStyle = {
  display: 'block',
  fontSize: '11px',
  marginTop: '3px',
  color: '#94a3b8'
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

const formatTransportTime = (seconds) => {
  const rounded = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const parseTransportTime = (timecode) => {
  if (typeof timecode !== 'string') return 0;
  const parts = timecode.split(':').map((part) => Number.parseInt(part, 10));
  if (parts.length === 3 && parts.every((part) => Number.isFinite(part) && part >= 0)) {
    return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  }
  return 0;
};

const isSupportedAudioFile = (file) => {
  if (!file) return false;
  if (typeof file.type === 'string' && file.type.startsWith('audio/')) return true;
  const fileName = String(file.name || '').toLowerCase();
  return /\.(wav|mp3|ogg|flac|aac|m4a|webm)$/i.test(fileName);
};

const readAudioFileDuration = (file) => new Promise((resolve) => {
  if (!file) {
    resolve(4);
    return;
  }

  const objectUrl = URL.createObjectURL(file);
  const audio = document.createElement('audio');
  audio.preload = 'metadata';

  const finalize = (duration = 4) => {
    URL.revokeObjectURL(objectUrl);
    audio.removeAttribute('src');
    resolve(duration);
  };

  audio.onloadedmetadata = () => {
    const duration = Number(audio.duration);
    if (Number.isFinite(duration) && duration > 0) {
      finalize(duration);
      return;
    }
    finalize(4);
  };

  audio.onerror = () => finalize(4);
  audio.src = objectUrl;
});

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const precision = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

const cloneState = (value) => JSON.parse(JSON.stringify(value));

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const toTimeSignatureDisplay = (value) => {
  if (!value) return '4/4';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.numerator && value.denominator) {
    return `${value.numerator}/${value.denominator}`;
  }
  return '4/4';
};

const toTimeSignatureApi = (value) => {
  if (typeof value === 'object' && value.numerator && value.denominator) {
    return value;
  }
  if (typeof value === 'string') {
    const [numerator, denominator] = value.split('/').map((part) => parseInt(part, 10));
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator > 0) {
      return { numerator, denominator };
    }
  }
  return { numerator: 4, denominator: 4 };
};

const mapTrackFromApi = (track, index) => {
  const type = track?.type === 'midi' ? 'midi' : 'audio';
  const volumeDb = typeof track?.volume === 'number' ? track.volume : 0.7;
  const panDb = typeof track?.pan === 'number' ? track.pan : 0;

  return {
    id: track.id,
    name: track.name || `Track ${index + 1}`,
    type,
    icon: type === 'audio' ? '🎙️' : '🎹',
    muted: !!track.is_muted,
    solo: !!track.is_solo,
    armed: false,
    selected: index === 0,
    volume: clamp(Math.round(volumeDb * 100), 0, 100),
    pan: clamp(Math.round(panDb * 50), -50, 50),
    color: track.color || '#4CAF50'
  };
};

const mapClipFromApi = (clip) => ({
  id: clip.id,
  trackId: clip.track_id || clip.trackId,
  name: clip.name || 'New Clip',
  type: clip.type || 'audio',
  startTime: Number(clip.start_time ?? clip.startTime ?? 0),
  duration: Number(clip.duration ?? 4),
  fileName: clip.file_name || clip.fileName || clip.settings?.fileName || null,
  filePath: clip.file_path || clip.filePath || null,
  fileSize: Number(clip.file_size ?? clip.fileSize ?? 0) || null,
  sampleRate: Number(clip.sample_rate ?? clip.sampleRate ?? 0) || null,
  bitDepth: Number(clip.bit_depth ?? clip.bitDepth ?? 0) || null,
  channels: Number(clip.channels ?? 0) || null,
  settings: clip.settings || {}
});

const trackToApiPayload = (track) => ({
  name: track.name,
  type: track.type,
  volume: clamp((track.volume ?? 70) / 100, 0, 1.5),
  pan: clamp((track.pan ?? 0) / 50, -1, 1),
  isMuted: !!track.muted,
  isSolo: !!track.solo,
  color: track.color || '#4CAF50'
});

const clipToApiPayload = (clip) => ({
  trackId: clip.trackId,
  name: clip.name,
  type: clip.type || 'audio',
  startTime: Number(clip.startTime ?? 0),
  duration: Number(clip.duration ?? 4),
  fileName: clip.fileName || clip.settings?.fileName,
  filePath: clip.filePath || null,
  fileSize: clip.fileSize || null,
  sampleRate: clip.sampleRate || null,
  bitDepth: clip.bitDepth || null,
  channels: clip.channels || null,
  settings: clip.settings || {}
});

const DEFAULT_READINESS_CHECKLIST = {
  projectLoaded: false,
  tracksReady: false,
  clipsReady: false,
  editedTimeline: false,
  savedToDb: false,
  reloadedFromDb: false
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
  const [audioLibraryItems, setAudioLibraryItems] = useState([]);
  const [showReadinessChecklist, setShowReadinessChecklist] = useState(true);
  const [readinessChecklist, setReadinessChecklist] = useState(DEFAULT_READINESS_CHECKLIST);
  const successfulFetchCountRef = useRef(0);

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
  const [playheadTime, setPlayheadTime] = useState(0);
  const [bpm, setBpm] = useState(120);
  const [zoom, setZoom] = useState(100);

  // Track state
  const [tracks, setTracks] = useState([]);

  // Track rename state
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editName, setEditName] = useState('');

  // Clips state
  const [clips, setClips] = useState([]);
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

  // Save state to history after significant changes
  const pushHistory = useCallback((newTracks, newClips) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({
        tracks: cloneState(newTracks),
        clips: cloneState(newClips)
      });
      if (newHistory.length > 50) {
        newHistory.shift();
        setHistoryIndex(prev => prev - 1);
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    setHistoryIndex(prev => {
      if (prev > 0) {
        const newIndex = prev - 1;
        const state = history[newIndex];
        setTracks(cloneState(state.tracks));
        setClips(cloneState(state.clips));
        return newIndex;
      }
      return prev;
    });
  }, [history]);

  const handleRedo = useCallback(() => {
    setHistoryIndex(prev => {
      if (prev < history.length - 1) {
        const newIndex = prev + 1;
        const state = history[newIndex];
        setTracks(cloneState(state.tracks));
        setClips(cloneState(state.clips));
        return newIndex;
      }
      return prev;
    });
  }, [history]);

  const readinessItems = [
    { key: 'projectLoaded', label: 'Project loaded', hint: 'Open editor without errors.' },
    { key: 'tracksReady', label: 'Track controls', hint: 'Add/edit track, mute/solo/type.' },
    { key: 'clipsReady', label: 'Clip creation', hint: 'Create or paste at least one clip.' },
    { key: 'editedTimeline', label: 'Timeline editing', hint: 'Move, resize, split, or quantize clip.' },
    { key: 'savedToDb', label: 'Save to DB', hint: 'Use Save and see success status.' },
    { key: 'reloadedFromDb', label: 'Reload verified', hint: 'Refresh/reload and confirm state persisted.' }
  ];

  const markChecklistStep = useCallback((key) => {
    setReadinessChecklist((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  }, []);

  const toggleChecklistStep = useCallback((key) => {
    setReadinessChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetChecklist = useCallback(() => {
    setReadinessChecklist(DEFAULT_READINESS_CHECKLIST);
  }, []);

  const completeChecklist = useCallback(() => {
    setReadinessChecklist({
      projectLoaded: true,
      tracksReady: true,
      clipsReady: true,
      editedTimeline: true,
      savedToDb: true,
      reloadedFromDb: true
    });
  }, []);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getProject(projectId);
      const project = response?.data || response;
      const mappedTracks = (project?.tracks || []).map((track, index) => mapTrackFromApi(track, index));
      const mappedClips = (project?.clips || []).map((clip) => mapClipFromApi(clip));

      setProjectName(project?.name || 'Untitled Project');
      if (project?.bpm) {
        setBpm(project.bpm);
      }
      setTimeSignature(toTimeSignatureDisplay(project?.time_signature || project?.timeSignature));
      setTracks(mappedTracks);
      setClips(mappedClips);

      const settings = project?.settings || {};
      if (typeof settings.zoomLevel === 'number') {
        setZoom(clamp(settings.zoomLevel, 50, 200));
      }
      if (typeof settings.masterVolume === 'number') {
        const normalizedMasterVolume = settings.masterVolume <= 1.5
          ? Math.round(settings.masterVolume * 100)
          : Math.round(settings.masterVolume);
        setMasterVolume(clamp(normalizedMasterVolume, 0, 100));
      }

      setHistory([{ tracks: cloneState(mappedTracks), clips: cloneState(mappedClips) }]);
      setHistoryIndex(0);
      successfulFetchCountRef.current += 1;
      markChecklistStep('projectLoaded');
      if (successfulFetchCountRef.current > 1) {
        markChecklistStep('reloadedFromDb');
      }
    } catch (err) {
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId, markChecklistStep]);

  const fetchAudioLibrary = useCallback(async () => {
    try {
      const response = await apiService.getAudioFiles();
      const files = response?.data || [];
      const normalizedFiles = files.map((file) => ({
        name: file.original_name || file.file_name,
        type: file.mime_type ? file.mime_type.replace('audio/', '').toUpperCase() : 'AUDIO',
        detail: formatFileSize(Number(file.file_size)),
        uploadedAt: file.uploaded_at
      }));
      setAudioLibraryItems(normalizedFiles);
    } catch (_error) {
      setAudioLibraryItems([]);
    }
  }, []);

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

  const handleSaveProject = useCallback(async () => {
    try {
      setSaveStatus('saving');
      setStudioMessage('');
      await apiService.updateProject(projectId, {
        name: projectName || 'Untitled Project',
        bpm,
        timeSignature: toTimeSignatureApi(timeSignature),
        sampleRate: 44100,
        settings: {
          zoomLevel: zoom,
          masterVolume: clamp(masterVolume / 100, 0, 1.5)
        }
      });

      const snapshot = buildProjectSnapshot();
      localStorage.setItem(`daw_project_${projectId}`, JSON.stringify(snapshot));
      setSaveStatus('saved');
      setStudioMessage('Project saved to database.');
      markChecklistStep('savedToDb');
      setTimeout(() => setSaveStatus('idle'), 1800);
    } catch (saveError) {
      setSaveStatus('error');
      setStudioMessage(`Save failed: ${saveError.message}`);
      setTimeout(() => setSaveStatus('idle'), 2200);
    }
  }, [buildProjectSnapshot, projectId, projectName, bpm, timeSignature, zoom, masterVolume, markChecklistStep]);

  const handleExportProject = useCallback(() => {
    setShowExport(true);
  }, []);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    fetchAudioLibrary();
  }, [fetchAudioLibrary]);

  useEffect(() => {
    if (tracks.length > 0) {
      markChecklistStep('tracksReady');
    }
  }, [tracks.length, markChecklistStep]);

  useEffect(() => {
    if (clips.length > 0) {
      markChecklistStep('clipsReady');
    }
  }, [clips.length, markChecklistStep]);

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

  const handleDeleteSelectedClips = useCallback(async () => {
    if (selectedClipIds.length === 0) return;

    const clipIdsToDelete = [...selectedClipIds];
    const nextClips = clips.filter((clip) => !clipIdsToDelete.includes(clip.id));
    setClips(nextClips);
    setSelectedClipIds([]);
    pushHistory(tracks, nextClips);

    try {
      await Promise.all(clipIdsToDelete.map((clipId) => apiService.deleteClip(projectId, clipId)));
    } catch (persistError) {
      setError(persistError.message || 'Failed to delete one or more clips');
      fetchProject();
    }
  }, [selectedClipIds, clips, tracks, projectId, fetchProject, pushHistory]);

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
          handleDeleteSelectedClips();
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
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipIds, editingTrackId, handleSaveProject, handleExportProject, handleUndo, handleRedo, handleDeleteSelectedClips]);

  // Audio engine refs
  const animationFrameRef = useRef(null);
  const isPlayingRef = useRef(false);
  const trackPersistTimersRef = useRef({});
  const clipPersistTimersRef = useRef({});
  const audioBufferCacheRef = useRef(new Map());
  const activeClipSourcesRef = useRef([]);

  // Keep isPlaying ref in sync
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const syncTransportFromSeconds = useCallback((seconds) => {
    const normalizedSeconds = Math.max(0, Number(seconds) || 0);
    setPlayheadTime(normalizedSeconds);
    setCurrentTime(formatTransportTime(normalizedSeconds));
  }, []);

  const clearActiveClipSources = useCallback(() => {
    activeClipSourcesRef.current.forEach(({ source }) => {
      try {
        source.onended = null;
        source.stop();
      } catch (_error) {
        // Source already finished
      }
    });
    activeClipSourcesRef.current = [];
  }, []);

  const syncPlayheadFromEngine = useCallback(() => {
    if (!isPlayingRef.current) return;
    const nextTime = Math.max(0, Number(audioEngine.currentTime) || 0);
    syncTransportFromSeconds(nextTime);
    animationFrameRef.current = requestAnimationFrame(syncPlayheadFromEngine);
  }, [syncTransportFromSeconds]);

  const loadClipAudioBuffer = useCallback(async (fileName) => {
    if (!fileName) return null;
    audioEngine.init();

    const cache = audioBufferCacheRef.current;
    const cached = cache.get(fileName);
    if (cached) {
      return typeof cached.then === 'function' ? cached : Promise.resolve(cached);
    }

    const token = localStorage.getItem('token');
    const streamUrl = `${API_BASE_URL}/api/audio/stream/${encodeURIComponent(fileName)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    const pendingBuffer = fetch(streamUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load audio source: ${fileName}`);
        }
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => audioEngine.audioContext.decodeAudioData(arrayBuffer))
      .then((decodedBuffer) => {
        cache.set(fileName, decodedBuffer);
        return decodedBuffer;
      })
      .catch((error) => {
        cache.delete(fileName);
        throw error;
      });

    cache.set(fileName, pendingBuffer);
    return pendingBuffer;
  }, []);

  const scheduleTimelineAudioPlayback = useCallback(async (startSeconds) => {
    audioEngine.init();
    const context = audioEngine.audioContext;
    const masterGain = audioEngine.masterGain;
    if (!context || !masterGain) return;

    clearActiveClipSources();
    const normalizedStart = Math.max(0, Number(startSeconds) || 0);
    const transportStartTime = context.currentTime + 0.05;
    const trackById = new Map(tracks.map((track) => [track.id, track]));
    const hasSoloTracks = tracks.some((track) => track.solo);

    const scheduleResults = await Promise.allSettled(
      clips
        .filter((clip) => clip.type === 'audio')
        .map(async (clip) => {
          const track = trackById.get(clip.trackId);
          if (!track) return;
          if (track.muted) return;
          if (hasSoloTracks && !track.solo) return;

          const clipStart = Math.max(0, Number(clip.startTime) || 0);
          const clipDuration = Math.max(0, Number(clip.duration) || 0);
          if (clipDuration <= 0) return;
          if ((clipStart + clipDuration) <= normalizedStart) return;

          const fileName = clip.fileName || clip.settings?.fileName || null;
          if (!fileName) return;

          const buffer = await loadClipAudioBuffer(fileName);
          if (!buffer) return;

          const playbackOffset = Math.max(0, normalizedStart - clipStart);
          if (playbackOffset >= clipDuration || playbackOffset >= buffer.duration) return;

          const playbackDuration = Math.min(clipDuration - playbackOffset, buffer.duration - playbackOffset);
          if (playbackDuration <= 0) return;

          const source = context.createBufferSource();
          source.buffer = buffer;

          const gainNode = context.createGain();
          gainNode.gain.value = clamp((track.volume ?? 70) / 100, 0, 1.5);

          if (typeof context.createStereoPanner === 'function') {
            const pannerNode = context.createStereoPanner();
            pannerNode.pan.value = clamp((track.pan ?? 0) / 50, -1, 1);
            source.connect(gainNode);
            gainNode.connect(pannerNode);
            pannerNode.connect(masterGain);
          } else {
            source.connect(gainNode);
            gainNode.connect(masterGain);
          }

          const plannedStartTime = transportStartTime + Math.max(0, clipStart - normalizedStart);
          const safeStartTime = Math.max(plannedStartTime, context.currentTime + 0.01);
          const sourceRef = { source };
          activeClipSourcesRef.current.push(sourceRef);
          source.onended = () => {
            activeClipSourcesRef.current = activeClipSourcesRef.current.filter((entry) => entry !== sourceRef);
          };
          source.start(safeStartTime, playbackOffset, playbackDuration);
        })
    );

    const failedCount = scheduleResults.filter((result) => result.status === 'rejected').length;
    if (failedCount > 0) {
      setStudioMessage(`Skipped ${failedCount} clip source${failedCount === 1 ? '' : 's'} due to load errors.`);
    }
  }, [clips, tracks, clearActiveClipSources, loadClipAudioBuffer]);

  useEffect(() => () => {
    isPlayingRef.current = false;
    cancelAnimationFrame(animationFrameRef.current);
    clearActiveClipSources();
    audioEngine.stop();
    Object.values(trackPersistTimersRef.current).forEach((timerId) => clearTimeout(timerId));
    Object.values(clipPersistTimersRef.current).forEach((timerId) => clearTimeout(timerId));
  }, [clearActiveClipSources]);

  const persistTrack = useCallback(async (track) => {
    await apiService.updateTrack(projectId, track.id, trackToApiPayload(track));
  }, [projectId]);

  const scheduleTrackPersist = useCallback((track, delayMs = 0) => {
    if (!track?.id) return;

    const key = String(track.id);
    if (trackPersistTimersRef.current[key]) {
      clearTimeout(trackPersistTimersRef.current[key]);
    }

    trackPersistTimersRef.current[key] = setTimeout(async () => {
      try {
        await persistTrack(track);
      } catch (persistError) {
        setError(persistError.message || 'Failed to save track changes');
      } finally {
        delete trackPersistTimersRef.current[key];
      }
    }, delayMs);
  }, [persistTrack]);

  const scheduleClipPersist = useCallback((clip, mode = 'update', delayMs = 0) => {
    if (!clip?.id) return;

    const key = `${mode}-${clip.id}`;
    if (clipPersistTimersRef.current[key]) {
      clearTimeout(clipPersistTimersRef.current[key]);
    }

    clipPersistTimersRef.current[key] = setTimeout(async () => {
      try {
        if (mode === 'move') {
          await apiService.moveClip(projectId, clip.id, clip.trackId, clip.startTime);
        } else {
          await apiService.updateClip(projectId, clip.id, clipToApiPayload(clip));
        }
      } catch (persistError) {
        setError(persistError.message || 'Failed to save clip changes');
      } finally {
        delete clipPersistTimersRef.current[key];
      }
    }, delayMs);
  }, [projectId]);

  // Transport controls with audio
  const handlePlay = async () => {
    if (!isPlayingRef.current) {
      const startSeconds = Math.max(0, Number(playheadTime) || parseTransportTime(currentTime));
      isPlayingRef.current = true;
      audioEngine.init();
      audioEngine.setBPM(bpm);
      audioEngine.setMetronome(metronomeEnabled);
      audioEngine.setTimeSignature(timeSignature);
      audioEngine.setLoop(loopEnabled, loopStart, loopEnd);
      audioEngine.setMasterVolume(masterVolume);
      audioEngine.seek(startSeconds);
      audioEngine.play();
      setIsPlaying(true);
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = requestAnimationFrame(syncPlayheadFromEngine);

      try {
        await scheduleTimelineAudioPlayback(startSeconds);
      } catch (playbackError) {
        setStudioMessage(playbackError.message || 'Unable to schedule one or more clip sources.');
      }
      return;
    }

    isPlayingRef.current = false;
    audioEngine.stop();
    clearActiveClipSources();
    cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
  };

  const handleStop = () => {
    isPlayingRef.current = false;
    audioEngine.stop();
    audioEngine.reset();
    clearActiveClipSources();
    cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
    setIsRecording(false);
    syncTransportFromSeconds(0);
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
        const currentTimeSecs = parseTransportTime(currentTime);
        const trackId = tracks.find(t => t.armed)?.id || tracks[0]?.id;
        if (!trackId) return;

        try {
          const response = await apiService.addClip(projectId, {
            trackId,
            name: `Recording ${new Date().toISOString()}`,
            type: 'audio',
            startTime: currentTimeSecs,
            duration: buffer.duration
          });

          const createdClip = mapClipFromApi(response?.data || response);
          setClips(prev => {
            const newClips = [...prev, createdClip];
            pushHistory(tracks, newClips);
            return newClips;
          });
        } catch (persistError) {
          setError(persistError.message || 'Failed to save recording clip');
        }
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
        const updatedClip = { ...c, startTime: Math.max(0, quantizedStart) };
        scheduleClipPersist(updatedClip, 'move', 250);
        return updatedClip;
      });
      pushHistory(tracks, newClips);
      return newClips;
    });
    markChecklistStep('editedTimeline');
  };

  const handleZoomToFit = () => {
    const maxTime = Math.max(...clips.map(c => c.startTime + c.duration), 60);
    const newZoom = Math.min(200, Math.max(50, Math.floor((800 / maxTime) * 5)));
    setZoom(newZoom);
  };

  // Transport navigation handlers
  const handleRewind = () => {
    const totalSeconds = Math.max(0, (Number(playheadTime) || parseTransportTime(currentTime)) - 5);
    audioEngine.seek(totalSeconds);
    syncTransportFromSeconds(totalSeconds);
  };

  const handleFastForward = () => {
    const totalSeconds = Math.max(0, (Number(playheadTime) || parseTransportTime(currentTime)) + 5);
    audioEngine.seek(totalSeconds);
    syncTransportFromSeconds(totalSeconds);
  };

  const handleSkipToStart = () => {
    audioEngine.seek(0);
    syncTransportFromSeconds(0);
  };

  const handleSkipToEnd = () => {
    const maxTime = Math.max(...clips.map(c => c.startTime + c.duration), 0);
    audioEngine.seek(maxTime);
    syncTransportFromSeconds(maxTime);
  };

  // Edit handlers
  const handleCut = async () => {
    if (selectedClipIds.length === 0) return;
    const clipsToCut = clips.filter(c => selectedClipIds.includes(c.id));
    setClipboard(clipsToCut);
    await handleDeleteSelectedClips();
  };

  const handleCopy = () => {
    if (selectedClipIds.length === 0) return;
    const clipsToCopy = clips.filter(c => selectedClipIds.includes(c.id));
    setClipboard(clipsToCopy);
  };

  const handlePaste = async () => {
    if (!clipboard || clipboard.length === 0) return;
    const currentTimeSecs = parseTransportTime(currentTime);

    try {
      const createdClips = [];
      for (const clip of clipboard) {
        const response = await apiService.addClip(projectId, {
          ...clipToApiPayload({
            ...clip,
            name: `${clip.name} (copy)`,
            startTime: currentTimeSecs
          })
        });
        createdClips.push(mapClipFromApi(response?.data || response));
      }

      setClips((prev) => {
        const newClips = [...prev, ...createdClips];
        pushHistory(tracks, newClips);
        return newClips;
      });
    } catch (persistError) {
      setError(persistError.message || 'Failed to paste clips');
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  // Track handlers
  const handleTrackSelect = (trackId) => {
    setTracks(prev => prev.map(t => ({ ...t, selected: t.id === trackId })));
  };

  const handleTrackMute = (trackId) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    const updatedTrack = { ...track, muted: !track.muted };
    setTracks(prev => prev.map(t => t.id === trackId ? updatedTrack : t));
    scheduleTrackPersist(updatedTrack);
  };

  const handleTrackSolo = (trackId) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    const updatedTrack = { ...track, solo: !track.solo };
    setTracks(prev => prev.map(t => t.id === trackId ? updatedTrack : t));
    scheduleTrackPersist(updatedTrack);
  };

  const handleTrackArm = (trackId) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, armed: !t.armed } : t));
  };

  const handleDeleteTrack = async (trackId) => {
    const nextTracks = tracks
      .filter((track) => track.id !== trackId)
      .map((track, index) => ({ ...track, selected: index === 0 ? true : track.selected }));
    const normalizedTracks = nextTracks.some((track) => track.selected)
      ? nextTracks
      : nextTracks.map((track, index) => ({ ...track, selected: index === 0 }));
    const nextClips = clips.filter((clip) => clip.trackId !== trackId);

    setTracks(normalizedTracks);
    setClips(nextClips);
    pushHistory(normalizedTracks, nextClips);

    try {
      await apiService.deleteTrack(projectId, trackId);
    } catch (persistError) {
      setError(persistError.message || 'Failed to delete track');
      fetchProject();
    }
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
      const track = tracks.find((t) => t.id === editingTrackId);
      if (!track) return;
      const updatedTrack = { ...track, name: editName.trim() };

      setTracks(prev => {
        const newTracks = prev.map(t => t.id === editingTrackId ? updatedTrack : t);
        pushHistory(newTracks, clips);
        return newTracks;
      });
      scheduleTrackPersist(updatedTrack);
    }
    setEditingTrackId(null);
    setEditName('');
  };

  const handleDuplicateTrack = async (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    try {
      const response = await apiService.addTrack(projectId, {
        ...trackToApiPayload(track),
        name: `${track.name} Copy`
      });
      const duplicatedTrack = mapTrackFromApi(response?.data || response, tracks.length);
      duplicatedTrack.selected = false;
      duplicatedTrack.armed = false;

      setTracks(prev => {
        const newTracks = [...prev, duplicatedTrack];
        pushHistory(newTracks, clips);
        return newTracks;
      });
    } catch (persistError) {
      setError(persistError.message || 'Failed to duplicate track');
    }
  };

  const handleChangeTrackType = (trackId) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    const newType = track.type === 'audio' ? 'midi' : 'audio';
    const updatedTrack = { ...track, type: newType, icon: newType === 'audio' ? '🎙️' : '🎹' };
    setTracks(prev => {
      const newTracks = prev.map(t => t.id === trackId ? updatedTrack : t);
      pushHistory(newTracks, clips);
      return newTracks;
    });
    scheduleTrackPersist(updatedTrack);
  };

  const handleVolumeChange = (trackId, volume) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    const updatedTrack = { ...track, volume };
    setTracks(prev => prev.map(t => t.id === trackId ? updatedTrack : t));
    scheduleTrackPersist(updatedTrack, 300);
  };

  const handlePanChange = (trackId, pan) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    const updatedTrack = { ...track, pan };
    setTracks(prev => prev.map(t => t.id === trackId ? updatedTrack : t));
    scheduleTrackPersist(updatedTrack, 300);
  };

  // Add track handler
  const handleAddTrack = async () => {
    const trackNumber = tracks.filter(t => t.type === 'audio').length + 1;
    try {
      const response = await apiService.addTrack(projectId, {
        name: `Audio Track ${trackNumber}`,
        type: 'audio',
        volume: 0.7,
        pan: 0,
        isMuted: false,
        isSolo: false,
        color: '#4CAF50'
      });

      const createdTrack = mapTrackFromApi(response?.data || response, tracks.length);
      createdTrack.selected = false;
      createdTrack.armed = false;

      setTracks(prev => {
        const newTracks = [...prev, createdTrack];
        pushHistory(newTracks, clips);
        return newTracks;
      });
    } catch (persistError) {
      setError(persistError.message || 'Failed to add track');
    }
  };

  // Timeline handlers
  const handleTimelineClick = (time) => {
    const normalizedTime = Math.max(0, Number(time) || 0);
    audioEngine.seek(normalizedTime);
    syncTransportFromSeconds(normalizedTime);
  };

  const handleClipClick = (clip) => {
    // Selection is handled in the timeline component
  };

  const handleClipsSelected = (clipIds) => {
    setSelectedClipIds(clipIds);
  };

  const handleClipDelete = async (clipId) => {
    const nextClips = clips.filter(c => c.id !== clipId);
    setClips(nextClips);
    setSelectedClipIds(prev => prev.filter(id => id !== clipId));
    pushHistory(tracks, nextClips);

    try {
      await apiService.deleteClip(projectId, clipId);
    } catch (persistError) {
      setError(persistError.message || 'Failed to delete clip');
      fetchProject();
    }
  };

  const handleClipMove = (clipId, newTrackId, newStartTime) => {
    const sourceClip = clips.find((clip) => clip.id === clipId);
    if (!sourceClip) return;
    const updatedClip = { ...sourceClip, trackId: newTrackId, startTime: newStartTime };

    setClips(prev => {
      const newClips = prev.map(c =>
        c.id === clipId ? updatedClip : c
      );
      pushHistory(tracks, newClips);
      return newClips;
    });
    scheduleClipPersist(updatedClip, 'move', 250);
    markChecklistStep('editedTimeline');
  };

  const handleClipResize = (clipId, newStartTime, newDuration) => {
    const sourceClip = clips.find((clip) => clip.id === clipId);
    if (!sourceClip) return;
    const updatedClip = { ...sourceClip, startTime: newStartTime, duration: newDuration };

    setClips(prev => {
      const newClips = prev.map(c =>
        c.id === clipId ? updatedClip : c
      );
      pushHistory(tracks, newClips);
      return newClips;
    });
    scheduleClipPersist(updatedClip, 'update', 250);
    markChecklistStep('editedTimeline');
  };

  const handleClipSplit = async (clipId, splitTime) => {
    const clip = clips.find(c => c.id === clipId);
    if (!clip) return;

    const firstDuration = splitTime - clip.startTime;
    const secondDuration = clip.duration - firstDuration;
    const firstClip = { ...clip, duration: firstDuration };
    const secondClip = { ...clip, name: `${clip.name} (split)`, startTime: splitTime, duration: secondDuration };

    try {
      const [updatedFirstResponse, createdSecondResponse] = await Promise.all([
        apiService.updateClip(projectId, clipId, clipToApiPayload(firstClip)),
        apiService.addClip(projectId, clipToApiPayload(secondClip))
      ]);

      const updatedFirstClip = mapClipFromApi(updatedFirstResponse?.data || updatedFirstResponse);
      const createdSecondClip = mapClipFromApi(createdSecondResponse?.data || createdSecondResponse);
      const newClips = [
        ...clips.filter(c => c.id !== clipId),
        updatedFirstClip,
        createdSecondClip
      ];
      setClips(newClips);
      pushHistory(tracks, newClips);
      markChecklistStep('editedTimeline');
    } catch (persistError) {
      setError(persistError.message || 'Failed to split clip');
    }
  };

  const handleExternalAudioDrop = useCallback(async ({ trackId, startTime, files }) => {
    const droppedFiles = Array.from(files || []).filter(isSupportedAudioFile);
    if (droppedFiles.length === 0) {
      setStudioMessage('Drop audio files only (wav, mp3, ogg, flac, aac, m4a, webm).');
      return;
    }

    let nextTracksState = tracks;
    let targetTrack = tracks.find((track) => track.id === trackId) || tracks[0] || null;

    if (!targetTrack) {
      try {
        const createdTrackResponse = await apiService.addTrack(projectId, {
          name: 'Imported Audio',
          type: 'audio',
          volume: 0.7,
          pan: 0,
          isMuted: false,
          isSolo: false,
          color: '#4CAF50'
        });

        targetTrack = mapTrackFromApi(createdTrackResponse?.data || createdTrackResponse, tracks.length);
        targetTrack.selected = false;
        targetTrack.armed = false;
        nextTracksState = [...tracks, targetTrack];
        setTracks(nextTracksState);
      } catch (persistError) {
        setError(persistError.message || 'Failed to create an audio track for dropped files');
        return;
      }
    }

    let insertCursor = Math.max(0, Number(startTime) || 0);
    const createdClips = [];
    const failedFiles = [];

    for (const file of droppedFiles) {
      try {
        setStudioMessage(`Uploading ${file.name}...`);
        const uploadResponse = await apiService.uploadAudioFile(file);
        const uploaded = uploadResponse?.data || uploadResponse || {};
        const duration = Math.max(0.25, await readAudioFileDuration(file));
        const fallbackFileName = String(file.name || 'Imported Audio');
        const fileName = uploaded.file_name || uploaded.fileName || fallbackFileName;
        const extension = fallbackFileName.includes('.') ? fallbackFileName.split('.').pop().toLowerCase() : 'audio';

        const clipResponse = await apiService.addClip(projectId, {
          trackId: targetTrack.id,
          name: uploaded.original_name || uploaded.originalName || fallbackFileName,
          type: 'audio',
          startTime: insertCursor,
          duration,
          fileName,
          filePath: uploaded.file_path || uploaded.filePath || null,
          fileSize: Number(uploaded.file_size ?? uploaded.fileSize ?? file.size) || null,
          sampleRate: Number(uploaded.sample_rate ?? uploaded.sampleRate ?? 0) || null,
          bitDepth: Number(uploaded.bit_depth ?? uploaded.bitDepth ?? 0) || null,
          channels: Number(uploaded.channels ?? 0) || null,
          settings: {
            source: 'timeline-drop',
            fileName,
            format: extension
          }
        });

        createdClips.push(mapClipFromApi(clipResponse?.data || clipResponse));
        insertCursor += duration;
      } catch (_error) {
        failedFiles.push(file.name);
      }
    }

    if (createdClips.length > 0) {
      setClips((prev) => {
        const newClips = [...prev, ...createdClips];
        pushHistory(nextTracksState, newClips);
        return newClips;
      });
      setSelectedClipIds(createdClips.map((clip) => clip.id));
      markChecklistStep('clipsReady');
      markChecklistStep('editedTimeline');
      fetchAudioLibrary();
    }

    if (createdClips.length > 0 && failedFiles.length === 0) {
      setStudioMessage(`Imported ${createdClips.length} audio file${createdClips.length === 1 ? '' : 's'} to timeline.`);
      return;
    }

    if (createdClips.length > 0 && failedFiles.length > 0) {
      setStudioMessage(`Imported ${createdClips.length}, failed ${failedFiles.length}: ${failedFiles.join(', ')}`);
      return;
    }

    setStudioMessage(`Import failed: ${failedFiles.join(', ') || 'unknown error'}`);
  }, [tracks, projectId, pushHistory, markChecklistStep, fetchAudioLibrary]);

  const handleAddClip = async (trackId, startTime) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    const clipCount = clips.filter(c => c.trackId === trackId).length;
    try {
      const response = await apiService.addClip(projectId, {
        trackId,
        name: `${track.name} Clip ${clipCount + 1}`,
        type: track.type,
        startTime,
        duration: 4
      });

      const createdClip = mapClipFromApi(response?.data || response);
      setClips(prev => {
        const newClips = [...prev, createdClip];
        pushHistory(tracks, newClips);
        return newClips;
      });
    } catch (persistError) {
      setError(persistError.message || 'Failed to add clip');
    }
  };

  const selectedTrack = tracks.find(track => track.selected);
  const arrangementLength = Math.max(...clips.map(c => c.startTime + c.duration), 0);
  const checklistDoneCount = Object.values(readinessChecklist).filter(Boolean).length;
  const checklistTotalCount = readinessItems.length;
  const pianoRollNotes = clips
    .filter(clip => clip.type === 'midi')
    .slice(0, 10)
    .map((clip, index) => ({
      id: clip.id,
      left: `${Math.min(88, clip.startTime * 3.4)}%`,
      width: `${Math.max(8, clip.duration * 2.8)}%`,
      top: `${8 + ((index * 14) % 78)}%`
    }));

  const assetLibrary = audioLibraryItems;

  const instrumentLibrary = tracks
    .filter((track) => track.type === 'midi')
    .map((track) => ({
      name: track.name,
      family: 'MIDI Track',
      preset: track.armed ? 'Record Armed' : 'Ready'
    }));

  const effectLibrary = [
    { name: 'Master Output', state: 'On', value: `${masterVolume}%` },
    { name: 'Tempo', state: 'On', value: `${bpm} BPM` },
    { name: 'Time Signature', state: 'On', value: timeSignature },
    { name: 'Track Count', state: 'On', value: `${tracks.length}` },
    { name: 'Clip Count', state: 'On', value: `${clips.length}` }
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
            <button
              type="button"
              style={quickNavBtnStyle}
              onClick={() => setShowReadinessChecklist((prev) => !prev)}
            >
              {showReadinessChecklist ? 'Hide Checklist' : 'Show Checklist'}
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

        {showReadinessChecklist && !loading && !error && (
          <div style={checklistPanelStyle}>
            <div style={checklistHeaderStyle}>
              <div style={statusGroupStyle}>
                <span style={checklistTitleStyle}>Readiness Checklist</span>
                <span style={checklistCountStyle}>{checklistDoneCount}/{checklistTotalCount}</span>
              </div>
              <div style={checklistActionsStyle}>
                <button type="button" style={checklistActionBtnStyle} onClick={completeChecklist}>
                  Complete All
                </button>
                <button type="button" style={checklistActionBtnStyle} onClick={resetChecklist}>
                  Reset
                </button>
              </div>
            </div>
            <div style={checklistItemsWrapStyle}>
              {readinessItems.map((item) => (
                <label key={item.key} style={checklistItemStyle}>
                  <input
                    type="checkbox"
                    checked={!!readinessChecklist[item.key]}
                    onChange={() => toggleChecklistStep(item.key)}
                  />
                  <span>
                    <span style={checklistItemTitleStyle}>{item.label}</span>
                    <span style={checklistItemHintStyle}>{item.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

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
                      {(leftPanelTab === 'files' ? assetLibrary : instrumentLibrary).length === 0 ? (
                        <div style={{ fontSize: '11px', color: '#94a3b8', padding: '8px 4px' }}>
                          {leftPanelTab === 'files'
                            ? 'No uploaded files yet. Open Sound Library (L) to upload audio.'
                            : 'No MIDI tracks yet. Change a track type to MIDI to populate this list.'}
                        </div>
                      ) : (
                        (leftPanelTab === 'files' ? assetLibrary : instrumentLibrary).map((item) => (
                          <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', padding: '8px 9px', marginBottom: '8px', background: 'rgba(15, 23, 42, 0.44)' }}>
                            <div>
                              <div style={{ fontSize: '12px', color: '#eff6ff', fontWeight: 600 }}>{item.name}</div>
                              <div style={{ fontSize: '11px', color: '#93c5fd' }}>{item.type || item.family}</div>
                            </div>
                            <span style={{ border: '1px solid rgba(148, 163, 184, 0.3)', borderRadius: '999px', padding: '2px 6px', fontSize: '10px', color: '#cbd5e1' }}>{item.detail || item.preset}</span>
                          </div>
                        ))
                      )}
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
                        onExternalAudioDrop={handleExternalAudioDrop}
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
