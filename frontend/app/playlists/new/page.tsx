'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { MovieSearch } from '@/components/movies/movie-search';
import { Movie, movieApi } from '@/lib/movie-api';

function NewPlaylistPageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    coverImageUrl: '',
    isPublic: true,
  });
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);

  const handleMovieSelect = (movie: Movie) => {
    const isAlreadySelected = selectedMovies.some((selected) => selected.id === movie.id);
    
    if (isAlreadySelected) {
      setSelectedMovies(selectedMovies.filter((selected) => selected.id !== movie.id));
      toast.success(`Removed "${movie.title}" from playlist`);
    } else {
      setSelectedMovies([...selectedMovies, movie]);
      toast.success(`Added "${movie.title}" to playlist`);
    }
  };

  const removeMovie = (movieId: number) => {
    const movie = selectedMovies.find((m) => m.id === movieId);
    setSelectedMovies(selectedMovies.filter((m) => m.id !== movieId));
    if (movie) {
      toast.success(`Removed "${movie.title}" from playlist`);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }

    setLoading(true);
    try {
      // Create the playlist
      const playlistResponse = await api.post('/api/playlists', formData);
      const playlistId = playlistResponse.playlist.id;

      // Add movies to the playlist
      for (const movie of selectedMovies) {
        await api.post(`/api/playlists/${playlistId}/movies`, {
          movieId: movie.id.toString(),
          movieTitle: movie.title,
          moviePosterUrl: movieApi.getPosterUrl(movie.poster_path),
          movieYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        });
      }

      toast.success('Playlist created successfully!');
      router.push(`/playlists/${playlistId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create playlist');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-sm -z-10"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/3d/31/ef/3d31ef975700b3d9c15bbc30f46be45a.jpg)',
        }}
      />
      <div className="fixed inset-0 bg-black/60 -z-10" />
      <div className="mx-auto max-w-6xl px-4 py-8 relative z-10">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Playlist Form */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-2xl">Create New Playlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Playlist Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Top 10 Action Movies"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your playlist..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImageUrl">Cover Image URL (Optional)</Label>
                <Input
                  id="coverImageUrl"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Or select a movie poster after adding movies
                </p>
              </div>

              {/* Selected Movies */}
              <div className="space-y-2">
                <Label>Selected Movies ({selectedMovies.length})</Label>
                {selectedMovies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No movies selected. Search and click movies to add them.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedMovies.map((movie, index) => (
                      <div
                        key={movie.id}
                        className="flex items-center gap-3 p-2 bg-muted rounded-lg"
                      >
                        <span className="text-sm font-medium w-6">{index + 1}.</span>
                        <img
                          src={movieApi.getPosterUrl(movie.poster_path)}
                          alt={movie.title}
                          className="h-12 w-8 rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1">{movie.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMovie(movie.id)}
                          disabled={loading}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.name.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? 'Creating Playlist...' : 'Create Playlist'}
              </Button>
            </CardContent>
          </Card>

          {/* Movie Search */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-2xl">Add Movies</CardTitle>
            </CardHeader>
            <CardContent>
              <MovieSearch
                onMovieSelect={handleMovieSelect}
                selectedMovies={selectedMovies}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewPlaylistPage() {
  return (
    <ProtectedRoute>
      <NewPlaylistPageContent />
    </ProtectedRoute>
  );
}
