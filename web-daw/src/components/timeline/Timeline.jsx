/**
 * Timeline Component - Main timeline with tracks and clips
 * Provides grid system, time ruler, and track management
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Track from './Track';
import { getProjectStore } from '../../store/projectStore';
import './Timeline.css';

const Timeline = ({ 
  tracks = [], 
  clips = [], 
  zoomLevel = 1, 
  currentTime = 0,
  onClipMove,
  onClipSelect,
  selectedClipId = null,
  bpm = 120,
  onTrackUpdate,
  onTrackAdd,
  onTrackDelete,
  onFileDrop,
  onSplitClip,
  onSeek
}) => {
  const timelineRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  const pixelsPerSecond = 100 * zoomLevel;
  const pixelsPerBeat = (pixelsPerSecond * 60) / bpm;
  const pixelsPerBar = pixelsPerBeat * 4;
  
  const trackHeight = 80; // Taller tracks like Logic
  const timeRulerHeight = 40;
  const trackHeaderWidth = 250;

  const playheadTriangleRef = useRef(null);
  const playheadLineRef = useRef(null);

  const timeToPixels = useCallback((time) => {
    return time * pixelsPerSecond;
  }, [pixelsPerSecond]);

  const pixelsToTime = useCallback((pixels) => {
    return Math.max(0, pixels / pixelsPerSecond);
  }, [pixelsPerSecond]);

  const generateTimeMarkers = useCallback(() => {
    const markers = [];
    const totalBars = 100; // Show 100 bars for now
    
    for (let i = 0; i < totalBars; i++) {
      const position = i * pixelsPerBar;
      markers.push({
        id: `bar-${i + 1}`,
        position,
        label: i + 1,
        isMajor: true
      });
      
      // Sub-divisions (beats)
      for (let j = 1; j < 4; j++) {
        markers.push({
          id: `bar-${i + 1}-beat-${j + 1}`,
          position: position + (j * pixelsPerBeat),
          label: '',
          isMajor: false
        });
      }
    }
    
    return markers;
  }, [pixelsPerBar, pixelsPerBeat]);

  // High-performance playhead animation subscription
  useEffect(() => {
    const store = getProjectStore();
    const unsubscribe = store.subscribeTime((time) => {
      // Direct DOM manipulation bypassing React render cycle
      const px = timeToPixels(time);
      if (playheadTriangleRef.current) {
        playheadTriangleRef.current.style.left = `${px}px`;
      }
      if (playheadLineRef.current) {
        playheadLineRef.current.style.left = `${px}px`;
      }
    });
    return unsubscribe;
  }, [timeToPixels]);

  // Ruler seek: click or drag on the ruler to move playhead
  const rulerRef = useRef(null);
  const isScrubbing = useRef(false);

  const seekToRulerX = useCallback((clientX) => {
    const rulerEl = rulerRef.current;
    if (!rulerEl) return;
    const rect = rulerEl.getBoundingClientRect();
    const x = clientX - rect.left + scrollPosition.x;
    const time = Math.max(0, pixelsToTime(x));
    onSeek?.(time);
    // Instant DOM feedback
    const px = timeToPixels(time);
    if (playheadTriangleRef.current) playheadTriangleRef.current.style.left = `${px}px`;
    if (playheadLineRef.current) playheadLineRef.current.style.left = `${px}px`;
  }, [scrollPosition.x, pixelsToTime, timeToPixels, onSeek]);

  const handleRulerMouseDown = useCallback((e) => {
    isScrubbing.current = true;
    seekToRulerX(e.clientX);
    const onMove = (ev) => { if (isScrubbing.current) seekToRulerX(ev.clientX); };
    const onUp = () => { isScrubbing.current = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [seekToRulerX]);

  const handleScroll = useCallback((e) => {
    setScrollPosition({ x: e.target.scrollLeft, y: e.target.scrollTop });
  }, []);

  const timeMarkers = generateTimeMarkers();

  return (
    <div className="timeline" ref={timelineRef}>
      {/* 1. Arrangement Sub-Toolbar */}
      <div className="arrangement-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-menu">
            <span>Edit</span>
            <span>Functions</span>
            <span>View</span>
          </div>
          <div className="toolbar-spacer"></div>
          <div className="toolbar-controls">
            <button className="tb-btn" onClick={onSplitClip} title="Split clip at playhead (Ctrl+E)">✂ Split</button>
            <button className="tb-btn">Snap: Smart</button>
            <button className="tb-btn">Drag: No Overlap</button>
          </div>
        </div>
        <div className="toolbar-right">
          <div className="zoom-controls">
             <div className="zoom-slider h"></div>
             <div className="zoom-slider v"></div>
          </div>
        </div>
      </div>

      <div className="time-ruler" style={{ height: `${timeRulerHeight}px` }}>
        <div className="time-ruler-track-header" style={{ width: `${trackHeaderWidth}px` }}>
          <div className="track-add-btns">
            <button className="add-btn" onClick={() => onTrackAdd?.('audio')}>+</button>
            <button className="add-btn">⬇</button>
            <button className="add-btn">S</button>
          </div>
        </div>
        
        <div 
          className="time-ruler-content"
          ref={rulerRef}
          style={{ transform: `translateX(-${scrollPosition.x}px)`, cursor: 'pointer' }}
          onMouseDown={handleRulerMouseDown}
        >
          {timeMarkers.map((marker) => (
            <div
              key={marker.id}
              className={`time-marker ${marker.isMajor ? 'major' : 'minor'}`}
              style={{ left: `${marker.position}px` }}
            >
              <div className="marker-line"></div>
              {marker.isMajor && (
                <div className="marker-text">{marker.label}</div>
              )}
            </div>
          ))}
          
          <div
            className="playhead"
            ref={playheadTriangleRef}
            style={{ left: `${timeToPixels(currentTime)}px` }}
          >
            <div className="playhead-triangle"></div>
          </div>
        </div>
      </div>

      <div className="tracks-container" onScroll={handleScroll}>
        <div className="tracks-list">
          {tracks.map((track) => (
            <Track
              key={track.id}
              track={track}
              clips={clips.filter(clip => clip.trackId === track.id)}
              trackHeight={trackHeight}
              trackHeaderWidth={trackHeaderWidth}
              pixelsPerSecond={pixelsPerSecond}
              timeToPixels={timeToPixels}
              pixelsToTime={pixelsToTime}
              scrollPosition={scrollPosition}
              onClipDragStart={() => {}}
              onClipDrop={(cid, tid, time) => onClipMove?.(cid, tid, time)}
              onClipSelect={onClipSelect}
              selectedClipId={selectedClipId}
              onTrackUpdate={onTrackUpdate}
              onTrackDelete={onTrackDelete}
              onFileDrop={onFileDrop}
            />
          ))}
        </div>
      </div>

      <div 
        className="grid-overlay" 
        style={{ 
          left: `${trackHeaderWidth}px`,
          transform: `translateX(-${scrollPosition.x}px)` 
        }}
      >
        {timeMarkers.filter(m => m.isMajor).map((marker) => (
          <div
            key={`grid-${marker.id}`}
            className="grid-line vertical"
            style={{ 
              left: `${marker.position}px`,
              top: `${timeRulerHeight}px`,
              height: `100%`
            }}
          />
        ))}

        {/* Full-height Playhead Line */}
        <div 
          className="playhead-line"
          ref={playheadLineRef}
          style={{ 
            left: `${timeToPixels(currentTime)}px`,
            top: 0,
            height: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default Timeline;
