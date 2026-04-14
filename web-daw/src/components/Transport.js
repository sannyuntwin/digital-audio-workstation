import React, { useState } from 'react';
import './Transport.css';

const Transport = ({ isPlaying, onPlay, onStop, onRecord, bpm, onBpmChange }) => {
  const [isRecording, setIsRecording] = useState(false);

  const handleRecord = () => {
    setIsRecording(!isRecording);
    onRecord();
  };

  return (
    <div className="transport">
      <div className="transport-controls">
        <button 
          className={`transport-btn ${isPlaying ? 'playing' : ''}`}
          onClick={onPlay}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        <button className="transport-btn" onClick={onStop}>
          ⏹️
        </button>
        <button 
          className={`transport-btn record ${isRecording ? 'recording' : ''}`}
          onClick={handleRecord}
        >
          🔴
        </button>
      </div>
      
      <div className="transport-info">
        <div className="bpm-control">
          <label>BPM:</label>
          <input 
            type="number" 
            value={bpm} 
            onChange={(e) => onBpmChange(parseInt(e.target.value) || 120)}
            min="60" 
            max="200"
          />
        </div>
        <div className="time-display">
          <span>00:00:00</span>
        </div>
      </div>
    </div>
  );
};

export default Transport;
