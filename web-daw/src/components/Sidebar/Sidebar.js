import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  tracks = [], 
  selectedTrackId = null,
  onTrackUpdate,
  onTrackAdd,
}) => {
  const [collapsed, setCollapsed] = useState({ region: false, track: false });
  const selectedTrack = tracks.find(t => t.id === selectedTrackId);
  const trackName = selectedTrack ? selectedTrack.name : 'Piano';

  const toggleSection = (section) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleControlChange = (property, value) => {
    if (selectedTrackId && onTrackUpdate) {
      onTrackUpdate(selectedTrackId, { [property]: value });
    }
  };

  const ChannelStrip = ({ name, data, isMaster = false, icon = '🎹' }) => {
    const vol = data?.volume ?? 0.7;
    const pan = data?.pan ?? 0;

    return (
      <div className={`channel-strip ${isMaster ? 'master' : ''}`}>
        <div className="strip-header">
          <button className="setting-btn">Setting</button>
          <div className="eq-thumbnail">
            <svg viewBox="0 0 40 20">
              <path d="M0,10 Q10,2 20,10 T40,10" fill="none" stroke="#5bc4ff" strokeWidth="1" />
            </svg>
          </div>
        </div>

        <div className="strip-slots">
          {!isMaster && <div className="slot midi-fx">MIDI FX</div>}
          <div className="slot instrument">{isMaster ? '' : 'Kontakt 5'}</div>
          <div className="slot audio-fx active">Channel EQ</div>
          <div className="slot audio-fx active">Compressor</div>
          <div className="slot audio-fx">FF Pro-MB</div>
          <div className="slot audio-fx">CLA Unplug</div>
          <div className="slot audio-fx">FF Simplon</div>
          <div className="slot audio-fx">Tape Delay</div>
          <div className="slot audio-fx empty"></div>
          <div className="slot send">Send</div>
          <div className="slot bus">Bus 12</div>
          <div className="slot output">{isMaster ? 'Stereo Out' : 'Stereo Out'}</div>
          <div className="slot group">Group</div>
          <div className="slot automation">Read</div>
        </div>

        <div className="strip-controls">
          <div className="pan-section">
            <span className="pan-label l">L</span>
            <div className="pan-knob-container">
              <div className="pan-knob-logic">
                <div className="pan-pos" style={{ transform: `rotate(${pan * 135}deg)` }}></div>
              </div>
            </div>
            <span className="pan-label r">R</span>
          </div>

          <div className="fader-section">
            <div className="fader-db-scale">
              <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span><span>30</span>
            </div>
            <div className="fader-container">
              <div className="fader-track">
                <div className="fader-handle" style={{ bottom: `${(vol / 1.5) * 100}%` }}></div>
              </div>
            </div>
            <div className="meters-container">
              <div className="meter-lane l"><div className="meter-fill" style={{ height: '40%' }}></div></div>
              <div className="meter-lane r"><div className="meter-fill" style={{ height: '38%' }}></div></div>
            </div>
          </div>

          <div className="db-readout">{(vol > 1 ? '+' : '') + (20 * Math.log10(vol || 0.0001)).toFixed(1)}</div>
        </div>

        <div className="strip-footer">
          <div className="strip-name">{isMaster ? 'Stereo Out' : name}</div>
          <div className="strip-icon">{isMaster ? '🔊' : icon}</div>
        </div>
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <div className="inspector-info">
        <div className={`info-section ${collapsed.region ? 'collapsed' : ''}`}>
          <div className="info-header" onClick={() => toggleSection('region')}>
            <span className="arrow">▶</span> Region: 8 selected
          </div>
          {!collapsed.region && (
            <div className="info-body">
              {/* Region settings could go here */}
            </div>
          )}
        </div>
        
        <div className={`info-section ${collapsed.track ? 'collapsed' : ''}`}>
          <div className="info-header" onClick={() => toggleSection('track')}>
            <span className="arrow">▶</span> Track: {trackName}
          </div>
          {!collapsed.track && (
            <div className="info-body">
              {/* Track settings could go here */}
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-main">
        <ChannelStrip name={trackName} data={selectedTrack} icon={selectedTrack?.type === 'audio' ? '🎵' : '🎹'} />
        <ChannelStrip name="Stereo Out" isMaster={true} />
      </div>
    </aside>
  );
};

export default Sidebar;
