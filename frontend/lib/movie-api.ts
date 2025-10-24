// TMDB API integration for movie search
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'demo_key';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// YouTube API for trailers
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || 'demo_key';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// OMDb API for enhanced movie data
const OMDB_API_KEY = process.env.NEXT_PUBLIC_OMDB_API_KEY || 'demo_key';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

// Giphy API for GIFs
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'demo_key';
const GIPHY_BASE_URL = 'https://api.giphy.com/v1';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface MovieSearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export const movieApi = {
  // Search movies by query
  searchMovies: async (query: string, page = 1): Promise<MovieSearchResponse> => {
    if (!query.trim()) {
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }

    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
          query
        )}&page=${page}`
      );

      if (!response.ok) {
        throw new Error('Failed to search movies');
      }

      return await response.json();
    } catch (error) {
      console.error('Movie search error:', error);
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  },

  // Get popular movies
  getPopularMovies: async (page = 1): Promise<MovieSearchResponse> => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch popular movies');
      }

      return await response.json();
    } catch (error) {
      console.error('Popular movies error:', error);
      return { page: 1, results: [], total_pages: 0, total_results: 0 };
    }
  },

  // Get movie details by ID
  getMovieDetails: async (movieId: number): Promise<Movie | null> => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch movie details');
      }

      return await response.json();
    } catch (error) {
      console.error('Movie details error:', error);
      return null;
    }
  },

  // Get full poster URL
  getPosterUrl: (posterPath: string | null): string => {
    if (!posterPath) return '/placeholder-movie.jpg';
    return `${TMDB_IMAGE_BASE_URL}${posterPath}`;
  },

  // Get backdrop URL
  getBackdropUrl: (backdropPath: string | null): string => {
    if (!backdropPath) return '/placeholder-backdrop.jpg';
    return `https://image.tmdb.org/t/p/w1280${backdropPath}`;
  },

  // Get movie videos (trailers) from TMDB
  getMovieVideos: async (movieId: number) => {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch movie videos');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Movie videos error:', error);
      return [];
    }
  },

  // Search YouTube for movie trailer
  searchYouTubeTrailer: async (movieTitle: string, year?: number) => {
    try {
      const searchQuery = year 
        ? `${movieTitle} ${year} official trailer`
        : `${movieTitle} official trailer`;
      
      const response = await fetch(
        `${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(
          searchQuery
        )}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to search YouTube');
      }

      const data = await response.json();
      return data.items?.[0]?.id?.videoId || null;
    } catch (error) {
      console.error('YouTube search error:', error);
      return null;
    }
  },

  // Get YouTube embed URL
  getYouTubeEmbedUrl: (videoId: string): string => {
    return `https://www.youtube.com/embed/${videoId}`;
  },

  // Get enhanced movie data from OMDb (IMDb ratings, awards, etc.)
  getOMDbData: async (imdbId?: string, title?: string, year?: number) => {
    try {
      let url = `${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}`;
      
      if (imdbId) {
        url += `&i=${imdbId}`;
      } else if (title) {
        url += `&t=${encodeURIComponent(title)}`;
        if (year) url += `&y=${year}`;
      } else {
        return null;
      }

      const response = await fetch(url);
      if (!response.ok) return null;

      const data = await response.json();
      return data.Response === 'True' ? data : null;
    } catch (error) {
      console.error('OMDb error:', error);
      return null;
    }
  },

  // Search Giphy for movie-related GIFs
  searchGiphy: async (query: string, limit: number = 20) => {
    try {
      const response = await fetch(
        `${GIPHY_BASE_URL}/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
          query
        )}&limit=${limit}&rating=pg-13`
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Giphy error:', error);
      return [];
    }
  },

  // Get trending movie GIFs
  getTrendingGiphy: async (limit: number = 20) => {
    try {
      const response = await fetch(
        `${GIPHY_BASE_URL}/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=pg-13`
      );

      if (!response.ok) return [];

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Giphy trending error:', error);
      return [];
    }
  },
};
