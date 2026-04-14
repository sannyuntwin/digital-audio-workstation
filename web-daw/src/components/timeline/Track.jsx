/**
 * Track Component - Individual track row in timeline
 * Handles track header, clips, and drag-drop zones
 */

import React, { useRef } from 'react';
import Clip from './Clip';
import './Track.css';

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
  onFileDrop
}) => {
  const trackRootRef = useRef(null); // for CSS class toggling (no re-render)
  const trackRef = useRef(null);
  const isDragOverRef = useRef(false);
  const rafPending = useRef(false); // requestAnimationFrame throttle flag

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
    if (rafPending.current) return; // skip — RAF already scheduled
    rafPending.current = true;
    requestAnimationFrame(() => {
      setDragOver(true);
      rafPending.current = false;
    });
  };

  const handleDragLeave = (e) => {
    // Only clear if leaving to outside the track root element
    if (trackRootRef.current && trackRootRef.current.contains(e.relatedTarget)) return;
    rafPending.current = false;
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    rafPending.current = false;
    setDragOver(false);
    
    const trackRect = trackRef.current?.getBoundingClientRect();
    if (!trackRect) return;
    const dropX = e.clientX - trackRect.left;
    const dropTime = pixelsToTime(dropX + scrollPosition.x);
    
    // Check for external files first
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onFileDrop) {
        // e.dataTransfer.files is a FileList
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
      const adjustedDropX = dropX - offsetX;
      const adjustedDropTime = Math.max(0, pixelsToTime(adjustedDropX + scrollPosition.x));
      
      // clipId from dataTransfer is a string, but store uses numeric IDs
      onClipDrop(parseFloat(clipId), track.id, adjustedDropTime);
    }
  };

  const handleControlChange = (property, value) => {
    if (onTrackUpdate) {
      onTrackUpdate(track.id, { [property]: value });
    }
  };

  
  return (
    <div ref={trackRootRef} className={`track track-${track.type}`}>
      <div 
        className="track-header"
        style={{ 
          width: `${trackHeaderWidth}px`,
          height: `${trackHeight}px`
        }}
      >
        <div className="track-controls">
           <div className="track-name-row">
              <span className="track-name">{track.name}</span>
           </div>
           
           <div className="track-buttons-row">
              <button 
                className={`track-btn mute ${track.isMuted ? 'active' : ''}`}
                onClick={() => handleControlChange('isMuted', !track.isMuted)}
              >M</button>
              <button 
                className={`track-btn solo ${track.isSolo ? 'active' : ''}`}
                onClick={() => handleControlChange('isSolo', !track.isSolo)}
              >S</button>
              <button className="track-btn record">R</button>
              
              <div className="track-fader-meter">
                 <div className="track-fader">
                    <div className="fader-thumb" style={{ left: `${((track.volume ?? 0.7) / 1.5) * 100}%` }}></div>
                 </div>
                 <div className="track-meter">
                    <div className="meter-fill" style={{ width: '40%' }}></div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div 
        ref={trackRef}
        className="track-content"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
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
