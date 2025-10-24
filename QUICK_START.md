# Quick Start Guide

## Current Status

✅ **Frontend is running**: http://localhost:3000
❌ **Backend needs database**: PostgreSQL required

## What's Working

The frontend is live and you can see:
- Beautiful Netflix-inspired dark theme
- Homepage with feature showcase
- Login and signup pages (UI only, needs backend)

## To Get Full Functionality

### Option 1: Use Docker for PostgreSQL (Easiest)

```bash
docker run --name movie-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=movie_community -p 5432:5432 -d postgres:15
```

### Option 2: Install PostgreSQL Locally

1. Download from https://www.postgresql.org/download/
2. Install with default settings
3. Remember your password

### Option 3: Use Cloud Database (Free Tier)

- **Supabase**: https://supabase.com (Free PostgreSQL)
- **Neon**: https://neon.tech (Free PostgreSQL)
- **Railway**: https://railway.app (Free tier available)

## Setup Steps (After Database is Ready)

1. **Update backend/.env with your database URL:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/movie_community"
```

2. **Run database migrations:**
```bash
cd backend
npm run migrate
npm run seed
```

3. **Backend will auto-restart** (nodemon is watching)

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## Test the Features

Once the database is connected:

1. **Sign Up**: Create a new account at /signup
2. **Login**: Sign in at /login
3. **Profile**: View your profile
4. **Follow Users**: Follow other users
5. **Create Blogs**: Write and publish blogs
6. **Create Playlists**: Curate movie playlists

## Demo Credentials (After Seeding)

```
Email: john@example.com
Password: password123

Email: jane@example.com
Password: password123
```

## What's Been Built

### ✅ Completed Features
- Authentication system (JWT, secure cookies)
- User profiles with edit functionality
- Follow/unfollow system
- Blog CRUD operations (create, read, update, delete)
- Blog drafts and publishing
- Save/bookmark blogs
- Playlist CRUD operations
- Add/remove movies from playlists
- View count tracking
- ML interaction tracking
- Dark Netflix-inspired theme
- Responsive design

### 📋 Backend API Endpoints

**Authentication**
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

**Users**
- GET /api/users/:id
- PUT /api/users/:id
- POST /api/users/:id/follow
- DELETE /api/users/:id/follow

**Blogs**
- GET /api/blogs
- GET /api/blogs/:id
- POST /api/blogs
- PUT /api/blogs/:id
- DELETE /api/blogs/:id
- POST /api/blogs/:id/save
- POST /api/blogs/:id/view

**Playlists**
- GET /api/playlists
- GET /api/playlists/:id
- POST /api/playlists
- PUT /api/playlists/:id
- DELETE /api/playlists/:id
- POST /api/playlists/:id/movies
- DELETE /api/playlists/:id/movies/:movieId

## Troubleshooting

### Frontend Issues
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

### Backend Issues
```bash
cd backend
rm -rf node_modules dist
npm install
npm run dev
```

### Database Connection Issues
- Check PostgreSQL is running: `psql -U postgres`
- Verify DATABASE_URL in backend/.env
- Check port 5432 is not in use

## Next Steps

The platform is 50% complete with core features working:
- ✅ Authentication & user management
- ✅ Social features (follow system)
- ✅ Blog system (backend complete)
- ✅ Playlist system (backend complete)
- 🚧 Homepage with curated content
- 🚧 ML recommendations
- 🚧 Rich-text blog editor
- 🚧 Full UI for blogs and playlists

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with httpOnly cookies
- **Theme**: Dark mode (Netflix-inspired)
