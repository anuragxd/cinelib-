import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import blogRoutes from './blog.routes';
import playlistRoutes from './playlist.routes';
import movieRoutes from './movie.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/playlists', playlistRoutes);
router.use('/movies', movieRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api' });
});

export default router;
