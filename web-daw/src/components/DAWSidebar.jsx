import React from 'react';

const sidebarStyle = {
  width: '240px',
  minWidth: '240px',
  background: '#1e1e22',
  borderRight: '1px solid #333338',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const sidebarHeaderStyle = {
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 12px',
  borderBottom: '1px solid #333338',
  boxSizing: 'border-box'
};

const headerTitleStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#9da2ac',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const addTrackBtnSmallStyle = {
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#3d8b41',
  border: 'none',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.15s ease'
};

const trackListStyle = {
  flex: 1,
  overflowY: 'auto'
};

const TRACK_HEIGHT = 60;

const trackItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  height: `${TRACK_HEIGHT}px`,
  padding: '0 14px',
  borderBottom: '1px solid #2a2a2e',
  boxSizing: 'border-box',
  cursor: 'pointer',
  transition: 'background 0.15s ease'
};

const trackItemHoverStyle = {
  background: '#2a2a2e'
};

const trackItemSelectedStyle = {
  background: '#2d3a2d',
  borderLeft: '3px solid #3d8b41',
  paddingLeft: '11px'
};

const trackIconStyle = {
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '4px',
  fontSize: '12px'
};

const audioIconStyle = {
  ...trackIconStyle,
  background: '#3d5a8b',
  color: '#ffffff'
};

const midiIconStyle = {
  ...trackIconStyle,
  background: '#8b5a3d',
  color: '#ffffff'
};

const trackInfoStyle = {
  flex: 1,
  overflow: 'hidden'
};

const trackNameStyle = {
  fontSize: '13px',
  fontWeight: 500,
  color: '#e8e8e8',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const trackTypeStyle = {
  fontSize: '11px',
  color: '#6b6b75',
  marginTop: '2px'
};

const trackControlsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};

const controlBtnStyle = {
  width: '22px',
  height: '22px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  borderRadius: '3px',
  color: '#6b6b75',
  cursor: 'pointer',
  fontSize: '10px'
};

const controlBtnActiveStyle = {
  ...controlBtnStyle,
  color: '#4fc3f7'
};

const controlBtnMuteStyle = {
  ...controlBtnStyle,
  color: '#e04d4d'
};

const MuteIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
);

const SoloIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
  </svg>
);

const ArmIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="6"/>
  </svg>
);

const defaultTracks = [
  { id: 1, name: 'Kick Drum', type: 'audio', icon: '🥁', muted: false, solo: false, armed: false, selected: true },
  { id: 2, name: 'Snare', type: 'audio', icon: '🥁', muted: false, solo: false, armed: false, selected: false },
  { id: 3, name: 'Hi-Hat', type: 'audio', icon: '🥁', muted: false, solo: false, armed: false, selected: false },
  { id: 4, name: 'Bass', type: 'audio', icon: '🎸', muted: false, solo: false, armed: false, selected: false },
  { id: 5, name: 'Lead Synth', type: 'midi', icon: '🎹', muted: false, solo: false, armed: false, selected: false },
  { id: 6, name: 'Pad', type: 'midi', icon: '🎹', muted: false, solo: false, armed: false, selected: false },
];

const volumeSliderStyle = {
  width: '60px',
  height: '4px',
  WebkitAppearance: 'none',
  background: '#3a3a40',
  borderRadius: '2px',
  outline: 'none',
  cursor: 'pointer'
};

const panSliderStyle = {
  width: '40px',
  height: '4px',
  WebkitAppearance: 'none',
  background: '#3a3a40',
  borderRadius: '2px',
  outline: 'none',
  cursor: 'pointer'
};

const sliderLabelStyle = {
  fontSize: '9px',
  color: '#6b6b75',
  marginTop: '2px'
};

const DAWSidebar = ({
  tracks = defaultTracks,
  onTrackSelect,
  onTrackMute,
  onTrackSolo,
  onTrackArm,
  onAddTrack,
  onDeleteTrack,
  onRenameTrack,
  onDuplicateTrack,
  onChangeTrackType,
  onVolumeChange,
  onPanChange,
  editingTrackId,
  editName,
  onEditNameChange,
  onEditNameSubmit
}) => {
  const handleTrackClick = (trackId) => {
    onTrackSelect?.(trackId);
  };

  const getItemStyle = (track) => ({
    ...trackItemStyle,
    ...(track.selected ? trackItemSelectedStyle : {})
  });

  const handleNameDoubleClick = (e, track) => {
    e.stopPropagation();
    onRenameTrack?.(track.id, track.name);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onEditNameSubmit?.();
    } else if (e.key === 'Escape') {
      onRenameTrack?.(null, '');
    }
  };

  return (
    <div style={sidebarStyle}>
      <div style={sidebarHeaderStyle}>
        <span style={headerTitleStyle}>Tracks</span>
        <button style={addTrackBtnSmallStyle} onClick={onAddTrack} title="Add Track">+</button>
      </div>
      <div style={trackListStyle}>
        {tracks.map((track) => (
          <div
            key={track.id}
            style={getItemStyle(track)}
            onClick={() => handleTrackClick(track.id)}
            onMouseEnter={(e) => {
              if (!track.selected) {
                Object.assign(e.currentTarget.style, trackItemHoverStyle);
              }
            }}
            onMouseLeave={(e) => {
              if (!track.selected) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            <div style={track.type === 'audio' ? audioIconStyle : midiIconStyle}>
              {track.icon}
            </div>
            <div style={trackInfoStyle}>
              {editingTrackId === track.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => onEditNameChange?.(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => onEditNameSubmit?.()}
                  autoFocus
                  style={{
                    ...trackNameStyle,
                    background: '#252529',
                    border: '1px solid #3d8b41',
                    borderRadius: '3px',
                    padding: '2px 6px',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              ) : (
                <div
                  style={trackNameStyle}
                  onDoubleClick={(e) => handleNameDoubleClick(e, track)}
                  title="Double-click to rename"
                >
                  {track.name}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={track.volume ?? 80}
                    onChange={(e) => onVolumeChange?.(track.id, parseInt(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    style={volumeSliderStyle}
                    title={`Volume: ${track.volume ?? 80}%`}
                  />
                  <div style={sliderLabelStyle}>VOL</div>
                </div>
                <div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={track.pan ?? 0}
                    onChange={(e) => onPanChange?.(track.id, parseInt(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    style={panSliderStyle}
                    title={`Pan: ${track.pan ?? 0}`}
                  />
                  <div style={sliderLabelStyle}>PAN</div>
                </div>
              </div>
            </div>
            <div style={trackControlsStyle}>
              <button
                style={track.muted ? controlBtnMuteStyle : controlBtnStyle}
                onClick={(e) => { e.stopPropagation(); onTrackMute?.(track.id); }}
                title="Mute"
              >
                <MuteIcon />
              </button>
              <button
                style={track.solo ? controlBtnActiveStyle : controlBtnStyle}
                onClick={(e) => { e.stopPropagation(); onTrackSolo?.(track.id); }}
                title="Solo"
              >
                <SoloIcon />
              </button>
              <button
                style={track.armed ? controlBtnMuteStyle : controlBtnStyle}
                onClick={(e) => { e.stopPropagation(); onTrackArm?.(track.id); }}
                title="Arm for Recording"
              >
                <ArmIcon />
              </button>
              <button
                style={controlBtnStyle}
                onClick={(e) => { e.stopPropagation(); onDuplicateTrack?.(track.id); }}
                title="Duplicate Track"
              >
                ⧉
              </button>
              <button
                style={controlBtnStyle}
                onClick={(e) => { e.stopPropagation(); onChangeTrackType?.(track.id); }}
                title="Toggle Audio/MIDI"
              >
                ⇄
              </button>
              <button
                style={{ ...controlBtnStyle, color: '#e04d4d' }}
                onClick={(e) => { e.stopPropagation(); onDeleteTrack?.(track.id); }}
                title="Delete Track"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DAWSidebar;
