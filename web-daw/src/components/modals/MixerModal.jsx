import React, { useState } from 'react';

// ============ STYLES ============
const modalStyle = {
  width: '90vw',
  height: '80vh',
  maxWidth: '1400px',
  maxHeight: '900px',
  background: 'rgba(8, 12, 18, 0.95)',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const modalHeaderStyle = {
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 20px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.8)'
};

const modalTitleStyle = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#dbeafe',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  fontSize: '24px',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '4px',
  transition: 'all 0.2s ease'
};

const modalBodyStyle = {
  flex: 1,
  padding: '20px',
  overflow: 'auto',
  background: 'linear-gradient(180deg, rgba(11, 17, 29, 0.72) 0%, rgba(8, 12, 20, 0.9) 100%)'
};

const mixerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  gap: '16px'
};

const tracksContainerStyle = {
  display: 'flex',
  gap: '12px',
  paddingBottom: '16px',
  overflowX: 'auto',
  minHeight: '400px'
};

const trackChannelStyle = {
  width: '120px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px 12px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'linear-gradient(180deg, rgba(20, 28, 42, 0.94) 0%, rgba(15, 22, 34, 0.9) 100%)',
  flexShrink: 0
};

const masterChannelStyle = {
  ...trackChannelStyle,
  width: '140px',
  border: '1px solid rgba(96, 165, 250, 0.4)',
  background: 'linear-gradient(180deg, rgba(30, 64, 175, 0.2) 0%, rgba(15, 22, 34, 0.9) 100%)'
};

const trackHeaderStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignItems: 'center'
};

const trackNameStyle = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#eff6ff',
  textAlign: 'center',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const trackTypeStyle = {
  fontSize: '10px',
  color: '#93c5fd',
  textAlign: 'center'
};

const controlsSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const controlGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  alignItems: 'center'
};

const controlLabelStyle = {
  fontSize: '10px',
  color: '#cbd5e1',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const volumeSliderStyle = {
  writingMode: 'bt-lr',
  WebkitAppearance: 'slider-vertical',
  width: '80px',
  height: '100px',
  background: 'transparent',
  outline: 'none',
  cursor: 'pointer'
};

const volumeDisplayStyle = {
  fontSize: '11px',
  color: '#eff6ff',
  fontWeight: 600,
  minWidth: '35px',
  textAlign: 'center'
};

const panKnobStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  border: '2px solid rgba(148, 163, 184, 0.4)',
  background: 'radial-gradient(circle, rgba(30, 64, 175, 0.3) 0%, rgba(15, 23, 42, 0.8) 100%)',
  position: 'relative',
  cursor: 'pointer'
};

const panIndicatorStyle = {
  position: 'absolute',
  width: '2px',
  height: '20px',
  background: '#3b82f6',
  left: '50%',
  top: '5px',
  transformOrigin: 'center 20px',
  transform: 'translateX(-50%)',
  borderRadius: '1px'
};

const panDisplayStyle = {
  fontSize: '10px',
  color: '#cbd5e1',
  fontWeight: 600,
  minWidth: '40px',
  textAlign: 'center'
};

const buttonsRowStyle = {
  display: 'flex',
  gap: '6px',
  justifyContent: 'center'
};

const buttonStyle = {
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: '6px',
  padding: '4px 8px',
  background: 'rgba(15, 23, 42, 0.6)',
  color: '#bfdbfe',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const buttonActiveStyle = {
  ...buttonStyle,
  borderColor: 'rgba(239, 68, 68, 0.6)',
  background: 'rgba(127, 29, 29, 0.3)',
  color: '#fee2e2'
};

const buttonSoloStyle = {
  ...buttonStyle,
  borderColor: 'rgba(250, 204, 21, 0.6)',
  background: 'rgba(161, 98, 7, 0.3)',
  color: '#fef3c7'
};

const buttonSoloActiveStyle = {
  ...buttonSoloStyle,
  borderColor: 'rgba(250, 204, 21, 0.8)',
  background: 'rgba(161, 98, 7, 0.5)',
  color: '#fbbf24'
};

const effectsSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const effectSlotStyle = {
  height: '24px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '4px',
  background: 'rgba(15, 23, 42, 0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '9px',
  color: '#93c5fd',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const effectSlotActiveStyle = {
  ...effectSlotStyle,
  borderColor: 'rgba(96, 165, 250, 0.5)',
  background: 'rgba(30, 64, 175, 0.2)',
  color: '#dbeafe'
};

const sendsSectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const sendRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const sendLabelStyle = {
  fontSize: '9px',
  color: '#93c5fd',
  minWidth: '30px'
};

const sendKnobStyle = {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  background: 'rgba(15, 23, 42, 0.6)',
  position: 'relative',
  cursor: 'pointer'
};

const sendIndicatorStyle = {
  position: 'absolute',
  width: '1px',
  height: '10px',
  background: '#60a5fa',
  left: '50%',
  top: '3px',
  transformOrigin: 'center 10px',
  transform: 'translateX(-50%)'
};

const meterStyle = {
  width: '8px',
  height: '60px',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: '4px',
  background: 'rgba(15, 23, 42, 0.6)',
  position: 'relative',
  overflow: 'hidden'
};

const meterLevelStyle = {
  position: 'absolute',
  bottom: 0,
  width: '100%',
  background: 'linear-gradient(180deg, #ef4444 0%, #f59e0b 70%, #10b981 100%)',
  transition: 'height 0.1s ease'
};

const MixerModal = ({ tracks, onClose }) => {
  const [trackVolumes, setTrackVolumes] = useState({});
  const [trackPans, setTrackPans] = useState({});
  const [trackMutes, setTrackMutes] = useState({});
  const [trackSolos, setTrackSolos] = useState({});
  const [masterVolume, setMasterVolume] = useState(80);
  const [meterLevels, setMeterLevels] = useState({});

  // Initialize track states
  React.useEffect(() => {
    const volumes = {};
    const pans = {};
    const mutes = {};
    const solos = {};
    const levels = {};
    
    tracks.forEach(track => {
      volumes[track.id] = track.volume || 80;
      pans[track.id] = track.pan || 0;
      mutes[track.id] = track.muted || false;
      solos[track.id] = track.solo || false;
      levels[track.id] = Math.random() * 60 + 20;
    });
    
    levels.master = Math.random() * 70 + 10;
    
    setTrackVolumes(volumes);
    setTrackPans(pans);
    setTrackMutes(mutes);
    setTrackSolos(solos);
    setMeterLevels(levels);
  }, [tracks]);

  const formatPanValue = (pan) => {
    if (pan === 0) return 'C';
    return pan > 0 ? `R${Math.abs(pan)}` : `L${Math.abs(pan)}`;
  };

  const getKnobRotation = (value, min = -100, max = 100) => {
    const normalized = (value - min) / (max - min);
    return -135 + (normalized * 270);
  };

  return (
    <div style={modalStyle}>
      <div style={modalHeaderStyle}>
        <h2 style={modalTitleStyle}>Mixer</h2>
        <button
          type="button"
          style={closeBtnStyle}
          onClick={onClose}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            e.target.style.color = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#94a3b8';
          }}
        >
          ×
        </button>
      </div>
      
      <div style={modalBodyStyle}>
        <div style={mixerContainerStyle}>
          <div style={tracksContainerStyle}>
            {tracks.map(track => (
              <div key={track.id} style={trackChannelStyle}>
                <div style={trackHeaderStyle}>
                  <div style={trackNameStyle}>{track.name}</div>
                  <div style={trackTypeStyle}>{track.type.toUpperCase()}</div>
                </div>

                <div style={controlsSectionStyle}>
                  <div style={controlGroupStyle}>
                    <div style={controlLabelStyle}>Volume</div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={trackVolumes[track.id] || 80}
                      onChange={(e) => setTrackVolumes(prev => ({ ...prev, [track.id]: parseInt(e.target.value) }))}
                      style={volumeSliderStyle}
                    />
                    <div style={volumeDisplayStyle}>{trackVolumes[track.id] || 80}%</div>
                  </div>

                  <div style={controlGroupStyle}>
                    <div style={controlLabelStyle}>Pan</div>
                    <div 
                      style={panKnobStyle}
                      onClick={() => {
                        const currentPan = trackPans[track.id] || 0;
                        const newPan = currentPan === 0 ? 50 : currentPan > 0 ? -50 : 0;
                        setTrackPans(prev => ({ ...prev, [track.id]: newPan }));
                      }}
                    >
                      <div 
                        style={{
                          ...panIndicatorStyle,
                          transform: `translateX(-50%) rotate(${getKnobRotation(trackPans[track.id] || 0)}deg)`
                        }}
                      />
                    </div>
                    <div style={panDisplayStyle}>{formatPanValue(trackPans[track.id] || 0)}</div>
                  </div>

                  <div style={buttonsRowStyle}>
                    <button
                      type="button"
                      style={trackMutes[track.id] ? buttonActiveStyle : buttonStyle}
                      onClick={() => setTrackMutes(prev => ({ ...prev, [track.id]: !prev[track.id] }))}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      style={trackSolos[track.id] ? buttonSoloActiveStyle : buttonSoloStyle}
                      onClick={() => setTrackSolos(prev => ({ ...prev, [track.id]: !prev[track.id] }))}
                    >
                      S
                    </button>
                  </div>

                  <div style={controlGroupStyle}>
                    <div style={controlLabelStyle}>Meter</div>
                    <div style={meterStyle}>
                      <div 
                        style={{
                          ...meterLevelStyle,
                          height: `${meterLevels[track.id] || 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={effectsSectionStyle}>
                  <div style={controlLabelStyle}>Insert Effects</div>
                  {['EQ', 'Comp', 'Reverb', 'Delay', 'Chorus'].map(effect => (
                    <div
                      key={effect}
                      style={Math.random() > 0.5 ? effectSlotActiveStyle : effectSlotStyle}
                    >
                      {Math.random() > 0.5 ? effect : '+ ' + effect}
                    </div>
                  ))}
                </div>

                <div style={sendsSectionStyle}>
                  <div style={controlLabelStyle}>Sends</div>
                  {['Reverb', 'Delay'].map(bus => (
                    <div key={bus} style={sendRowStyle}>
                      <div style={sendLabelStyle}>{bus}</div>
                      <div 
                        style={sendKnobStyle}
                        onClick={() => {
                          const currentValue = Math.floor(Math.random() * 100);
                        }}
                      >
                        <div 
                          style={{
                            ...sendIndicatorStyle,
                            transform: `translateX(-50%) rotate(${getKnobRotation(Math.floor(Math.random() * 100))}deg)`
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '9px', color: '#cbd5e1', minWidth: '20px' }}>
                        {Math.floor(Math.random() * 100)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={masterChannelStyle}>
              <div style={trackHeaderStyle}>
                <div style={trackNameStyle}>Master</div>
                <div style={trackTypeStyle}>OUTPUT</div>
              </div>

              <div style={controlsSectionStyle}>
                <div style={controlGroupStyle}>
                  <div style={controlLabelStyle}>Volume</div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={masterVolume}
                    onChange={(e) => setMasterVolume(parseInt(e.target.value))}
                    style={volumeSliderStyle}
                  />
                  <div style={volumeDisplayStyle}>{masterVolume}%</div>
                </div>

                <div style={controlGroupStyle}>
                  <div style={controlLabelStyle}>Meter</div>
                  <div style={meterStyle}>
                    <div 
                      style={{
                        ...meterLevelStyle,
                        height: `${meterLevels.master || 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={effectsSectionStyle}>
                <div style={controlLabelStyle}>Master Effects</div>
                {['Limiter', 'Analyzer'].map(effect => (
                  <div key={effect} style={effectSlotActiveStyle}>
                    {effect}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MixerModal;
