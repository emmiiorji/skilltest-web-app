# Docker Deployment Setup

This project uses `captain-definition` as the source of truth for Docker configuration, with automatic Dockerfile generation for compatibility with various deployment platforms.

## How it works:

1. **Source of Truth**: `captain-definition` contains the Docker build instructions
2. **Auto-Generation**: `generate-dockerfile.js` converts captain-definition to standard Dockerfile format
3. **Deployment**: Standard Dockerfile is used by deployment platforms like Render

## Usage:

### To update Docker configuration:
1. Edit `captain-definition` 
2. Run: `npm run docker:generate`
3. Commit both files

### For deployment platforms that support captain-definition:
- Use `captain-definition` directly (e.g., CapRover)

### For deployment platforms that need Dockerfile:
- Use the generated `Dockerfile` (e.g., Render, Docker Hub)

## Commands:
- `npm run docker:generate` - Generate Dockerfile from captain-definition
- `npm run build` - Build the application
- `npm run migration:run` - Run database migrations

## Environment Variables Required:
- `DB_HOST` - MySQL database host
- `DB_PORT` - MySQL database port (default: 3306)
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - MySQL database name
- `SESSION_SECRET` - Session encryption secret
- `SESSION_SALT` - Session salt
- `KEY` - Application key
- `RESULT_SALT` - Result encryption salt