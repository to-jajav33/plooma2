# Environment Variables for @plooma/app

Create a `.env` file in this directory with the following variables:

```env
# Frontend App Configuration

# API Server URL (optional, default: http://localhost:3001)
# Point this to your backend API server
API_URL=http://localhost:3001

# Node Environment (optional, default: development)
# Set to "production" for production builds
NODE_ENV=development
```

## Quick Start

1. Copy this file to `.env`:
   ```bash
   cp ENV.md .env
   # Then edit .env and update the values
   ```

2. Or create `.env` manually with the variables above

3. Make sure `.env` is in `.gitignore` (it should be already)

## Usage in Code

The environment variables can be accessed via `process.env` in your code. Bun automatically loads `.env` files.

## Important Notes

- The `.env` file is already in `.gitignore` and won't be committed to version control
- For production builds, set `NODE_ENV=production`
- Update `API_URL` to point to your production API server when deploying

