import { Router } from 'express';
import {
  createPlaylist,
  getPlaylists,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addMovieToPlaylist,
  removeMovieFromPlaylist,
  reorderPlaylistMovies,
} from '../controllers/playlist.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', getPlaylists);
router.get('/:id', getPlaylist);
router.post('/', authenticate, createPlaylist);
router.put('/:id', authenticate, updatePlaylist);
router.delete('/:id', authenticate, deletePlaylist);
router.post('/:id/movies', authenticate, addMovieToPlaylist);
router.delete('/:id/movies/:movieId', authenticate, removeMovieFromPlaylist);
router.put('/:id/reorder', authenticate, reorderPlaylistMovies);

export default router;
