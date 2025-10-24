'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { movieApi, Movie } from '@/lib/movie-api';
import { toast } from 'sonner';

interface MovieSearchProps {
  onMovieSelect: (movie: Movie) => void;
  selectedMovies?: Movie[];
}

export function MovieSearch({ onMovieSelect, selectedMovies = [] }: MovieSearchProps) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPopular, setShowPopular] = useState(true);

  useEffect(() => {
    loadPopularMovies();
  }, []);

  async function loadPopularMovies() {
    setLoading(true);
    try {
      const response = await movieApi.getPopularMovies();
      setMovies(response.results);
    } catch (error) {
      toast.error('Failed to load popular movies');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!query.trim()) {
      loadPopularMovies();
      setShowPopular(true);
      return;
    }

    setLoading(true);
    setShowPopular(false);
    try {
      const response = await movieApi.searchMovies(query);
      setMovies(response.results);
    } catch (error) {
      toast.error('Failed to search movies');
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isMovieSelected = (movie: Movie) => {
    return selectedMovies.some((selected) => selected.id === movie.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {showPopular ? 'Popular Movies' : `Search results for "${query}"`}
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-96 overflow-y-auto">
          {movies.map((movie) => (
            <Card
              key={movie.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                isMovieSelected(movie) ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onMovieSelect(movie)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img
                    src={movieApi.getPosterUrl(movie.poster_path)}
                    alt={movie.title}
                    className="h-20 w-14 rounded object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold line-clamp-2">{movie.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </Badge>
                      {isMovieSelected(movie) && (
                        <Badge variant="default" className="text-xs">
                          Added
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {movies.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          {showPopular ? 'No popular movies found' : 'No movies found. Try a different search term.'}
        </div>
      )}
    </div>
  );
}
