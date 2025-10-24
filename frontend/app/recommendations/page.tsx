'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MovieDetailsModal } from '@/components/movies/movie-details-modal';
import { MovieGridSkeleton } from '@/components/skeletons/movie-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, Filter } from 'lucide-react';

interface Recommendation {
  movieId: string;
  title: string;
  year: string | null;
  posterUrl: string | null;
  score: number;
  reason: string;
}

export default function RecommendationsPage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Recommendation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    { id: 'all', name: 'All Genres' },
    { id: '28', name: 'Action' },
    { id: '12', name: 'Adventure' },
    { id: '16', name: 'Animation' },
    { id: '35', name: 'Comedy' },
    { id: '80', name: 'Crime' },
    { id: '18', name: 'Drama' },
    { id: '14', name: 'Fantasy' },
    { id: '27', name: 'Horror' },
    { id: '10749', name: 'Romance' },
    { id: '878', name: 'Sci-Fi' },
    { id: '53', name: 'Thriller' },
  ];

  const years = [
    { value: 'all', label: 'All Years' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' },
    { value: '2010s', label: '2010s' },
    { value: '2000s', label: '2000s' },
    { value: '1990s', label: '1990s' },
  ];

  const filteredRecommendations = recommendations.filter(movie => {
    if (selectedGenre !== 'all' && !movie.reason.includes('genre')) return true;
    if (selectedYear !== 'all' && movie.year && movie.year !== selectedYear) {
      if (selectedYear === '2010s' && (parseInt(movie.year) < 2010 || parseInt(movie.year) >= 2020)) return false;
      if (selectedYear === '2000s' && (parseInt(movie.year) < 2000 || parseInt(movie.year) >= 2010)) return false;
      if (selectedYear === '1990s' && (parseInt(movie.year) < 1990 || parseInt(movie.year) >= 2000)) return false;
      if (selectedYear !== '2010s' && selectedYear !== '2000s' && selectedYear !== '1990s' && movie.year !== selectedYear) return false;
    }
    if (minRating > 0 && movie.score < minRating) return false;
    return true;
  });

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  async function fetchRecommendations() {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/ml/recommend/movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          limit: 20,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }

  async function searchSimilarMovies() {
    if (!searchQuery.trim()) {
      toast.error('Please enter a movie title');
      return;
    }

    setSearchLoading(true);
    setSearchMode(true);
    try {
      const response = await fetch('http://localhost:5000/ml/recommend/similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieTitle: searchQuery,
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search for similar movies');
      }

      const data = await response.json();
      
      if (!data.found) {
        toast.error('Movie not found. Try a different title.');
        setRecommendations([]);
      } else {
        setRecommendations(data.recommendations || []);
        toast.success(`Found ${data.recommendations.length} movies similar to "${data.matchedMovie.title}"`);
      }
    } catch (error) {
      console.error('Failed to search similar movies:', error);
      toast.error('Failed to search for similar movies');
    } finally {
      setSearchLoading(false);
    }
  }

  function resetToPersonalized() {
    setSearchMode(false);
    setSearchQuery('');
    fetchRecommendations();
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Please log in to see recommendations</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: 'url(https://i.pinimg.com/1200x/3d/31/ef/3d31ef975700b3d9c15bbc30f46be45a.jpg)',
          }}
        />
        <div className="fixed inset-0 bg-black/60 -z-10" />
        
        <div className="mx-auto max-w-7xl px-4 py-8 relative z-10">
          <div className="mb-8 animate-fade-in">
            <Skeleton className="h-10 w-64 mb-2 bg-white/20" />
            <Skeleton className="h-6 w-96 bg-white/20" />
          </div>
          <MovieGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/3d/31/ef/3d31ef975700b3d9c15bbc30f46be45a.jpg)',
        }}
      />
      <div className="fixed inset-0 bg-black/60 -z-10" />
      
      <div className="mx-auto max-w-7xl px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {searchMode ? 'Similar Movies' : 'Recommended for You'}
          </h1>
          <p className="text-gray-200 mb-4">
            {searchMode 
              ? 'Movies similar to your search' 
              : 'Personalized movie recommendations based on your playlists'}
          </p>

          {/* Search Bar */}
          <div className="flex flex-col gap-4 max-w-4xl">
            <div className="flex gap-2">
              <Input
                placeholder="Search for a movie to find similar titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchSimilarMovies()}
                className="bg-white text-black border-gray-300"
              />
              <Button 
                onClick={searchSimilarMovies}
                disabled={searchLoading}
                className="bg-white text-black hover:bg-gray-100 border border-gray-300"
              >
                {searchLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="bg-white/90 hover:bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              {searchMode && (
                <Button 
                  onClick={resetToPersonalized}
                  variant="outline"
                  className="bg-white/90 hover:bg-white"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white/95 p-4 rounded-lg space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Genre</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    >
                      {genres.map(genre => (
                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    >
                      {years.map(year => (
                        <option key={year.value} value={year.value}>{year.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Rating: {minRating.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Showing {filteredRecommendations.length} of {recommendations.length} movies</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedGenre('all');
                      setSelectedYear('all');
                      setMinRating(0);
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {recommendations.length === 0 ? (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>No recommendations yet</CardTitle>
              <p className="text-muted-foreground mt-2">
                Add some movies to your playlists to get personalized recommendations!
              </p>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredRecommendations.map((movie, index) => (
              <div
                key={movie.movieId}
                className="group relative bg-white rounded-md overflow-hidden shadow hover:shadow-xl transition-all duration-300 cursor-pointer stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => setSelectedMovie(movie)}
              >
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img
                    src={movie.posterUrl || '/placeholder-movie.jpg'}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-movie.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-medium line-clamp-2">
                        {movie.reason}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-white">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1 text-gray-900">
                    {movie.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                      {movie.year || 'N/A'}
                    </p>
                    {movie.score > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-xs text-gray-700">{movie.score.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Movie Details Modal */}
        {selectedMovie && (
          <MovieDetailsModal
            movieId={selectedMovie.movieId}
            movieTitle={selectedMovie.title}
            movieYear={selectedMovie.year ? parseInt(selectedMovie.year) : undefined}
            moviePosterUrl={selectedMovie.posterUrl || undefined}
            open={!!selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}
      </div>
    </div>
  );
}
