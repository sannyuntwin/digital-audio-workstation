/**
 * Track Component - Individual track row in timeline
 * Handles track header, clips, and drag-drop zones
 */

import React, { useRef } from 'react';
import Clip from './Clip';
import '../../index.css';

const Track = ({ 
  track, 
  clips = [], 
  trackHeight, 
  trackHeaderWidth, 
  pixelsPerSecond, 
  onClipDragStart, 
  onClipDrop, 
  onClipSelect, 
  selectedClipId,
  timeToPixels,
  pixelsToTime,
  scrollPosition,
  onTrackUpdate,
  onTrackDelete,
  onFileDrop,
  isSelected,
  onSelect,
  onHeightChange,
  onReorderTrack,
  trackIndex
}) => {
  const trackRootRef = useRef(null); // for CSS class toggling (no re-render)
  const trackRef = useRef(null);
  const isDragOverRef = useRef(false);
  const rafPending = useRef(false); // requestAnimationFrame throttle flag
  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const isDraggingTrackRef = useRef(false);
  const dragStartIndexRef = useRef(null);

  const handleResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = trackHeight;
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'ns-resize';
  };

  const handleResizeMove = (e) => {
    if (!isResizingRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    const newHeight = Math.max(40, Math.min(400, startHeightRef.current + deltaY));
    onHeightChange?.(track.id, newHeight);
  };

  const handleResizeEnd = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    document.body.style.cursor = 'default';
  };

  const handleTrackDragStart = (e, trackIndex) => {
    if (e.button !== 0) return;
    
    // Don't start track dragging if clicking on interactive elements
    if (e.target.closest('.track-btn') || 
        e.target.closest('.track-fader') || 
        e.target.closest('.track-pan-knob') || 
        e.target.closest('.track-resizer') || 
        e.target.closest('.track-delete-btn') ||
        e.target.closest('.clip')) {
      return;
    }
    
    // e.preventDefault() is removed because it can interfere with other drag operations
    // We only start track dragging if the user moves the mouse while holding down
    isDraggingTrackRef.current = true;
    dragStartIndexRef.current = trackIndex;
    document.body.style.cursor = 'grabbing';
    document.addEventListener('mousemove', handleTrackDragMove);
    document.addEventListener('mouseup', handleTrackDragEnd);
  };

  const handleTrackDragMove = (e) => {
    if (!isDraggingTrackRef.current) return;
    // Track reordering is handled by Timeline component via dataTransfer
  };

  const handleTrackDragEnd = (e) => {
    isDraggingTrackRef.current = false;
    document.body.style.cursor = 'default';
    document.removeEventListener('mousemove', handleTrackDragMove);
    document.removeEventListener('mouseup', handleTrackDragEnd);
    
    // Fire the reorder event
    if (onReorderTrack && dragStartIndexRef.current !== null) {
      onReorderTrack(dragStartIndexRef.current, trackIndex);
    }
    dragStartIndexRef.current = null;
  };

  const handleTrackDragOver = (e) => {
    if (!isDraggingTrackRef.current) return;
    e.preventDefault();
  };

  const setDragOver = (value) => {
    if (isDragOverRef.current === value) return; // already set, skip DOM write
    isDragOverRef.current = value;
    if (trackRootRef.current) {
      if (value) {
        trackRootRef.current.classList.add('drag-over');
      } else {
        trackRootRef.current.classList.remove('drag-over');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    if (rafPending.current) return;
    rafPending.current = true;
    requestAnimationFrame(() => {
      setDragOver(true);
      rafPending.current = false;
    });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Only set to false if we're actually leaving the track element
    const rect = trackRootRef.current.getBoundingClientRect();
    if (e.clientX <= rect.left || e.clientX >= rect.right || e.clientY <= rect.top || e.clientY >= rect.bottom) {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    rafPending.current = false;
    setDragOver(false);
    
    const trackRect = trackRef.current?.getBoundingClientRect();
    if (!trackRect) return;
    
    // Calculate position relative to the track lane (time 0)
    // We don't need to add scrollPosition.x because getBoundingClientRect is viewport-relative
    const dropX = e.clientX - trackRect.left;
    const dropTime = pixelsToTime(dropX);
    
    // Check for external files first
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFileDrop) {
        Array.from(e.dataTransfer.files).forEach(file => {
          onFileDrop(file, track.id, dropTime);
        });
      }
      return;
    }

    // Otherwise check for internal clip move
    let clipId;
    let offsetX = 0;
    
    try {
      const dragDataStr = e.dataTransfer.getData('application/json');
      if (dragDataStr) {
        const dragData = JSON.parse(dragDataStr);
        clipId = dragData.clipId;
        offsetX = dragData.offsetX || 0;
      } else {
        clipId = e.dataTransfer.getData('text/plain');
      }
    } catch(err) {
      clipId = e.dataTransfer.getData('text/plain');
    }

    if (clipId && onClipDrop) {
      // Adjust drop position by the mouse offset inside the clip
      const adjustedDropTime = Math.max(0, pixelsToTime(dropX - offsetX));
      
      console.log('Dropping clip:', clipId, 'on track:', track.id, 'at time:', adjustedDropTime);
      
      // Ensure clipId is passed as its original type if possible, or as a string/number
      // The store handles both if we use == or find the correct type
      onClipDrop(clipId, track.id, adjustedDropTime);
    }
  };

  const handleControlChange = (property, value) => {
    if (onTrackUpdate) {
      onTrackUpdate(track.id, { [property]: value });
    }
  };

  
  const getTrackIcon = () => {
    switch (track.type) {
      case 'audio': 
        return '🌊';
      case 'midi': 
        return '🎹';
      case 'inst': 
        return '🎹';
      default: 
        return '🎵';
    }
  };

  return (
    <div 
      ref={trackRootRef} 
      className={`track track-${track.type} ${isSelected ? 'selected' : ''} ${isDraggingTrackRef.current ? 'dragging' : ''}`}
      onClick={() => onSelect?.(track.id)}
      onMouseDown={(e) => handleTrackDragStart(e, trackIndex)}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div 
        className="track-header"
        style={{ 
          width: `${trackHeaderWidth}px`,
          height: `${trackHeight}px`,
          borderLeft: `4px solid ${track.color || '#5bc4ff'}`
        }}
      >
        <div className="track-index">{track.index || ''}</div>
        
        <div className="track-header-content">
           <div className="track-icon-container">
              {getTrackIcon()}
           </div>
           
           <div className="track-controls-main">
              <div className="track-name-row">
                 <span className="track-name">{track.name}</span>
                 <button 
                   className="track-delete-btn"
                   onClick={(e) => {
                     e.stopPropagation();
                     onTrackDelete?.(track.id);
                   }}
                   title="Delete Track"
                 >
                   ×
                 </button>
              </div>
              
              <div className="track-buttons-row">
                 <div className="msr-group">
                    <button 
                      className={`track-btn mute ${track.isMuted ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleControlChange('isMuted', !track.isMuted);
                      }}
                    >M</button>
                    <button 
                      className={`track-btn solo ${track.isSolo ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleControlChange('isSolo', !track.isSolo);
                      }}
                    >S</button>
                    <button 
                      className={`track-btn record ${track.isArmed ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleControlChange('isArmed', !track.isArmed);
                      }}
                    >R</button>
                 </div>
                 
                 <div className="track-fader-container">
                    <div className="track-fader" onClick={(e) => {
                       e.stopPropagation();
                       const rect = e.currentTarget.getBoundingClientRect();
                       const x = e.clientX - rect.left;
                       const newVolume = Math.max(0, Math.min(1.5, (x / rect.width) * 1.5));
                       handleControlChange('volume', newVolume);
                    }}>
                       <div className="fader-thumb" style={{ left: `${((track.volume ?? 0.7) / 1.5) * 100}%` }}></div>
                    </div>
                 </div>

                 <div className="track-pan-knob" onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const centerY = rect.top + rect.height / 2;
                    const angle = Math.atan2(e.clientY - centerY, e.clientX - rect.left);
                    const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
                    const newPan = (normalizedAngle - 0.5) * 2;
                    handleControlChange('pan', Math.max(-1, Math.min(1, newPan)));
                 }}>
                    <div className="pan-knob-fill" style={{ transform: `rotate(${(track.pan ?? 0) * 135}deg)` }}></div>
                 </div>
              </div>
           </div>
        </div>

        {/* Resizer handle */}
        <div 
          className="track-resizer" 
          onMouseDown={handleResizeStart}
        ></div>
      </div>

      <div 
        ref={trackRef}
        className="track-content"
        style={{ 
          paddingLeft: '0px',
          height: `${trackHeight}px`
        }} // Removed padding for flush look
      >
        {clips.map(clip => (
          <Clip 
            key={clip.id}
            clip={clip}
            pixelsPerSecond={pixelsPerSecond}
            trackHeight={trackHeight}
            onDragStart={onClipDragStart}
            onDragEnd={onClipDrop}
            onSelect={onClipSelect}
            isSelected={selectedClipId === clip.id}
            timeToPixels={timeToPixels}
            pixelsToTime={pixelsToTime}
          />
        ))}
      </div>
    </div>
  );
};

export default Track;
