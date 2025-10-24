import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

/**
 * Save/bookmark a blog
 * POST /api/blogs/:id/save
 */
export async function saveBlog(req: Request, res: Response) {
  try {
    const { id: blogId } = req.params;
    const userId = req.user!.userId;

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return res.status(404).json({
        error: {
          code: 'BLOG_NOT_FOUND',
          message: 'Blog not found',
        },
      });
    }

    // Check if already saved
    const existing = await prisma.savedBlog.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: {
          code: 'ALREADY_SAVED',
          message: 'Blog already saved',
        },
      });
    }

    // Save blog
    await prisma.savedBlog.create({
      data: {
        userId,
        blogId,
      },
    });

    // Track interaction for ML
    await prisma.userInteraction.create({
      data: {
        userId,
        interactionType: 'blog_save',
        targetId: blogId,
        targetType: 'blog',
      },
    });

    logger.info(`User ${userId} saved blog ${blogId}`);

    res.status(201).json({
      message: 'Blog saved successfully',
    });
  } catch (error) {
    logger.error('Save blog error:', error);
    res.status(500).json({
      error: {
        code: 'SAVE_BLOG_FAILED',
        message: 'Failed to save blog',
      },
    });
  }
}

/**
 * Unsave/unbookmark a blog
 * DELETE /api/blogs/:id/save
 */
export async function unsaveBlog(req: Request, res: Response) {
  try {
    const { id: blogId } = req.params;
    const userId = req.user!.userId;

    // Check if saved
    const savedBlog = await prisma.savedBlog.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    if (!savedBlog) {
      return res.status(404).json({
        error: {
          code: 'NOT_SAVED',
          message: 'Blog not saved',
        },
      });
    }

    // Remove save
    await prisma.savedBlog.delete({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

    logger.info(`User ${userId} unsaved blog ${blogId}`);

    res.json({
      message: 'Blog unsaved successfully',
    });
  } catch (error) {
    logger.error('Unsave blog error:', error);
    res.status(500).json({
      error: {
        code: 'UNSAVE_BLOG_FAILED',
        message: 'Failed to unsave blog',
      },
    });
  }
}

/**
 * Get user's saved blogs
 * GET /api/blogs/saved
 */
export async function getSavedBlogs(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [savedBlogs, total] = await Promise.all([
      prisma.savedBlog.findMany({
        where: { userId },
        select: {
          savedAt: true,
          blog: {
            select: {
              id: true,
              title: true,
              excerpt: true,
              coverImageUrl: true,
              viewCount: true,
              publishedAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { savedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.savedBlog.count({ where: { userId } }),
    ]);

    res.json({
      blogs: savedBlogs.map((sb) => ({
        ...sb.blog,
        savedAt: sb.savedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get saved blogs error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_SAVED_BLOGS_FAILED',
        message: 'Failed to fetch saved blogs',
      },
    });
  }
}
