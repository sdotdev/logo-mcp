# Vercel Deployment Guide for logo-mcp

## Prerequisites

Before deploying to Vercel, ensure you have:
- A [Vercel account](https://vercel.com/signup)
- The Vercel CLI installed: `npm install -g vercel`
- Your project pushed to GitHub/GitLab/Bitbucket

## Option 1: Deploy via Git (Recommended)

### Step 1: Push to GitHub
```bash
git push origin master
```

### Step 2: Import to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Select your Git provider (GitHub/GitLab/Bitbucket)
3. Find and select the `logo-mcp` repository
4. Click **Import**

### Step 3: Configure Environment (if needed)
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** ./ (default)
- **Build Command:** npm run build (auto-detected)
- **Output Directory:** .next (auto-detected)

### Step 4: Deploy
Click **Deploy** and Vercel will automatically:
- Build the project
- Deploy to a preview URL
- Show the production URL once complete

## Option 2: Deploy via CLI

### Step 1: Login
```bash
vercel login
```
Follow the prompts to authenticate.

### Step 2: Deploy
```bash
vercel --prod
```

This will:
- Build your project
- Deploy to production
- Output your live URL

## Option 3: Automatic Deployments

Once connected via Git import, Vercel will automatically deploy:
- Every push to `master` → Production
- Every pull request → Preview URL

## Post-Deployment

### Update Claude Desktop Config
Once deployed, update your Claude Desktop config to use the production URL:

```json
{
  "mcpServers": {
    "logo-mcp": {
      "url": "https://your-vercel-url.vercel.app/api/mcp"
    }
  }
}
```

Replace `your-vercel-url` with your actual Vercel domain.

### Environment Variables (Optional)

If you need environment variables, add them in Vercel dashboard:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add any secrets needed (currently none required for logo-mcp)

## Monitoring & Logs

After deployment:
- View logs: Dashboard → your project → **Functions** tab
- Monitor errors: **Error Tracking** section
- Check analytics: **Analytics** tab

## Troubleshooting

### Build Fails
Check the build logs in the Vercel dashboard. Common issues:
- Dependencies not installed: Run `npm install` locally and commit
- TypeScript errors: Run `npm run lint` and fix issues

### Runtime Errors
Check function logs in the **Functions** tab or look at Error Tracking.

### Slow Performance
- Check function duration in **Analytics**
- Icons are cached in memory, so first call is slow but subsequent calls are fast
- Consider implementing Redis caching for production (optional)

## Current Status

✅ The logo-mcp project is **production-ready**:
- All code committed to master
- No environment variables needed
- CORS headers configured
- MCP server fully functional
- UI pages tested and working

## What's Deployed

Your Vercel deployment will include:
- **HTTP MCP Endpoint:** `/api/mcp`
  - Tools: `search_logo`, `get_logo_svg`
  
- **UI Pages:**
  - `/` - Home page
  - `/browse` - Browse all logos
  - `/search` - Search logos
  - `/docs` - Documentation
  
- **API Routes:**
  - `/api/icons/all` - Get all 3300+ icons
  - `/api/icons/search` - Search endpoint

## Support

For deployment issues:
1. Check [Vercel documentation](https://vercel.com/docs)
2. Review function logs in Vercel dashboard
3. Check [Next.js deployment guide](https://nextjs.org/docs/app/building-your-application/deploying)
