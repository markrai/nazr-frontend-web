![Logo](public/logo.png)

# Nazr Web v0.8.0

a React based front-end for Nazr — a comprehensive photo/video management app.

## Prerequisites

- Node.js 20.19+ or 22.12+
- Nazr backend running locally at `http://localhost:9161` (or configure via env)

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Docker Image

Build and serve the production bundle with nginx:

```bash
# Build with default API URL (http://localhost:9161)
docker build -t markrai/nazrweb:0.8.0 .

# Build with custom API URL (e.g. for NAS deployment with relative path)
docker build --build-arg VITE_API_BASE_URL=/api -t markrai/nazrweb:0.8.0 .
```

Run the container:

```bash
docker run --rm -p 3000:80 markrai/nazrweb:0.8.0
```

**Note:** The `VITE_API_BASE_URL` is baked into the static files at build time. You cannot change it at runtime with an environment variable in the production image.

## Docker Compose

We provide ready-to-use Compose files for different environments:

- **Windows**: `docker-compose.windows.yml`
- **Synology**: `docker-compose.synology.yml`
- **Ugreen**: `docker-compose.ugreen.yml`

Example usage:

```bash
docker-compose -f docker-compose.windows.yml up -d
```

## Configuration

- API base URL: set `VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:9161`).

Example `.env`:

```env
VITE_API_BASE_URL=http://localhost:9161
```

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview production build

## Features

- Dashboard with system stats and scan control
- Infinite-scrolling media gallery with sort options
- Full-text search with filters (date range, camera)
- Asset detail view with metadata
- Light/dark/system theme + persistent preferences
- **Facial Recognition**: Detect and manage faces, merge persons, and more.

## Notes

- Thumbnails and previews are loaded directly from the backend with browser caching.
- Stats are polled every 2s from `/stats` to reflect scan/queue progress.
