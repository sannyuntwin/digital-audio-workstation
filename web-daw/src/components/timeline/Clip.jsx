/**
 * Clip Component - Draggable clip representation on timeline
 * Handles drag-and-drop functionality and clip selection
 */

import React, { useRef } from 'react';
import '../../index.css';

const Clip = ({ 
  clip, 
  pixelsPerSecond, 
  trackHeight, 
  isSelected = false,
  onDragStart,
  onDragEnd,
  onSelect,
  timeToPixels,
  pixelsToTime
}) => {
  const clipRef = useRef(null);

  const clipWidth = (clip.duration || 0) * pixelsPerSecond;
  const clipLeft = timeToPixels(clip.startTime);
  const clipTop = 4;

  const handleDragStart = (e) => {
    e.stopPropagation();
    onSelect?.(clip.id);
    
    // Calculate exact pixel offset of the mouse inside the clip
    const rect = clipRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    
    // Store exact pixel offset + clip id
    const dragData = JSON.stringify({ clipId: clip.id, offsetX });
    
    e.dataTransfer.setData('application/json', dragData);
    e.dataTransfer.setData('text/plain', clip.id.toString());
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(clip.id);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect?.(clip.id);
  };

  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startWidth = clipWidth;
    const startTime = clip.startTime;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaTime = deltaX / pixelsPerSecond;
      
      if (direction === 'left') {
        // Resize from left - change start time and duration
        const newStartTime = Math.max(0, startTime + deltaTime);
        const newDuration = startWidth / pixelsPerSecond - deltaTime;
        
        if (newDuration > 0.1) { // Minimum duration
          // TODO: Update clip with new start time and duration
          console.log('Resize left:', { newStartTime, newDuration });
        }
      } else {
        // Resize from right - change duration only
        const newDuration = Math.max(0.1, startWidth / pixelsPerSecond + deltaTime);
        // TODO: Update clip with new duration
        console.log('Resize right:', { newDuration });
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getClipIcon = () => {
    switch (clip.type) {
      case 'audio': return '〰️';
      case 'midi': return '🎹';
      default: return '📁';
    }
  };

  return (
    <div
      ref={clipRef}
      className={`clip clip-${clip.type} ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${clipLeft}px`,
        top: `${clipTop}px`,
        width: `${clipWidth}px`,
        height: `${trackHeight - 8}px`,
      }}
      draggable={true}
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <div className="clip-header-bar">
        <span className="clip-icon">{getClipIcon()}</span>
        <span className="clip-name">{clip.name}</span>
      </div>
      
      <div className="clip-content">
        {clip.type === 'audio' && (
          <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 100">
            {clip.peaks ? (
              <path 
                className="waveform-path"
                d={(function() {
                  const mid = 50;
                  const peaks = clip.peaks;
                  let upper = `M0,${mid} `;
                  let lower = ``;
                  
                  peaks.forEach((peak, i) => {
                    const x = (i / (peaks.length - 1)) * 200;
                    const yMax = mid - (peak[1] * mid * 0.8); // 0.8 to leave some padding
                    const yMin = mid - (peak[0] * mid * 0.8);
                    upper += `L${x.toFixed(1)},${yMax.toFixed(1)} `;
                    lower = `L${x.toFixed(1)},${yMin.toFixed(1)} ` + lower;
                  });
                  
                  return upper + lower + 'Z';
                })()}
                vectorEffect="non-scaling-stroke"
              />
            ) : (
              <path d="M0,50 L200,50" className="waveform-path" />
            )}
          </svg>
        )}
        
        {clip.type === 'midi' && (
          <div className="midi-notes-logic">
            {[10, 25, 40, 55, 70, 85].map((x, i) => (
              <div 
                key={x} 
                className="midi-note-box" 
                style={{
                  left: `${x}%`, 
                  top: `${(i * 13) % 40 + 20}%`, 
                  width: `${8 + (i % 3) * 5}%`
                }} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="clip-handle left" onMouseDown={(e) => handleResizeStart(e, 'left')} />
      <div className="clip-handle right" onMouseDown={(e) => handleResizeStart(e, 'right')} />
    </div>
  );
};

export default Clip;
