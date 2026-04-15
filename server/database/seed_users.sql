-- Web DAW Seed Users Script
-- Creates default users for testing and development

-- Hash for password: "password123"
-- Generated using bcrypt with cost factor 10
-- You can generate new hashes using: node -e "console.log(require('bcrypt').hashSync('yourpassword', 10))"

INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES 
('admin', 'admin@webdaw.com', '$2b$10$QHywN/TYYtfHjGkrduf7ZuQP9osJ4j.1w5xiTvcXjLuREiUP.ukD2', 'Admin', 'User'),
('demo', 'demo@webdaw.com', '$2b$10$QHywN/TYYtfHjGkrduf7ZuQP9osJ4j.1w5xiTvcXjLuREiUP.ukD2', 'Demo', 'User'),
('test', 'test@webdaw.com', '$2b$10$QHywN/TYYtfHjGkrduf7ZuQP9osJ4j.1w5xiTvcXjLuREiUP.ukD2', 'Test', 'User')
ON CONFLICT (username) DO NOTHING;

-- Log successful seed
DO $$
BEGIN
    RAISE NOTICE 'Seed users created successfully';
    RAISE NOTICE 'Users: admin, demo, test';
    RAISE NOTICE 'Password for all users: password123';
END $$;
