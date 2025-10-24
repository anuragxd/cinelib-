'use client';

import { useEffect, useState } from 'react';
import { movieApi } from '@/lib/movie-api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Play } from 'lucide-react';

interface MovieTrailerModalProps {
  movieId: number;
  movieTitle: string;
  movieYear?: number;
}

export function MovieTrailerModal({ movieId, movieTitle, movieYear }: MovieTrailerModalProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !trailerKey && !loading) {
      fetchTrailer();
    }
  }, [open]);

  async function fetchTrailer() {
    setLoading(true);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Watch Trailer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>{movieTitle} - Trailer</DialogTitle>
        </DialogHeader>
        <div className="bg-white">
          {loading ? (
            <div className="aspect-video w-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading trailer...</p>
              </div>
            </div>
          ) : trailerKey ? (
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src={movieApi.getYouTubeEmbedUrl(trailerKey)}
                title={`${movieTitle} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded"
              />
            </div>
          ) : (
            <div className="aspect-video w-full flex items-center justify-center bg-gray-100 rounded">
              <p className="text-muted-foreground">Trailer not available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
