# Database Documentation

## Overview

The Movie Community Platform uses PostgreSQL as its database with Prisma ORM for type-safe database access.

## Data Models

### User
Stores user account information and authentication credentials.

**Fields:**
- `id` (UUID): Primary key
- `email` (String): Unique email address
- `passwordHash` (String): Bcrypt hashed password
- `username` (String): Unique username
- `displayName` (String): Display name
- `bio` (String?): Optional user biography
- `avatarUrl` (String?): Optional avatar image URL
- `createdAt` (DateTime): Account creation timestamp
- `updatedAt` (DateTime): Last update timestamp

**Relations:**
- Has many `blogs`
- Has many `playlists`
- Has many `savedBlogs`
- Has many `followers` (Follow)
- Has many `following` (Follow)
- Has many `interactions`

### Blog
Stores blog posts about movies.

**Fields:**
- `id` (UUID): Primary key
- `title` (String): Blog title
- `content` (Text): Rich text content (JSON)
- `excerpt` (String): Short description
- `coverImageUrl` (String?): Optional cover image
- `status` (Enum): 'draft' or 'published'
- `viewCount` (Int): Number of views
- `publishedAt` (DateTime?): Publication timestamp
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp
- `authorId` (UUID): Foreign key to User

**Relations:**
- Belongs to `author` (User)
- Has many `savedBy` (SavedBlog)

**Indexes:**
- `authorId`
- `status`
- `publishedAt`

### Playlist
Stores user-created movie playlists.

**Fields:**
- `id` (UUID): Primary key
- `name` (String): Playlist name
- `description` (String?): Optional description
- `isPublic` (Boolean): Visibility flag (default: true)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp
- `userId` (UUID): Foreign key to User

**Relations:**
- Belongs to `user` (User)
- Has many `movies` (PlaylistMovie)

**Indexes:**
- `userId`

### PlaylistMovie
Join table for movies in playlists.

**Fields:**
- `id` (UUID): Primary key
- `playlistId` (UUID): Foreign key to Playlist
- `movieId` (String): External movie ID (e.g., TMDB ID)
- `movieTitle` (String): Movie title
- `moviePosterUrl` (String?): Optional poster URL
- `movieYear` (Int?): Optional release year
- `position` (Int): Order in playlist
- `addedAt` (DateTime): Addition timestamp

**Relations:**
- Belongs to `playlist` (Playlist)

**Constraints:**
- Unique: `[playlistId, movieId]` (prevents duplicates)

**Indexes:**
- `playlistId`

### Follow
Join table for user follow relationships.

**Fields:**
- `id` (UUID): Primary key
- `followerId` (UUID): User who follows
- `followeeId` (UUID): User being followed
- `createdAt` (DateTime): Follow timestamp

**Relations:**
- Belongs to `follower` (User)
- Belongs to `followee` (User)

**Constraints:**
- Unique: `[followerId, followeeId]`

**Indexes:**
- `followerId`
- `followeeId`

### SavedBlog
Join table for saved/bookmarked blogs.

**Fields:**
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `blogId` (UUID): Foreign key to Blog
- `savedAt` (DateTime): Save timestamp

**Relations:**
- Belongs to `user` (User)
- Belongs to `blog` (Blog)

**Constraints:**
- Unique: `[userId, blogId]`

**Indexes:**
- `userId`
- `blogId`

### UserInteraction
Tracks user interactions for ML recommendations.

**Fields:**
- `id` (UUID): Primary key
- `userId` (UUID): Foreign key to User
- `interactionType` (Enum): Type of interaction
- `targetId` (String): ID of target entity
- `targetType` (Enum): Type of target entity
- `createdAt` (DateTime): Interaction timestamp

**Enums:**
- `InteractionType`: blog_view, blog_save, playlist_view, movie_add, follow
- `TargetType`: blog, playlist, user, movie

**Relations:**
- Belongs to `user` (User)

**Indexes:**
- `userId`
- `targetId`
- `createdAt`

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and set your PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/movie_community"
```

### 3. Generate Prisma Client
```bash
npm run prisma:generate
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Seed Database (Optional)
```bash
npm run seed
```

## Common Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create a new migration
npm run migrate

# Deploy migrations (production)
npm run migrate:deploy

# Open Prisma Studio (GUI)
npm run prisma:studio

# Seed database
npm run seed
```

## Database Relationships Diagram

```
User
├── blogs (1:N) → Blog
├── playlists (1:N) → Playlist
├── savedBlogs (1:N) → SavedBlog
├── followers (1:N) → Follow
├── following (1:N) → Follow
└── interactions (1:N) → UserInteraction

Blog
├── author (N:1) → User
└── savedBy (1:N) → SavedBlog

Playlist
├── user (N:1) → User
└── movies (1:N) → PlaylistMovie

PlaylistMovie
└── playlist (N:1) → Playlist

Follow
├── follower (N:1) → User
└── followee (N:1) → User

SavedBlog
├── user (N:1) → User
└── blog (N:1) → Blog

UserInteraction
└── user (N:1) → User
```

## Performance Considerations

### Indexes
The schema includes indexes on frequently queried fields:
- User: `email`, `username`
- Blog: `authorId`, `status`, `publishedAt`
- Playlist: `userId`
- Follow: `followerId`, `followeeId`
- SavedBlog: `userId`, `blogId`
- UserInteraction: `userId`, `targetId`, `createdAt`

### Cascade Deletes
All foreign key relationships use `onDelete: Cascade` to maintain referential integrity.

### Query Optimization
- Use Prisma's `include` and `select` to fetch only needed data
- Implement pagination for list queries
- Use connection pooling in production
