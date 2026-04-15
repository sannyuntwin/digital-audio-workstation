import React from 'react';
import '../index.css';

const Timeline = ({ zoomLevel, currentTime }) => {
  const generateTimeMarkers = () => {
    const markers = [];
    const pixelsPerSecond = 100 * zoomLevel;
    const totalWidth = 2000;
    const seconds = Math.ceil(totalWidth / pixelsPerSecond);
    
    for (let i = 0; i <= seconds; i++) {
      const position = i * pixelsPerSecond;
      const time = `${Math.floor(i / 60)}:${(i % 60).toString().padStart(2, '0')}`;
      markers.push(
        <div 
          key={i} 
          className="time-marker" 
          style={{ left: `${position}px` }}
        >
          <div className="time-marker-line"></div>
          <div className="time-marker-text">{time}</div>
        </div>
      );
    }
    return markers;
  };

  return (
    <div className="timeline">
      <div className="timeline-header">
        <div className="time-ruler">
          {generateTimeMarkers()}
          <div 
            className="playhead" 
            style={{ left: `${currentTime * 100 * zoomLevel}px` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
