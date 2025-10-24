import { Router } from 'express';
import {
  searchMovies,
  getMovieDetails,
  getPopularMovies,
  getTrendingMovies,
  getMovieGenres,
} from '../controllers/movie.controller';

const router = Router();

router.get('/search', searchMovies);
router.get('/popular', getPopularMovies);
router.get('/trending', getTrendingMovies);
router.get('/genres', getMovieGenres);
router.get('/:id', getMovieDetails);

export default router;
