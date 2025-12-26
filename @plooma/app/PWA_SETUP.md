# PWA Setup Guide

Your Modular Story Editor is now configured as a Progressive Web App (PWA) that works offline!

## What's Included

✅ Web App Manifest (`public/manifest.json`)  
✅ Service Worker for offline caching (`public/sw.js`)  
✅ Service Worker registration  
✅ PWA meta tags in HTML  
✅ Server routes for PWA files

## Setup Steps

### 1. Generate Icons

The PWA needs two icon files. You have two options:

**Use Your Own Icons**

- Create square PNG images:
  - `icon-192.png` (192x192 pixels)
  - `icon-512.png` (512x512 pixels)
- Place them in the `public` directory

### 2. Build and Deploy

```bash
# Build for production
bun run build

# Start production server
NODE_ENV=production bun run start
```

### 3. Install the PWA

Once deployed:

1. Visit your app in a supported browser (Chrome, Edge, Safari, Firefox)
2. Look for the install prompt or use the browser menu
3. Click "Install" to add to home screen/desktop
4. The app will now work offline!

## Features

### Offline Support

- All static assets are cached
- App works without internet connection
- Story data is stored in localStorage (already working)
- Service worker handles network requests

### Installable

- Can be installed on desktop and mobile
- Appears as a standalone app
- No browser chrome when installed

### Auto-Updates

- Service worker checks for updates every minute
- Users are prompted to reload when updates are available

## Testing Locally

To test PWA features locally:

1. **Generate icons** (see step 1 above)

2. **Run in production mode:**

   ```bash
   NODE_ENV=production bun run start
   ```

3. **Open in browser** and check:

   - DevTools > Application > Manifest (should show manifest)
   - DevTools > Application > Service Workers (should show registered worker)
   - DevTools > Application > Storage > Cache Storage (should show cached files)

4. **Test offline:**

   - DevTools > Network > Check "Offline"
   - Refresh page - should still work!

5. **Test installation:**
   - Look for install button in address bar
   - Or use browser menu: "Install App"

## Troubleshooting

### Service Worker Not Registering

- Make sure you're running in production mode (`NODE_ENV=production`)
- Check browser console for errors
- Verify `/sw.js` is accessible (visit `http://localhost:3000/sw.js`)

### Icons Not Showing

- Verify icon files exist in `public/` directory
- Check file names are exactly `icon-192.png` and `icon-512.png`
- Clear browser cache

### Can't Install

- Must be served over HTTPS (or localhost)
- Manifest must be valid
- Icons must be present
- Service worker must be registered

## Development Notes

- Service worker is **disabled in development** (when HMR is active) to avoid conflicts
- In production, service worker automatically registers
- Cache is versioned (`story-editor-v1`) - increment version in `sw.js` to force cache refresh

## Next Steps

1. ✅ Generate icons using `public/icon-generator.html`
2. ✅ Test locally in production mode
3. ✅ Deploy to a server with HTTPS
4. ✅ Install and test offline functionality

Enjoy your offline-capable PWA! 🎉
