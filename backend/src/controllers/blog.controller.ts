import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { z } from 'zod';

const blogSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().min(1).max(500),
  coverImageUrl: z.string().url().optional().nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
});

/**
 * Create a new blog
 * POST /api/blogs
 */
export async function createBlog(req: Request, res: Response) {
  try {
    const data = blogSchema.parse(req.body);
    const authorId = req.user!.userId;

    const blog = await prisma.blog.create({
      data: {
        ...data,
        authorId,
        publishedAt: data.status === 'published' ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    logger.info(`Blog created: ${blog.id} by ${authorId}`);

    res.status(201).json({ blog });
  } catch (error: any) {
    logger.error('Create blog error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'CREATE_BLOG_FAILED',
        message: 'Failed to create blog',
      },
    });
  }
}

/**
 * Get all published blogs
 * GET /api/blogs
 */
export async function getBlogs(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where: { status: 'published' },
        select: {
          id: true,
          title: true,
          excerpt: true,
          coverImageUrl: true,
          viewCount: true,
          publishedAt: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where: { status: 'published' } }),
    ]);

    res.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get blogs error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_BLOGS_FAILED',
        message: 'Failed to fetch blogs',
      },
    });
  }
}

/**
 * Get single blog by ID
 * GET /api/blogs/:id
 */
export async function getBlog(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
    });

    if (!blog) {
      return res.status(404).json({
        error: {
          code: 'BLOG_NOT_FOUND',
          message: 'Blog not found',
        },
      });
    }

    // Only allow viewing drafts if you're the author
    if (blog.status === 'draft' && blog.authorId !== req.user?.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You cannot view this draft',
        },
      });
    }

    // Check if current user has saved this blog
    let isSaved = false;
    if (req.user) {
      const savedBlog = await prisma.savedBlog.findUnique({
        where: {
          userId_blogId: {
            userId: req.user.userId,
            blogId: id,
          },
        },
      });
      isSaved = !!savedBlog;
    }

    res.json({
      blog: {
        ...blog,
        isSaved,
      },
    });
  } catch (error) {
    logger.error('Get blog error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_BLOG_FAILED',
        message: 'Failed to fetch blog',
      },
    });
  }
}

/**
 * Update a blog
 * PUT /api/blogs/:id
 */
export async function updateBlog(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = blogSchema.partial().parse(req.body);

    // Check if blog exists and user is the author
    const existingBlog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!existingBlog) {
      return res.status(404).json({
        error: {
          code: 'BLOG_NOT_FOUND',
          message: 'Blog not found',
        },
      });
    }

    if (existingBlog.authorId !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own blogs',
        },
      });
    }

    // If changing from draft to published, set publishedAt
    const updateData: any = { ...data };
    if (data.status === 'published' && existingBlog.status === 'draft') {
      updateData.publishedAt = new Date();
    }

    const blog = await prisma.blog.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    logger.info(`Blog updated: ${id}`);

    res.json({ blog });
  } catch (error: any) {
    logger.error('Update blog error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors,
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'UPDATE_BLOG_FAILED',
        message: 'Failed to update blog',
      },
    });
  }
}

/**
 * Delete a blog
 * DELETE /api/blogs/:id
 */
export async function deleteBlog(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if blog exists and user is the author
    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return res.status(404).json({
        error: {
          code: 'BLOG_NOT_FOUND',
          message: 'Blog not found',
        },
      });
    }

    if (blog.authorId !== req.user!.userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only delete your own blogs',
        },
      });
    }

    await prisma.blog.delete({
      where: { id },
    });

    logger.info(`Blog deleted: ${id}`);

    res.json({
      message: 'Blog deleted successfully',
    });
  } catch (error) {
    logger.error('Delete blog error:', error);
    res.status(500).json({
      error: {
        code: 'DELETE_BLOG_FAILED',
        message: 'Failed to delete blog',
      },
    });
  }
}

/**
 * Get user's drafts
 * GET /api/blogs/drafts
 */
export async function getDrafts(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;

    const drafts = await prisma.blog.findMany({
      where: {
        authorId: userId,
        status: 'draft',
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        coverImageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ drafts });
  } catch (error) {
    logger.error('Get drafts error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_DRAFTS_FAILED',
        message: 'Failed to fetch drafts',
      },
    });
  }
}

/**
 * Increment blog view count
 * POST /api/blogs/:id/view
 */
export async function incrementViewCount(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.blog.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    // Track interaction for ML
    if (req.user) {
      await prisma.userInteraction.create({
        data: {
          userId: req.user.userId,
          interactionType: 'blog_view',
          targetId: id,
          targetType: 'blog',
        },
      });
    }

    res.json({ message: 'View count incremented' });
  } catch (error) {
    logger.error('Increment view count error:', error);
    res.status(500).json({
      error: {
        code: 'INCREMENT_VIEW_FAILED',
        message: 'Failed to increment view count',
      },
    });
  }
}
