'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { MovieSearch } from '@/components/movies/movie-search';
import { MovieTrailer } from '@/components/movies/movie-trailer';
import { MovieTrailerModal } from '@/components/movies/movie-trailer-modal';
import { MovieRatings } from '@/components/movies/movie-ratings';
import { MovieDetailsModal } from '@/components/movies/movie-details-modal';
import { Movie, movieApi } from '@/lib/movie-api';

interface PlaylistMovie {
  id: string;
  movieId: string;
  movieTitle: string;
  moviePosterUrl?: string;
  movieYear?: number;
  position: number;
  addedAt: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  movies: PlaylistMovie[];
}

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [showEditCover, setShowEditCover] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<PlaylistMovie | null>(null);

  useEffect(() => {
    fetchPlaylist();
  }, [params.id]);

  async function fetchPlaylist() {
    try {
      const response = await api.get(`/api/playlists/${params.id}`);
      setPlaylist(response.playlist);
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      toast.error('Playlist not found');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/playlists/${params.id}`);
      toast.success('Playlist deleted successfully');
      router.push('/playlists');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete playlist');
    }
  }

  async function handleAddMovie(movie: Movie) {
    if (!playlist) return;

    try {
      await api.post(`/api/playlists/${params.id}/movies`, {
        movieId: movie.id.toString(),
        movieTitle: movie.title,
        moviePosterUrl: movieApi.getPosterUrl(movie.poster_path),
        movieYear: movie.release_date ? new Date(movie.release_date).getFullYear() : undefined,
      });
      
      toast.success(`Added "${movie.title}" to playlist`);
      setShowAddMovie(false);
      fetchPlaylist();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add movie');
    }
  }

  async function handleUpdateCover() {
    if (!coverImageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      await api.put(`/api/playlists/${params.id}`, {
        coverImageUrl: coverImageUrl.trim(),
      });
      
      toast.success('Cover image updated');
      setShowEditCover(false);
      fetchPlaylist();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cover image');
    }
  }

  function handleSelectMovieAsCover(posterUrl: string) {
    setCoverImageUrl(posterUrl);
    setShowEditCover(true);
  }

  async function handleRemoveMovie(movieId: string) {
    if (!confirm('Remove this movie from the playlist?')) return;

    try {
      await api.delete(`/api/playlists/${params.id}/movies/${movieId}`);
      toast.success('Movie removed from playlist');
      fetchPlaylist(); // Refresh the playlist
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove movie');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-sm -z-10"
          style={{
            backgroundImage: 'url(https://i.pinimg.com/1200x/3d/31/ef/3d31ef975700b3d9c15bbc30f46be45a.jpg)',
          }}
        />
        <div className="fixed inset-0 bg-black/60 -z-10" />
        <div className="mx-auto max-w-6xl px-4 py-4 relative z-10">
          <div className="mb-4 bg-white rounded-md p-6 animate-fade-in">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-md overflow-hidden shadow animate-pulse">
                <div className="aspect-[2/3] bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Playlist not found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === playlist.user.id;

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-sm -z-10"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/3d/31/ef/3d31ef975700b3d9c15bbc30f46be45a.jpg)',
        }}
      />
      <div className="fixed inset-0 bg-black/60 -z-10" />
      <div className="mx-auto max-w-6xl px-4 py-4 relative z-10">
        {/* Playlist Header with Cover */}
        <Card className="mb-4 overflow-hidden">
          {playlist.coverImageUrl && (
            <div className="relative h-48 w-full">
              <img
                src={playlist.coverImageUrl}
                alt={playlist.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
          )}
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{playlist.name}</h1>
                {playlist.description && (
                  <p className="text-muted-foreground mb-4">{playlist.description}</p>
                )}
                <div className="flex items-center gap-4">
                  <Link href={`/profile/${playlist.user.username}`}>
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={playlist.user.avatarUrl} />
                        <AvatarFallback>
                          {playlist.user.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{playlist.user.displayName}</p>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(playlist.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <Badge variant="secondary">
                    {playlist.movies.length} movies
                  </Badge>
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <Dialog open={showEditCover} onOpenChange={setShowEditCover}>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setCoverImageUrl(playlist.coverImageUrl || '')}>
                        {playlist.coverImageUrl ? 'Change Cover' : 'Add Cover'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>Update Playlist Cover</DialogTitle>
                        <DialogDescription>
                          Enter an image URL or select from your playlist movies
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 bg-white">
                        <div>
                          <Label htmlFor="coverUrl">Image URL</Label>
                          <Input
                            id="coverUrl"
                            placeholder="https://example.com/image.jpg"
                            value={coverImageUrl}
                            onChange={(e) => setCoverImageUrl(e.target.value)}
                          />
                        </div>
                        {playlist.movies.length > 0 && (
                          <div>
                            <Label>Or select from playlist movies:</Label>
                            <div className="grid grid-cols-4 gap-2 mt-2 max-h-48 overflow-y-auto">
                              {playlist.movies.map((movie) => (
                                movie.moviePosterUrl && (
                                  <img
                                    key={movie.id}
                                    src={movie.moviePosterUrl}
                                    alt={movie.movieTitle}
                                    className="w-full aspect-[2/3] object-cover rounded cursor-pointer hover:ring-2 hover:ring-primary transition"
                                    onClick={() => setCoverImageUrl(movie.moviePosterUrl!)}
                                  />
                                )
                              ))}
                            </div>
                          </div>
                        )}
                        <Button onClick={handleUpdateCover} className="w-full">
                          Update Cover
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showAddMovie} onOpenChange={setShowAddMovie}>
                    <DialogTrigger asChild>
                      <Button>Add Movie</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add Movie to Playlist</DialogTitle>
                        <DialogDescription>
                          Search for movies and click to add them to your playlist
                        </DialogDescription>
                      </DialogHeader>
                      <MovieSearch
                        onMovieSelect={handleAddMovie}
                        selectedMovies={playlist.movies.map(m => ({
                          id: parseInt(m.movieId),
                          title: m.movieTitle,
                          poster_path: m.moviePosterUrl || '',
                          overview: '',
                          backdrop_path: null,
                          release_date: m.movieYear?.toString() || '',
                          vote_average: 0,
                          genre_ids: [],
                        }))}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Featured Trailer */}
        {playlist.movies.length > 0 && (
          <div className="mb-4">
            <MovieTrailer
              movieId={parseInt(playlist.movies[0].movieId)}
              movieTitle={playlist.movies[0].movieTitle}
              movieYear={playlist.movies[0].movieYear}
            />
          </div>
        )}

        {/* Movies Grid */}
        {playlist.movies.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No movies in this playlist</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {playlist.movies
              .sort((a, b) => a.position - b.position)
              .map((movie, index) => (
                <div 
                  key={movie.id} 
                  className="group relative bg-white rounded-md overflow-hidden shadow hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.03}s` }}
                  onClick={() => setSelectedMovie(movie)}
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={movie.moviePosterUrl || '/placeholder-movie.jpg'}
                      alt={movie.movieTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                      }}
                    />
                  </div>
                  <div className="p-3 bg-white">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-gray-900">
                      {movie.movieTitle}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {movie.movieYear || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Movie Details Modal */}
        {selectedMovie && (
          <MovieDetailsModal
            movieId={selectedMovie.movieId}
            movieTitle={selectedMovie.movieTitle}
            movieYear={selectedMovie.movieYear}
            moviePosterUrl={selectedMovie.moviePosterUrl}
            open={!!selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}
      </div>
    </div>
  );
}
