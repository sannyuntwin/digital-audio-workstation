import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DAWToolbar from '../components/DAWToolbar';
import apiService from '../services/apiService';

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

const libraryContainerStyle = {
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

const statusMessageStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(96, 165, 250, 0.45)',
  borderRadius: '8px',
  background: 'rgba(30, 64, 175, 0.28)',
  color: '#dbeafe',
  fontSize: '12px',
  fontWeight: 600,
  padding: '8px 10px',
  marginBottom: '12px'
};

const viewToggleStyle = {
  display: 'flex',
  gap: '8px'
};

const toggleBtnStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.28)',
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

const sidebarStyle = {
  width: '280px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const uploadSectionStyle = {
  borderWidth: '2px',
  borderStyle: 'dashed',
  borderColor: 'rgba(148, 163, 184, 0.4)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  background: 'rgba(15, 23, 42, 0.4)',
  transition: 'all 0.3s ease',
  cursor: 'pointer'
};

const uploadSectionHoverStyle = {
  ...uploadSectionStyle,
  borderColor: 'rgba(96, 165, 250, 0.6)',
  background: 'rgba(30, 64, 175, 0.2)'
};

const uploadIconStyle = {
  fontSize: '48px',
  marginBottom: '12px',
  color: '#93c5fd'
};

const uploadTextStyle = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#dbeafe',
  marginBottom: '4px'
};

const uploadSubtextStyle = {
  fontSize: '12px',
  color: '#94a3b8'
};

const fileInputStyle = {
  display: 'none'
};

const filterSectionStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  borderRadius: '12px',
  padding: '16px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.2)'
};

const filterTitleStyle = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#dbeafe',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tagContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginBottom: '12px'
};

const tagStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.3)',
  borderRadius: '20px',
  padding: '4px 12px',
  background: 'rgba(15, 23, 42, 0.4)',
  color: '#bfdbfe',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const tagActiveStyle = {
  ...tagStyle,
  borderColor: 'rgba(96, 165, 250, 0.6)',
  background: 'rgba(30, 64, 175, 0.3)',
  color: '#eff6ff'
};

const searchBoxStyle = {
  width: '100%',
  padding: '8px 12px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.3)',
  borderRadius: '8px',
  background: 'rgba(8, 12, 18, 0.6)',
  color: '#f5f7fa',
  fontSize: '12px',
  outline: 'none',
  transition: 'all 0.2s ease'
};


const mainContentStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
};

const libraryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '16px',
  padding: '16px 0',
  overflowY: 'auto',
  maxHeight: '100%'
};

const assetCardStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.2)',
  borderRadius: '12px',
  background: 'rgba(15, 23, 42, 0.6)',
  padding: '12px',
  cursor: 'grab',
  transition: 'all 0.2s ease',
  position: 'relative'
};

const assetCardHoverStyle = {
  ...assetCardStyle,
  borderColor: 'rgba(96, 165, 250, 0.4)',
  background: 'rgba(30, 64, 175, 0.2)',
  transform: 'translateY(-2px)'
};

const assetCardDraggingStyle = {
  ...assetCardStyle,
  opacity: '0.5',
  cursor: 'grabbing'
};

const assetHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '8px'
};

const assetNameStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#eff6ff',
  flex: 1,
  marginRight: '8px',
  wordBreak: 'break-word'
};

const assetTypeStyle = {
  fontSize: '10px',
  color: '#93c5fd',
  background: 'rgba(30, 64, 175, 0.3)',
  padding: '2px 6px',
  borderRadius: '4px',
  textTransform: 'uppercase'
};

const assetMetaStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  marginBottom: '8px'
};

const assetMetaItemStyle = {
  fontSize: '10px',
  color: '#94a3b8'
};

const assetTagsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  marginBottom: '8px'
};

const assetTagStyle = {
  fontSize: '9px',
  color: '#dbeafe',
  background: 'rgba(96, 165, 250, 0.2)',
  padding: '2px 6px',
  borderRadius: '4px'
};

const assetActionsStyle = {
  display: 'flex',
  gap: '6px'
};

const actionBtnStyle = {
  flex: 1,
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.3)',
  borderRadius: '6px',
  padding: '4px 8px',
  background: 'rgba(15, 23, 42, 0.4)',
  color: '#bfdbfe',
  fontSize: '10px',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'all 0.2s ease'
};


const progressBarStyle = {
  width: '100%',
  height: '4px',
  backgroundColor: 'rgba(148, 163, 184, 0.2)',
  borderRadius: '2px',
  overflow: 'hidden',
  marginTop: '8px'
};

const progressFillStyle = {
  height: '100%',
  backgroundColor: '#3b82f6',
  transition: 'width 0.3s ease'
};

const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  color: '#94a3b8'
};

const emptyStateIconStyle = {
  fontSize: '48px',
  marginBottom: '12px',
  opacity: '0.5'
};

const emptyStateTextStyle = {
  fontSize: '14px',
  textAlign: 'center'
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const formatBytes = (value) => {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const precision = unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

const mapAudioFileToAsset = (audioFile, token) => {
  const mimeType = audioFile.mime_type || '';
  const format = (audioFile.file_name?.split('.').pop() || mimeType.split('/')[1] || 'audio').toLowerCase();
  const durationValue = Number(audioFile.duration);
  const duration = Number.isFinite(durationValue) && durationValue > 0 ? `${durationValue.toFixed(1)}s` : 'Unknown';
  const metadata = audioFile.metadata || {};

  return {
    id: audioFile.id || audioFile.file_name,
    fileName: audioFile.file_name,
    filePath: audioFile.file_path,
    name: audioFile.original_name || audioFile.file_name,
    type: 'audio',
    format,
    duration,
    size: formatBytes(Number(audioFile.file_size)),
    fileSize: Number(audioFile.file_size) || null,
    sampleRate: Number(audioFile.sample_rate) || null,
    bitDepth: Number(audioFile.bit_depth) || null,
    channels: Number(audioFile.channels) || null,
    tags: [format, 'uploaded'],
    bpm: Number(metadata.bpm || 0),
    key: metadata.key || '-',
    uploaded: audioFile.uploaded_at ? new Date(audioFile.uploaded_at) : new Date(),
    previewUrl: audioFile.file_name && token
      ? `${API_BASE_URL}/api/audio/stream/${audioFile.file_name}?token=${encodeURIComponent(token)}`
      : null
  };
};

const parseAssetDuration = (duration) => {
  if (typeof duration === 'number' && Number.isFinite(duration)) {
    return Math.max(duration, 0.25);
  }

  if (typeof duration === 'string') {
    const numericValue = Number.parseFloat(duration.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(numericValue) && numericValue > 0) {
      return numericValue;
    }
  }

  return 4;
};

const SoundLibraryPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [assets, setAssets] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [hoveredAsset, setHoveredAsset] = useState(null);
  const [draggedAsset, setDraggedAsset] = useState(null);
  const [libraryMessage, setLibraryMessage] = useState('');
  const [previewingAssetId, setPreviewingAssetId] = useState(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  
  const fileInputRef = useRef(null);
  const previewAudioRef = useRef(new Audio());

  const loadAudioAssets = useCallback(async () => {
    try {
      setIsLoadingAssets(true);
      const token = localStorage.getItem('token');
      const response = await apiService.getAudioFiles();
      const rows = response?.data || [];
      const mapped = rows.map((row) => mapAudioFileToAsset(row, token));
      setAssets(mapped);
    } catch (error) {
      setLibraryMessage(`Failed to load library: ${error.message}`);
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  }, []);

  useEffect(() => {
    loadAudioAssets();
  }, [loadAudioAssets]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    assets.forEach((asset) => {
      (asset.tags || []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [assets]);

  const filteredAssets = useMemo(() => {
    let filtered = assets;

    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((asset) =>
        asset.name.toLowerCase().includes(normalizedQuery) ||
        (asset.tags || []).some((tag) => tag.toLowerCase().includes(normalizedQuery))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((asset) =>
        selectedTags.some((tag) => (asset.tags || []).includes(tag))
      );
    }

    return filtered;
  }, [assets, searchQuery, selectedTags]);

  useEffect(() => {
    if (!libraryMessage) return undefined;
    const timer = setTimeout(() => setLibraryMessage(''), 2600);
    return () => clearTimeout(timer);
  }, [libraryMessage]);

  useEffect(() => {
    const previewAudio = previewAudioRef.current;
    const handleEnded = () => setPreviewingAssetId(null);
    previewAudio.addEventListener('ended', handleEnded);

    return () => {
      previewAudio.removeEventListener('ended', handleEnded);
      previewAudio.pause();
      previewAudio.src = '';
    };
  }, []);

  const handleFileSelect = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 10 }));
      try {
        await apiService.uploadAudioFile(file);
        setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        setLibraryMessage(`Upload failed for ${file.name}: ${error.message}`);
      } finally {
        setTimeout(() => {
          setUploadProgress((prev) => {
            const nextProgress = { ...prev };
            delete nextProgress[file.name];
            return nextProgress;
          });
        }, 350);
      }
    }

    await loadAudioAssets();
    setLibraryMessage('Audio upload complete.');
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAssetDragStart = (e, asset) => {
    setDraggedAsset(asset);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', JSON.stringify(asset));
  };

  const handleAssetDragEnd = () => {
    setDraggedAsset(null);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handlePreview = async (asset) => {
    const previewAudio = previewAudioRef.current;

    if (previewingAssetId === asset.id && !previewAudio.paused) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewingAssetId(null);
      setLibraryMessage(`Stopped preview: ${asset.name}`);
      return;
    }

    if (!asset.previewUrl) {
      setLibraryMessage(`Preview unavailable for "${asset.name}". Upload files to preview audio.`);
      return;
    }

    try {
      previewAudio.pause();
      previewAudio.src = asset.previewUrl;
      previewAudio.currentTime = 0;
      await previewAudio.play();
      setPreviewingAssetId(asset.id);
      setLibraryMessage(`Previewing "${asset.name}"`);
    } catch (error) {
      setPreviewingAssetId(null);
      setLibraryMessage(`Preview failed: ${error.message}`);
    }
  };

  const handleAddToTimeline = async (asset) => {
    if (!projectId) {
      setLibraryMessage('No project selected.');
      return;
    }

    try {
      setLibraryMessage(`Adding "${asset.name}" to timeline...`);
      const projectResponse = await apiService.getProject(projectId);
      const project = projectResponse?.data || projectResponse;

      let targetTrack = project?.tracks?.find((track) => track.type === 'audio') || project?.tracks?.[0];

      if (!targetTrack) {
        const createdTrackResponse = await apiService.addTrack(projectId, {
          name: 'Imported Audio',
          type: 'audio',
          volume: 0.7,
          pan: 0,
          isMuted: false,
          isSolo: false,
          color: '#4CAF50'
        });
        targetTrack = createdTrackResponse?.data || createdTrackResponse;
      }

      const clips = project?.clips || [];
      const trackClips = clips.filter((clip) => (clip.track_id || clip.trackId) === targetTrack.id);
      const nextStartTime = trackClips.reduce((maxTime, clip) => {
        const startTime = Number(clip.start_time ?? clip.startTime ?? 0);
        const duration = Number(clip.duration ?? 0);
        return Math.max(maxTime, startTime + duration);
      }, 0);

      await apiService.addClip(projectId, {
        trackId: targetTrack.id,
        name: asset.name,
        type: 'audio',
        startTime: nextStartTime,
        duration: parseAssetDuration(asset.duration),
        fileName: asset.fileName || null,
        filePath: asset.filePath || null,
        fileSize: asset.fileSize || null,
        sampleRate: asset.sampleRate || null,
        bitDepth: asset.bitDepth || null,
        channels: asset.channels || null,
        settings: {
          source: 'sound-library',
          fileName: asset.fileName || null,
          format: asset.format || 'wav',
          key: asset.key || 'C',
          bpm: Number(asset.bpm || 0)
        }
      });

      setLibraryMessage(`Added "${asset.name}" to timeline.`);
      setTimeout(() => navigate(`/project/${projectId}/`), 450);
    } catch (error) {
      setLibraryMessage(`Add failed: ${error.message}`);
    }
  };


  return (
    <div style={pageStyle}>
      <div style={workspaceFrameStyle}>
        <DAWToolbar
          projectName="Sound Library"
          isPlaying={false}
          isRecording={false}
          currentTime="00:00:00"
          bpm={120}
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

        <div style={libraryContainerStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>Sound Library</h1>
            <div style={viewToggleStyle}>
              <button
                type="button"
                style={toggleBtnStyle}
                onClick={() => navigate(`/project/${projectId}`)}
              >
                Arrangement View
              </button>
              <button
                type="button"
                style={toggleBtnStyle}
                onClick={() => navigate(`/project/${projectId}/mixer`)}
              >
                Mixer View
              </button>
              <button
                type="button"
                style={toggleBtnActiveStyle}
              >
                Sound Library
              </button>
            </div>
          </div>

          {libraryMessage && (
            <div style={statusMessageStyle}>{libraryMessage}</div>
          )}

          <div style={contentStyle}>
            <div style={sidebarStyle}>
              <div
                style={isDragging ? uploadSectionHoverStyle : uploadSectionStyle}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={uploadIconStyle}>📁</div>
                <div style={uploadTextStyle}>Upload Samples</div>
                <div style={uploadSubtextStyle}>Drag & drop or click to browse</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="audio/*"
                  style={fileInputStyle}
                  onChange={async (e) => {
                    await handleFileSelect(e.target.files);
                    e.target.value = '';
                  }}
                />
              </div>

              <div style={filterSectionStyle}>
                <div style={filterTitleStyle}>Filter by Tags</div>
                <div style={tagContainerStyle}>
                  {availableTags.slice(0, 12).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      style={selectedTags.includes(tag) ? tagActiveStyle : tagStyle}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                  {availableTags.length === 0 && (
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Upload files to generate tags.
                    </div>
                  )}
                </div>
              </div>

              <div style={filterSectionStyle}>
                <div style={filterTitleStyle}>Search</div>
                <input
                  type="text"
                  placeholder="Search samples..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={searchBoxStyle}
                />
              </div>
            </div>

            <div style={mainContentStyle}>
              {isLoadingAssets ? (
                <div style={emptyStateStyle}>
                  <div style={emptyStateIconStyle}>🎧</div>
                  <div style={emptyStateTextStyle}>Loading audio library...</div>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div style={emptyStateStyle}>
                  <div style={emptyStateIconStyle}>🎵</div>
                  <div style={emptyStateTextStyle}>
                    {searchQuery || selectedTags.length > 0
                      ? 'No samples found matching your filters'
                      : 'No samples uploaded yet. Drag and drop audio files to get started!'}
                  </div>
                </div>
              ) : (
                <div style={libraryGridStyle}>
                  {filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      style={
                        draggedAsset?.id === asset.id
                          ? assetCardDraggingStyle
                          : hoveredAsset === asset.id
                          ? assetCardHoverStyle
                          : assetCardStyle
                      }
                      draggable
                      onDragStart={(e) => handleAssetDragStart(e, asset)}
                      onDragEnd={handleAssetDragEnd}
                      onMouseEnter={() => setHoveredAsset(asset.id)}
                      onMouseLeave={() => setHoveredAsset(null)}
                    >
                      <div style={assetHeaderStyle}>
                        <div style={assetNameStyle}>{asset.name}</div>
                        <div style={assetTypeStyle}>{asset.format}</div>
                      </div>
                      
                      <div style={assetMetaStyle}>
                        <div style={assetMetaItemStyle}>Duration: {asset.duration}</div>
                        <div style={assetMetaItemStyle}>Size: {asset.size}</div>
                        {asset.bpm > 0 && (
                          <div style={assetMetaItemStyle}>BPM: {asset.bpm}</div>
                        )}
                        <div style={assetMetaItemStyle}>Key: {asset.key}</div>
                      </div>

                      <div style={assetTagsStyle}>
                        {asset.tags.map(tag => (
                          <span key={tag} style={assetTagStyle}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div style={assetActionsStyle}>
                        <button
                          type="button"
                          style={actionBtnStyle}
                          onClick={() => handlePreview(asset)}
                        >
                          {previewingAssetId === asset.id ? '⏹ Stop' : '🔊 Preview'}
                        </button>
                        <button
                          type="button"
                          style={actionBtnStyle}
                          onClick={() => handleAddToTimeline(asset)}
                        >
                          ➕ Add to Timeline
                        </button>
                      </div>

                      {uploadProgress[asset.fileName || asset.name] !== undefined && (
                        <div style={progressBarStyle}>
                          <div
                            style={{
                              ...progressFillStyle,
                              width: `${uploadProgress[asset.fileName || asset.name]}%`
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundLibraryPage;
