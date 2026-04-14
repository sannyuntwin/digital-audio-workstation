/**
 * Transport Component - Playback controls and transport information
 * Provides play, stop, record controls and displays current time/BPM
 */

import React, { useRef, useEffect } from 'react';
import { useProjectStore, getProjectStore } from '../../store/projectStore';
import './Transport.css';

const Transport = ({ audioEngine, onPlay, onStop, isPlaying }) => {
  const [state, setState] = useProjectStore();
  
  const barRef = useRef(null);
  const beatRef = useRef(null);

  const {
    isRecording,
    bpm,

    timeSignature
  } = state;

  const handlePlayPause = () => {
    if (isPlaying) {
      onStop?.();
    } else {
      onPlay?.();
    }
  };

  const handleStop = () => {
    onStop?.();
  };

  const handleRecord = () => {
    setState({ isRecording: !isRecording });
  };

  // Logic LCD logic
  const currentBPM = bpm || 115;
  const beatsPerBar = timeSignature?.numerator || 4;
  
  // High-performance LCD subscription
  useEffect(() => {
    const store = getProjectStore();
    const unsubscribe = store.subscribeTime((time) => {
      const totalBeats = (time * currentBPM) / 60;
      const updatedBar = Math.floor(totalBeats / beatsPerBar) + 1;
      const updatedBeat = Math.floor(totalBeats % beatsPerBar) + 1;
      
      if (barRef.current) barRef.current.innerText = updatedBar.toString().padStart(3, '0');
      if (beatRef.current) beatRef.current.innerText = updatedBeat.toString();
    });
    return unsubscribe;
  }, [currentBPM, beatsPerBar]);

  // Initial values for SSR/first render
  const initialTotalBeats = ((state.currentTime || 0) * currentBPM) / 60;
  const initialBar = Math.floor(initialTotalBeats / beatsPerBar) + 1;
  const initialBeat = Math.floor(initialTotalBeats % beatsPerBar) + 1;

  return (
    <div className="transport">
      {/* 1. Left Section: Sidebar & Library Tools */}
      <div className="transport-left">
        <div className="utility-group">
          <button className="util-btn active" title="Inspector">i</button>
          <button className="util-btn" title="Quick Help">?</button>
        </div>
        <div className="utility-group">
          <button className="util-btn" title="Toolbar">⚙️</button>
          <button className="util-btn" title="Smart Controls">🎛️</button>
          <button className="util-btn" title="Mixer">🎚️</button>
          <button className="util-btn" title="Editors">✂️</button>
        </div>
      </div>

      {/* 2. Center Section: Playback & LCD */}
      <div className="transport-center">
        <div className="playback-controls">
          <button className="playback-btn" title="Rewind">⏪</button>
          <button className="playback-btn" title="Forward">⏩</button>
          <button className="playback-btn" onClick={handleStop} title="Stop">■</button>
          <button className={`playback-btn ${isPlaying ? 'active play' : ''}`} onClick={handlePlayPause} title="Play">▶</button>
          <button className={`playback-btn pause`} onClick={handlePlayPause} title="Pause">Ⅱ</button>
          <button className={`playback-btn ${isRecording ? 'active record' : ''}`} onClick={handleRecord} title="Record">●</button>
        </div>

        <div className="logic-lcd">
          <div className="lcd-main">
            <div className="lcd-section bar-beat">
              <span className="lcd-value" ref={barRef}>{initialBar.toString().padStart(3, '0')}</span>
              <span className="lcd-label">BAR</span>
              <span className="lcd-value small" ref={beatRef}>{initialBeat}</span>
              <span className="lcd-label">BEAT</span>
            </div>
            <div className="lcd-section project-info">
              <div className="info-row">
                <span className="lcd-value silver">{currentBPM}</span>
                <span className="lcd-label sm">KEEP</span>
                <span className="lcd-label sm">TEMPO</span>
              </div>
              <div className="info-row">
                <span className="lcd-value silver">{beatsPerBar}/{timeSignature?.denominator || 4}</span>
                <span className="lcd-label sm">/ 4</span>
              </div>
            </div>
            <div className="lcd-section key-chord">
              <span className="lcd-value blue">Cmaj</span>
              <span className="lcd-label">CHORD</span>
            </div>
          </div>
        </div>

        <div className="utility-group">
          <button className="util-btn" title="Solo">S</button>
        </div>
      </div>

      {/* 3. Right Section: Metronome & Master */}
      <div className="transport-right">
        <div className="utility-group">
          <button className="util-btn" title="Metronome">1234</button>
          <button className="util-btn" title="Count-in">🔔</button>
        </div>
        
        <div className="master-volume-section">
          <div className="master-fader-container">
             <input type="range" min="0" max="1.5" step="0.01" className="master-vol-slider" />
             <div className="master-meters">
                <div className="m-lane l"><div className="m-fill" style={{height: '60%'}}></div></div>
                <div className="m-lane r"><div className="m-fill" style={{height: '58%'}}></div></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transport;
