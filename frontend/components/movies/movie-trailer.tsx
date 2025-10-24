'use client';

import { useEffect, useState } from 'react';
import { movieApi } from '@/lib/movie-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MovieTrailerProps {
  movieId: number;
  movieTitle: string;
  movieYear?: number;
}

export function MovieTrailer({ movieId, movieTitle, movieYear }: MovieTrailerProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrailer();
  }, [movieId]);

  async function fetchTrailer() {
    try {
      // First try TMDB videos
      const videos = await movieApi.getMovieVideos(movieId);
      const trailer = videos.find(
        (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
      );

      if (trailer) {
        setTrailerKey(trailer.key);
      } else {
        // Fallback to YouTube search
        const videoId = await movieApi.searchYouTubeTrailer(movieTitle, movieYear);
        setTrailerKey(videoId);
      }
    } catch (error) {
      console.error('Failed to fetch trailer:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Loading trailer...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!trailerKey) {
    return null;
  }

  return (
    <Card className="bg-white overflow-hidden">
      <CardHeader>
        <CardTitle>Watch Trailer</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="aspect-video w-full">
          <iframe
            width="100%"
            height="100%"
            src={movieApi.getYouTubeEmbedUrl(trailerKey)}
            title={`${movieTitle} Trailer`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
