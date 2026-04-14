/**
 * Audio Utilities
 * Helper functions for audio file processing and validation
 */

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const { v4: uuidv4 } = require('uuid');

// Supported audio formats
const SUPPORTED_FORMATS = [
  'audio/mpeg',     // MP3
  'audio/wav',      // WAV
  'audio/ogg',      // OGG
  'audio/aac',      // AAC
  'audio/flac',     // FLAC
  'audio/m4a',      // M4A
  'audio/x-m4a'     // M4A (alternative)
];

// Maximum file size (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Validate audio file
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result
 */
const validateAudioFile = (file) => {
  const errors = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!SUPPORTED_FORMATS.includes(file.mimetype)) {
    errors.push(`Unsupported file type: ${file.mimetype}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
  }

  // Check if file exists
  if (!fs.existsSync(file.path)) {
    errors.push('File does not exist on server');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const name = path.basename(originalName, ext);
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  
  return `${name}_${timestamp}_${uuid}${ext}`;
};

/**
 * Save uploaded audio file
 * @param {Object} file - Multer file object
 * @param {string} uploadDir - Upload directory
 * @returns {Object} Saved file info
 */
const saveAudioFile = async (file, uploadDir = './uploads') => {
  try {
    // Validate file
    const validation = validateAudioFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Ensure upload directory exists
    await fs.ensureDir(uploadDir);

    // Generate unique filename
    const uniqueFilename = generateUniqueFilename(file.originalname);
    const filePath = path.join(uploadDir, uniqueFilename);

    // Move file to upload directory
    await fs.move(file.path, filePath);

    // Get file info
    const stats = await fs.stat(filePath);
    const fileInfo = {
      id: uuidv4(),
      originalName: file.originalname,
      filename: uniqueFilename,
      path: filePath,
      size: stats.size,
      mimetype: file.mimetype,
      extension: path.extname(file.originalname),
      uploadedAt: new Date().toISOString()
    };

    return fileInfo;
  } catch (error) {
    // Clean up temporary file if error occurs
    if (fs.existsSync(file.path)) {
      await fs.remove(file.path);
    }
    throw error;
  }
};

/**
 * Delete audio file
 * @param {string} filePath - File path to delete
 * @returns {boolean} Success status
 */
const deleteAudioFile = async (filePath) => {
  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting audio file:', error);
    return false;
  }
};

/**
 * Get audio file metadata
 * @param {string} filePath - File path
 * @returns {Object} File metadata
 */
const getAudioMetadata = async (filePath) => {
  try {
    if (!await fs.pathExists(filePath)) {
      throw new Error('File does not exist');
    }

    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimetype = mime.lookup(filePath) || 'unknown';

    return {
      size: stats.size,
      extension: ext,
      mimetype,
      createdAt: stats.birthtime.toISOString(),
      modifiedAt: stats.mtime.toISOString(),
      isAudio: SUPPORTED_FORMATS.includes(mimetype)
    };
  } catch (error) {
    throw new Error(`Failed to get metadata: ${error.message}`);
  }
};

/**
 * List all audio files in directory
 * @param {string} dir - Directory path
 * @returns {Array} Array of audio file info
 */
const listAudioFiles = async (dir = './uploads') => {
  try {
    if (!await fs.pathExists(dir)) {
      return [];
    }

    const files = await fs.readdir(dir);
    const audioFiles = [];

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isFile()) {
        const mimetype = mime.lookup(filePath);
        if (SUPPORTED_FORMATS.includes(mimetype)) {
          audioFiles.push({
            filename: file,
            path: filePath,
            size: stats.size,
            mimetype,
            extension: path.extname(file),
            createdAt: stats.birthtime.toISOString()
          });
        }
      }
    }

    return audioFiles;
  } catch (error) {
    throw new Error(`Failed to list audio files: ${error.message}`);
  }
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get audio duration (placeholder - would need audio processing library)
 * @param {string} filePath - File path
 * @returns {number} Duration in seconds
 */
const getAudioDuration = async (filePath) => {
  // This is a placeholder implementation
  // In a real implementation, you would use a library like:
  // - node-ffprobe
  // - music-metadata
  // - node-wav
  
  try {
    // For now, return estimated duration based on file size
    const stats = await fs.stat(filePath);
    const estimatedDuration = stats.size / (44100 * 2 * 2); // Rough estimate
    return Math.max(1, estimatedDuration);
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return 0;
  }
};

module.exports = {
  SUPPORTED_FORMATS,
  MAX_FILE_SIZE,
  validateAudioFile,
  generateUniqueFilename,
  saveAudioFile,
  deleteAudioFile,
  getAudioMetadata,
  listAudioFiles,
  formatFileSize,
  getAudioDuration
};
