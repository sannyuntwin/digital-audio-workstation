# Digital Audio Workstation (Web DAW)

A professional web-based Digital Audio Workstation inspired by Logic Pro X, built with React and the Web Audio API.

## 🎛 Features

- **Professional Interface**: Logic Pro-style design with integrated transport controls
- **Multi-page Navigation**: Home, Projects, and DAW Interface pages
- **Transport Controls**: Play, stop, record functionality
- **Timeline System**: Visual timeline with draggable clips
- **Track Management**: Multiple tracks with mute, solo, and volume controls
- **Project Management**: Create, delete, and manage audio projects
- **Modern UI**: Clean, responsive design with touching components

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sannyuntwin/digital-audio-workstation.git
cd digital-audio-workstation
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── audio/              # Audio engine and track management
├── components/         # React components
│   ├── Sidebar/        # Track controls and channel strips
│   ├── timeline/       # Timeline and clip components
│   └── transport/      # Transport controls
├── pages/              # Page components
│   ├── DAWInterfacePage.jsx  # Main DAW interface
│   ├── ProjectsPage.jsx      # Project management
│   └── LandingPage.jsx       # Landing page
├── services/           # API services
└── store/              # State management
```

## 🎵 Core Components

### Transport Controls
- Integrated header with play, stop, record buttons
- Professional Logic Pro-style design
- Time display and BPM controls

### Timeline
- Visual track representation
- Drag-and-drop clip functionality
- Zoom and scroll capabilities

### Sidebar
- Track management controls
- Channel strips with volume, mute, solo
- Master output controls

### Project Management
- Create new projects
- Delete existing projects
- Auto-enter newly created projects

## 🛠 Technologies Used

- **React 18** - Modern React with hooks
- **React Router** - Multi-page navigation
- **Web Audio API** - Audio processing
- **CSS3** - Modern styling with CSS variables
- **ESLint** - Code quality assurance

## 🎨 Design Features

- **Logic Pro Inspired**: Professional DAW interface
- **Touching Components**: No gaps between sections
- **Responsive Design**: Adapts to different screen sizes
- **Modern Theming**: CSS variables for easy customization

## 📝 Development

### Code Quality
- Zero ESLint warnings
- Clean, optimized codebase
- Modern React patterns
- Component-based architecture

### Performance
- Optimized React hooks usage
- Efficient state management
- Smooth animations and transitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit and push
5. Create a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## � Live Demo

Coming soon! The application will be deployed to a live demo environment.

---

Built with ❤️ using React and Web Audio API
