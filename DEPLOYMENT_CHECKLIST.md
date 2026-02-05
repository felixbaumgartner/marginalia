# Deployment Checklist

Use this checklist to ensure your Marginalia deployment is configured correctly.

## Pre-Deployment

- [ ] Node.js version >= 18.0.0
- [ ] npm version >= 9.0.0
- [ ] Anthropic API key obtained
- [ ] Supabase credentials available

## Configuration

- [ ] Environment variables set on deployment platform:
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `NODE_ENV=production` (optional but recommended)
  - [ ] `PORT` (optional, most platforms auto-assign)

## Deployment Settings

- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Root directory: `/` (project root, not server or client subdirectories)
- [ ] Node.js version specified in platform settings (18 or higher)

## Verification Steps

After deployment, verify these work:

1. **Server Health Check**
   ```bash
   curl https://your-app-url.com/api/health
   ```
   Expected response: `{"status":"ok"}`

2. **Frontend Loads**
   - Visit your app URL in a browser
   - Should see the Marginalia homepage

3. **Book Search Works**
   - Try searching for a book (e.g., "Dune")
   - Should see results from Open Library

4. **Database Connection**
   - Save a book
   - Should persist in Supabase

5. **AI Chat Works**
   - Set a book as "currently reading"
   - Go to Chat page
   - Send a message
   - Should receive AI response

## Common Issues

### Build Fails
- Check Node.js version: `node --version`
- Review build logs for specific errors
- Verify all dependencies install correctly

### Server Won't Start
- Check environment variables are set
- Review server logs for errors
- Verify `server/dist/index.js` exists after build

### 404 Errors
- Ensure catch-all route is configured
- Verify `client/dist/` contains built files
- Check server logs for routing errors

### API Errors
- Verify Supabase credentials are correct
- Check Anthropic API key is valid
- Review server logs for specific API errors

## Deployment Platform Quick Links

- **Railway**: [railway.app](https://railway.app)
- **Render**: [render.com](https://render.com)
- **fly.io**: [fly.io](https://fly.io)
- **Heroku**: [heroku.com](https://heroku.com)

## Support

If you encounter issues:
1. Check deployment logs in your platform dashboard
2. Review DEPLOYMENT.md for detailed troubleshooting
3. Verify all checklist items are complete
4. Test locally first: `npm install && npm run build && npm start`
