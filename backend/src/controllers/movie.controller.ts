import { Request, Response } from 'express';
import axios from 'axios';
import { logger } from '../utils/logger';
import { z } from 'zod';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  tagline?: string;
}

function formatMovie(movie: TMDBMovie) {
  return {
    id: movie.id.toString(),
    title: movie.title,
    overview: movie.overview,
    posterUrl: movie.poster_path
      ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
      : null,
    backdropUrl: movie.backdrop_path
      ? `${TMDB_IMAGE_BASE_URL}/original${movie.backdrop_path}`
      : null,
    releaseDate: movie.release_date,
    year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
    rating: movie.vote_average,
    voteCount: movie.vote_count,
    popularity: movie.popularity,
    genreIds: movie.genre_ids,
    genres: movie.genres,
    runtime: movie.runtime,
    tagline: movie.tagline,
  };
}

export async function searchMovies(req: Request, res: Response) {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({
        error: { code: 'TMDB_NOT_CONFIGURED', message: 'Movie API not configured' },
      });
    }

    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: { code: 'INVALID_QUERY', message: 'Search query is required' },
      });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        query: query.trim(),
        page,
        include_adult: false,
      },
    });

    const movies = response.data.results.map(formatMovie);

    res.json({
      movies,
      pagination: {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
      },
    });
  } catch (error: any) {
    logger.error('Search movies error:', error);
    if (error.response?.status === 401) {
      return res.status(500).json({
        error: { code: 'TMDB_AUTH_ERROR', message: 'Invalid TMDB API key' },
      });
    }
    res.status(500).json({
      error: { code: 'SEARCH_FAILED', message: 'Failed to search movies' },
    });
  }
}

export async function getMovieDetails(req: Request, res: Response) {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({
        error: { code: 'TMDB_NOT_CONFIGURED', message: 'Movie API not configured' },
      });
    }

    const { id } = req.params;

    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'credits,videos,similar',
      },
    });

    const movie = formatMovie(response.data);

    // Add additional details
    const details = {
      ...movie,
      credits: {
        cast: response.data.credits?.cast?.slice(0, 10).map((person: any) => ({
          id: person.id,
          name: person.name,
          character: person.character,
          profilePath: person.profile_path
            ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}`
            : null,
        })),
        crew: response.data.credits?.crew
          ?.filter((person: any) => ['Director', 'Writer', 'Producer'].includes(person.job))
          .slice(0, 10)
          .map((person: any) => ({
            id: person.id,
            name: person.name,
            job: person.job,
            profilePath: person.profile_path
              ? `${TMDB_IMAGE_BASE_URL}/w185${person.profile_path}`
              : null,
          })),
      },
      videos: response.data.videos?.results
        ?.filter((video: any) => video.site === 'YouTube')
        .slice(0, 5)
        .map((video: any) => ({
          id: video.id,
          key: video.key,
          name: video.name,
          type: video.type,
        })),
      similar: response.data.similar?.results?.slice(0, 12).map(formatMovie),
    };

    res.json({ movie: details });
  } catch (error: any) {
    logger.error('Get movie details error:', error);
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: { code: 'MOVIE_NOT_FOUND', message: 'Movie not found' },
      });
    }
    if (error.response?.status === 401) {
      return res.status(500).json({
        error: { code: 'TMDB_AUTH_ERROR', message: 'Invalid TMDB API key' },
      });
    }
    res.status(500).json({
      error: { code: 'FETCH_MOVIE_FAILED', message: 'Failed to fetch movie details' },
    });
  }
}

export async function getPopularMovies(req: Request, res: Response) {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({
        error: { code: 'TMDB_NOT_CONFIGURED', message: 'Movie API not configured' },
      });
    }

    const page = parseInt(req.query.page as string) || 1;

    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: TMDB_API_KEY,
        page,
      },
    });

    const movies = response.data.results.map(formatMovie);

    res.json({
      movies,
      pagination: {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
      },
    });
  } catch (error: any) {
    logger.error('Get popular movies error:', error);
    res.status(500).json({
      error: { code: 'FETCH_POPULAR_FAILED', message: 'Failed to fetch popular movies' },
    });
  }
}

export async function getTrendingMovies(req: Request, res: Response) {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({
        error: { code: 'TMDB_NOT_CONFIGURED', message: 'Movie API not configured' },
      });
    }

    const timeWindow = (req.query.timeWindow as string) || 'week'; // 'day' or 'week'
    const page = parseInt(req.query.page as string) || 1;

    const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/${timeWindow}`, {
      params: {
        api_key: TMDB_API_KEY,
        page,
      },
    });

    const movies = response.data.results.map(formatMovie);

    res.json({
      movies,
      pagination: {
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results,
      },
    });
  } catch (error: any) {
    logger.error('Get trending movies error:', error);
    res.status(500).json({
      error: { code: 'FETCH_TRENDING_FAILED', message: 'Failed to fetch trending movies' },
    });
  }
}

export async function getMovieGenres(req: Request, res: Response) {
  try {
    if (!TMDB_API_KEY) {
      return res.status(500).json({
        error: { code: 'TMDB_NOT_CONFIGURED', message: 'Movie API not configured' },
      });
    }

    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    res.json({ genres: response.data.genres });
  } catch (error: any) {
    logger.error('Get movie genres error:', error);
    res.status(500).json({
      error: { code: 'FETCH_GENRES_FAILED', message: 'Failed to fetch genres' },
    });
  }
}
