import React, { useState, useEffect } from 'react';

// ============ STYLES ============
const modalStyle = {
  width: '90vw',
  height: '80vh',
  maxWidth: '1000px',
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
  background: 'linear-gradient(180deg, rgba(11, 17, 29, 0.72) 0%, rgba(8, 12, 20, 0.9) 100%)',
  display: 'flex',
  gap: '20px'
};

const sidebarStyle = {
  width: '240px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const sidebarItemStyle = {
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '8px',
  padding: '12px 16px',
  background: 'rgba(15, 23, 42, 0.4)',
  color: '#bfdbfe',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const sidebarItemActiveStyle = {
  ...sidebarItemStyle,
  borderColor: 'rgba(96, 165, 250, 0.5)',
  background: 'rgba(30, 64, 175, 0.3)',
  color: '#eff6ff'
};

const mainContentStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const sectionStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  marginBottom: '16px'
};

const sectionTitleStyle = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#dbeafe',
  marginBottom: '16px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const settingRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '12px 0',
  borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
};

const settingLabelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px'
};

const settingNameStyle = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#eff6ff'
};

const settingDescriptionStyle = {
  fontSize: '12px',
  color: '#94a3b8'
};

const selectStyle = {
  padding: '8px 12px',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: '8px',
  background: 'rgba(8, 12, 18, 0.6)',
  color: '#f5f7fa',
  fontSize: '12px',
  minWidth: '200px',
  outline: 'none',
  cursor: 'pointer'
};

const inputStyle = {
  padding: '8px 12px',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: '8px',
  background: 'rgba(8, 12, 18, 0.6)',
  color: '#f5f7fa',
  fontSize: '12px',
  minWidth: '120px',
  outline: 'none'
};

const sliderContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1
};

const sliderStyle = {
  flex: 1,
  height: '4px',
  borderRadius: '2px',
  background: 'rgba(148, 163, 184, 0.3)',
  outline: 'none',
  cursor: 'pointer'
};

const sliderValueStyle = {
  fontSize: '12px',
  color: '#eff6ff',
  fontWeight: 600,
  minWidth: '60px',
  textAlign: 'center'
};

const toggleSwitchStyle = {
  position: 'relative',
  width: '48px',
  height: '24px',
  background: 'rgba(148, 163, 184, 0.3)',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'background 0.3s ease'
};

const toggleSwitchActiveStyle = {
  ...toggleSwitchStyle,
  background: 'rgba(96, 165, 250, 0.5)'
};

const toggleSliderStyle = {
  position: 'absolute',
  top: '2px',
  left: '2px',
  width: '20px',
  height: '20px',
  background: '#f5f7fa',
  borderRadius: '50%',
  transition: 'transform 0.3s ease'
};

const toggleSliderActiveStyle = {
  ...toggleSliderStyle,
  transform: 'translateX(24px)'
};

const shortcutsTableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '16px'
};

const shortcutsHeaderStyle = {
  textAlign: 'left',
  padding: '12px',
  borderBottom: '2px solid rgba(148, 163, 184, 0.3)',
  fontSize: '12px',
  fontWeight: 700,
  color: '#dbeafe',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const shortcutsRowStyle = {
  borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
};

const shortcutsCellStyle = {
  padding: '12px',
  fontSize: '12px',
  color: '#eff6ff'
};

const shortcutKeyStyle = {
  display: 'inline-block',
  padding: '4px 8px',
  background: 'rgba(30, 64, 175, 0.3)',
  border: '1px solid rgba(96, 165, 250, 0.4)',
  borderRadius: '4px',
  fontSize: '11px',
  fontWeight: 600,
  color: '#dbeafe',
  fontFamily: 'monospace'
};

const actionButtonsStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  marginTop: '20px'
};

const saveBtnStyle = {
  border: '1px solid rgba(34, 197, 94, 0.5)',
  borderRadius: '8px',
  padding: '10px 20px',
  background: 'rgba(34, 197, 94, 0.2)',
  color: '#86efac',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const resetBtnStyle = {
  border: '1px solid rgba(239, 68, 68, 0.5)',
  borderRadius: '8px',
  padding: '10px 20px',
  background: 'rgba(239, 68, 68, 0.2)',
  color: '#fca5a5',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const SettingsModal = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('audio');
  const [audioLatency, setAudioLatency] = useState(128);
  const [inputDevice, setInputDevice] = useState('default');
  const [outputDevice, setOutputDevice] = useState('default');
  const [sampleRate, setSampleRate] = useState(44100);
  const [bufferSize, setBufferSize] = useState(512);
  const [theme, setTheme] = useState('dark');
  const [shortcuts] = useState([
    { action: 'Play/Pause', key: 'Space', category: 'Transport' },
    { action: 'Stop', key: 'Shift + Space', category: 'Transport' },
    { action: 'Record', key: 'R', category: 'Transport' },
    { action: 'Save Project', key: 'Ctrl + S', category: 'File' },
    { action: 'Export Project', key: 'Ctrl + E', category: 'File' },
    { action: 'Undo', key: 'Ctrl + Z', category: 'Edit' },
    { action: 'Redo', key: 'Ctrl + Y', category: 'Edit' },
    { action: 'Cut', key: 'Ctrl + X', category: 'Edit' },
    { action: 'Copy', key: 'Ctrl + C', category: 'Edit' },
    { action: 'Paste', key: 'Ctrl + V', category: 'Edit' },
    { action: 'Zoom In', key: 'Ctrl + +', category: 'View' },
    { action: 'Zoom Out', key: 'Ctrl + -', category: 'View' },
    { action: 'Zoom to Fit', key: 'Ctrl + 0', category: 'View' }
  ]);

  const [settings, setSettings] = useState({
    autoSave: true,
    autoSaveInterval: 5,
    showTooltips: true,
    snapToGrid: true,
    defaultBpm: 120,
    defaultTimeSignature: '4/4',
    enableAutoBackup: true,
    maxUndoHistory: 50
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('daw_settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
      setTheme(parsed.theme || 'dark');
      setAudioLatency(parsed.audioLatency || 128);
      setSampleRate(parsed.sampleRate || 44100);
      setBufferSize(parsed.bufferSize || 512);
    }
  }, []);

  const handleSaveSettings = () => {
    const allSettings = {
      ...settings,
      theme,
      audioLatency,
      sampleRate,
      bufferSize,
      shortcuts
    };
    localStorage.setItem('daw_settings', JSON.stringify(allSettings));
    console.log('Settings saved:', allSettings);
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      localStorage.removeItem('daw_settings');
      setSettings({
        autoSave: true,
        autoSaveInterval: 5,
        showTooltips: true,
        snapToGrid: true,
        defaultBpm: 120,
        defaultTimeSignature: '4/4',
        enableAutoBackup: true,
        maxUndoHistory: 50
      });
      setTheme('dark');
      setAudioLatency(128);
      setSampleRate(44100);
      setBufferSize(512);
    }
  };

  const sections = {
    audio: { title: 'Audio', component: () => (
      <div>
        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Audio Latency</div>
            <div style={settingDescriptionStyle}>Buffer size for audio processing</div>
          </div>
          <div style={sliderContainerStyle}>
            <input
              type="range"
              min="64"
              max="2048"
              step="64"
              value={audioLatency}
              onChange={(e) => setAudioLatency(parseInt(e.target.value))}
              style={sliderStyle}
            />
            <div style={sliderValueStyle}>{audioLatency} samples</div>
          </div>
        </div>

        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Input Device</div>
            <div style={settingDescriptionStyle}>Audio input device for recording</div>
          </div>
          <select
            value={inputDevice}
            onChange={(e) => setInputDevice(e.target.value)}
            style={selectStyle}
          >
            <option value="default">Default - System Default</option>
            <option value="builtin">Built-in Microphone</option>
            <option value="usb">USB Audio Interface</option>
          </select>
        </div>

        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Output Device</div>
            <div style={settingDescriptionStyle}>Audio output device for playback</div>
          </div>
          <select
            value={outputDevice}
            onChange={(e) => setOutputDevice(e.target.value)}
            style={selectStyle}
          >
            <option value="default">Default - System Default</option>
            <option value="builtin">Built-in Speakers</option>
            <option value="usb">USB Audio Interface</option>
            <option value="bluetooth">Bluetooth Headphones</option>
          </select>
        </div>

        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Sample Rate</div>
            <div style={settingDescriptionStyle}>Audio sample rate in Hz</div>
          </div>
          <select
            value={sampleRate}
            onChange={(e) => setSampleRate(parseInt(e.target.value))}
            style={selectStyle}
          >
            <option value={44100}>44.1 kHz</option>
            <option value={48000}>48 kHz</option>
            <option value={88200}>88.2 kHz</option>
            <option value={96000}>96 kHz</option>
          </select>
        </div>

        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Buffer Size</div>
            <div style={settingDescriptionStyle}>Audio buffer size</div>
          </div>
          <select
            value={bufferSize}
            onChange={(e) => setBufferSize(parseInt(e.target.value))}
            style={selectStyle}
          >
            <option value={128}>128 samples</option>
            <option value={256}>256 samples</option>
            <option value={512}>512 samples</option>
            <option value={1024}>1024 samples</option>
            <option value={2048}>2048 samples</option>
          </select>
        </div>
      </div>
    )},
    theme: { title: 'Theme', component: () => (
      <div>
        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Theme</div>
            <div style={settingDescriptionStyle}>Choose your preferred color theme</div>
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={selectStyle}
          >
            <option value="dark">Dark Theme</option>
            <option value="light">Light Theme</option>
            <option value="auto">Auto (System)</option>
          </select>
        </div>

        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Show Tooltips</div>
            <div style={settingDescriptionStyle}>Display helpful tooltips on hover</div>
          </div>
          <div
            style={settings.showTooltips ? toggleSwitchActiveStyle : toggleSwitchStyle}
            onClick={() => setSettings(prev => ({ ...prev, showTooltips: !prev.showTooltips }))}
          >
            <div style={settings.showTooltips ? toggleSliderActiveStyle : toggleSliderStyle} />
          </div>
        </div>
      </div>
    )},
    shortcuts: { title: 'Shortcuts', component: () => (
      <div>
        <table style={shortcutsTableStyle}>
          <thead>
            <tr>
              <th style={shortcutsHeaderStyle}>Action</th>
              <th style={shortcutsHeaderStyle}>Category</th>
              <th style={shortcutsHeaderStyle}>Shortcut</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((shortcut, index) => (
              <tr key={index} style={shortcutsRowStyle}>
                <td style={shortcutsCellStyle}>{shortcut.action}</td>
                <td style={shortcutsCellStyle}>{shortcut.category}</td>
                <td style={shortcutsCellStyle}>
                  <span style={shortcutKeyStyle}>{shortcut.key}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )},
    project: { title: 'Project', component: () => (
      <div>
        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Auto Save</div>
            <div style={settingDescriptionStyle}>Automatically save project changes</div>
          </div>
          <div
            style={settings.autoSave ? toggleSwitchActiveStyle : toggleSwitchStyle}
            onClick={() => setSettings(prev => ({ ...prev, autoSave: !prev.autoSave }))}
          >
            <div style={settings.autoSave ? toggleSliderActiveStyle : toggleSliderStyle} />
          </div>
        </div>

        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Auto Save Interval</div>
            <div style={settingDescriptionStyle}>Minutes between auto-saves</div>
          </div>
          <input
            type="number"
            min="1"
            max="30"
            value={settings.autoSaveInterval}
            onChange={(e) => setSettings(prev => ({ ...prev, autoSaveInterval: parseInt(e.target.value) }))}
            style={inputStyle}
            disabled={!settings.autoSave}
          />
        </div>

        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Default BPM</div>
            <div style={settingDescriptionStyle}>Default tempo for new projects</div>
          </div>
          <input
            type="number"
            min="60"
            max="200"
            value={settings.defaultBpm}
            onChange={(e) => setSettings(prev => ({ ...prev, defaultBpm: parseInt(e.target.value) }))}
            style={inputStyle}
          />
        </div>

        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Default Time Signature</div>
            <div style={settingDescriptionStyle}>Default time signature for new projects</div>
          </div>
          <select
            value={settings.defaultTimeSignature}
            onChange={(e) => setSettings(prev => ({ ...prev, defaultTimeSignature: e.target.value }))}
            style={selectStyle}
          >
            <option value="4/4">4/4</option>
            <option value="3/4">3/4</option>
            <option value="6/8">6/8</option>
            <option value="5/4">5/4</option>
          </select>
        </div>

        <div style={settingRowStyle}>
          <div style={settingLabelStyle}>
            <div style={settingNameStyle}>Max Undo History</div>
            <div style={settingDescriptionStyle}>Maximum number of undo states</div>
          </div>
          <input
            type="number"
            min="10"
            max="100"
            value={settings.maxUndoHistory}
            onChange={(e) => setSettings(prev => ({ ...prev, maxUndoHistory: parseInt(e.target.value) }))}
            style={inputStyle}
          />
        </div>
      </div>
    )}
  };

  return (
    <div style={modalStyle}>
      <div style={modalHeaderStyle}>
        <h2 style={modalTitleStyle}>Settings</h2>
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
        <div style={sidebarStyle}>
          {Object.entries(sections).map(([key, section]) => (
            <button
              key={key}
              type="button"
              style={activeSection === key ? sidebarItemActiveStyle : sidebarItemStyle}
              onClick={() => setActiveSection(key)}
            >
              {section.title}
            </button>
          ))}
        </div>

        <div style={mainContentStyle}>
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>{sections[activeSection].title}</h3>
            {sections[activeSection].component()}
          </div>

          <div style={actionButtonsStyle}>
            <button
              type="button"
              style={saveBtnStyle}
              onClick={handleSaveSettings}
            >
              Save Settings
            </button>
            <button
              type="button"
              style={resetBtnStyle}
              onClick={handleResetSettings}
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
