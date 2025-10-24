# YouTube API Setup for Movie Trailers

## Get Your Free YouTube API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project** (or select existing)
   - Click "Select a project" → "New Project"
   - Name it: "Movie Community Platform"
   - Click "Create"

3. **Enable YouTube Data API v3**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "YouTube Data API v3"
   - Click on it → Click "Enable"

4. **Create API Credentials**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API Key"
   - Copy your API key

5. **Add to Your Project**
   - Open `frontend/.env.local`
   - Add this line:
   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_api_key_here
   ```

6. **Restart Frontend**
   ```bash
   # Stop the frontend (Ctrl+C)
   # Start it again
   cd frontend
   npm run dev
   ```

## Usage Limits (Free Tier)

- **10,000 units per day** (free)
- Each search = 100 units
- That's 100 trailer searches per day
- More than enough for your platform!

## How It Works

The platform will:
1. First try to get trailers from TMDB (already integrated)
2. If not found, search YouTube automatically
3. Display the trailer in an embedded player

## Features Added

✅ **Automatic trailer fetching** from TMDB
✅ **YouTube fallback** if TMDB doesn't have it
✅ **Embedded video player** 
✅ **Responsive design**

## Test It

1. Add the API key to `.env.local`
2. Restart frontend
3. Go to any playlist with movies
4. Trailers will appear automatically!

## Optional: Restrict API Key

For security, restrict your API key:
1. Go to API credentials
2. Click on your API key
3. Under "API restrictions" → Select "YouTube Data API v3"
4. Under "Website restrictions" → Add your domain
5. Save

## Cost

**100% FREE** for normal usage! The free tier is very generous.
