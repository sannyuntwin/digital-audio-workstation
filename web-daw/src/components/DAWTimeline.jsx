import React, { useRef, useEffect, useState, useCallback } from 'react';

const timelineContainerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  background: '#151518',
  overflow: 'hidden'
};

const rulerContainerStyle = {
  height: '32px',
  background: '#1e1e22',
  borderBottom: '1px solid #333338',
  position: 'relative',
  overflow: 'hidden'
};

const rulerCanvasStyle = {
  width: '100%',
  height: '100%'
};

const timelineBodyStyle = {
  flex: 1,
  position: 'relative',
  overflow: 'auto'
};

const trackLaneStyle = {
  height: '60px',
  borderBottom: '1px solid #2a2a2e',
  boxSizing: 'border-box',
  position: 'relative',
  background: 'linear-gradient(to bottom, #1a1a1e 0%, #18181b 100%)'
};

const trackLaneAltStyle = {
  ...trackLaneStyle,
  background: 'linear-gradient(to bottom, #1c1c20 0%, #1a1a1d 100%)'
};

const clipStyle = {
  position: 'absolute',
  height: '44px',
  top: '8px',
  borderRadius: '4px',
  padding: '6px 10px',
  fontSize: '12px',
  color: '#fff',
  fontWeight: 500,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.1)',
  cursor: 'pointer',
  userSelect: 'none'
};

const audioClipStyle = {
  ...clipStyle,
  background: 'linear-gradient(135deg, #4a7c9b 0%, #3d5a8b 100%)'
};

const midiClipStyle = {
  ...clipStyle,
  background: 'linear-gradient(135deg, #9b7c4a 0%, #8b5a3d 100%)'
};

const playheadStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '2px',
  background: '#4fc3f7',
  pointerEvents: 'none',
  zIndex: 100
};

const playheadHeadStyle = {
  position: 'absolute',
  top: 0,
  left: '-6px',
  width: 0,
  height: 0,
  borderLeft: '7px solid transparent',
  borderRight: '7px solid transparent',
  borderTop: '10px solid #4fc3f7'
};

const selectedClipStyle = {
  boxShadow: '0 0 0 2px #4fc3f7, 0 1px 3px rgba(0,0,0,0.3)'
};

const resizeHandleStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '6px',
  cursor: 'ew-resize',
  zIndex: 10
};

const resizeHandleLeftStyle = {
  ...resizeHandleStyle,
  left: 0
};

const resizeHandleRightStyle = {
  ...resizeHandleStyle,
  right: 0
};

const contextMenuStyle = {
  position: 'fixed',
  background: '#252529',
  border: '1px solid #333338',
  borderRadius: '4px',
  padding: '4px 0',
  zIndex: 1000,
  minWidth: '140px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
};

const contextMenuItemStyle = {
  padding: '8px 16px',
  fontSize: '13px',
  color: '#e8e8e8',
  cursor: 'pointer',
  hover: {
    background: '#3a3a40'
  }
};

const waveformStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.3
};

const midiNoteStyle = {
  position: 'absolute',
  height: '3px',
  background: 'rgba(255,255,255,0.6)',
  borderRadius: '1px'
};

const fadeHandleStyle = {
  position: 'absolute',
  top: '-4px',
  width: '8px',
  height: '8px',
  background: '#4fc3f7',
  borderRadius: '50%',
  cursor: 'ew-resize',
  zIndex: 5
};

const loopHighlightStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  background: 'rgba(79, 195, 247, 0.1)',
  pointerEvents: 'none',
  zIndex: 50
};

const DAWTimeline = ({
  tracks = [],
  clips = [],
  currentTime = 0,
  zoom = 100,
  duration = 300,
  pixelsPerSecond = 20,
  selectedClipIds = [],
  loopEnabled = false,
  loopStart = 0,
  loopEnd = 8,
  snapEnabled = true,
  snapGrid = 0.25,
  onTimelineClick,
  onClipClick,
  onClipDelete,
  onClipSplit,
  onAddClip,
  onClipMove,
  onClipResize,
  onClipsSelected,
  onScrollSync
}) => {
  const rulerRef = useRef(null);
  const bodyRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragClip, setDragClip] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOriginalStart, setDragOriginalStart] = useState(0);
  const [dragOriginalTrackId, setDragOriginalTrackId] = useState(null);

  // Resize state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeClip, setResizeClip] = useState(null);
  const [resizeEdge, setResizeEdge] = useState(null); // 'left' or 'right'
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeOriginalStart, setResizeOriginalStart] = useState(0);
  const [resizeOriginalDuration, setResizeOriginalDuration] = useState(0);

  // Context menu
  const [contextMenu, setContextMenu] = useState(null);

  // Clipboard for copy/paste
  const [clipboard, setClipboard] = useState(null);

  const scale = (zoom / 100) * pixelsPerSecond;
  const totalWidth = duration * scale;

  const snapTime = useCallback((time) => {
    if (!snapEnabled) return time;
    return Math.round(time / snapGrid) * snapGrid;
  }, [snapEnabled, snapGrid]);

  // Draw ruler
  useEffect(() => {
    const canvas = rulerRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw time markers
    ctx.fillStyle = '#9da2ac';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#3a3a40';
    ctx.lineWidth = 1;

    const step = scale >= 40 ? 1 : scale >= 20 ? 5 : 10;
    const minorStep = step / 5;

    for (let t = 0; t <= duration; t += step) {
      const x = t * scale - scrollLeft;

      if (x < -50 || x > rect.width + 50) continue;

      // Major tick
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 32);
      ctx.stroke();

      // Time label
      const minutes = Math.floor(t / 60);
      const seconds = Math.floor(t % 60);
      const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      ctx.fillText(label, x, 14);

      // Minor ticks
      for (let m = 1; m < 5; m++) {
        const mx = x + (minorStep * m * scale);
        if (mx < rect.width) {
          ctx.beginPath();
          ctx.moveTo(mx, 26);
          ctx.lineTo(mx, 32);
          ctx.stroke();
        }
      }
    }

    // Draw loop region markers if needed
    ctx.strokeStyle = '#4fc3f7';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    // Loop start/end would go here
    ctx.setLineDash([]);

  }, [duration, scale, scrollLeft]);

  const handleScroll = (e) => {
    setScrollLeft(e.target.scrollLeft);
    setScrollTop(e.target.scrollTop);
    onScrollSync?.(e.target.scrollTop);
  };

  const handleTimelineClick = (e) => {
    if (e.target.closest('.clip') || e.target.closest('.resize-handle')) return;

    // Clear selection if clicking empty space without Ctrl
    if (!e.ctrlKey && !e.shiftKey) {
      onClipsSelected?.([]);
    }

    if (e.target.closest('.track-lane')) {
      const rect = bodyRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + bodyRef.current.scrollLeft;
      const time = snapTime(x / scale);
      const trackId = parseInt(e.target.closest('.track-lane').dataset.trackId);
      onAddClip?.(trackId, time);
      return;
    }

    const rect = bodyRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + bodyRef.current.scrollLeft;
    const time = x / scale;
    onTimelineClick?.(time);
  };

  // Clip selection with multi-select support
  const handleClipClick = (e, clip) => {
    e.stopPropagation();

    if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      const newSelection = selectedClipIds.includes(clip.id)
        ? selectedClipIds.filter(id => id !== clip.id)
        : [...selectedClipIds, clip.id];
      onClipsSelected?.(newSelection);
    } else if (e.shiftKey && selectedClipIds.length > 0) {
      // Range selection
      const lastSelected = clips.find(c => c.id === selectedClipIds[selectedClipIds.length - 1]);
      if (lastSelected) {
        const clipIds = clips
          .filter(c => {
            const inTimeRange = (c.startTime >= Math.min(lastSelected.startTime, clip.startTime) &&
                               c.startTime <= Math.max(lastSelected.startTime, clip.startTime));
            return inTimeRange;
          })
          .map(c => c.id);
        onClipsSelected?.([...new Set([...selectedClipIds, ...clipIds])]);
      }
    } else {
      // Single select
      onClipsSelected?.([clip.id]);
    }
    onClipClick?.(clip);
  };

  // Drag handlers
  const handleClipMouseDown = (e, clip) => {
    if (e.target.classList.contains('resize-handle')) return;
    e.stopPropagation();

    if (!selectedClipIds.includes(clip.id) && !e.ctrlKey) {
      onClipsSelected?.([clip.id]);
    }

    setIsDragging(true);
    setDragClip(clip);
    setDragStartX(e.clientX);
    setDragOriginalStart(clip.startTime);
    setDragOriginalTrackId(clip.trackId);
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && dragClip && bodyRef.current) {
      const rect = bodyRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartX;
      const deltaTime = deltaX / scale;
      const newStartTime = Math.max(0, snapTime(dragOriginalStart + deltaTime));

      // Determine new track from Y position
      const y = e.clientY - rect.top + bodyRef.current.scrollTop;
      const trackIndex = Math.floor(y / 60);
      const newTrackId = tracks[Math.max(0, Math.min(trackIndex, tracks.length - 1))]?.id;

      if (newTrackId && (newStartTime !== dragClip.startTime || newTrackId !== dragClip.trackId)) {
        onClipMove?.(dragClip.id, newTrackId, newStartTime);
      }
    }

    if (isResizing && resizeClip && bodyRef.current) {
      const rect = bodyRef.current.getBoundingClientRect();
      const deltaX = e.clientX - resizeStartX;
      const deltaTime = deltaX / scale;

      if (resizeEdge === 'right') {
        const newDuration = Math.max(0.25, snapTime(resizeOriginalDuration + deltaTime));
        onClipResize?.(resizeClip.id, resizeOriginalStart, newDuration);
      } else if (resizeEdge === 'left') {
        const newStartTime = Math.max(0, snapTime(resizeOriginalStart + deltaTime));
        const newDuration = Math.max(0.25, resizeOriginalStart + resizeOriginalDuration - newStartTime);
        if (newDuration >= 0.25) {
          onClipResize?.(resizeClip.id, newStartTime, newDuration);
        }
      }
    }
  }, [isDragging, dragClip, dragStartX, dragOriginalStart, dragOriginalTrackId, scale, snapTime, tracks, onClipMove, isResizing, resizeClip, resizeEdge, resizeStartX, resizeOriginalStart, resizeOriginalDuration, onClipResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragClip(null);
    setIsResizing(false);
    setResizeClip(null);
    setResizeEdge(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Resize handlers
  const handleResizeMouseDown = (e, clip, edge) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeClip(clip);
    setResizeEdge(edge);
    setResizeStartX(e.clientX);
    setResizeOriginalStart(clip.startTime);
    setResizeOriginalDuration(clip.duration);
  };

  // Context menu
  const handleContextMenu = (e, clip) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedClipIds.includes(clip.id)) {
      onClipsSelected?.([clip.id]);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, clip });
  };

  const handleContextMenuAction = (action) => {
    if (!contextMenu) return;
    const clip = contextMenu.clip;

    switch (action) {
      case 'copy':
        setClipboard(clip);
        break;
      case 'paste':
        if (clipboard) {
          onAddClip?.(clip.trackId, clip.startTime + clip.duration);
        }
        break;
      case 'delete':
        onClipDelete?.(clip.id);
        break;
      case 'split':
        const splitTime = currentTime;
        if (splitTime > clip.startTime && splitTime < clip.startTime + clip.duration) {
          onClipSplit?.(clip.id, splitTime);
        }
        break;
      case 'duplicate':
        onAddClip?.(clip.trackId, clip.startTime + clip.duration);
        break;
    }
    setContextMenu(null);
  };

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Keyboard shortcuts
  const handleClipKeyDown = (e, clip) => {
    if (selectedClipIds.includes(clip.id)) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onClipDelete?.(clip.id);
      } else if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault();
        onAddClip?.(clip.trackId, clip.startTime + clip.duration);
      }
    }
  };

  // Generate fake waveform data
  const generateWaveform = (clipId, width) => {
    const segments = Math.floor(width / 4);
    return Array.from({ length: segments }, (_, i) => ({
      x: i * 4,
      height: 10 + Math.random() * 24
    }));
  };

  // Generate fake MIDI notes
  const generateMidiNotes = (clip) => {
    const notes = [];
    const noteCount = Math.floor(clip.duration * 4);
    for (let i = 0; i < noteCount; i++) {
      notes.push({
        left: (i / noteCount) * 100 + '%',
        top: 10 + Math.random() * 30,
        width: `${80 / noteCount}%`
      });
    }
    return notes;
  };

  const playheadPosition = currentTime * scale - scrollLeft;
  const loopLeft = loopStart * scale - scrollLeft;
  const loopWidth = (loopEnd - loopStart) * scale;

  return (
    <div style={timelineContainerStyle}>
      {/* Ruler */}
      <div style={rulerContainerStyle}>
        <canvas
          ref={rulerRef}
          style={rulerCanvasStyle}
        />
        {loopEnabled && (
          <div style={{ ...loopHighlightStyle, left: loopLeft, width: loopWidth }} />
        )}
        <div style={{ ...playheadStyle, left: playheadPosition }}>
          <div style={playheadHeadStyle} />
        </div>
      </div>

      {/* Timeline Body */}
      <div
        ref={bodyRef}
        style={timelineBodyStyle}
        onScroll={handleScroll}
        onClick={handleTimelineClick}
      >
        <div style={{ width: totalWidth, minHeight: '100%', position: 'relative' }}>
          {/* Loop highlight in body */}
          {loopEnabled && (
            <div style={{ ...loopHighlightStyle, left: loopStart * scale, width: (loopEnd - loopStart) * scale }} />
          )}

          {tracks.map((track, index) => (
            <div
              key={track.id}
              data-track-id={track.id}
              className="track-lane"
              style={index % 2 === 0 ? trackLaneStyle : trackLaneAltStyle}
            >
              {clips
                .filter(clip => clip.trackId === track.id)
                .map(clip => {
                  const isSelected = selectedClipIds.includes(clip.id);
                  const clipWidth = clip.duration * scale;

                  return (
                    <div
                      key={clip.id}
                      className="clip"
                      tabIndex={0}
                      style={{
                        ...(clip.type === 'audio' ? audioClipStyle : midiClipStyle),
                        left: clip.startTime * scale,
                        width: clipWidth,
                        ...(isSelected ? selectedClipStyle : {}),
                        cursor: isDragging && dragClip?.id === clip.id ? 'grabbing' : 'pointer'
                      }}
                      onClick={(e) => handleClipClick(e, clip)}
                      onMouseDown={(e) => handleClipMouseDown(e, clip)}
                      onKeyDown={(e) => handleClipKeyDown(e, clip)}
                      onContextMenu={(e) => handleContextMenu(e, clip)}
                    >
                      {/* Waveform for audio clips */}
                      {clip.type === 'audio' && (
                        <div style={waveformStyle}>
                          {generateWaveform(clip.id, clipWidth).map((bar, i) => (
                            <div
                              key={i}
                              style={{
                                position: 'absolute',
                                left: bar.x,
                                bottom: '20%',
                                width: '2px',
                                height: bar.height,
                                background: 'rgba(255,255,255,0.4)',
                                borderRadius: '1px'
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* MIDI notes visualization */}
                      {clip.type === 'midi' && (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          {generateMidiNotes(clip).map((note, i) => (
                            <div
                              key={i}
                              style={{
                                ...midiNoteStyle,
                                left: note.left,
                                top: note.top,
                                width: note.width
                              }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Clip name overlay */}
                      <div style={{ position: 'relative', zIndex: 2, fontSize: '11px' }}>
                        {clip.name}
                      </div>

                      {/* Resize handles */}
                      <div
                        className="resize-handle"
                        style={resizeHandleLeftStyle}
                        onMouseDown={(e) => handleResizeMouseDown(e, clip, 'left')}
                      />
                      <div
                        className="resize-handle"
                        style={resizeHandleRightStyle}
                        onMouseDown={(e) => handleResizeMouseDown(e, clip, 'right')}
                      />

                      {/* Fade handles (only show when selected) */}
                      {isSelected && (
                        <>
                          <div style={{ ...fadeHandleStyle, left: '4px' }} title="Fade In" />
                          <div style={{ ...fadeHandleStyle, right: '4px' }} title="Fade Out" />
                        </>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
          <div style={{ ...playheadStyle, left: playheadPosition }} />
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div style={{ ...contextMenuStyle, left: contextMenu.x, top: contextMenu.y }}>
          <div
            style={contextMenuItemStyle}
            onMouseEnter={(e) => e.target.style.background = '#3a3a40'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={() => handleContextMenuAction('copy')}
          >
            Copy (Ctrl+C)
          </div>
          <div
            style={contextMenuItemStyle}
            onMouseEnter={(e) => e.target.style.background = '#3a3a40'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={() => handleContextMenuAction('paste')}
          >
            Paste (Ctrl+V)
          </div>
          <div
            style={contextMenuItemStyle}
            onMouseEnter={(e) => e.target.style.background = '#3a3a40'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={() => handleContextMenuAction('duplicate')}
          >
            Duplicate (Ctrl+D)
          </div>
          <div style={{ borderTop: '1px solid #333338', margin: '4px 0' }} />
          <div
            style={contextMenuItemStyle}
            onMouseEnter={(e) => e.target.style.background = '#3a3a40'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={() => handleContextMenuAction('split')}
          >
            Split at Playhead (S)
          </div>
          <div
            style={{ ...contextMenuItemStyle, color: '#e04d4d' }}
            onMouseEnter={(e) => e.target.style.background = '#3a3a40'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            onClick={() => handleContextMenuAction('delete')}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default DAWTimeline;
