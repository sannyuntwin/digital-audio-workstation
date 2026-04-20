import React, { useState, useRef, useCallback } from 'react';

// ============ STYLES ============
const toolbarStyle = {
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  background: '#252529',
  borderBottom: '1px solid #333338',
  gap: '16px'
};

const toolbarLeftStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const toolbarCenterStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flex: 1,
  justifyContent: 'center'
};

const toolbarRightStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const projectNameStyle = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#e8e8e8'
};

const transportGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  background: '#1e1e22',
  borderRadius: '6px',
  border: '1px solid #333338'
};

const transportBtnStyle = {
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: '#a0a0a8',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

const transportBtnActiveStyle = {
  ...transportBtnStyle,
  background: '#3d8b41',
  color: '#ffffff'
};

const recordBtnStyle = {
  ...transportBtnStyle,
  color: '#e04d4d'
};

const recordBtnActiveStyle = {
  ...transportBtnStyle,
  background: '#e04d4d',
  color: '#ffffff'
};

const timeDisplayStyle = {
  fontSize: '18px',
  fontWeight: 600,
  fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
  color: '#4fc3f7',
  letterSpacing: '1px',
  minWidth: '100px',
  textAlign: 'center'
};

const bpmDisplayStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '4px 12px',
  background: '#1e1e22',
  borderRadius: '4px',
  border: '1px solid #333338',
  fontSize: '13px',
  color: '#a0a0a8'
};

const bpmValueStyle = {
  fontWeight: 600,
  color: '#e8e8e8'
};

const zoomGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};

const iconBtnStyle = {
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  borderRadius: '4px',
  color: '#a0a0a8',
  cursor: 'pointer',
  fontSize: '14px'
};

const toolGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  padding: '2px',
  background: '#1e1e22',
  borderRadius: '4px',
  border: '1px solid #333338'
};

const toolBtnStyle = {
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  borderRadius: '3px',
  color: '#a0a0a8',
  cursor: 'pointer',
  fontSize: '12px'
};

const toolBtnActiveStyle = {
  ...toolBtnStyle,
  background: '#3d8b41',
  color: '#ffffff'
};

const editBtnStyle = {
  padding: '4px 8px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: 'transparent',
  border: 'none',
  borderRadius: '3px',
  color: '#a0a0a8',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 500
};

const selectStyle = {
  padding: '4px 8px',
  background: '#1e1e22',
  border: '1px solid #333338',
  borderRadius: '4px',
  color: '#e8e8e8',
  fontSize: '12px',
  cursor: 'pointer',
  outline: 'none'
};

const volumeSliderStyle = {
  width: '80px',
  height: '20px',
  cursor: 'pointer'
};

const actionBtnStyle = {
  height: '32px',
  borderRadius: '6px',
  border: '1px solid #3f4550',
  padding: '0 12px',
  background: '#20262f',
  color: '#e8edf7',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.2px'
};

const saveBtnStyle = {
  ...actionBtnStyle,
  borderColor: '#3f7a54',
  background: '#193327',
  color: '#c8f8d8'
};

const exportBtnStyle = {
  ...actionBtnStyle,
  borderColor: '#4a607e',
  background: '#172436',
  color: '#d6e8ff'
};

const statusTextStyle = {
  fontSize: '11px',
  color: '#9fb0c4',
  minWidth: '56px'
};

const timeSigStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  padding: '4px 8px',
  background: '#1e1e22',
  borderRadius: '4px',
  border: '1px solid #333338',
  fontSize: '13px',
  color: '#a0a0a8'
};

// ============ ICONS ============
const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h12v12H6z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const RecordIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="8"/>
  </svg>
);

const RewindIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
  </svg>
);

const FastForwardIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
  </svg>
);

const SkipPreviousIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
  </svg>
);

const SkipNextIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
  </svg>
);

const CutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm9 5v-3h-3v-2h3V9h2v3h3v2h-3v3h-2z"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
  </svg>
);

const PasteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/>
  </svg>
);

const DAWToolbar = ({
  projectName = 'Unnamed Project',
  isPlaying = false,
  isRecording = false,
  currentTime = '00:00:00',
  bpm = 120,
  zoom = 100,
  metronomeEnabled = false,
  loopEnabled = false,
  punchInEnabled = false,
  canUndo = false,
  canRedo = false,
  activeTool = 'select',
  snapGrid = 0.25,
  timeSignature = '4/4',
  masterVolume = 80,
  onPlay,
  onStop,
  onRecord,
  onRewind,
  onFastForward,
  onSkipToStart,
  onSkipToEnd,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomToFit,
  onMetronomeToggle,
  onLoopToggle,
  onPunchInToggle,
  onUndo,
  onRedo,
  onToolChange,
  onCut,
  onCopy,
  onPaste,
  onSnapGridChange,
  onTapTempo,
  onTimeSignatureChange,
  onQuantize,
  onMasterVolumeChange,
  onSave,
  onExport,
  saveStatus = 'idle'
}) => {
  const [, setTapTimes] = useState([]);
  const tapTimeoutRef = useRef(null);

  const handleTapTempo = useCallback(() => {
    const now = Date.now();
    setTapTimes(prev => {
      const newTimes = [...prev, now].slice(-4);
      if (newTimes.length >= 2) {
        const intervals = [];
        for (let i = 1; i < newTimes.length; i++) {
          intervals.push(newTimes[i] - newTimes[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const newBpm = Math.round(60000 / avgInterval);
        if (newBpm >= 40 && newBpm <= 240) {
          onTapTempo?.(newBpm);
        }
      }
      return newTimes;
    });

    clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => setTapTimes([]), 2000);
  }, [onTapTempo]);
  return (
    <div style={toolbarStyle}>
      {/* Left: Project Name + Undo/Redo + Tools */}
      <div style={toolbarLeftStyle}>
        <span style={projectNameStyle}>{projectName}</span>

        {/* Undo/Redo */}
        <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
          <button
            style={{ ...iconBtnStyle, opacity: canUndo ? 1 : 0.3 }}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </button>
          <button
            style={{ ...iconBtnStyle, opacity: canRedo ? 1 : 0.3 }}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </button>
        </div>

        {/* Tool Selector */}
        <div style={{ ...toolGroupStyle, marginLeft: '12px' }}>
          <button
            style={activeTool === 'select' ? toolBtnActiveStyle : toolBtnStyle}
            onClick={() => onToolChange?.('select')}
            title="Select Tool (V)"
          >
            🖱
          </button>
          <button
            style={activeTool === 'hand' ? toolBtnActiveStyle : toolBtnStyle}
            onClick={() => onToolChange?.('hand')}
            title="Hand Tool (H)"
          >
            ✋
          </button>
          <button
            style={activeTool === 'pencil' ? toolBtnActiveStyle : toolBtnStyle}
            onClick={() => onToolChange?.('pencil')}
            title="Pencil Tool (P)"
          >
            ✏
          </button>
          <button
            style={activeTool === 'zoom' ? toolBtnActiveStyle : toolBtnStyle}
            onClick={() => onToolChange?.('zoom')}
            title="Zoom Tool (Z)"
          >
            🔍
          </button>
        </div>

        {/* Edit Buttons */}
        <div style={{ display: 'flex', marginLeft: '8px' }}>
          <button style={editBtnStyle} onClick={onCut} title="Cut (Ctrl+X)">
            <CutIcon /> Cut
          </button>
          <button style={editBtnStyle} onClick={onCopy} title="Copy (Ctrl+C)">
            <CopyIcon /> Copy
          </button>
          <button style={editBtnStyle} onClick={onPaste} title="Paste (Ctrl+V)">
            <PasteIcon /> Paste
          </button>
        </div>
      </div>

      {/* Center: Transport + Time + Editing */}
      <div style={toolbarCenterStyle}>
        {/* Transport Controls */}
        <div style={transportGroupStyle}>
          <button style={transportBtnStyle} onClick={onSkipToStart} title="Skip to Start (Home)">
            <SkipPreviousIcon />
          </button>
          <button style={transportBtnStyle} onClick={onRewind} title="Rewind">
            <RewindIcon />
          </button>
          <button
            style={isRecording ? recordBtnActiveStyle : recordBtnStyle}
            onClick={onRecord}
            title="Record"
          >
            <RecordIcon />
          </button>
          <button
            style={isPlaying ? transportBtnActiveStyle : transportBtnStyle}
            onClick={onPlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            style={transportBtnStyle}
            onClick={onStop}
            title="Stop"
          >
            <StopIcon />
          </button>
          <button style={transportBtnStyle} onClick={onFastForward} title="Fast Forward">
            <FastForwardIcon />
          </button>
          <button style={transportBtnStyle} onClick={onSkipToEnd} title="Skip to End (End)">
            <SkipNextIcon />
          </button>
        </div>

        <div style={timeDisplayStyle}>{currentTime}</div>

        {/* Time Signature */}
        <div style={timeSigStyle}>
          <select
            style={{ ...selectStyle, width: '50px' }}
            value={timeSignature}
            onChange={(e) => onTimeSignatureChange?.(e.target.value)}
            title="Time Signature"
          >
            <option value="3/4">3/4</option>
            <option value="4/4">4/4</option>
            <option value="5/4">5/4</option>
            <option value="6/8">6/8</option>
            <option value="7/8">7/8</option>
          </select>
        </div>

        {/* BPM + Tap Tempo */}
        <div style={{ ...bpmDisplayStyle, gap: '4px' }}>
          <button
            style={{ ...iconBtnStyle, width: '24px', height: '24px', fontSize: '10px' }}
            onClick={handleTapTempo}
            title="Tap Tempo"
          >
            TAP
          </button>
          <span style={bpmValueStyle}>{bpm}</span>
          <span>BPM</span>
        </div>

        {/* Playback Controls */}
        <div style={transportGroupStyle}>
          <button
            style={metronomeEnabled ? transportBtnActiveStyle : transportBtnStyle}
            onClick={onMetronomeToggle}
            title="Metronome"
          >
            𝄞
          </button>
          <button
            style={loopEnabled ? transportBtnActiveStyle : transportBtnStyle}
            onClick={onLoopToggle}
            title="Loop"
          >
            ⥁
          </button>
          <button
            style={punchInEnabled ? transportBtnActiveStyle : transportBtnStyle}
            onClick={onPunchInToggle}
            title="Punch In/Out"
          >
            P
          </button>
        </div>

        {/* Snap Grid + Quantize */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: '#6b6b75' }}>Snap:</span>
          <select
            style={selectStyle}
            value={snapGrid}
            onChange={(e) => onSnapGridChange?.(parseFloat(e.target.value))}
            title="Snap Grid"
          >
            <option value={0.0625}>1/64</option>
            <option value={0.125}>1/32</option>
            <option value={0.25}>1/16</option>
            <option value={0.5}>1/8</option>
            <option value={1}>1/4</option>
            <option value={2}>1/2</option>
            <option value={4}>1</option>
            <option value={0}>Off</option>
          </select>
          <button
            style={{ ...transportBtnStyle, width: '28px', height: '28px', fontSize: '10px' }}
            onClick={onQuantize}
            title="Quantize (Q)"
          >
            Q
          </button>
        </div>
      </div>

      {/* Right: Zoom + Master Volume */}
      <div style={toolbarRightStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button style={saveBtnStyle} onClick={onSave} title="Save Project (Ctrl+S)">
            Save
          </button>
          <button style={exportBtnStyle} onClick={onExport} title="Export Session">
            Export
          </button>
          <span style={statusTextStyle}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : saveStatus === 'error' ? 'Error' : 'Ready'}
          </span>
        </div>

        {/* Zoom Controls */}
        <div style={zoomGroupStyle}>
          <button style={iconBtnStyle} onClick={onZoomOut} title="Zoom Out">-</button>
          <span style={{ fontSize: '12px', color: '#a0a0a8', minWidth: '40px', textAlign: 'center' }}>
            {zoom}%
          </span>
          <button style={iconBtnStyle} onClick={onZoomIn} title="Zoom In">+</button>
        </div>
        <button style={iconBtnStyle} onClick={onZoomReset} title="Reset Zoom">⟲</button>
        <button style={iconBtnStyle} onClick={onZoomToFit} title="Zoom to Fit">⬌</button>

        {/* Master Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid #333338' }}>
          <span style={{ fontSize: '11px', color: '#a0a0a8' }}>Master</span>
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => onMasterVolumeChange?.(parseInt(e.target.value))}
            style={volumeSliderStyle}
            title={`Master Volume: ${masterVolume}%`}
          />
          <span style={{ fontSize: '11px', color: '#e8e8e8', minWidth: '28px' }}>{masterVolume}</span>
        </div>
      </div>
    </div>
  );
};

export default DAWToolbar;
