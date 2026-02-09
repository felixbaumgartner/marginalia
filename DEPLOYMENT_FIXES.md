# Deployment Fixes Applied

This document explains all the fixes applied to make Marginalia deployment-ready.

## Issues Fixed

### 1. Port Binding Issue

**Problem:** Server wouldn't bind correctly on cloud platforms (Railway, Render, Heroku).

**Root Cause:** The server was binding to `localhost` which doesn't work on cloud platforms that require binding to `0.0.0.0`.

**Fix Applied:**
```typescript
// Before:
app.listen(PORT, () => { ... });

// After:
app.listen(PORT, '0.0.0.0', () => { ... });
```

**File Changed:** `server/src/index.ts:66`

---

### 2. Environment Variable Loading

**Problem:** `.env` file wouldn't be found in production since it's gitignored.

**Root Cause:** Cloud platforms set environment variables directly, not through `.env` files. The dotenv.config() was failing silently.

**Fix Applied:**
```typescript
// Before:
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// After:
try {
  dotenv.config({ path: envPath });
} catch (error) {
  console.log('No .env file found, using environment variables from platform');
}
```

**File Changed:** `server/src/index.ts:8-13`

---

### 3. Missing Environment Variable Validation

**Problem:** Server would start but fail silently if required environment variables were missing.

**Root Cause:** No validation of required environment variables on startup.

**Fix Applied:**
```typescript
const requiredEnvVars = ['ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please set these variables in your deployment platform or .env file');
  process.exit(1);
}
```

**File Changed:** `server/src/index.ts:18-25`

---

### 4. Port Type Issue

**Problem:** TypeScript compilation error when passing PORT to listen().

**Root Cause:** `process.env.PORT` returns a string, but `listen()` expects a number.

**Fix Applied:**
```typescript
// Before:
const PORT = process.env.PORT || 3001;

// After:
const PORT = parseInt(process.env.PORT || '3001', 10);
```

**File Changed:** `server/src/index.ts:28`

---

### 5. Missing Client Dist Detection

**Problem:** Server would fail silently if client build wasn't present.

**Root Cause:** No check for whether `client/dist/` exists before trying to serve it.

**Fix Applied:**
```typescript
const clientDistPath = path.resolve(__dirname, '../../client/dist');

if (!fs.existsSync(clientDistPath)) {
  console.error(`Client dist directory not found at: ${clientDistPath}`);
  console.error('Please run "npm run build" to build the client before starting the server');
} else {
  app.use(express.static(clientDistPath));
  // ... serve client
}
```

**File Changed:** `server/src/index.ts:46-56`

---

### 6. Build Process

**Problem:** Build script was running `npm install` unnecessarily during build, slowing down deployments.

**Root Cause:** Build command included installation steps that should be in postinstall.

**Fix Applied:**
```json
{
  "scripts": {
    "postinstall": "npm install --prefix server && npm install --prefix client",
    "build": "npm run build --prefix client && npm run build --prefix server"
  }
}
```

**File Changed:** `package.json:10-13`

---

## Configuration Files Added

### 1. `Procfile`
For Heroku compatibility:
```
web: npm start
```

### 2. `railway.toml`
For Railway deployment configuration:
```toml
[build]
builder = "nixpacks"
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
```

### 3. `render.yaml`
For Render.com Blueprint deployment:
```yaml
services:
  - type: web
    name: marginalia
    env: node
    buildCommand: npm run build
    startCommand: npm start
```

### 4. `app.json`
For Heroku one-click deployment:
```json
{
  "name": "Marginalia",
  "buildpacks": [{ "url": "heroku/nodejs" }],
  "env": { ... }
}
```

### 5. `.npmrc`
For consistent npm behavior:
```
engine-strict=true
legacy-peer-deps=false
```

### 6. `verify-deployment.js`
Deployment readiness verification script. Run with:
```bash
npm run verify
```

---

## How to Deploy Now

### Quick Deploy Commands

```bash
# 1. Verify deployment readiness
npm run verify

# 2. Build everything
npm run build

# 3. Test locally
npm start
```

### Platform Deployment

**Railway (Recommended):**
1. Push to GitHub
2. Connect repository on railway.app
3. Set environment variables
4. Deploy automatically

**Render:**
1. Push to GitHub
2. Create Web Service on render.com
3. Use `render.yaml` for auto-configuration
4. Set environment variables
5. Deploy

**Heroku:**
```bash
heroku create your-app-name
heroku config:set ANTHROPIC_API_KEY=xxx
heroku config:set SUPABASE_URL=xxx
heroku config:set SUPABASE_ANON_KEY=xxx
git push heroku main
```

---

## Environment Variables Checklist

Required on your deployment platform:

- [ ] `ANTHROPIC_API_KEY` - Get from https://console.anthropic.com/settings/keys
- [ ] `SUPABASE_URL` - From your Supabase project settings
- [ ] `SUPABASE_ANON_KEY` - From your Supabase project settings
- [ ] `NODE_ENV=production` - Recommended for production builds
- [ ] `PORT` - Optional, most platforms auto-assign

---

## Testing Deployment

After deploying, test these endpoints:

1. **Health Check:**
   ```bash
   curl https://your-app.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Frontend:**
   Visit your app URL in a browser

3. **Book Search:**
   Search for a book and verify it returns results

4. **Database:**
   Save a book and check Supabase dashboard

5. **AI Chat:**
   Set a book as current and send a chat message

---

## Common Deployment Errors & Solutions

### Error: "Missing required environment variables"

**Solution:** Set the missing variables in your platform's dashboard.

### Error: "Client dist directory not found"

**Solution:** Ensure `npm run build` completed successfully. Check build logs.

### Error: "Cannot find module"

**Solution:** Ensure `npm install` ran during deployment. Check if platform runs postinstall scripts.

### Error: "Port 3001 is already in use"

**Solution:** Cloud platforms set PORT automatically. Don't hardcode it locally.

### Error: 404 on page refresh

**Solution:** The catch-all route should handle this. Verify server is serving static files correctly.

---

## Performance Tips

1. **Use production NODE_ENV:** Set `NODE_ENV=production`
2. **Upgrade instance type:** Free tiers are for testing only
3. **Enable HTTP/2:** Most platforms support this automatically
4. **Add CDN:** For static assets if needed
5. **Monitor API usage:** Watch Anthropic API costs

---

## Support

If deployment still fails:

1. Run `npm run verify` locally
2. Check platform build logs
3. Verify all environment variables are set
4. Test build locally: `npm run build && npm start`
5. Check DEPLOYMENT.md for platform-specific instructions

---

## Summary

All deployment issues have been resolved. The app now:

✅ Binds to `0.0.0.0` for cloud platform compatibility
✅ Validates environment variables on startup
✅ Gracefully handles missing .env files
✅ Checks for client build before serving
✅ Includes platform-specific configuration files
✅ Provides deployment verification script
✅ Has comprehensive documentation

Your Marginalia app is ready to deploy to any Node.js hosting platform!
