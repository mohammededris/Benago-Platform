# Benago Platform

This repository is split into two deployable parts for Vercel:

1. `client/` for the React frontend.
2. `backend/` for the serverless API.

## Frontend

Deploy `client/` as a Vercel project with:

- `VITE_API_URL` set to the backend deployment URL.
- `VITE_CLERK_PUBLISHABLE_KEY` set to your Clerk publishable key.

The frontend includes a SPA rewrite in `client/vercel.json` so deep links like `/student` and `/instructor` resolve correctly.

## Backend

Deploy `backend/` as a separate Vercel project with these environment variables:

- `MONGODB_URI`
- `CLERK_SECRET_KEY`
- `CLERK_PUBLISHABLE_KEY`
- `CLERK_WEBHOOK_SECRET`
- `CLIENT_ORIGIN`

The API routes are exposed under `/api/*` from the serverless function in `backend/api/[...path].js`.
