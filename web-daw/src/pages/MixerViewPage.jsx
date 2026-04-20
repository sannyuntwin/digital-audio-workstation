import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DAWToolbar from '../components/DAWToolbar';
import audioEngine from '../audio/AudioEngine';

// ============ STYLES ============
const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  padding: '12px',
  background: 'radial-gradient(circle at 15% 0%, #2a3f5f 0%, #131722 48%, #0d1118 100%)',
  color: '#f5f7fa',
  fontFamily: '"Avenir Next", "SF Pro Display", "Segoe UI", sans-serif'
};

const workspaceFrameStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '16px',
  border: '1px solid rgba(148, 163, 184, 0.26)',
  background: 'rgba(8, 12, 18, 0.82)',
  boxShadow: '0 28px 52px rgba(0, 0, 0, 0.46)',
  backdropFilter: 'blur(6px)',
  overflow: 'hidden'
};

const mixerContainerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  background: 'linear-gradient(180deg, rgba(11, 17, 29, 0.72) 0%, rgba(8, 12, 20, 0.9) 100%)',
  overflowX: 'auto'
};

const mixerHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
};

const mixerTitleStyle = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#dbeafe',
  letterSpacing: '0.5px',
  textTransform: 'uppercase'
};

const viewToggleStyle = {
  display: 'flex',
  gap: '8px'
};

const toggleBtnStyle = {
  border: '1px solid rgba(148, 163, 184, 0.28)',
  borderRadius: '8px',
  padding: '8px 16px',
  background: 'rgba(15, 23, 42, 0.4)',
  color: '#bfdbfe',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const toggleBtnActiveStyle = {
  ...toggleBtnStyle,
  borderColor: 'rgba(96, 165, 250, 0.65)',
  background: 'rgba(30, 64, 175, 0.35)',
  color: '#eff6ff'
};

const tracksContainerStyle = {
  display: 'flex',
  gap: '16px',
  minWidth: 'max-content',
  paddingBottom: '20px'
};

const trackChannelStyle = {
  width: '120px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px 12px',
  borderRadius: '12px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'linear-gradient(180deg, rgba(20, 28, 42, 0.94) 0%, rgba(15, 22, 34, 0.9) 100%)'
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

const defaultEffects = ['EQ', 'Comp', 'Reverb', 'Delay', 'Chorus'];
const sendBuses = ['Reverb', 'Delay'];

const MixerViewPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [projectName] = useState('Untitled Project');
  const [tracks, setTracks] = useState([
    { id: 1, name: 'Kick Drum', type: 'audio', volume: 80, pan: 0, muted: false, solo: false, armed: false, effects: ['EQ', 'Comp'], sends: { Reverb: 20, Delay: 0 } },
    { id: 2, name: 'Snare', type: 'audio', volume: 75, pan: 0, muted: false, solo: false, armed: false, effects: ['EQ'], sends: { Reverb: 35, Delay: 10 } },
    { id: 3, name: 'Hi-Hat', type: 'audio', volume: 70, pan: -20, muted: false, solo: false, armed: false, effects: [], sends: { Reverb: 15, Delay: 5 } },
    { id: 4, name: 'Bass', type: 'audio', volume: 85, pan: 0, muted: false, solo: false, armed: false, effects: ['EQ', 'Comp'], sends: { Reverb: 0, Delay: 0 } },
    { id: 5, name: 'Lead Synth', type: 'midi', volume: 65, pan: 30, muted: false, solo: false, armed: false, effects: ['Reverb', 'Delay'], sends: { Reverb: 40, Delay: 25 } },
    { id: 6, name: 'Pad', type: 'midi', volume: 60, pan: -10, muted: false, solo: false, armed: false, effects: ['Reverb', 'Chorus'], sends: { Reverb: 50, Delay: 15 } },
  ]);

  const [masterVolume, setMasterVolume] = useState(80);
  const [meterLevels, setMeterLevels] = useState({});
  const [currentTime] = useState('00:00:00');
  const [bpm] = useState(120);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize meter levels
  useEffect(() => {
    const initialLevels = {};
    tracks.forEach(track => {
      initialLevels[track.id] = Math.random() * 30 + 10;
    });
    initialLevels.master = Math.random() * 40 + 20;
    setMeterLevels(initialLevels);
  }, [tracks]);

  // Simulate meter updates
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setMeterLevels(prev => {
        const newLevels = { ...prev };
        tracks.forEach(track => {
          if (!track.muted && (track.solo || !tracks.some(t => t.solo))) {
            newLevels[track.id] = Math.random() * 60 + 20;
          } else {
            newLevels[track.id] = 0;
          }
        });
        newLevels.master = Math.random() * 70 + 10;
        return newLevels;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, tracks]);

  const handleVolumeChange = (trackId, volume) => {
    if (trackId === 'master') {
      setMasterVolume(volume);
      audioEngine.setMasterVolume(volume);
    } else {
      setTracks(prev => prev.map(track => 
        track.id === trackId ? { ...track, volume } : track
      ));
    }
  };

  const handlePanChange = (trackId, pan) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, pan } : track
    ));
  };

  const handleMuteToggle = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  };

  const handleSoloToggle = (trackId) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  const handleEffectToggle = (trackId, effect) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        const effects = track.effects.includes(effect)
          ? track.effects.filter(e => e !== effect)
          : [...track.effects, effect];
        return { ...track, effects };
      }
      return track;
    }));
  };

  const handleSendChange = (trackId, bus, value) => {
    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          sends: { ...track.sends, [bus]: value }
        };
      }
      return track;
    }));
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      audioEngine.init();
      audioEngine.play();
    } else {
      audioEngine.stop();
    }
  };

  const formatPanValue = (pan) => {
    if (pan === 0) return 'C';
    return pan > 0 ? `R${Math.abs(pan)}` : `L${Math.abs(pan)}`;
  };

  const getKnobRotation = (value, min = -100, max = 100) => {
    const normalized = (value - min) / (max - min);
    return -135 + (normalized * 270); // -135deg to +135deg
  };

  const getSendKnobRotation = (value) => {
    return getKnobRotation(value, 0, 100);
  };

  return (
    <div style={pageStyle}>
      <div style={workspaceFrameStyle}>
        <DAWToolbar
          projectName={projectName}
          isPlaying={isPlaying}
          isRecording={false}
          currentTime={currentTime}
          bpm={bpm}
          zoom={100}
          metronomeEnabled={false}
          loopEnabled={false}
          punchInEnabled={false}
          canUndo={false}
          canRedo={false}
          activeTool="select"
          snapGrid={0.25}
          timeSignature="4/4"
          masterVolume={masterVolume}
          onPlay={handlePlay}
          onStop={() => setIsPlaying(false)}
          onRecord={() => {}}
          onRewind={() => {}}
          onFastForward={() => {}}
          onSkipToStart={() => {}}
          onSkipToEnd={() => {}}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onZoomReset={() => {}}
          onZoomToFit={() => {}}
          onMetronomeToggle={() => {}}
          onLoopToggle={() => {}}
          onPunchInToggle={() => {}}
          onUndo={() => {}}
          onRedo={() => {}}
          onToolChange={() => {}}
          onCut={() => {}}
          onCopy={() => {}}
          onPaste={() => {}}
          onSnapGridChange={() => {}}
          onTapTempo={() => {}}
          onTimeSignatureChange={() => {}}
          onQuantize={() => {}}
          onMasterVolumeChange={handleVolumeChange}
          onSave={() => {}}
          onExport={() => {}}
          saveStatus="idle"
        />

        <div style={mixerContainerStyle}>
          <div style={mixerHeaderStyle}>
            <h1 style={mixerTitleStyle}>Mixer View</h1>
            <div style={viewToggleStyle}>
              <button
                type="button"
                style={toggleBtnStyle}
                onClick={() => navigate(`/daw/${projectId}`)}
              >
                Arrangement View
              </button>
              <button
                type="button"
                style={toggleBtnActiveStyle}
              >
                Mixer View
              </button>
            </div>
          </div>

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
                      value={track.volume}
                      onChange={(e) => handleVolumeChange(track.id, parseInt(e.target.value))}
                      style={volumeSliderStyle}
                    />
                    <div style={volumeDisplayStyle}>{track.volume}%</div>
                  </div>

                  <div style={controlGroupStyle}>
                    <div style={controlLabelStyle}>Pan</div>
                    <div 
                      style={panKnobStyle}
                      onClick={() => {
                        const newPan = track.pan === 0 ? 50 : track.pan > 0 ? -50 : 0;
                        handlePanChange(track.id, newPan);
                      }}
                    >
                      <div 
                        style={{
                          ...panIndicatorStyle,
                          transform: `translateX(-50%) rotate(${getKnobRotation(track.pan)}deg)`
                        }}
                      />
                    </div>
                    <div style={panDisplayStyle}>{formatPanValue(track.pan)}</div>
                  </div>

                  <div style={buttonsRowStyle}>
                    <button
                      type="button"
                      style={track.muted ? buttonActiveStyle : buttonStyle}
                      onClick={() => handleMuteToggle(track.id)}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      style={track.solo ? buttonSoloActiveStyle : buttonSoloStyle}
                      onClick={() => handleSoloToggle(track.id)}
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
                  {defaultEffects.map(effect => (
                    <div
                      key={effect}
                      style={track.effects.includes(effect) ? effectSlotActiveStyle : effectSlotStyle}
                      onClick={() => handleEffectToggle(track.id, effect)}
                    >
                      {track.effects.includes(effect) ? effect : '+ ' + effect}
                    </div>
                  ))}
                </div>

                <div style={sendsSectionStyle}>
                  <div style={controlLabelStyle}>Sends</div>
                  {sendBuses.map(bus => (
                    <div key={bus} style={sendRowStyle}>
                      <div style={sendLabelStyle}>{bus}</div>
                      <div 
                        style={sendKnobStyle}
                        onClick={() => {
                          const currentValue = track.sends[bus];
                          const newValue = currentValue === 0 ? 50 : currentValue >= 100 ? 0 : currentValue + 25;
                          handleSendChange(track.id, bus, newValue);
                        }}
                      >
                        <div 
                          style={{
                            ...sendIndicatorStyle,
                            transform: `translateX(-50%) rotate(${getSendKnobRotation(track.sends[bus])}deg)`
                          }}
                        />
                      </div>
                      <div style={{ fontSize: '9px', color: '#cbd5e1', minWidth: '20px' }}>
                        {track.sends[bus]}
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
                    onChange={(e) => handleVolumeChange('master', parseInt(e.target.value))}
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

export default MixerViewPage;
