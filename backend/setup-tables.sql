-- Movie Community Platform Database Schema

-- Create ENUM types
CREATE TYPE "BlogStatus" AS ENUM ('draft', 'published');
CREATE TYPE "InteractionType" AS ENUM ('blog_view', 'blog_save', 'playlist_view', 'movie_add', 'follow');
CREATE TYPE "TargetType" AS ENUM ('blog', 'playlist', 'user', 'movie');

-- Create users table
CREATE TABLE "users" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "username" TEXT UNIQUE NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create blogs table
CREATE TABLE "blogs" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "status" "BlogStatus" NOT NULL DEFAULT 'draft',
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT NOT NULL,
    FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create playlists table
CREATE TABLE "playlists" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create playlist_movies table
CREATE TABLE "playlist_movies" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "playlistId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "movieTitle" TEXT NOT NULL,
    "moviePosterUrl" TEXT,
    "movieYear" INTEGER,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("playlistId") REFERENCES "playlists"("id") ON DELETE CASCADE,
    UNIQUE ("playlistId", "movieId")
);

-- Create follows table
CREATE TABLE "follows" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "followerId" TEXT NOT NULL,
    "followeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("followeeId") REFERENCES "users"("id") ON DELETE CASCADE,
    UNIQUE ("followerId", "followeeId")
);

-- Create saved_blogs table
CREATE TABLE "saved_blogs" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "blogId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE,
    UNIQUE ("userId", "blogId")
);

-- Create user_interactions table
CREATE TABLE "user_interactions" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "interactionType" "InteractionType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "blogs_authorId_idx" ON "blogs"("authorId");
CREATE INDEX "blogs_status_idx" ON "blogs"("status");
CREATE INDEX "blogs_publishedAt_idx" ON "blogs"("publishedAt");
CREATE INDEX "playlists_userId_idx" ON "playlists"("userId");
CREATE INDEX "playlist_movies_playlistId_idx" ON "playlist_movies"("playlistId");
CREATE INDEX "follows_followerId_idx" ON "follows"("followerId");
CREATE INDEX "follows_followeeId_idx" ON "follows"("followeeId");
CREATE INDEX "saved_blogs_userId_idx" ON "saved_blogs"("userId");
CREATE INDEX "saved_blogs_blogId_idx" ON "saved_blogs"("blogId");
CREATE INDEX "user_interactions_userId_idx" ON "user_interactions"("userId");
CREATE INDEX "user_interactions_targetId_idx" ON "user_interactions"("targetId");
CREATE INDEX "user_interactions_createdAt_idx" ON "user_interactions"("createdAt");
