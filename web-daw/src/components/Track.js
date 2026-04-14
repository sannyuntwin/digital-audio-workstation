import React from 'react';
import './Track.css';

const Track = ({ track, onTrackSelect, isSelected }) => {

  return (
    <div className={`track ${isSelected ? 'selected' : ''}`}>
      <div className="track-header">
        <div className="track-info">
          <div className="track-name">{track.name}</div>
          <div className="track-type">{track.type}</div>
        </div>
        <div className="track-controls">
          <button className="track-btn mute">
            {track.isMuted ? '🔇' : '🔊'}
          </button>
          <button className="track-btn solo">
            S
          </button>
          <button className="track-btn delete">
            ×
          </button>
        </div>
      </div>
      <div className="track-lane">
        <div className="track-clips">
          {track.clips.map((clip, index) => (
            <div 
              key={index} 
              className="clip"
              style={{
                left: `${clip.start * 100}px`,
                width: `${(clip.end - clip.start) * 100}px`
              }}
            >
              <div className="clip-content">
                {clip.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Track;
