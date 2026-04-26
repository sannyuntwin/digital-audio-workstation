# Web DAW

This project no longer ships with seeded users, projects, tracks, or clips.

## First Run

1. Start services:
   - `docker compose up -d --build`
2. Open the web app and create an account from the register page.
3. Log in and create your first project.

## Notes

- Audio library content is user-driven:
  - Upload files from Sound Library.
  - Files are stored in the backend and listed via API.
- If you previously used seeded data, remove your old Postgres volume to start clean:
  - `docker compose down -v`
