# Marginalia Deployment Guide

This guide covers deploying Marginalia to production.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Anthropic API key
- Supabase account (already configured)

## Quick Start

The deployment process is now fully automated:

1. **Install dependencies**: `npm install` (automatically installs server and client dependencies via postinstall)
2. **Build**: `npm run build` (builds both client and server)
3. **Start**: `npm start` (starts the production server)

## Environment Variables

Set these environment variables on your hosting platform:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SUPABASE_URL=https://gswpidbqpeuqdprzxmct.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd3BpZGJxcGV1cWRwcnp4bWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY1NTcsImV4cCI6MjA4NTgwMjU1N30.JwUQwgm8i6DQxjvGYNRS-B7DN7mRtDetzMDB1-lF64g
PORT=3001
NODE_ENV=production
```

## Build & Deploy Steps

1. **Build the application:**
   ```bash
   npm run build
   ```
   This will:
   - Install all dependencies (server and client)
   - Build the React client for production
   - Compile the TypeScript server code

2. **Start the server:**
   ```bash
   npm start
   ```
   The server will:
   - Serve the API on `/api/*` routes
   - Serve the built React app for all other routes
   - Run on the port specified by PORT environment variable (default: 3001)

## Deployment Platforms

### Railway

1. Create new project from GitHub repository
2. Configure environment variables in Settings → Variables:
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `PORT` (optional, Railway auto-assigns)
   - `NODE_ENV=production`
3. **Build Command**: `npm run build`
4. **Start Command**: `npm start`
5. **Root Directory**: `/` (project root)
6. Railway will automatically detect Node.js and run `npm install`

### Render

1. Create new Web Service
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave empty (uses root)
4. Add environment variables in Environment tab
5. Render will automatically install dependencies and build

### fly.io

1. Install flyctl CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Launch app: `fly launch`
4. Set environment variables:
   ```bash
   fly secrets set ANTHROPIC_API_KEY=your_key_here
   fly secrets set SUPABASE_URL=https://gswpidbqpeuqdprzxmct.supabase.co
   fly secrets set SUPABASE_ANON_KEY=your_anon_key
   ```
5. Deploy: `fly deploy`

### Heroku

1. Create new app
2. Add Node.js buildpack
3. Set environment variables in Settings → Config Vars
4. Connect to GitHub and enable automatic deploys
5. Or deploy via CLI:
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

### Vercel (Alternative - Separate Deployments)

If you prefer to deploy client and server separately:

**Client (Frontend):**
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_URL` environment variable to your server URL

**Server (Backend):**
- Root directory: `server`
- Build command: `npm run build`
- Start command: `npm start`
- Set all environment variables

## Database

The Supabase database is already configured with:
- All tables (books, conversations, messages, notes, collections)
- Row Level Security policies (public access for single-user app)
- Stored function for monthly statistics

No additional database setup is required.

## Post-Deployment

1. Visit your deployed URL
2. Search for a book using Open Library
3. Save a book and start a conversation
4. Enjoy your personal AI reading companion!

## Important Notes

1. **Monorepo Structure**: This project uses a monorepo with separate `server/` and `client/` directories
2. **Automatic Dependency Installation**: The `postinstall` script automatically installs dependencies for both server and client
3. **Build Process**: The build process compiles both the React client (to `client/dist/`) and TypeScript server (to `server/dist/`)
4. **Single Server**: The Express server serves both the API and the static client files

## Troubleshooting

**Build fails during npm install:**
- Ensure Node.js version >= 18.0.0: `node --version`
- Check npm version >= 9.0.0: `npm --version`
- Clear npm cache: `npm cache clean --force`
- Delete all node_modules: `rm -rf node_modules */node_modules package-lock.json */package-lock.json`
- Reinstall: `npm install`

**Build fails during compilation:**
- Check if TypeScript compilation errors exist: `cd server && npx tsc --noEmit`
- Check if Vite build errors exist: `cd client && npm run build`
- Ensure all environment variables are set (at minimum `ANTHROPIC_API_KEY`)

**Server won't start:**
- Verify `server/dist/` folder exists and contains `index.js`
- Verify `client/dist/` folder exists and contains `index.html`
- Check logs for missing dependencies
- Ensure all environment variables are set:
  - `ANTHROPIC_API_KEY` (required)
  - `SUPABASE_URL` (required)
  - `SUPABASE_ANON_KEY` (required)
- Test locally: `cd server && node dist/index.js`
- If you see "Missing required environment variables", set them in your platform's dashboard
- Server now binds to `0.0.0.0` for compatibility with all deployment platforms

**API requests failing:**
- Check server logs for errors
- Verify Supabase credentials are correct in environment variables
- Ensure Anthropic API key is valid and has credits
- Check network connectivity from the server to external APIs

**404 errors for routes:**
- Ensure the catch-all route is working (`app.get('*', ...)`)
- Verify `client/dist/` contains built files
- Check that `express.static` is serving files correctly

**Port already in use:**
- Change the `PORT` environment variable
- Or kill the process: `lsof -ti:3001 | xargs kill -9`

**Deployment platform specific:**
- **Railway**: Check deployment logs in the dashboard
- **Render**: Verify build command includes `npm install`
- **Heroku**: Ensure Procfile is not overriding the start command (we use package.json scripts)
- **fly.io**: Check fly.toml configuration matches the deployment settings
