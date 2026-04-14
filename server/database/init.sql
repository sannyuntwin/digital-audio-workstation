-- Web DAW Database Initialization Script
-- Creates tables for projects, tracks, clips, and audio files

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    bpm INTEGER DEFAULT 120,
    time_signature JSONB DEFAULT '{"numerator": 4, "denominator": 4}',
    sample_rate INTEGER DEFAULT 44100,
    settings JSONB DEFAULT '{"zoomLevel": 1, "masterVolume": 1}',
    metadata JSONB DEFAULT '{"version": "1.0.0"}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('audio', 'midi')),
    volume REAL DEFAULT 0.7 CHECK (volume >= 0 AND volume <= 1.5),
    pan REAL DEFAULT 0 CHECK (pan >= -1 AND pan <= 1),
    is_muted BOOLEAN DEFAULT FALSE,
    is_solo BOOLEAN DEFAULT FALSE,
    color VARCHAR(7) DEFAULT '#4CAF50',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clips table
CREATE TABLE IF NOT EXISTS clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('audio', 'midi')),
    start_time REAL NOT NULL DEFAULT 0 CHECK (start_time >= 0),
    duration REAL NOT NULL CHECK (duration > 0),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size BIGINT,
    sample_rate INTEGER,
    bit_depth INTEGER,
    channels INTEGER,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audio files table
CREATE TABLE IF NOT EXISTS audio_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_name VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    duration REAL,
    sample_rate INTEGER,
    bit_depth INTEGER,
    channels INTEGER,
    metadata JSONB DEFAULT '{}',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracks_project_id ON tracks(project_id);
CREATE INDEX IF NOT EXISTS idx_tracks_type ON tracks(type);
CREATE INDEX IF NOT EXISTS idx_clips_project_id ON clips(project_id);
CREATE INDEX IF NOT EXISTS idx_clips_track_id ON clips(track_id);
CREATE INDEX IF NOT EXISTS idx_clips_start_time ON clips(start_time);
CREATE INDEX IF NOT EXISTS idx_audio_files_file_name ON audio_files(file_name);
CREATE INDEX IF NOT EXISTS idx_audio_files_uploaded_at ON audio_files(uploaded_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at BEFORE UPDATE ON tracks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clips_updated_at BEFORE UPDATE ON clips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO projects (name, description, bpm) VALUES 
('Demo Project', 'A sample project to get started', 120),
('Podcast Episode', 'Sample podcast project', 140),
('Music Production', 'Sample music project', 128)
ON CONFLICT DO NOTHING;

-- Get the first project ID for sample tracks
DO $$
DECLARE
    demo_project_id UUID;
BEGIN
    SELECT id INTO demo_project_id FROM projects WHERE name = 'Demo Project' LIMIT 1;
    
    IF demo_project_id IS NOT NULL THEN
        -- Insert sample tracks
        INSERT INTO tracks (project_id, name, type, color) VALUES
        (demo_project_id, 'Audio Track 1', 'audio', '#4CAF50'),
        (demo_project_id, 'MIDI Track 1', 'midi', '#2196F3'),
        (demo_project_id, 'Audio Track 2', 'audio', '#FF9800')
        ON CONFLICT DO NOTHING;
        
        -- Get track IDs for sample clips
        INSERT INTO clips (project_id, track_id, name, type, start_time, duration) 
        SELECT 
            demo_project_id,
            t.id,
            CASE 
                WHEN t.name = 'Audio Track 1' THEN 'Drums'
                WHEN t.name = 'MIDI Track 1' THEN 'Melody'
                WHEN t.name = 'Audio Track 2' THEN 'Bass'
            END,
            t.type,
            CASE 
                WHEN t.name = 'Audio Track 1' THEN 0
                WHEN t.name = 'MIDI Track 1' THEN 2
                WHEN t.name = 'Audio Track 2' THEN 8
            END,
            CASE 
                WHEN t.name = 'Audio Track 1' THEN 4
                WHEN t.name = 'MIDI Track 1' THEN 6
                WHEN t.name = 'Audio Track 2' THEN 3
            END
        FROM tracks t 
        WHERE t.project_id = demo_project_id
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Web DAW database initialized successfully';
    RAISE NOTICE 'Created tables: projects, tracks, clips, audio_files';
    RAISE NOTICE 'Sample data inserted for testing';
END $$;
