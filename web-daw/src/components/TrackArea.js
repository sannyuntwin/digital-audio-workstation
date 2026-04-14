import React from 'react';
import Track from './Track';
import './TrackArea.css';

const TrackArea = ({ tracks, selectedTrackId, onTrackSelect }) => {
  return (
    <div className="track-area">
      <div className="track-list">
        {tracks.map((track) => (
          <Track 
            key={track.id}
            track={track}
            onTrackSelect={onTrackSelect}
            isSelected={track.id === selectedTrackId}
          />
        ))}
      </div>
    </div>
  );
};

export default TrackArea;
