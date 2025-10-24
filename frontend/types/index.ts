// Common types for the application

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImageUrl?: string;
  status: 'draft' | 'published';
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author?: User;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  movies?: PlaylistMovie[];
}

export interface PlaylistMovie {
  id: string;
  playlistId: string;
  movieId: string;
  movieTitle: string;
  moviePosterUrl?: string;
  movieYear?: number;
  position: number;
  addedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}
