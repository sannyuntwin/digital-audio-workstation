import React, { useState } from 'react';
import '../../index.css';

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
          <button className="setting-btn" onClick={() => alert('Track Settings:\n• Track Name\n• Color\n• Input/Output\n• Recording Settings\n• Automation')}>Setting</button>
          <div className="eq-thumbnail">
            <svg viewBox="0 0 40 20">
              <path d="M0,10 Q10,2 20,10 T40,10" fill="none" stroke="#5bc4ff" strokeWidth="1" />
            </svg>
          </div>
        </div>

        <div className="strip-slots">
          {!isMaster && <div className="slot midi-fx" onClick={() => alert('MIDI FX Plugin Slot')}>MIDI FX</div>}
          <div className="slot instrument" onClick={() => !isMaster && alert('Instrument Plugin Slot')}>{isMaster ? '' : 'Kontakt 5'}</div>
          <div className="slot audio-fx active" onClick={() => alert('Channel EQ Plugin')}>Channel EQ</div>
          <div className="slot audio-fx active" onClick={() => alert('Compressor Plugin')}>Compressor</div>
          <div className="slot audio-fx" onClick={() => alert('FF Pro-MB Plugin')}>FF Pro-MB</div>
          <div className="slot audio-fx" onClick={() => alert('CLA Unplug Plugin')}>CLA Unplug</div>
          <div className="slot audio-fx" onClick={() => alert('FF Simplon Plugin')}>FF Simplon</div>
          <div className="slot audio-fx" onClick={() => alert('Tape Delay Plugin')}>Tape Delay</div>
          <div className="slot audio-fx empty" onClick={() => alert('Add Audio FX Plugin')}></div>
          <div className="slot send" onClick={() => alert('Send Effects')}>Send</div>
          <div className="slot bus" onClick={() => alert('Bus Routing')}>Bus 12</div>
          <div className="slot output" onClick={() => alert('Output Routing')}>{isMaster ? 'Stereo Out' : 'Stereo Out'}</div>
          <div className="slot group" onClick={() => alert('Track Grouping')}>Group</div>
          <div className="slot automation" onClick={() => alert('Automation Mode')}>Read</div>
        </div>

        <div className="strip-controls">
          <div className="pan-section">
            <div className="pan-knob-large" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const centerY = rect.top + rect.height / 2;
              const angle = Math.atan2(e.clientY - centerY, e.clientX - rect.left);
              const normalizedAngle = (angle + Math.PI) / (2 * Math.PI);
              const newPan = (normalizedAngle - 0.5) * 2;
              handleControlChange('pan', Math.max(-1, Math.min(1, newPan)));
            }}>
              <div className="pan-knob-logic-large">
                <div className="pan-pos-large" style={{ transform: `rotate(${pan * 135}deg)` }}></div>
              </div>
              <div className="pan-readout">
                 <span className="pan-label l">L</span>
                 <span className="pan-value">{pan === 0 ? 'C' : (pan < 0 ? 'L' + Math.abs(Math.round(pan * 64)) : 'R' + Math.round(pan * 63))}</span>
                 <span className="pan-label r">R</span>
              </div>
            </div>
          </div>

          <div className="fader-section">
            <div className="fader-db-scale">
              <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span><span>30</span>
            </div>
            <div className="fader-container" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const y = rect.bottom - e.clientY;
              const newVolume = Math.max(0, Math.min(1.5, (y / rect.height) * 1.5));
              handleControlChange('volume', newVolume);
            }}>
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
