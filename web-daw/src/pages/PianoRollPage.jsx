import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiService from '../services/apiService';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const TOTAL_BEATS = 32;
const BEAT_WIDTH = 44;
const ROW_HEIGHT = 24;
const MIN_DURATION = 0.125;

const pageStyle = {
  minHeight: '100vh',
  padding: '16px',
  background: 'radial-gradient(circle at 10% 0%, #294062 0%, #131a2a 45%, #0a0e17 100%)',
  color: '#e2e8f0',
  fontFamily: '"Avenir Next", "SF Pro Display", "Segoe UI", sans-serif'
};

const shellStyle = {
  minHeight: 'calc(100vh - 32px)',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  background: 'rgba(7, 11, 19, 0.86)',
  boxShadow: '0 28px 60px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column'
};

const topBarStyle = {
  minHeight: '62px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '10px 14px',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'linear-gradient(90deg, rgba(17, 24, 39, 0.95) 0%, rgba(20, 32, 54, 0.82) 50%, rgba(17, 24, 39, 0.95) 100%)',
  flexWrap: 'wrap'
};

const leftTopStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap'
};

const backBtnStyle = {
  height: '34px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  borderRadius: '8px',
  background: 'rgba(15, 23, 42, 0.55)',
  color: '#e2e8f0',
  fontSize: '12px',
  fontWeight: 700,
  padding: '0 11px',
  cursor: 'pointer'
};

const titleStyle = {
  fontSize: '16px',
  fontWeight: 800,
  color: '#f8fafc'
};

const metaStyle = {
  fontSize: '12px',
  color: '#93c5fd'
};

const controlsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap'
};

const controlBtnStyle = {
  height: '32px',
  border: '1px solid rgba(148, 163, 184, 0.32)',
  borderRadius: '8px',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#e2e8f0',
  fontSize: '12px',
  fontWeight: 700,
  padding: '0 10px',
  cursor: 'pointer'
};

const controlBtnActiveStyle = {
  ...controlBtnStyle,
  borderColor: 'rgba(96, 165, 250, 0.64)',
  background: 'rgba(30, 64, 175, 0.35)',
  color: '#eff6ff'
};

const controlSelectStyle = {
  height: '32px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  borderRadius: '8px',
  background: 'rgba(15, 23, 42, 0.5)',
  color: '#e2e8f0',
  fontSize: '12px',
  padding: '0 9px',
  outline: 'none',
  cursor: 'pointer'
};

const appBodyStyle = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  gap: '10px',
  padding: '10px'
};

const editorPaneStyle = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '12px',
  overflow: 'hidden',
  background: 'linear-gradient(180deg, rgba(10, 14, 25, 0.92) 0%, rgba(8, 13, 20, 0.96) 100%)'
};

const rulerRowStyle = {
  height: '32px',
  display: 'grid',
  gridTemplateColumns: '92px 1fr',
  borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
  background: 'rgba(15, 23, 42, 0.75)'
};

const keyHeaderStyle = {
  borderRight: '1px solid rgba(148, 163, 184, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.4px',
  textTransform: 'uppercase',
  color: '#bfdbfe'
};

const rulerViewportStyle = {
  overflow: 'hidden',
  position: 'relative'
};

const rulerTrackStyle = {
  height: '100%',
  position: 'relative'
};

const beatLabelStyle = {
  position: 'absolute',
  top: '7px',
  fontSize: '11px',
  color: '#bfdbfe',
  fontWeight: 700
};

const bodyGridStyle = {
  flex: 1,
  minHeight: 0,
  display: 'grid',
  gridTemplateColumns: '92px 1fr'
};

const keyViewportStyle = {
  borderRight: '1px solid rgba(148, 163, 184, 0.2)',
  overflow: 'hidden',
  background: 'rgba(15, 23, 42, 0.5)'
};

const keyTrackStyle = {
  position: 'relative'
};

const keyRowStyle = {
  height: `${ROW_HEIGHT}px`,
  borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 8px',
  fontSize: '11px',
  color: '#cbd5e1'
};

const keyBlackRowStyle = {
  ...keyRowStyle,
  background: 'rgba(15, 23, 42, 0.46)'
};

const gridScrollerStyle = {
  overflow: 'auto',
  position: 'relative',
  background: 'rgba(3, 6, 13, 0.42)'
};

const gridInnerStyle = {
  position: 'relative'
};

const laneRowStyle = {
  height: `${ROW_HEIGHT}px`,
  borderBottom: '1px solid rgba(148, 163, 184, 0.12)'
};

const laneRowAltStyle = {
  ...laneRowStyle,
  background: 'rgba(15, 23, 42, 0.26)'
};

const beatLineStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  width: '1px',
  background: 'rgba(148, 163, 184, 0.18)',
  pointerEvents: 'none'
};

const barLineStyle = {
  ...beatLineStyle,
  width: '2px',
  background: 'rgba(147, 197, 253, 0.35)'
};

const noteStyle = {
  position: 'absolute',
  height: `${ROW_HEIGHT - 4}px`,
  top: '2px',
  borderRadius: '5px',
  border: '1px solid rgba(191, 219, 254, 0.65)',
  cursor: 'grab',
  userSelect: 'none',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.32)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 4px 0 6px',
  fontSize: '10px',
  color: '#e2e8f0'
};

const noteSelectedStyle = {
  boxShadow: '0 0 0 2px rgba(56, 189, 248, 0.74), 0 2px 8px rgba(0, 0, 0, 0.36)'
};

const resizeHandleStyle = {
  width: '7px',
  height: '100%',
  borderRadius: '4px',
  background: 'rgba(191, 219, 254, 0.55)',
  cursor: 'ew-resize'
};

const sidePaneStyle = {
  width: '252px',
  minWidth: '252px',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  borderRadius: '12px',
  padding: '10px',
  background: 'linear-gradient(180deg, rgba(20, 28, 42, 0.9) 0%, rgba(14, 20, 30, 0.95) 100%)',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px'
};

const sideTitleStyle = {
  margin: 0,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: '#93c5fd',
  fontWeight: 800
};

const cardStyle = {
  border: '1px solid rgba(148, 163, 184, 0.24)',
  borderRadius: '10px',
  padding: '10px',
  background: 'rgba(15, 23, 42, 0.54)'
};

const cardLabelStyle = {
  margin: 0,
  fontSize: '11px',
  color: '#bfdbfe',
  fontWeight: 700
};

const cardValueStyle = {
  margin: '4px 0 0',
  fontSize: '14px',
  color: '#f8fafc',
  fontWeight: 700
};

const sliderStyle = {
  width: '100%',
  marginTop: '8px',
  cursor: 'pointer'
};

const helperTextStyle = {
  margin: 0,
  fontSize: '12px',
  lineHeight: 1.4,
  color: '#cbd5e1'
};

const createPitchRows = (minMidi = 48, maxMidi = 84) => {
  const rows = [];
  for (let midi = maxMidi; midi >= minMidi; midi -= 1) {
    const note = NOTE_NAMES[midi % 12];
    const octave = Math.floor(midi / 12) - 1;
    rows.push({
      midi,
      label: `${note}${octave}`,
      isBlack: note.includes('#')
    });
  }
  return rows;
};

const quantizeValue = (value, step) => Math.round(value / step) * step;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const PITCH_ROWS = createPitchRows();

const PianoRollPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [projectName, setProjectName] = useState('Loading project...');
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapStep, setSnapStep] = useState(0.25);
  const [defaultDuration, setDefaultDuration] = useState(0.5);
  const [defaultVelocity, setDefaultVelocity] = useState(96);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [dragState, setDragState] = useState(null);
  const [notes, setNotes] = useState([
    { id: 1, start: 0, duration: 1, pitch: 72, velocity: 96 },
    { id: 2, start: 1, duration: 1, pitch: 74, velocity: 88 },
    { id: 3, start: 2, duration: 1.5, pitch: 76, velocity: 105 },
    { id: 4, start: 4, duration: 0.5, pitch: 67, velocity: 90 }
  ]);

  const pitchIndexByMidi = useMemo(
    () => new Map(PITCH_ROWS.map((pitch, index) => [pitch.midi, index])),
    []
  );
  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await apiService.getProject(projectId);
        const project = response?.data || response;
        setProjectName(project?.name || 'Unnamed Project');
      } catch (error) {
        setProjectName('Unnamed Project');
      }
    };
    fetchProject();
  }, [projectId]);

  const snapBeat = useCallback(
    (value) => (snapEnabled ? quantizeValue(value, snapStep) : value),
    [snapEnabled, snapStep]
  );

  const handleGridDoubleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const beat = clamp(
      snapBeat((event.clientX - rect.left) / BEAT_WIDTH),
      0,
      TOTAL_BEATS - MIN_DURATION
    );
    const rowIndex = clamp(Math.floor((event.clientY - rect.top) / ROW_HEIGHT), 0, PITCH_ROWS.length - 1);
    const note = {
      id: Date.now(),
      start: beat,
      duration: Math.max(snapStep, defaultDuration),
      pitch: PITCH_ROWS[rowIndex].midi,
      velocity: defaultVelocity
    };
    setNotes((prev) => [...prev, note]);
    setSelectedNoteId(note.id);
  };

  const startDragNote = (event, note, mode) => {
    event.stopPropagation();
    setSelectedNoteId(note.id);
    setDragState({
      noteId: note.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      originStart: note.start,
      originDuration: note.duration,
      originPitchIndex: pitchIndexByMidi.get(note.pitch) ?? 0
    });
  };

  useEffect(() => {
    if (!dragState) return undefined;

    const onMouseMove = (event) => {
      setNotes((prev) =>
        prev.map((note) => {
          if (note.id !== dragState.noteId) return note;

          const deltaBeat = (event.clientX - dragState.startX) / BEAT_WIDTH;
          if (dragState.mode === 'move') {
            const nextStart = clamp(
              snapBeat(dragState.originStart + deltaBeat),
              0,
              TOTAL_BEATS - MIN_DURATION
            );
            const deltaRows = Math.round((event.clientY - dragState.startY) / ROW_HEIGHT);
            const nextPitchIndex = clamp(
              dragState.originPitchIndex + deltaRows,
              0,
              PITCH_ROWS.length - 1
            );
            return { ...note, start: nextStart, pitch: PITCH_ROWS[nextPitchIndex].midi };
          }

          const minimumDuration = snapEnabled ? snapStep : MIN_DURATION;
          const nextDuration = clamp(
            snapBeat(dragState.originDuration + deltaBeat),
            minimumDuration,
            TOTAL_BEATS - note.start
          );
          return { ...note, duration: nextDuration };
        })
      );
    };

    const onMouseUp = () => setDragState(null);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragState, snapBeat, snapEnabled, snapStep]);

  useEffect(() => {
    const handleDelete = (event) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNoteId !== null) {
        event.preventDefault();
        setNotes((prev) => prev.filter((note) => note.id !== selectedNoteId));
        setSelectedNoteId(null);
      }
    };

    window.addEventListener('keydown', handleDelete);
    return () => window.removeEventListener('keydown', handleDelete);
  }, [selectedNoteId]);

  const updateSelectedVelocity = (value) => {
    const velocity = parseInt(value, 10);
    if (!selectedNoteId) return;
    setNotes((prev) => prev.map((note) => (note.id === selectedNoteId ? { ...note, velocity } : note)));
  };

  const quantizeNotes = (target) => {
    setNotes((prev) =>
      prev.map((note) => {
        if (target === 'selected' && note.id !== selectedNoteId) return note;
        const start = clamp(quantizeValue(note.start, snapStep), 0, TOTAL_BEATS - MIN_DURATION);
        const duration = clamp(
          Math.max(snapStep, quantizeValue(note.duration, snapStep)),
          snapStep,
          TOTAL_BEATS - start
        );
        return { ...note, start, duration };
      })
    );
  };

  const totalWidth = TOTAL_BEATS * BEAT_WIDTH;
  const totalHeight = PITCH_ROWS.length * ROW_HEIGHT;

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={topBarStyle}>
          <div style={leftTopStyle}>
            <button type="button" style={backBtnStyle} onClick={() => navigate(`/daw/${projectId}`)}>
              Back To DAW
            </button>
            <span style={titleStyle}>Piano Roll</span>
            <span style={metaStyle}>{projectName}</span>
          </div>
          <div style={controlsStyle}>
            <button
              type="button"
              style={snapEnabled ? controlBtnActiveStyle : controlBtnStyle}
              onClick={() => setSnapEnabled((prev) => !prev)}
            >
              Snap {snapEnabled ? 'On' : 'Off'}
            </button>
            <select
              style={controlSelectStyle}
              value={snapStep}
              onChange={(event) => setSnapStep(parseFloat(event.target.value))}
              title="Grid Snap"
            >
              <option value={1}>1/4</option>
              <option value={0.5}>1/8</option>
              <option value={0.25}>1/16</option>
              <option value={0.125}>1/32</option>
            </select>
            <select
              style={controlSelectStyle}
              value={defaultDuration}
              onChange={(event) => setDefaultDuration(parseFloat(event.target.value))}
              title="Default Duration"
            >
              <option value={0.25}>Note 1/16</option>
              <option value={0.5}>Note 1/8</option>
              <option value={1}>Note 1/4</option>
              <option value={2}>Note 1/2</option>
            </select>
            <button type="button" style={controlBtnStyle} onClick={() => quantizeNotes('selected')}>
              Quantize Selected
            </button>
            <button type="button" style={controlBtnStyle} onClick={() => quantizeNotes('all')}>
              Quantize All
            </button>
          </div>
        </div>

        <div style={appBodyStyle}>
          <div style={editorPaneStyle}>
            <div style={rulerRowStyle}>
              <div style={keyHeaderStyle}>Pitch</div>
              <div style={rulerViewportStyle}>
                <div
                  style={{
                    ...rulerTrackStyle,
                    width: `${totalWidth}px`,
                    transform: `translateX(-${scrollLeft}px)`
                  }}
                >
                  {Array.from({ length: TOTAL_BEATS + 1 }).map((_, beat) => (
                    <div key={`beat-${beat}`}>
                      <div
                        style={{
                          ...(beat % 4 === 0 ? barLineStyle : beatLineStyle),
                          left: `${beat * BEAT_WIDTH}px`
                        }}
                      />
                      {beat % 4 === 0 && (
                        <span style={{ ...beatLabelStyle, left: `${beat * BEAT_WIDTH + 4}px` }}>
                          {Math.floor(beat / 4) + 1}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={bodyGridStyle}>
              <div style={keyViewportStyle}>
                <div
                  style={{
                    ...keyTrackStyle,
                    height: `${totalHeight}px`,
                    transform: `translateY(-${scrollTop}px)`
                  }}
                >
                  {PITCH_ROWS.map((pitch) => (
                    <div key={pitch.midi} style={pitch.isBlack ? keyBlackRowStyle : keyRowStyle}>
                      <span>{pitch.label}</span>
                      <span>{pitch.midi}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={gridScrollerStyle}
                onScroll={(event) => {
                  setScrollLeft(event.currentTarget.scrollLeft);
                  setScrollTop(event.currentTarget.scrollTop);
                }}
              >
                <div
                  style={{ ...gridInnerStyle, width: `${totalWidth}px`, height: `${totalHeight}px` }}
                  onDoubleClick={handleGridDoubleClick}
                >
                  {PITCH_ROWS.map((pitch) => (
                    <div
                      key={`lane-${pitch.midi}`}
                      style={pitch.isBlack ? laneRowAltStyle : laneRowStyle}
                    />
                  ))}

                  {Array.from({ length: TOTAL_BEATS + 1 }).map((_, beat) => (
                    <div
                      key={`line-${beat}`}
                      style={{
                        ...(beat % 4 === 0 ? barLineStyle : beatLineStyle),
                        left: `${beat * BEAT_WIDTH}px`
                      }}
                    />
                  ))}

                  {notes.map((note) => {
                    const rowIndex = pitchIndexByMidi.get(note.pitch) ?? 0;
                    const colorStrength = 0.36 + (note.velocity / 127) * 0.56;
                    return (
                      <div
                        key={note.id}
                        role="button"
                        tabIndex={0}
                        onMouseDown={(event) => startDragNote(event, note, 'move')}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedNoteId(note.id);
                        }}
                        style={{
                          ...noteStyle,
                          left: `${note.start * BEAT_WIDTH}px`,
                          top: `${rowIndex * ROW_HEIGHT + 2}px`,
                          width: `${Math.max(8, note.duration * BEAT_WIDTH)}px`,
                          background: `rgba(59, 130, 246, ${colorStrength})`,
                          ...(selectedNoteId === note.id ? noteSelectedStyle : {})
                        }}
                        title="Drag note to move. Drag right edge to resize."
                      >
                        <span>{note.velocity}</span>
                        <span
                          style={resizeHandleStyle}
                          onMouseDown={(event) => startDragNote(event, note, 'resize')}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <aside style={sidePaneStyle}>
            <p style={sideTitleStyle}>Note Inspector</p>
            <div style={cardStyle}>
              <p style={cardLabelStyle}>Selected Note</p>
              <p style={cardValueStyle}>
                {selectedNote ? `${NOTE_NAMES[selectedNote.pitch % 12]}${Math.floor(selectedNote.pitch / 12) - 1}` : 'None'}
              </p>
              <p style={{ ...helperTextStyle, marginTop: '8px' }}>
                Double click the grid to add MIDI notes. Use Delete or Backspace to remove the selected note.
              </p>
            </div>
            <div style={cardStyle}>
              <p style={cardLabelStyle}>Velocity</p>
              <p style={cardValueStyle}>{selectedNote ? selectedNote.velocity : '--'}</p>
              <input
                style={sliderStyle}
                type="range"
                min="1"
                max="127"
                value={selectedNote ? selectedNote.velocity : defaultVelocity}
                onChange={(event) => updateSelectedVelocity(event.target.value)}
                disabled={!selectedNote}
              />
            </div>
            <div style={cardStyle}>
              <p style={cardLabelStyle}>Default Velocity</p>
              <p style={cardValueStyle}>{defaultVelocity}</p>
              <input
                style={sliderStyle}
                type="range"
                min="1"
                max="127"
                value={defaultVelocity}
                onChange={(event) => setDefaultVelocity(parseInt(event.target.value, 10))}
              />
            </div>
            <div style={cardStyle}>
              <p style={cardLabelStyle}>Editing Shortcuts</p>
              <p style={helperTextStyle}>Double click grid: add note</p>
              <p style={helperTextStyle}>Drag note: move note</p>
              <p style={helperTextStyle}>Drag right handle: resize</p>
              <p style={helperTextStyle}>Delete key: remove note</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PianoRollPage;
