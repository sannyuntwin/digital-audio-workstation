/**
 * Audio Uploader Component
 * Handles audio file uploads with drag & drop
 */

import React, { useState, useCallback } from 'react';
import '../index.css';

const AudioUploader = ({ onAudioUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = useCallback((file) => {
    if (!file) return;

    // Check file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/m4a'];
    if (!validTypes.includes(file.type)) {
      setUploadStatus('Invalid file type. Please upload MP3, WAV, OGG, FLAC, AAC, or M4A files.');
      return;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setUploadStatus('File too large. Maximum size is 50MB.');
      return;
    }

    setUploadStatus('Uploading...');
    setUploadProgress(0);

    // Create FormData for upload
    const formData = new FormData();
    formData.append('audio', file);

    // Upload to backend
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:8000/api/audio/upload', true);

    // Track progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        setUploadStatus('Upload complete!');
        setUploadProgress(100);
        
        try {
          const response = JSON.parse(xhr.responseText);
          if (onAudioUpload && response.success) {
            onAudioUpload(response.data);
          }
        } catch (error) {
          setUploadStatus('Upload complete, but failed to process response');
        }
      } else {
        setUploadStatus(`Upload failed with status: ${xhr.status}`);
      }
    };

    xhr.onerror = () => {
      setUploadStatus('Upload failed. Please try again.');
    };

    xhr.send(formData);
  }, [onAudioUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  return (
    <div className="audio-uploader">
      <h3>🎵 Upload Audio Files</h3>
      
      <div 
        className={`upload-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📁</div>
          <p>
            {isDragging ? 'Drop audio file here' : 'Drag & drop audio files here'}
          </p>
          <p className="upload-hint">
            or click to select files
          </p>
        </div>
        
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="file-input"
        />
      </div>

      <div className="upload-controls">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="file-input-button"
        />
        <button className="browse-btn">
          📁 Browse Files
        </button>
      </div>

      {uploadStatus && (
        <div className="upload-status">
          <div className="status-message">{uploadStatus}</div>
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioUploader;
