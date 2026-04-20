import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DAWToolbar from '../components/DAWToolbar';

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

const exportContainerStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  background: 'linear-gradient(180deg, rgba(11, 17, 29, 0.72) 0%, rgba(8, 12, 20, 0.9) 100%)',
  overflow: 'hidden'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
};

const titleStyle = {
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

const contentStyle = {
  flex: 1,
  display: 'flex',
  gap: '20px',
  overflow: 'hidden'
};

const mainSectionStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const exportCardStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid rgba(148, 163, 184, 0.2)'
};

const cardTitleStyle = {
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

const radioGroupStyle = {
  display: 'flex',
  gap: '12px'
};

const radioLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: '#eff6ff',
  cursor: 'pointer'
};

const radioInputStyle = {
  width: '16px',
  height: '16px',
  accentColor: '#3b82f6'
};

const timeInputStyle = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center'
};

const timeInputFieldStyle = {
  width: '60px',
  padding: '4px 8px',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  borderRadius: '6px',
  background: 'rgba(8, 12, 18, 0.6)',
  color: '#f5f7fa',
  fontSize: '12px',
  textAlign: 'center',
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

const previewSectionStyle = {
  background: 'rgba(15, 23, 42, 0.4)',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '16px'
};

const previewTitleStyle = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#dbeafe',
  marginBottom: '12px'
};

const previewInfoStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px'
};

const previewItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '12px',
  color: '#94a3b8'
};

const previewLabelStyle = {
  fontWeight: 600,
  color: '#cbd5e1'
};

const progressSectionStyle = {
  marginTop: '20px'
};

const progressBarStyle = {
  width: '100%',
  height: '8px',
  backgroundColor: 'rgba(148, 163, 184, 0.2)',
  borderRadius: '4px',
  overflow: 'hidden',
  marginBottom: '8px'
};

const progressFillStyle = {
  height: '100%',
  background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
  transition: 'width 0.3s ease',
  borderRadius: '4px'
};

const progressTextStyle = {
  fontSize: '12px',
  color: '#eff6ff',
  textAlign: 'center',
  marginBottom: '16px'
};

const actionButtonsStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  marginTop: '20px'
};

const exportBtnStyle = {
  border: '1px solid rgba(34, 197, 94, 0.5)',
  borderRadius: '8px',
  padding: '12px 24px',
  background: 'rgba(34, 197, 94, 0.2)',
  color: '#86efac',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const exportBtnDisabledStyle = {
  ...exportBtnStyle,
  borderColor: 'rgba(148, 163, 184, 0.3)',
  background: 'rgba(148, 163, 184, 0.2)',
  color: '#94a3b8',
  cursor: 'not-allowed'
};

const cancelBtnStyle = {
  border: '1px solid rgba(239, 68, 68, 0.5)',
  borderRadius: '8px',
  padding: '12px 24px',
  background: 'rgba(239, 68, 68, 0.2)',
  color: '#fca5a5',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const ExportPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [exportFormat, setExportFormat] = useState('wav');
  const [exportRange, setExportRange] = useState('full');
  const [quality, setQuality] = useState('high');
  const [sampleRate, setSampleRate] = useState(44100);
  const [bitDepth, setBitDepth] = useState(16);
  const [mp3Bitrate, setMp3Bitrate] = useState(320);
  const [startTime, setStartTime] = useState({ minutes: 0, seconds: 0 });
  const [endTime, setEndTime] = useState({ minutes: 4, seconds: 0 });
  const [fileName, setFileName] = useState('my-export');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');

  // Mock project data
  const projectInfo = {
    name: 'My Awesome Track',
    duration: '4:32',
    bpm: 120,
    sampleRate: 44100,
    loopStart: '1:00',
    loopEnd: '3:00'
  };

  const formatOptions = [
    { value: 'wav', label: 'WAV', description: 'Uncompressed audio, highest quality' },
    { value: 'mp3', label: 'MP3', description: 'Compressed audio, smaller file size' }
  ];

  const rangeOptions = [
    { value: 'full', label: 'Full Project', description: 'Export entire project from start to end' },
    { value: 'loop', label: 'Loop Range', description: `Export from ${projectInfo.loopStart} to ${projectInfo.loopEnd}` },
    { value: 'custom', label: 'Custom Range', description: 'Specify custom start and end times' }
  ];

  const qualityOptions = {
    wav: [
      { value: 'low', label: 'Low (16-bit, 44.1kHz)', sampleRate: 44100, bitDepth: 16 },
      { value: 'medium', label: 'Medium (24-bit, 48kHz)', sampleRate: 48000, bitDepth: 24 },
      { value: 'high', label: 'High (32-bit, 96kHz)', sampleRate: 96000, bitDepth: 32 }
    ],
    mp3: [
      { value: 'low', label: 'Low (128 kbps)', bitrate: 128 },
      { value: 'medium', label: 'Medium (192 kbps)', bitrate: 192 },
      { value: 'high', label: 'High (320 kbps)', bitrate: 320 }
    ]
  };

  useEffect(() => {
    // Update quality settings when format changes
    const currentQuality = qualityOptions[exportFormat]?.find(q => q.value === quality);
    if (currentQuality) {
      if (exportFormat === 'wav') {
        setSampleRate(currentQuality.sampleRate);
        setBitDepth(currentQuality.bitDepth);
      } else {
        setMp3Bitrate(currentQuality.bitrate);
      }
    }
  }, [exportFormat, quality]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('Initializing export...');

    try {
      // Simulate export process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(i);
        
        if (i === 0) setExportStatus('Preparing audio data...');
        else if (i === 30) setExportStatus('Processing tracks...');
        else if (i === 60) setExportStatus('Applying effects...');
        else if (i === 90) setExportStatus('Finalizing export...');
        else if (i === 100) setExportStatus('Export complete!');
      }

      // Create download link
      const fileExtension = exportFormat === 'wav' ? 'wav' : 'mp3';
      const fullFileName = `${fileName}.${fileExtension}`;
      
      // Simulate file download
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#'; // In real app, this would be the actual file URL
        link.download = fullFileName;
        link.click();
        
        setIsExporting(false);
        setExportProgress(0);
        setExportStatus('');
      }, 1000);

    } catch (error) {
      setExportStatus(`Export failed: ${error.message}`);
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    if (isExporting) {
      setIsExporting(false);
      setExportProgress(0);
      setExportStatus('');
    } else {
      navigate(`/daw/${projectId}`);
    }
  };

  const getEstimatedFileSize = () => {
    const duration = 4.5; // Mock duration in minutes
    if (exportFormat === 'wav') {
      const bytesPerSecond = sampleRate * (bitDepth / 8) * 2; // Stereo
      return `${((bytesPerSecond * duration * 60) / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${((mp3Bitrate * 1000 / 8 * duration * 60) / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  const getExportDuration = () => {
    if (exportRange === 'full') return projectInfo.duration;
    if (exportRange === 'loop') return '2:00';
    
    const startSeconds = startTime.minutes * 60 + startTime.seconds;
    const endSeconds = endTime.minutes * 60 + endTime.seconds;
    const duration = endSeconds - startSeconds;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={pageStyle}>
      <div style={workspaceFrameStyle}>
        <DAWToolbar
          projectName="Export"
          isPlaying={false}
          isRecording={false}
          currentTime="00:00:00"
          bpm={projectInfo.bpm}
          zoom={100}
          metronomeEnabled={false}
          loopEnabled={false}
          punchInEnabled={false}
          canUndo={false}
          canRedo={false}
          activeTool="select"
          snapGrid={0.25}
          timeSignature="4/4"
          masterVolume={80}
          onPlay={() => {}}
          onStop={() => {}}
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
          onMasterVolumeChange={() => {}}
          onSave={() => {}}
          onExport={() => {}}
          saveStatus="idle"
        />

        <div style={exportContainerStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>Export Project</h1>
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
                style={toggleBtnStyle}
                onClick={() => navigate(`/daw/${projectId}/mixer`)}
              >
                Mixer View
              </button>
              <button
                type="button"
                style={toggleBtnStyle}
                onClick={() => navigate(`/daw/${projectId}/sound-library`)}
              >
                Sound Library
              </button>
              <button
                type="button"
                style={toggleBtnStyle}
                onClick={() => navigate(`/daw/${projectId}/settings`)}
              >
                Settings
              </button>
              <button
                type="button"
                style={toggleBtnActiveStyle}
              >
                Export
              </button>
            </div>
          </div>

          <div style={contentStyle}>
            <div style={mainSectionStyle}>
              <div style={exportCardStyle}>
                <h2 style={cardTitleStyle}>Export Settings</h2>
                
                <div style={settingRowStyle}>
                  <div style={settingLabelStyle}>
                    <div style={settingNameStyle}>File Name</div>
                    <div style={settingDescriptionStyle}>Name of the exported file</div>
                  </div>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    style={inputStyle}
                    placeholder="my-export"
                  />
                </div>

                <div style={settingRowStyle}>
                  <div style={settingLabelStyle}>
                    <div style={settingNameStyle}>Format</div>
                    <div style={settingDescriptionStyle}>Audio file format</div>
                  </div>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    style={selectStyle}
                  >
                    {formatOptions.map(format => (
                      <option key={format.value} value={format.value}>
                        {format.label} - {format.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={settingRowStyle}>
                  <div style={settingLabelStyle}>
                    <div style={settingNameStyle}>Export Range</div>
                    <div style={settingDescriptionStyle}>What portion of the project to export</div>
                  </div>
                  <div style={radioGroupStyle}>
                    {rangeOptions.map(range => (
                      <label key={range.value} style={radioLabelStyle}>
                        <input
                          type="radio"
                          value={range.value}
                          checked={exportRange === range.value}
                          onChange={(e) => setExportRange(e.target.value)}
                          style={radioInputStyle}
                        />
                        {range.label}
                      </label>
                    ))}
                  </div>
                </div>

                {exportRange === 'custom' && (
                  <div style={settingRowStyle}>
                    <div style={settingLabelStyle}>
                      <div style={settingNameStyle}>Custom Time Range</div>
                      <div style={settingDescriptionStyle}>Start and end times for export</div>
                    </div>
                    <div style={timeInputStyle}>
                      <div style={timeInputFieldStyle}>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={startTime.minutes}
                          onChange={(e) => setStartTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                          style={{ ...timeInputFieldStyle, width: '50px' }}
                        />
                        <span>:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={startTime.seconds}
                          onChange={(e) => setStartTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                          style={{ ...timeInputFieldStyle, width: '50px' }}
                        />
                      </div>
                      <span>to</span>
                      <div style={timeInputFieldStyle}>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={endTime.minutes}
                          onChange={(e) => setEndTime(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                          style={{ ...timeInputFieldStyle, width: '50px' }}
                        />
                        <span>:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={endTime.seconds}
                          onChange={(e) => setEndTime(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                          style={{ ...timeInputFieldStyle, width: '50px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div style={settingRowStyle}>
                  <div style={settingLabelStyle}>
                    <div style={settingNameStyle}>Quality</div>
                    <div style={settingDescriptionStyle}>
                      {exportFormat === 'wav' ? 'Sample rate and bit depth' : 'MP3 compression bitrate'}
                    </div>
                  </div>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    style={selectStyle}
                  >
                    {qualityOptions[exportFormat]?.map(qual => (
                      <option key={qual.value} value={qual.value}>
                        {qual.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={exportCardStyle}>
                <h2 style={cardTitleStyle}>Export Preview</h2>
                
                <div style={previewSectionStyle}>
                  <h3 style={previewTitleStyle}>Export Summary</h3>
                  <div style={previewInfoStyle}>
                    <div style={previewItemStyle}>
                      <span style={previewLabelStyle}>Format:</span>
                      <span>{exportFormat.toUpperCase()}</span>
                    </div>
                    <div style={previewItemStyle}>
                      <span style={previewLabelStyle}>Quality:</span>
                      <span>{qualityOptions[exportFormat]?.find(q => q.value === quality)?.label}</span>
                    </div>
                    <div style={previewItemStyle}>
                      <span style={previewLabelStyle}>Duration:</span>
                      <span>{getExportDuration()}</span>
                    </div>
                    <div style={previewItemStyle}>
                      <span style={previewLabelStyle}>Sample Rate:</span>
                      <span>{sampleRate.toLocaleString()} Hz</span>
                    </div>
                    <div style={previewItemStyle}>
                      <span style={previewLabelStyle}>Bit Depth:</span>
                      <span>{bitDepth}-bit</span>
                    </div>
                    <div style={previewItemStyle}>
                      <span style={previewLabelStyle}>File Size (est.):</span>
                      <span>{getEstimatedFileSize()}</span>
                    </div>
                  </div>
                </div>

                {isExporting && (
                  <div style={progressSectionStyle}>
                    <div style={progressBarStyle}>
                      <div
                        style={{
                          ...progressFillStyle,
                          width: `${exportProgress}%`
                        }}
                      />
                    </div>
                    <div style={progressTextStyle}>
                      {exportStatus} ({exportProgress}%)
                    </div>
                  </div>
                )}

                <div style={actionButtonsStyle}>
                  <button
                    type="button"
                    style={isExporting ? exportBtnDisabledStyle : exportBtnStyle}
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? 'Exporting...' : 'Start Export'}
                  </button>
                  <button
                    type="button"
                    style={cancelBtnStyle}
                    onClick={handleCancel}
                  >
                    {isExporting ? 'Cancel' : 'Back to Project'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;
