'use client';

import { useEffect, useState } from 'react';
import { movieApi } from '@/lib/movie-api';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface MovieRatingsProps {
  movieTitle: string;
  movieYear?: number;
}

export function MovieRatings({ movieTitle, movieYear }: MovieRatingsProps) {
  const [ratings, setRatings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [movieTitle]);

  async function fetchRatings() {
    try {
      const data = await movieApi.getOMDbData(undefined, movieTitle, movieYear);
      setRatings(data);
    } catch (error) {
      console.error('Failed to fetch ratings:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !ratings) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {ratings.imdbRating && ratings.imdbRating !== 'N/A' && (
        <Badge variant="secondary" className="text-xs">
          ⭐ IMDb {ratings.imdbRating}/10
        </Badge>
      )}
      {ratings.Ratings?.map((rating: any, index: number) => {
        if (rating.Source === 'Rotten Tomatoes') {
          return (
            <Badge key={index} variant="secondary" className="text-xs">
              🍅 {rating.Value}
            </Badge>
          );
        }
        if (rating.Source === 'Metacritic') {
          return (
            <Badge key={index} variant="secondary" className="text-xs">
              Ⓜ️ {rating.Value}
            </Badge>
          );
        }
        return null;
      })}
      {ratings.Awards && ratings.Awards !== 'N/A' && (
        <Badge variant="outline" className="text-xs">
          🏆 {ratings.Awards}
        </Badge>
      )}
    </div>
  );
}
