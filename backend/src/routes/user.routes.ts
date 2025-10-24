import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getUserBlogs,
  getUserPlaylists,
  getUserFollowers,
  getUserFollowing,
} from '../controllers/user.controller';
import { followUser, unfollowUser } from '../controllers/follow.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth for isFollowing check)
router.get('/:id', optionalAuthenticate, getUserProfile);
router.get('/:id/blogs', optionalAuthenticate, getUserBlogs);
router.get('/:id/playlists', getUserPlaylists);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);

// Protected routes
router.put('/:id', authenticate, updateUserProfile);
router.post('/:id/follow', authenticate, followUser);
router.delete('/:id/follow', authenticate, unfollowUser);

export default router;
