# Deployment Instructions for Dhan-Sarthi AI

## Backend Deployment (Render)

### 1. Environment Variables on Render
Set these environment variables in your Render dashboard:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://ankitrajput:nSK5XG2bZzMGWwxQ@cluster0.mqmw6d2.mongodb.net/dhan-sarthi?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-for-security
JWT_EXPIRE=7d
FRONTEND_URL=https://dhan-sarthi-ai.vercel.app
PORT=10000
```

### 2. Build & Start Commands
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && node server.js`

### 3. Deploy
Push your code to GitHub and Render will auto-deploy.

---

## Frontend Deployment (Vercel)

### 1. Environment Variables on Vercel
Go to Project Settings → Environment Variables and add:

```
VITE_API_BASE_URL=https://dhan-sarthi-backend.onrender.com/api
```

Make sure to set it for **Production** environment.

### 2. Build Settings
Vercel should auto-detect these from `vercel.json`:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Deploy
Push your code to GitHub and Vercel will auto-deploy.

---

## Testing After Deployment

1. Visit: `https://dhan-sarthi-ai.vercel.app`
2. Try logging in with demo credentials:
   - Email: `vebs@email.com`
   - Password: `123456`

---

## Troubleshooting CORS Issues

If you still see CORS errors:

1. **Check Render Logs**: Make sure the backend is running and not crashing
2. **Verify Environment Variables**: Ensure all env vars are set correctly on both platforms
3. **Check Backend URL**: Make sure `https://dhan-sarthi-backend.onrender.com/api/health` returns a response
4. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R) or use incognito mode
5. **Redeploy Both Services**: Sometimes a fresh deployment helps

---

## Important Notes

- The backend CORS is configured to allow:
  - All `.vercel.app` domains
  - All `.render.com` domains
  - `https://dhan-sarthi-ai.vercel.app` specifically
  - All localhost ports for development

- Make sure your Render service is not sleeping (free tier sleeps after inactivity)
- First request might be slow as Render wakes up the service

---

## Local Development

For local development, use:

**Frontend** (`.env`):
```
VITE_API_BASE_URL=http://localhost:10000/api
```

**Backend** (`backend/.env`):
```
PORT=10000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Run:
- Backend: `cd backend && npm run dev`
- Frontend: `npm run dev`
