import { Router } from 'express';
import {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  getDrafts,
  incrementViewCount,
} from '../controllers/blog.controller';
import { saveBlog, unsaveBlog, getSavedBlogs } from '../controllers/saved-blog.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth';

const router = Router();

// Public routes (with optional auth)
router.get('/', getBlogs);
router.get('/:id', optionalAuthenticate, getBlog);

// Protected routes
router.post('/', authenticate, createBlog);
router.put('/:id', authenticate, updateBlog);
router.delete('/:id', authenticate, deleteBlog);
router.get('/drafts', authenticate, getDrafts);
router.post('/:id/view', optionalAuthenticate, incrementViewCount);
router.post('/:id/save', authenticate, saveBlog);
router.delete('/:id/save', authenticate, unsaveBlog);
router.get('/saved', authenticate, getSavedBlogs);

export default router;
