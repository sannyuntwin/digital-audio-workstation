import React from 'react';

// ============ STYLES ============
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
  borderRadius: '4px',
  transition: 'all 0.2s ease'
};

const modalBodyStyle = {
  flex: 1,
  padding: '20px',
  overflow: 'auto',
  background: 'linear-gradient(180deg, rgba(11, 17, 29, 0.72) 0%, rgba(8, 12, 20, 0.9) 100%)'
};

const pianoRollGridStyle = {
  height: '100%',
  borderRadius: '10px',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  background: 'repeating-linear-gradient(0deg, rgba(148, 163, 184, 0.08) 0px, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.08) 0px, rgba(148, 163, 184, 0.08) 1px, transparent 1px, transparent 56px)',
  position: 'relative',
  overflow: 'hidden'
};

const noteStyle = {
  position: 'absolute',
  height: '14px',
  borderRadius: '4px',
  background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)',
  border: '1px solid rgba(191, 219, 254, 0.6)'
};

const emptyStateStyle = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#93c5fd',
  fontSize: '16px'
};

const PianoRollModal = ({ tracks, clips, onClose }) => {
  const pianoNotes = clips.slice(0, 20).map((clip, index) => ({
    id: clip.id,
    left: `${Math.min(88, clip.startTime * 3.4)}%`,
    width: `${Math.max(8, clip.duration * 2.8)}%`,
    top: `${8 + ((index * 14) % 78)}%`
  }));

  return (
    <div style={modalStyle}>
      <div style={modalHeaderStyle}>
        <h2 style={modalTitleStyle}>Piano Roll Editor</h2>
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
        <div style={pianoRollGridStyle}>
          {pianoNotes.length === 0 ? (
            <div style={emptyStateStyle}>
              No MIDI clips found. Add MIDI clips to the timeline to edit them here.
            </div>
          ) : (
            pianoNotes.map(note => (
              <div
                key={note.id}
                style={{ ...noteStyle, left: note.left, width: note.width, top: note.top }}
                title="MIDI Note Block"
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PianoRollModal;
