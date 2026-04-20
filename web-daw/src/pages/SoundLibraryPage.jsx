import React, { useState, useRef, useEffect } from 'react';
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

const sidebarStyle = {
  width: '280px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const uploadSectionStyle = {
  border: '2px dashed rgba(148, 163, 184, 0.4)',
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
  border: '1px solid rgba(148, 163, 184, 0.2)'
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
  border: '1px solid rgba(148, 163, 184, 0.3)',
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
  border: '1px solid rgba(148, 163, 184, 0.3)',
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
  border: '1px solid rgba(148, 163, 184, 0.2)',
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
  border: '1px solid rgba(148, 163, 184, 0.3)',
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

// Sample data
const initialAssets = [
  {
    id: 1,
    name: 'Kick_808_Heavy',
    type: 'audio',
    format: 'wav',
    duration: '0.5s',
    size: '2.1 MB',
    tags: ['drums', 'kick', '808', 'heavy'],
    bpm: 120,
    key: 'C',
    uploaded: new Date('2024-01-15')
  },
  {
    id: 2,
    name: 'Snare_Punchy',
    type: 'audio',
    format: 'wav',
    duration: '0.3s',
    size: '1.8 MB',
    tags: ['drums', 'snare', 'punchy'],
    bpm: 120,
    key: 'C',
    uploaded: new Date('2024-01-14')
  },
  {
    id: 3,
    name: 'HiHat_Closed_16th',
    type: 'audio',
    format: 'wav',
    duration: '0.1s',
    size: '0.8 MB',
    tags: ['drums', 'hihat', 'closed'],
    bpm: 120,
    key: 'C',
    uploaded: new Date('2024-01-13')
  },
  {
    id: 4,
    name: 'Bass_Sub_Drop',
    type: 'audio',
    format: 'wav',
    duration: '2.0s',
    size: '4.2 MB',
    tags: ['bass', 'sub', 'drop'],
    bpm: 140,
    key: 'G',
    uploaded: new Date('2024-01-12')
  },
  {
    id: 5,
    name: 'Synth_Lead_Arpeggio',
    type: 'audio',
    format: 'wav',
    duration: '4.0s',
    size: '6.8 MB',
    tags: ['synth', 'lead', 'melody'],
    bpm: 128,
    key: 'Am',
    uploaded: new Date('2024-01-11')
  },
  {
    id: 6,
    name: 'Vocal_Chops_Phrase',
    type: 'audio',
    format: 'wav',
    duration: '1.5s',
    size: '3.2 MB',
    tags: ['vocal', 'chops', 'phrase'],
    bpm: 90,
    key: 'F',
    uploaded: new Date('2024-01-10')
  },
  {
    id: 7,
    name: 'Drum_Loop_HipHop',
    type: 'audio',
    format: 'wav',
    duration: '4.0s',
    size: '7.1 MB',
    tags: ['drums', 'loop', 'hiphop'],
    bpm: 90,
    key: 'C',
    uploaded: new Date('2024-01-09')
  },
  {
    id: 8,
    name: 'Pad_Atmospheric_Wash',
    type: 'audio',
    format: 'wav',
    duration: '8.0s',
    size: '12.4 MB',
    tags: ['pad', 'atmospheric', 'wash'],
    bpm: 0,
    key: 'Dm',
    uploaded: new Date('2024-01-08')
  }
];

const availableTags = [
  'drums', 'bass', 'synth', 'vocal', 'loop', 'kick', 'snare', 'hihat',
  'lead', 'pad', 'melody', 'chops', 'phrase', '808', 'sub', 'atmospheric',
  'punchy', 'heavy', 'closed', 'drop', 'arpeggio', 'hiphop', 'wash'
];

const SoundLibraryPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [assets, setAssets] = useState(initialAssets);
  const [filteredAssets, setFilteredAssets] = useState(initialAssets);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [hoveredAsset, setHoveredAsset] = useState(null);
  const [draggedAsset, setDraggedAsset] = useState(null);
  
  const fileInputRef = useRef(null);

  // Filter assets based on search and tags
  useEffect(() => {
    let filtered = assets;

    if (searchQuery) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(asset =>
        selectedTags.some(tag => asset.tags.includes(tag))
      );
    }

    setFilteredAssets(filtered);
  }, [assets, searchQuery, selectedTags]);

  const handleFileSelect = (files) => {
    Array.from(files).forEach(file => {
      const newAsset = {
        id: Date.now() + Math.random(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'audio',
        format: file.name.split('.').pop().toLowerCase(),
        duration: '0.0s',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        tags: [],
        bpm: 0,
        key: 'C',
        uploaded: new Date()
      };

      setAssets(prev => [...prev, newAsset]);
      
      // Simulate upload progress
      const assetId = newAsset.id;
      setUploadProgress(prev => ({ ...prev, [assetId]: 0 }));
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[assetId] || 0;
          if (current >= 100) {
            clearInterval(progressInterval);
            const newProgress = { ...prev };
            delete newProgress[assetId];
            return newProgress;
          }
          return { ...prev, [assetId]: current + 10 };
        });
      }, 200);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
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

  const handlePreview = (asset) => {
    console.log('Preview asset:', asset);
    // TODO: Implement audio preview
  };

  const handleAddToTimeline = (asset) => {
    console.log('Add to timeline:', asset);
    // TODO: Add asset to timeline
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
                style={toggleBtnActiveStyle}
              >
                Sound Library
              </button>
            </div>
          </div>

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
                  onChange={(e) => handleFileSelect(e.target.files)}
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
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                    e.target.style.background = 'rgba(8, 12, 18, 0.8)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                    e.target.style.background = 'rgba(8, 12, 18, 0.6)';
                  }}
                />
              </div>
            </div>

            <div style={mainContentStyle}>
              {filteredAssets.length === 0 ? (
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
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                            e.target.style.background = 'rgba(30, 64, 175, 0.3)';
                            e.target.style.color = '#eff6ff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                            e.target.style.background = 'rgba(15, 23, 42, 0.4)';
                            e.target.style.color = '#bfdbfe';
                          }}
                          onClick={() => handlePreview(asset)}
                        >
                          🔊 Preview
                        </button>
                        <button
                          type="button"
                          style={actionBtnStyle}
                          onMouseEnter={(e) => {
                            e.target.style.borderColor = 'rgba(96, 165, 250, 0.5)';
                            e.target.style.background = 'rgba(30, 64, 175, 0.3)';
                            e.target.style.color = '#eff6ff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                            e.target.style.background = 'rgba(15, 23, 42, 0.4)';
                            e.target.style.color = '#bfdbfe';
                          }}
                          onClick={() => handleAddToTimeline(asset)}
                        >
                          ➕ Add to Timeline
                        </button>
                      </div>

                      {uploadProgress[asset.id] !== undefined && (
                        <div style={progressBarStyle}>
                          <div
                            style={{
                              ...progressFillStyle,
                              width: `${uploadProgress[asset.id]}%`
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
