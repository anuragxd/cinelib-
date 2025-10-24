# API Keys Setup Guide

## 🎬 Your Movie Platform Uses These APIs

### Already Configured ✅
- **TMDB** - Movie data and posters
- **YouTube** - Movie trailers

### New APIs to Configure 🆕

---

## 1. OMDb API - Movie Ratings & Awards

**What it adds:** IMDb ratings, Rotten Tomatoes scores, Metacritic scores, Awards

### Get Your Free API Key:

1. Go to: http://www.omdbapi.com/apikey.aspx
2. Select "FREE! (1,000 daily limit)"
3. Enter your email
4. Check your email for the API key
5. Click the activation link in the email

### Add to `.env.local`:
```env
NEXT_PUBLIC_OMDB_API_KEY=your_key_here
```

**Free Tier:** 1,000 requests/day

---

## 2. Giphy API - Movie GIFs

**What it adds:** GIF picker for blog posts, movie reactions

### Get Your Free API Key:

1. Go to: https://developers.giphy.com/
2. Click "Create an App"
3. Select "API" (not SDK)
4. Fill in:
   - App Name: "Movie Community Platform"
   - App Description: "Movie blog and playlist platform"
5. Agree to terms and create app
6. Copy your API Key

### Add to `.env.local`:
```env
NEXT_PUBLIC_GIPHY_API_KEY=your_key_here
```

**Free Tier:** Unlimited with attribution

---

## 3. Streaming Availability API (Optional)

**What it adds:** "Watch on Netflix/Prime/Disney+" badges

### Get Your Free API Key:

1. Go to: https://rapidapi.com/movie-of-the-night-movie-of-the-night-default/api/streaming-availability
2. Sign up for RapidAPI (free)
3. Subscribe to "Basic" plan (free, 100 requests/day)
4. Copy your API key from the dashboard

### Add to `.env.local`:
```env
NEXT_PUBLIC_STREAMING_API_KEY=your_key_here
```

**Free Tier:** 100 requests/day

---

## Complete `.env.local` File

Your `frontend/.env.local` should look like:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_TMDB_API_KEY=d458cdadd3a32631ecb638f3b9c486d2
NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSyANSS960-8aERpxQySDw4jHjXI5dExjzy0
NEXT_PUBLIC_OMDB_API_KEY=your_omdb_key_here
NEXT_PUBLIC_GIPHY_API_KEY=your_giphy_key_here
```

---

## After Adding Keys

1. **Restart the frontend:**
   ```bash
   # Stop the frontend (Ctrl+C)
   cd frontend
   npm run dev
   ```

2. **Test the features:**
   - Movie ratings will appear on playlist movie cards
   - GIF picker will work in blog editor
   - Trailers will show on playlists

---

## Features Enabled by Each API

### OMDb API:
- ⭐ IMDb ratings on movie cards
- 🍅 Rotten Tomatoes scores
- Ⓜ️ Metacritic scores
- 🏆 Awards and nominations

### Giphy API:
- 🎬 GIF picker in blog editor
- 🔍 Search movie GIFs
- 📈 Trending GIFs
- 💬 Visual reactions

### YouTube API:
- ▶️ Movie trailers
- 🎥 Embedded video player
- 🔍 Automatic trailer search

---

## Cost Summary

All APIs are **100% FREE** for your usage level:

| API | Free Tier | Your Usage | Cost |
|-----|-----------|------------|------|
| TMDB | 1M requests/month | ~1K/day | $0 |
| YouTube | 10K units/day | ~100/day | $0 |
| OMDb | 1K requests/day | ~50/day | $0 |
| Giphy | Unlimited | Any | $0 |

**Total Monthly Cost: $0** 🎉

---

## Need Help?

If you have issues:
1. Check the API key is correct
2. Make sure you activated the key (OMDb requires email activation)
3. Restart the frontend after adding keys
4. Check browser console for errors

All set! Your movie platform now has enhanced ratings, GIFs, and trailers! 🚀
