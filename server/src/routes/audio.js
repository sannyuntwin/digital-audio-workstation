/**
 * Audio API Routes
 * Upload, list, stream, and delete audio assets
 */

const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const { db } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const SUPPORTED_FORMATS = [
  { extension: 'mp3', mimeType: 'audio/mpeg' },
  { extension: 'wav', mimeType: 'audio/wav' },
  { extension: 'ogg', mimeType: 'audio/ogg' },
  { extension: 'aac', mimeType: 'audio/aac' },
  { extension: 'flac', mimeType: 'audio/flac' },
  { extension: 'm4a', mimeType: 'audio/mp4' }
];

const SUPPORTED_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a'
]);

const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads');
fs.ensureDirSync(uploadDir);

const parseMaxSizeToBytes = (value) => {
  if (!value) return 50 * 1024 * 1024;
  const normalized = String(value).trim().toUpperCase();
  const matched = normalized.match(/^(\d+)(KB|MB|GB)?$/);
  if (!matched) return 50 * 1024 * 1024;

  const amount = parseInt(matched[1], 10);
  const unit = matched[2] || 'B';
  const multipliers = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024
  };

  return amount * (multipliers[unit] || 1);
};

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.ensureDir(uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (_req, file, cb) => {
    const extFromName = path.extname(file.originalname);
    const extFromMime = mime.extension(file.mimetype);
    const ext = extFromName || (extFromMime ? `.${extFromMime}` : '');
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseMaxSizeToBytes(process.env.MAX_FILE_SIZE),
    files: 10
  },
  fileFilter: (_req, file, cb) => {
    if (!SUPPORTED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`Unsupported audio format: ${file.mimetype}`));
    }
    cb(null, true);
  }
});

const buildPublicMetadata = (row) => ({
  ...row,
  stream_url: `/api/audio/stream/${row.file_name}`
});

const applyUploaderFilter = (query, userId) => {
  if (!userId || typeof query?.whereRaw !== 'function') {
    return query;
  }
  return query.whereRaw("metadata->>'uploadedBy' = ?", [String(userId)]);
};

router.get('/formats', (_req, res) => {
  res.json({
    success: true,
    data: SUPPORTED_FORMATS
  });
});

router.get('/files', authenticate, async (req, res) => {
  try {
    const query = db('audio_files')
      .select('*');
    applyUploaderFilter(query, req.user?.id);
    const files = await query.orderBy('uploaded_at', 'desc');

    res.json({
      success: true,
      count: files.length,
      data: files.map(buildPublicMetadata)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/files/:filename', authenticate, async (req, res) => {
  try {
    const query = db('audio_files')
      .where({ file_name: req.params.filename });
    applyUploaderFilter(query, req.user?.id);
    const file = await query.first();

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found'
      });
    }

    res.json({
      success: true,
      data: buildPublicMetadata(file)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/stream/:filename', authenticate, async (req, res) => {
  try {
    const query = db('audio_files')
      .where({ file_name: req.params.filename });
    applyUploaderFilter(query, req.user?.id);
    const file = await query.first();

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found'
      });
    }

    const absolutePath = path.resolve(process.cwd(), file.file_path);
    const exists = await fs.pathExists(absolutePath);
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'Audio file missing from storage'
      });
    }

    res.setHeader('Content-Type', file.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${file.original_name}"`);
    return res.sendFile(absolutePath);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/upload', authenticate, upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No audio file uploaded'
    });
  }

  try {
    const relativePath = path.relative(process.cwd(), req.file.path);
    const [record] = await db('audio_files')
      .insert({
        original_name: req.file.originalname,
        file_name: req.file.filename,
        file_path: relativePath,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        metadata: {
          uploadedBy: req.user.id
        }
      })
      .returning('*');

    res.status(201).json({
      success: true,
      data: buildPublicMetadata(record)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/upload-multiple', authenticate, upload.array('audio', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No audio files uploaded'
    });
  }

  try {
    const insertPayload = req.files.map((file) => ({
      original_name: file.originalname,
      file_name: file.filename,
      file_path: path.relative(process.cwd(), file.path),
      file_size: file.size,
      mime_type: file.mimetype,
      metadata: {
        uploadedBy: req.user.id
      }
    }));

    const records = await db('audio_files')
      .insert(insertPayload)
      .returning('*');

    res.status(201).json({
      success: true,
      count: records.length,
      data: records.map(buildPublicMetadata)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/files/:filename', authenticate, async (req, res) => {
  try {
    const query = db('audio_files')
      .where({ file_name: req.params.filename });
    applyUploaderFilter(query, req.user?.id);
    const file = await query.first();

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not found'
      });
    }

    const absolutePath = path.resolve(process.cwd(), file.file_path);
    const exists = await fs.pathExists(absolutePath);
    if (exists) {
      await fs.remove(absolutePath);
    }

    await db('audio_files')
      .where({ file_name: req.params.filename })
      .del();

    res.json({
      success: true,
      data: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
