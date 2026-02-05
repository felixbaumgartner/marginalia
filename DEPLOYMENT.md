# Marginalia Deployment Guide

This guide covers deploying Marginalia to production.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Anthropic API key
- Supabase account (already configured)

## Environment Variables

Set these environment variables on your hosting platform:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
SUPABASE_URL=https://gswpidbqpeuqdprzxmct.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdzd3BpZGJxcGV1cWRwcnp4bWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMjY1NTcsImV4cCI6MjA4NTgwMjU1N30.JwUQwgm8i6DQxjvGYNRS-B7DN7mRtDetzMDB1-lF64g
PORT=3001
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

### Railway / Render / fly.io

1. Connect your GitHub repository
2. Set environment variables in the platform dashboard
3. Configure build command: `npm run build`
4. Configure start command: `npm start`
5. Set root directory to the project root (not server or client subdirectory)

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

## Troubleshooting

**Server won't start:**
- Verify `dist` folder exists in `server/` directory
- Check that all environment variables are set
- Ensure Node.js version >= 18.0.0

**API requests failing:**
- Check CORS configuration if deploying client and server separately
- Verify Supabase credentials are correct
- Ensure Anthropic API key is valid

**Build fails:**
- Run `npm run install:all` to ensure all dependencies are installed
- Clear node_modules and reinstall: `rm -rf node_modules */node_modules && npm run install:all`
