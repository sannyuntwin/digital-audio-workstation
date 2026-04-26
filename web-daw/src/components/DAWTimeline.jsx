import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';

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

const DRAG_THRESHOLD_PX = 2;
const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const WHEEL_ZOOM_STEP = 5;
const DRAG_PREVIEW_FRAME_MS = 16;

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

const DAWTimeline = ({
  tracks = [],
  clips = [],
  currentTime = 0,
  zoom = 100,
  duration = 60,
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
  onClipMoveEnd,
  onClipResize,
  barSnapSeconds = 0,
  onZoomChange,
  onClipsSelected,
  onScrollSync,
  onExternalAudioDrop
}) => {
  const rulerRef = useRef(null);
  const bodyRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragClip, setDragClip] = useState(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragPointerOffset, setDragPointerOffset] = useState(0);
  const lastDragPositionRef = useRef(null);
  const lastMovePreviewAtRef = useRef(0);

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
  const [dropLaneTrackId, setDropLaneTrackId] = useState(null);
  const waveformCacheRef = useRef(new Map());
  const midiCacheRef = useRef(new Map());

  const scale = (zoom / 100) * pixelsPerSecond;
  const totalWidth = duration * scale;

  const snapTime = useCallback((time) => {
    if (!snapEnabled) return time;
    return Math.round(time / snapGrid) * snapGrid;
  }, [snapEnabled, snapGrid]);

  const snapDragTime = useCallback((time) => {
    const candidate = Number(barSnapSeconds);
    if (Number.isFinite(candidate) && candidate > 0) {
      return Math.round(time / candidate) * candidate;
    }
    return snapTime(time);
  }, [barSnapSeconds, snapTime]);

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
    onScrollSync?.(e.target.scrollTop);
  };

  const handleTimelineWheel = useCallback((event) => {
    const body = bodyRef.current;
    if (!body) return;

    if ((event.ctrlKey || event.metaKey) && typeof onZoomChange === 'function') {
      event.preventDefault();
      const zoomDelta = event.deltaY < 0 ? WHEEL_ZOOM_STEP : -WHEEL_ZOOM_STEP;
      const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + zoomDelta));
      if (nextZoom !== zoom) {
        onZoomChange(nextZoom);
      }
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();
      body.scrollLeft += event.deltaY !== 0 ? event.deltaY : event.deltaX;
    }
  }, [zoom, onZoomChange]);

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
      const trackId = normalizeTrackId(e.target.closest('.track-lane').dataset.trackId);
      const shouldAddClip = e.detail >= 2 || e.altKey;

      if (shouldAddClip && trackId !== null) {
        onAddClip?.(trackId, time);
      } else {
        onTimelineClick?.(time);
      }
      return;
    }

    const rect = bodyRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + bodyRef.current.scrollLeft;
    const time = x / scale;
    onTimelineClick?.(time);
  };

  const getAudioFilesFromDataTransfer = useCallback((dataTransfer) => {
    const files = Array.from(dataTransfer?.files || []);
    if (files.length === 0) return [];
    return files.filter((file) => {
      if (typeof file?.type === 'string' && file.type.startsWith('audio/')) return true;
      const name = String(file?.name || '').toLowerCase();
      return /\.(wav|mp3|ogg|flac|aac|m4a|webm)$/i.test(name);
    });
  }, []);

  const resolveDropTrackAndTime = useCallback((event) => {
    const body = bodyRef.current;
    if (!body) return { trackId: null, startTime: 0 };

    const laneElement = event.target?.closest?.('.track-lane');
    const laneTrackId = normalizeTrackId(laneElement?.dataset?.trackId);
    const fallbackTrackId = normalizeTrackId(tracks[0]?.id);
    const trackId = laneTrackId ?? fallbackTrackId;

    const rect = body.getBoundingClientRect();
    const x = event.clientX - rect.left + body.scrollLeft;
    const startTime = Math.max(0, snapTime(x / scale));
    return { trackId, startTime };
  }, [tracks, scale, snapTime]);

  const handleTimelineDragOver = useCallback((event) => {
    const audioFiles = getAudioFilesFromDataTransfer(event.dataTransfer);
    if (audioFiles.length === 0) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    const laneElement = event.target?.closest?.('.track-lane');
    setDropLaneTrackId(normalizeTrackId(laneElement?.dataset?.trackId));
  }, [getAudioFilesFromDataTransfer]);

  const handleTimelineDrop = useCallback((event) => {
    const audioFiles = getAudioFilesFromDataTransfer(event.dataTransfer);
    if (audioFiles.length === 0) return;

    event.preventDefault();
    event.stopPropagation();
    const { trackId, startTime } = resolveDropTrackAndTime(event);
    setDropLaneTrackId(null);

    if (trackId === null) return;
    onExternalAudioDrop?.({
      trackId,
      startTime,
      files: audioFiles
    });
  }, [getAudioFilesFromDataTransfer, onExternalAudioDrop, resolveDropTrackAndTime]);

  const handleTimelineDragLeave = useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDropLaneTrackId(null);
    }
  }, []);

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
    setDragStartY(e.clientY);
    lastMovePreviewAtRef.current = 0;

    if (bodyRef.current) {
      const rect = bodyRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left + bodyRef.current.scrollLeft;
      const pointerTime = pointerX / scale;
      setDragPointerOffset(Math.max(0, pointerTime - clip.startTime));
    } else {
      setDragPointerOffset(0);
    }

    lastDragPositionRef.current = {
      clipId: clip.id,
      trackId: normalizeTrackId(clip.trackId),
      startTime: clip.startTime
    };
  };

  const handleMouseMove = useCallback((e) => {
    if (isDragging && dragClip && bodyRef.current) {
      const rect = bodyRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      const movedEnough = Math.abs(deltaX) >= DRAG_THRESHOLD_PX || Math.abs(deltaY) >= DRAG_THRESHOLD_PX;

      if (!movedEnough) {
        return;
      }

      const pointerX = e.clientX - rect.left + bodyRef.current.scrollLeft;
      const pointerTime = pointerX / scale;
      const newStartTime = Math.max(0, snapDragTime(pointerTime - dragPointerOffset));

      // Determine new track from Y position
      const y = e.clientY - rect.top + bodyRef.current.scrollTop;
      const trackIndex = Math.floor(y / 60);
      const newTrackId = tracks[Math.max(0, Math.min(trackIndex, tracks.length - 1))]?.id;
      const normalizedTrackId = normalizeTrackId(newTrackId);
      const lastDragPosition = lastDragPositionRef.current;

      if (normalizedTrackId !== null && (
        !lastDragPosition ||
        newStartTime !== lastDragPosition.startTime ||
        normalizedTrackId !== lastDragPosition.trackId
      )) {
        const now = performance.now();
        if ((now - lastMovePreviewAtRef.current) >= DRAG_PREVIEW_FRAME_MS) {
          onClipMove?.(dragClip.id, normalizedTrackId, newStartTime);
          lastMovePreviewAtRef.current = now;
        }
        lastDragPositionRef.current = {
          clipId: dragClip.id,
          trackId: normalizedTrackId,
          startTime: newStartTime
        };
      }
    }

    if (isResizing && resizeClip && bodyRef.current) {
      const deltaX = e.clientX - resizeStartX;
      const deltaTime = deltaX / scale;

      if (resizeEdge === 'right') {
        const newDuration = Math.max(0.25, snapDragTime(resizeOriginalDuration + deltaTime));
        onClipResize?.(resizeClip.id, resizeOriginalStart, newDuration);
      } else if (resizeEdge === 'left') {
        const newStartTime = Math.max(0, snapDragTime(resizeOriginalStart + deltaTime));
        const newDuration = Math.max(0.25, resizeOriginalStart + resizeOriginalDuration - newStartTime);
        if (newDuration >= 0.25) {
          onClipResize?.(resizeClip.id, newStartTime, newDuration);
        }
      }
    }
  }, [isDragging, dragClip, dragStartX, dragStartY, dragPointerOffset, scale, snapDragTime, tracks, onClipMove, isResizing, resizeClip, resizeEdge, resizeStartX, resizeOriginalStart, resizeOriginalDuration, onClipResize]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragClip) {
      const lastDragPosition = lastDragPositionRef.current;
      const originalTrackId = normalizeTrackId(dragClip.trackId);
      const hasCommittedMove = !!lastDragPosition
        && (lastDragPosition.startTime !== dragClip.startTime || lastDragPosition.trackId !== originalTrackId);

      if (hasCommittedMove) {
        onClipMoveEnd?.(dragClip.id, lastDragPosition.trackId, lastDragPosition.startTime);
      }
    }

    setIsDragging(false);
    setDragClip(null);
    setIsResizing(false);
    setResizeClip(null);
    setResizeEdge(null);
    setDragPointerOffset(0);
    lastMovePreviewAtRef.current = 0;
    lastDragPositionRef.current = null;
  }, [isDragging, dragClip, onClipMoveEnd]);

  useEffect(() => {
    if (!isDragging && !isResizing) return undefined;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = isResizing ? 'ew-resize' : 'grabbing';
    document.body.style.userSelect = 'none';

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isDragging, isResizing]);

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
      default:
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

  const clipsByTrack = useMemo(() => {
    const grouped = new Map();
    clips.forEach((clip) => {
      const trackId = normalizeTrackId(clip.trackId);
      if (!trackId) return;
      if (!grouped.has(trackId)) grouped.set(trackId, []);
      grouped.get(trackId).push(clip);
    });
    return grouped;
  }, [clips]);

  const getWaveformData = useCallback((clipId, width) => {
    const segmentCount = Math.max(1, Math.floor(width / 4));
    const cacheKey = `${String(clipId)}:${segmentCount}`;
    const cached = waveformCacheRef.current.get(cacheKey);
    if (cached) return cached;

    let seed = 0;
    const source = String(clipId);
    for (let i = 0; i < source.length; i += 1) {
      seed = (seed * 31 + source.charCodeAt(i)) >>> 0;
    }

    const data = Array.from({ length: segmentCount }, (_, i) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const normalized = seed / 0xffffffff;
      return {
        x: i * 4,
        height: 10 + normalized * 24
      };
    });

    waveformCacheRef.current.set(cacheKey, data);
    return data;
  }, []);

  const getMidiNoteData = useCallback((clip) => {
    const noteCount = Math.max(1, Math.floor(clip.duration * 4));
    const cacheKey = `${String(clip.id)}:${noteCount}`;
    const cached = midiCacheRef.current.get(cacheKey);
    if (cached) return cached;

    let seed = 0;
    const source = String(clip.id);
    for (let i = 0; i < source.length; i += 1) {
      seed = (seed * 33 + source.charCodeAt(i)) >>> 0;
    }

    const notes = Array.from({ length: noteCount }, (_, i) => {
      seed = (seed * 1103515245 + 12345) >>> 0;
      const normalized = seed / 0xffffffff;
      return {
        left: `${(i / noteCount) * 100}%`,
        top: 10 + normalized * 30,
        width: `${80 / noteCount}%`
      };
    });

    midiCacheRef.current.set(cacheKey, notes);
    return notes;
  }, []);

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
        onWheel={handleTimelineWheel}
        onClick={handleTimelineClick}
        onDragOver={handleTimelineDragOver}
        onDrop={handleTimelineDrop}
        onDragLeave={handleTimelineDragLeave}
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
              style={{
                ...(index % 2 === 0 ? trackLaneStyle : trackLaneAltStyle),
                ...(dropLaneTrackId !== null && isSameTrackId(track.id, dropLaneTrackId)
                  ? {
                    outline: '2px dashed rgba(79, 195, 247, 0.85)',
                    outlineOffset: '-2px',
                    background: 'linear-gradient(to bottom, rgba(37, 99, 235, 0.26) 0%, rgba(15, 23, 42, 0.72) 100%)'
                  }
                  : {})
              }}
            >
              {(clipsByTrack.get(normalizeTrackId(track.id)) || [])
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
                          {getWaveformData(clip.id, clipWidth).map((bar, i) => (
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
                          {getMidiNoteData(clip).map((note, i) => (
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
