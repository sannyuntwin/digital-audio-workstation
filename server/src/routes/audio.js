/**
 * Audio API Routes
 * Handle audio file uploads, downloads, and management
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  saveAudioFile,
  deleteAudioFile,
  getAudioMetadata,
  listAudioFiles,
  formatFileSize,
  getAudioDuration,
  validateAudioFile
} = require('../utils/audioUtils');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/temp');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const validation = validateAudioFile(file);
  if (validation.isValid) {
    cb(null, true);
  } else {
    cb(new Error(validation.errors.join(', ')), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10 // Maximum 10 files at once
  }
});

// Ensure temp directory exists
const fs = require('fs-extra');
fs.ensureDirSync('./uploads/temp');

// Get all uploaded audio files
router.get('/files', optionalAuth, async (req, res) => {
  try {
    const files = await listAudioFiles();
    const filesWithMetadata = await Promise.all(
      files.map(async (file) => {
        const duration = await getAudioDuration(file.path);
        return {
          ...file,
          duration,
          sizeFormatted: formatFileSize(file.size)
        };
      })
    );

    res.json({
      success: true,
      count: filesWithMetadata.length,
      data: filesWithMetadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single audio file metadata
router.get('/files/:filename', optionalAuth, async (req, res) => {
  try {
    const filePath = path.join('./uploads', req.params.filename);
    const metadata = await getAudioMetadata(filePath);
    const duration = await getAudioDuration(filePath);

    res.json({
      success: true,
      data: {
        ...metadata,
        duration,
        sizeFormatted: formatFileSize(metadata.size)
      }
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
});

// Upload single audio file
router.post('/upload', optionalAuth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const fileInfo = await saveAudioFile(req.file);
    const duration = await getAudioDuration(fileInfo.path);

    res.status(201).json({
      success: true,
      data: {
        ...fileInfo,
        duration,
        sizeFormatted: formatFileSize(fileInfo.size),
        url: `/uploads/${fileInfo.filename}`
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Upload multiple audio files
router.post('/upload-multiple', optionalAuth, upload.array('audio', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const savedFiles = await Promise.all(
      req.files.map(async (file) => {
        const fileInfo = await saveAudioFile(file);
        const duration = await getAudioDuration(fileInfo.path);
        return {
          ...fileInfo,
          duration,
          sizeFormatted: formatFileSize(fileInfo.size),
          url: `/uploads/${fileInfo.filename}`
        };
      })
    );

    res.status(201).json({
      success: true,
      count: savedFiles.length,
      data: savedFiles
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Delete audio file
router.delete('/files/:filename', optionalAuth, async (req, res) => {
  try {
    const filePath = path.join('./uploads', req.params.filename);
    const deleted = await deleteAudioFile(filePath);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get audio file for streaming/download
router.get('/stream/:filename', optionalAuth, async (req, res) => {
  try {
    const filePath = path.join('./uploads', req.params.filename);
    
    // Check if file exists
    const fs = require('fs-extra');
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Get file metadata
    const metadata = await getAudioMetadata(filePath);
    
    // Set headers for audio streaming
    res.setHeader('Content-Type', metadata.mimetype);
    res.setHeader('Content-Length', metadata.size);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Handle range requests for streaming
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : metadata.size - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${metadata.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': metadata.mimetype,
      });
      
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // Send entire file
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get supported audio formats
router.get('/formats', (req, res) => {
  res.json({
    success: true,
    data: {
      supportedFormats: [
        { format: 'MP3', mimetype: 'audio/mpeg', extensions: ['.mp3'] },
        { format: 'WAV', mimetype: 'audio/wav', extensions: ['.wav'] },
        { format: 'OGG', mimetype: 'audio/ogg', extensions: ['.ogg'] },
        { format: 'AAC', mimetype: 'audio/aac', extensions: ['.aac'] },
        { format: 'FLAC', mimetype: 'audio/flac', extensions: ['.flac'] },
        { format: 'M4A', mimetype: 'audio/m4a', extensions: ['.m4a'] }
      ],
      maxFileSize: '50MB',
      maxFiles: 10
    }
  });
});

module.exports = router;
