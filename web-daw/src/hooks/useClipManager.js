/**
 * useClipManager Hook
 * Manages clip creation, positioning, and editing on the timeline
 */

import { useState, useCallback } from 'react';

const useClipManager = (tracks, setTracks) => {
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Add a new clip to a track
  const addClip = useCallback((trackId, clipData) => {
    const newClip = {
      id: `clip-${Date.now()}`,
      name: clipData.name || 'New Clip',
      type: clipData.type || 'audio',
      startTime: clipData.startTime || 0,
      duration: clipData.duration || 4,
      audioId: clipData.audioId || null,
      ...clipData
    };

    console.log('[ClipManager] Adding clip:', newClip, 'to track:', trackId);

    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: [...(track.clips || []), newClip]
        };
      }
      return track;
    }));

    return newClip.id;
  }, [setTracks]);

  // Delete a clip
  const deleteClip = useCallback((trackId, clipId) => {
    console.log('[ClipManager] Deleting clip:', clipId, 'from track:', trackId);

    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: track.clips.filter(clip => clip.id !== clipId)
        };
      }
      return track;
    }));

    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  }, [selectedClipId, setTracks]);

  // Move clip to new time position
  const moveClip = useCallback((trackId, clipId, newStartTime) => {
    console.log('[ClipManager] Moving clip:', clipId, 'to time:', newStartTime);

    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: track.clips.map(clip => {
            if (clip.id === clipId) {
              return { ...clip, startTime: Math.max(0, newStartTime) };
            }
            return clip;
          })
        };
      }
      return track;
    }));
  }, [setTracks]);

  // Resize clip duration
  const resizeClip = useCallback((trackId, clipId, newDuration) => {
    const clampedDuration = Math.max(0.5, newDuration);
    console.log('[ClipManager] Resizing clip:', clipId, 'to duration:', clampedDuration);

    setTracks(prev => prev.map(track => {
      if (track.id === trackId) {
        return {
          ...track,
          clips: track.clips.map(clip => {
            if (clip.id === clipId) {
              return { ...clip, duration: clampedDuration };
            }
            return clip;
          })
        };
      }
      return track;
    }));
  }, [setTracks]);

  // Move clip to different track
  const moveClipToTrack = useCallback((fromTrackId, toTrackId, clipId, newStartTime) => {
    console.log('[ClipManager] Moving clip:', clipId, 'from track:', fromTrackId, 'to track:', toTrackId);

    let clipToMove = null;

    // Remove from source track
    setTracks(prev => {
      const updated = prev.map(track => {
        if (track.id === fromTrackId) {
          clipToMove = track.clips.find(c => c.id === clipId);
          return {
            ...track,
            clips: track.clips.filter(c => c.id !== clipId)
          };
        }
        return track;
      });
      return updated;
    });

    // Add to destination track
    if (clipToMove) {
      setTracks(prev => prev.map(track => {
        if (track.id === toTrackId) {
          return {
            ...track,
            clips: [...(track.clips || []), { ...clipToMove, startTime: newStartTime }]
          };
        }
        return track;
      }));
    }
  }, [setTracks]);

  // Select a clip
  const selectClip = useCallback((clipId) => {
    console.log('[ClipManager] Clip selected:', clipId, 'Previous:', selectedClipId);
    setSelectedClipId(clipId);
  }, [selectedClipId]);

  // Get clip by ID
  const getClip = useCallback((clipId) => {
    for (const track of tracks) {
      const clip = track.clips?.find(c => c.id === clipId);
      if (clip) return { clip, trackId: track.id };
    }
    return null;
  }, [tracks]);

  // Start dragging
  const startDrag = useCallback((clipId, mouseX, mouseY, clipStartX) => {
    setIsDragging(true);
    setSelectedClipId(clipId);
    setDragOffset({ x: mouseX - clipStartX, y: 0 });
    console.log('[ClipManager] Started dragging clip:', clipId);
  }, []);

  // End dragging
  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  return {
    selectedClipId,
    isDragging,
    dragOffset,
    addClip,
    deleteClip,
    moveClip,
    resizeClip,
    moveClipToTrack,
    selectClip,
    getClip,
    startDrag,
    endDrag,
    setIsDragging
  };
};

export default useClipManager;
