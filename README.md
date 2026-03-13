# Conflict Detection Platform

A full-stack application for detecting and visualizing conflict events using reports.

## Tech Stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React, React Leaflet, OpenStreetMap

## Setup

1. Install dependencies:
   ```
   npm run install-server
   npm run install-client
   ```

2. Start MongoDB locally or set MONGODB_URI in .env

3. Run the application:
   ```
   npm run dev
   ```

This will start the backend on port 5000 and frontend on port 3000.

## API Endpoints

- GET /api/events: Get all events
- GET /api/events/:id: Get event by ID
- POST /api/report: Submit a new report

Example POST /api/report:
```json
{
  "text": "Explosion heard",
  "username": "user1",
  "followerCount": 500,
  "verified": false,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timestamp": "2023-10-01T12:00:00Z"
}
```

## Features

- Real-time event visualization on map
- Event clustering and credibility scoring
- Filters by type, status, date
- Simulation for testing