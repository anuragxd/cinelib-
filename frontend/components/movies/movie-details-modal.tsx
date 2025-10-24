'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { movieApi } from '@/lib/movie-api';
import { X, Play, Star } from 'lucide-react';

interface MovieDetailsModalProps {
  movieId: string;
  movieTitle: string;
  movieYear?: number;
  moviePosterUrl?: string;
  open: boolean;
  onClose: () => void;
}

interface MovieDetails {
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  backdrop_path: string | null;
  poster_path: string | null;
  tagline?: string;
  production_companies?: { name: string }[];
}

interface OMDbData {
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Awards?: string;
  imdbRating?: string;
  Rated?: string;
  Runtime?: string;
}

export function MovieDetailsModal({
  movieId,
  movieTitle,
  movieYear,
  moviePosterUrl,
  open,
  onClose,
}: MovieDetailsModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [omdbData, setOmdbData] = useState<OMDbData | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchMovieData();
    }
  }, [open, movieId]);

  async function fetchMovieData() {
    setLoading(true);
    try {
      // Fetch TMDB details
      const tmdbDetails = await movieApi.getMovieDetails(parseInt(movieId));
      if (tmdbDetails) {
        setDetails(tmdbDetails as any);
      }

      // Fetch OMDb data for additional info
      const omdb = await movieApi.getOMDbData(undefined, movieTitle, movieYear);
      if (omdb) {
        setOmdbData(omdb);
      }

      // Fetch trailer
      const videos = await movieApi.getMovieVideos(parseInt(movieId));
      const trailer = videos.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailer) {
        setTrailerKey(trailer.key);
      }
    } catch (error) {
      console.error('Failed to fetch movie data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 bg-white">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="relative">
            {/* Backdrop Image */}
            {details?.backdrop_path && (
              <div className="relative h-64 w-full">
                <img
                  src={movieApi.getBackdropUrl(details.backdrop_path)}
                  alt={details.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-4">
              <div className="flex gap-4">
                {/* Poster */}
                <div className="flex-shrink-0">
                  <img
                    src={moviePosterUrl || movieApi.getPosterUrl(details?.poster_path || null)}
                    alt={movieTitle}
                    className="w-40 rounded-md shadow-lg"
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {details?.title || movieTitle}
                  </h2>

                  {details?.tagline && (
                    <p className="text-gray-600 italic mb-2 text-sm">{details.tagline}</p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {movieYear && (
                      <Badge variant="secondary">{movieYear}</Badge>
                    )}
                    {omdbData?.Rated && (
                      <Badge variant="secondary">{omdbData.Rated}</Badge>
                    )}
                    {omdbData?.Runtime && (
                      <Badge variant="secondary">{omdbData.Runtime}</Badge>
                    )}
                    {details?.vote_average && (
                      <Badge className="bg-yellow-500 text-white">
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        {details.vote_average.toFixed(1)}
                      </Badge>
                    )}
                    {omdbData?.imdbRating && (
                      <Badge variant="outline">
                        IMDb: {omdbData.imdbRating}
                      </Badge>
                    )}
                  </div>

                  {/* Genres */}
                  {details?.genres && details.genres.length > 0 && (
                    <div className="mb-2">
                      <div className="flex flex-wrap gap-1.5">
                        {details.genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Director & Cast */}
                  {omdbData?.Director && (
                    <div className="mb-2">
                      <span className="font-semibold text-gray-900 text-sm">Director: </span>
                      <span className="text-gray-700 text-sm">{omdbData.Director}</span>
                    </div>
                  )}

                  {omdbData?.Actors && (
                    <div className="mb-2">
                      <span className="font-semibold text-gray-900 text-sm">Cast: </span>
                      <span className="text-gray-700 text-sm">{omdbData.Actors}</span>
                    </div>
                  )}

                  {/* Overview */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm">Overview</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {omdbData?.Plot || details?.overview || 'No description available.'}
                    </p>
                  </div>

                  {/* Awards */}
                  {omdbData?.Awards && omdbData.Awards !== 'N/A' && (
                    <div className="mb-2">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">Awards</h3>
                      <p className="text-gray-700 text-sm">{omdbData.Awards}</p>
                    </div>
                  )}

                  {/* Watch Trailer Button */}
                  {trailerKey && (
                    <div className="mt-3">
                      <Button
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Trailer
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
