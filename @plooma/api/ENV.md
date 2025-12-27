# Environment Variables for @plooma/api

Create a `.env` file in this directory with the following variables:

```env
# API Server Configuration

# JWT Secret Key (REQUIRED - change this in production!)
# Generate a secure random string for production use
# Example: openssl rand -base64 32
JWT_SECRET=your-secret-key-change-in-production

# Server Port (optional, default: 3001)
PORT=3001

# Database Name (optional, default: plooma)
# This will create a file named {DB_NAME}.sqlite
DB_NAME=plooma

# CORS Origin (optional, default: *)
# Set to your frontend URL in production (e.g., https://yourdomain.com)
# Use * for development, but restrict in production
CORS_ORIGIN=*

# API Origin (optional, default: http://localhost:3001)
# The base URL where the API is served (for FileSystemRouter)
API_ORIGIN=http://localhost:3001
```

## Quick Start

1. Copy this file to `.env`:

   ```bash
   cp ENV.md .env
   # Then edit .env and update the values
   ```

2. Or create `.env` manually with the variables above

3. Make sure `.env` is in `.gitignore` (it should be already)

## Important Notes

- **JWT_SECRET**: This is critical for security. Use a strong, random string in production.
- **CORS_ORIGIN**: In production, set this to your actual frontend domain instead of `*`
- The `.env` file is already in `.gitignore` and won't be committed to version control

