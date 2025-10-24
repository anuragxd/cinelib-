# TMDB API Setup Guide

## Get Your Free TMDB API Key

1. **Go to TMDB**: https://www.themoviedb.org/
2. **Create Account**: Sign up for a free account
3. **Go to Settings**: Click your profile → Settings
4. **API Section**: Click on "API" in the left sidebar
5. **Request API Key**: Click "Create" and choose "Developer"
6. **Fill Form**: 
   - Application Name: "Movie Community Platform"
   - Application URL: "http://localhost:3000"
   - Application Summary: "A community platform for movie enthusiasts"
7. **Get Your Key**: Copy the API Key (v3 auth)

## Add API Key to Your Project

1. **Open**: `frontend/.env.local`
2. **Replace**: `your_tmdb_api_key_here` with your actual API key
3. **Example**:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_TMDB_API_KEY=abc123def456ghi789jkl012mno345pqr
   ```

## Test the Integration

1. **Restart Frontend**: Stop and start `npm run dev` in frontend
2. **Go to**: http://localhost:3000/playlists/new
3. **Search Movies**: You should see popular movies and be able to search
4. **Create Playlist**: Add movies and create your first playlist!

## Features Now Available

✅ **Movie Search**: Search thousands of movies from TMDB
✅ **Popular Movies**: Browse trending and popular films
✅ **Movie Details**: Posters, ratings, release years
✅ **Playlist Creation**: Add movies to custom playlists
✅ **Playlist Viewing**: See playlists with movie posters
✅ **Movie Management**: Add/remove movies from playlists

## Free Tier Limits

- **40,000 requests per month** (more than enough for development)
- **40 requests per 10 seconds**
- **No cost** for personal/educational use

## Troubleshooting

### "Invalid API Key" Error
- Check your API key is correct in `.env.local`
- Make sure you're using the v3 API key, not v4
- Restart the frontend server after adding the key

### No Movies Showing
- Check browser console for errors
- Verify your API key is active (may take a few minutes after creation)
- Try searching for popular movies like "Avengers" or "Batman"

### Images Not Loading
- TMDB images are served from their CDN
- Check if your network blocks image requests
- Images have fallback placeholders if they fail to load

## Demo Without API Key

If you don't want to get an API key right now, the movie search will show a demo message, but you can still:
- Create playlists manually
- View existing playlists
- Use all other platform features

The movie integration is optional and doesn't break the core functionality!
