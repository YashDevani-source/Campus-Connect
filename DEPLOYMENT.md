# Vercel Deployment Guide

This guide explains how to deploy the IIT MANDI Campus Connect platform on Vercel.

## 1. Environment Variables

### Backend (`NODE_ENV`)
For production deployment, you **MUST** set `NODE_ENV` to `production`.
- **Effect**:
    - Disables verbose logging (Morgan 'dev' mode).
    - Enables stricter error handling messages (e.g., hiding stack traces).
    - Optimizes performance for express.

### Required Environment Variables (Vercel Project Settings)

**Backend Project:**
- `NODE_ENV`: `production`
- `PORT`: (Vercel handles this automatically, but you can set 3000 if needed locally)
- `MONGO_URI`: Connection string to your MongoDB Atlas cluster.
- `JWT_SECRET`: A strong, random string for signing tokens.
- `JWT_EXPIRE`: Token expiration (e.g., `30d`).
- `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://iit-mandi-connect.vercel.app`). **Critical for CORS.**

**Frontend Project:**
- `VITE_API_URL`: The URL of your deployed backend (e.g., `https://iit-mandi-backend.vercel.app/api`). **Note**: Ensure you include `/api` if your backend routes are prefixed.

## 2. Deployment Strategy

We recommend deploying the Frontend and Backend as **two separate Vercel projects**.

### Deploying the Backend
1.  Push your code to GitHub.
2.  Go to Vercel Dashboard -> "Add New..." -> "Project".
3.  Import your repository.
4.  **Root Directory**: Click "Edit" and select `backend`.
5.  **Build Command**: `npm install` (default is usually fine).
6.  **Environment Variables**: Add the variables listed above.
7.  Deploy.

### Deploying the Frontend
1.  Go to Vercel Dashboard -> "Add New..." -> "Project".
2.  Import the **same** repository.
3.  **Root Directory**: Click "Edit" and select `frontend`.
4.  **Framework Preset**: Select "Vite" (Vercel usually auto-detects this).
5.  **Environment Variables**: Add `VITE_API_URL` pointing to your Backend URL.
6.  Deploy.

## 3. Post-Deployment Checks
- Check the backend logs in Vercel to ensure MongoDB connected successfully.
- Open the frontend URL and try to Login.
- If you get CORS errors, verify `FRONTEND_URL` in backend env vars matches your frontend domain exactly.
