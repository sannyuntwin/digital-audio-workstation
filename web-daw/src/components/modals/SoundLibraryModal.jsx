import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../services/apiService';

const modalStyle = {
  width: '90vw',
  height: '80vh',
  maxWidth: '1200px',
  maxHeight: '800px',
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
  borderRadius: '4px'
};

const modalBodyStyle = {
  flex: 1,
  padding: '16px 20px',
  overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(11, 17, 29, 0.72) 0%, rgba(8, 12, 20, 0.9) 100%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const controlsStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  alignItems: 'center'
};

const inputStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.3)',
  borderRadius: '8px',
  padding: '8px 10px',
  background: 'rgba(8, 12, 18, 0.6)',
  color: '#f5f7fa',
  fontSize: '12px'
};

const buttonStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.3)',
  borderRadius: '8px',
  padding: '8px 10px',
  background: 'rgba(15, 23, 42, 0.45)',
  color: '#bfdbfe',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer'
};

const tagStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.3)',
  borderRadius: '20px',
  padding: '4px 10px',
  background: 'rgba(15, 23, 42, 0.4)',
  color: '#bfdbfe',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer'
};

const tagActiveStyle = {
  ...tagStyle,
  borderColor: 'rgba(96, 165, 250, 0.6)',
  background: 'rgba(30, 64, 175, 0.35)',
  color: '#eff6ff'
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
  padding: '8px 10px'
};

const gridStyle = {
  flex: 1,
  overflowY: 'auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '12px'
};

const cardStyle = {
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'rgba(148, 163, 184, 0.2)',
  borderRadius: '10px',
  background: 'rgba(15, 23, 42, 0.6)',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const cardNameStyle = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#eff6ff',
  wordBreak: 'break-word'
};

const metaStyle = {
  fontSize: '11px',
  color: '#94a3b8'
};

const rowStyle = {
  display: 'flex',
  gap: '6px'
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
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
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
    previewUrl: audioFile.file_name && token
      ? `${API_BASE_URL}/api/audio/stream/${audioFile.file_name}?token=${encodeURIComponent(token)}`
      : null
  };
};

const SoundLibraryModal = ({ onClose }) => {
  const { projectId } = useParams();
  const fileInputRef = useRef(null);
  const previewAudioRef = useRef(new Audio());

  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [libraryMessage, setLibraryMessage] = useState('');
  const [previewingAssetId, setPreviewingAssetId] = useState(null);

  const loadAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await apiService.getAudioFiles();
      const rows = response?.data || [];
      setAssets(rows.map((row) => mapAudioFileToAsset(row, token)));
    } catch (error) {
      setLibraryMessage(`Failed to load library: ${error.message}`);
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  useEffect(() => {
    if (!libraryMessage) return undefined;
    const timer = setTimeout(() => setLibraryMessage(''), 2400);
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

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const handleUpload = async (files) => {
    const selectedFiles = Array.from(files || []);
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      try {
        await apiService.uploadAudioFile(file);
      } catch (error) {
        setLibraryMessage(`Upload failed for ${file.name}: ${error.message}`);
      }
    }

    await loadAssets();
    setLibraryMessage('Upload complete.');
  };

  const handlePreview = async (asset) => {
    const previewAudio = previewAudioRef.current;
    if (previewingAssetId === asset.id && !previewAudio.paused) {
      previewAudio.pause();
      previewAudio.currentTime = 0;
      setPreviewingAssetId(null);
      return;
    }

    if (!asset.previewUrl) {
      setLibraryMessage(`Preview unavailable for "${asset.name}"`);
      return;
    }

    try {
      previewAudio.pause();
      previewAudio.src = asset.previewUrl;
      previewAudio.currentTime = 0;
      await previewAudio.play();
      setPreviewingAssetId(asset.id);
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
          key: asset.key || '-',
          bpm: Number(asset.bpm || 0)
        }
      });

      setLibraryMessage(`Added "${asset.name}" to timeline.`);
    } catch (error) {
      setLibraryMessage(`Add failed: ${error.message}`);
    }
  };

  return (
    <div style={modalStyle}>
      <div style={modalHeaderStyle}>
        <h2 style={modalTitleStyle}>Sound Library</h2>
        <button type="button" style={closeBtnStyle} onClick={onClose}>
          x
        </button>
      </div>

      <div style={modalBodyStyle}>
        <div style={controlsStyle}>
          <button type="button" style={buttonStyle} onClick={() => fileInputRef.current?.click()}>
            Upload Audio
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={async (e) => {
              await handleUpload(e.target.files);
              e.target.value = '';
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search uploaded audio..."
            style={{ ...inputStyle, minWidth: '230px' }}
          />
          <button type="button" style={buttonStyle} onClick={loadAssets}>
            Refresh
          </button>
        </div>

        <div style={controlsStyle}>
          {availableTags.map((tag) => (
            <button
              key={tag}
              type="button"
              style={selectedTags.includes(tag) ? tagActiveStyle : tagStyle}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </button>
          ))}
          {availableTags.length === 0 && <span style={metaStyle}>No tags yet.</span>}
        </div>

        {libraryMessage && <div style={statusMessageStyle}>{libraryMessage}</div>}

        <div style={gridStyle}>
          {isLoading ? (
            <div style={metaStyle}>Loading audio library...</div>
          ) : filteredAssets.length === 0 ? (
            <div style={metaStyle}>No uploaded audio files found.</div>
          ) : (
            filteredAssets.map((asset) => (
              <div key={asset.id} style={cardStyle}>
                <div style={cardNameStyle}>{asset.name}</div>
                <div style={metaStyle}>Format: {asset.format.toUpperCase()}</div>
                <div style={metaStyle}>Duration: {asset.duration}</div>
                <div style={metaStyle}>Size: {asset.size}</div>
                <div style={rowStyle}>
                  <button type="button" style={buttonStyle} onClick={() => handlePreview(asset)}>
                    {previewingAssetId === asset.id ? 'Stop' : 'Preview'}
                  </button>
                  <button type="button" style={buttonStyle} onClick={() => handleAddToTimeline(asset)}>
                    Add To Timeline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SoundLibraryModal;
