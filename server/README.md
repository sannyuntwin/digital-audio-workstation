# Web DAW Server

Backend API for the Web DAW application built with Node.js + Express.

## 🚀 Features

- **Project Management**: CRUD operations for DAW projects
- **Audio File Handling**: Upload, store, and stream audio files
- **Real-time Collaboration**: WebSocket support for multi-user editing
- **File Validation**: Secure audio file upload with format validation
- **RESTful API**: Clean, well-documented API endpoints
- **Error Handling**: Comprehensive error handling and logging

## 📁 Project Structure

```
server/
├── src/
│   ├── middleware/          # Express middleware
│   │   ├── auth.js         # Authentication middleware
│   │   └── errorHandler.js # Error handling middleware
│   ├── models/             # Data models
│   │   └── Project.js     # Project data model (in-memory storage)
│   ├── routes/             # API routes
│   │   ├── audio.js        # Audio file endpoints
│   │   └── projects.js    # Project management endpoints
│   └── utils/              # Utility functions
│       └── audioUtils.js   # Audio processing helpers
├── uploads/               # Uploaded audio files
├── data/                  # Project data storage
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                  # Environment variables
└── .gitignore           # Git ignore rules
```

## 🛠️ Installation

1. **Install dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server**:
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Projects API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get single project |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/tracks` | Add track to project |
| POST | `/api/projects/:id/clips` | Add clip to project |
| PUT | `/api/projects/:id/clips/:clipId` | Update clip |
| DELETE | `/api/projects/:id/clips/:clipId` | Delete clip |
| POST | `/api/projects/:id/duplicate` | Duplicate project |

### Audio API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/audio/files` | List all uploaded files |
| GET | `/api/audio/files/:filename` | Get file metadata |
| GET | `/api/audio/stream/:filename` | Stream/download file |
| POST | `/api/audio/upload` | Upload single file |
| POST | `/api/audio/upload-multiple` | Upload multiple files |
| DELETE | `/api/audio/files/:filename` | Delete file |
| GET | `/api/audio/formats` | Get supported formats |

### WebSocket Events

| Event | Description |
|-------|-------------|
| `join-project` | Join a project room |
| `leave-project` | Leave a project room |
| `project-update` | Broadcast project updates |
| `cursor-position` | Share cursor position |

## 🎵 Supported Audio Formats

- **MP3** (`audio/mpeg`)
- **WAV** (`audio/wav`)
- **OGG** (`audio/ogg`)
- **AAC** (`audio/aac`)
- **FLAC** (`audio/flac`)
- **M4A** (`audio/m4a`)

## 📝 Example Usage

### Create a New Project

```javascript
const response = await fetch('http://localhost:3001/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My New Project',
    bpm: 120,
    timeSignature: { numerator: 4, denominator: 4 }
  })
});

const project = await response.json();
```

### Upload Audio File

```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('http://localhost:3001/api/audio/upload', {
  method: 'POST',
  body: formData
});

const fileInfo = await response.json();
```

### WebSocket Connection

```javascript
const socket = io('http://localhost:3001');

// Join project room
socket.emit('join-project', projectId);

// Listen for updates
socket.on('project-updated', (data) => {
  console.log('Project updated:', data);
});
```

## 🔧 Configuration

Environment variables in `.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_DIR=./uploads

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key
```

## 🚀 Deployment

### Production Setup

1. **Set production environment**:
   ```bash
   export NODE_ENV=production
   ```

2. **Use process manager** (PM2 recommended):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "web-daw-server"
   ```

3. **Set up reverse proxy** (Nginx example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
       }
   }
   ```

## 🛡️ Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **File validation**: Type and size checking
- **Error handling**: Sanitized error responses
- **JWT support**: Token-based authentication (optional)

## 📊 Monitoring

The server includes:

- **Health check endpoint**: `/health`
- **Request logging**: Morgan middleware
- **Error tracking**: Comprehensive error handling
- **Performance monitoring**: Uptime tracking

## 🔄 Development

### Adding New Endpoints

1. Create route file in `src/routes/`
2. Add middleware as needed
3. Register routes in `server.js`

### Adding New Middleware

1. Create middleware file in `src/middleware/`
2. Export middleware function
3. Use in routes or server.js

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make your changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the example usage
