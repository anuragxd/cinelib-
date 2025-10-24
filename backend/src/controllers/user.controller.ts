import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { z } from 'zod';

/**
 * Get user profile by ID
 * GET /api/users/:id
 */
export async function getUserProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            blogs: { where: { status: 'published' } },
            playlists: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followeeId: {
            followerId: req.user.userId,
            followeeId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    res.json({
      user: {
        ...user,
        followerCount: user._count.followers,
        followingCount: user._count.following,
        blogCount: user._count.blogs,
        playlistCount: user._count.playlists,
        isFollowing,
      },
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_PROFILE_FAILED',
        message: 'Failed to fetch user profile',
      },
    });
  }
}

/**
 * Update user profile
 * PUT /api/users/:id
 */
export async function updateUserProfile(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if user is updating their own profile
    if (req.user?.userId !== id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'You can only update your own profile',
        },
      });
    }

    // Validate update data
    const updateSchema = z.object({
      displayName: z.string().min(1).max(100).optional(),
      bio: z.string().max(500).optional(),
      avatarUrl: z.string().url().optional().nullable(),
    });

    const data = updateSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`User profile updated: ${updatedUser.username}`);

    res.json({ user: updatedUser });
  } catch (error: any) {
    logger.error('Update user profile error:', error);

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
        code: 'UPDATE_PROFILE_FAILED',
        message: 'Failed to update profile',
      },
    });
  }
}

/**
 * Get user's blogs
 * GET /api/users/:id/blogs
 */
export async function getUserBlogs(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Only show published blogs unless viewing own profile
    const where: any = {
      authorId: id,
    };

    if (req.user?.userId !== id) {
      where.status = 'published';
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        select: {
          id: true,
          title: true,
          excerpt: true,
          coverImageUrl: true,
          status: true,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
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
    logger.error('Get user blogs error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_BLOGS_FAILED',
        message: 'Failed to fetch user blogs',
      },
    });
  }
}

/**
 * Get user's playlists
 * GET /api/users/:id/playlists
 */
export async function getUserPlaylists(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where: { userId: id },
        select: {
          id: true,
          name: true,
          description: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              movies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.playlist.count({ where: { userId: id } }),
    ]);

    res.json({
      playlists: playlists.map((p) => ({
        ...p,
        movieCount: p._count.movies,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get user playlists error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_PLAYLISTS_FAILED',
        message: 'Failed to fetch user playlists',
      },
    });
  }
}

/**
 * Get user's followers
 * GET /api/users/:id/followers
 */
export async function getUserFollowers(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followeeId: id },
        select: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
            },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follow.count({ where: { followeeId: id } }),
    ]);

    res.json({
      followers: follows.map((f) => ({
        ...f.follower,
        followedAt: f.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get user followers error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FOLLOWERS_FAILED',
        message: 'Failed to fetch followers',
      },
    });
  }
}

/**
 * Get users being followed
 * GET /api/users/:id/following
 */
export async function getUserFollowing(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: id },
        select: {
          followee: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              bio: true,
            },
          },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.follow.count({ where: { followerId: id } }),
    ]);

    res.json({
      following: follows.map((f) => ({
        ...f.followee,
        followedAt: f.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get user following error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FOLLOWING_FAILED',
        message: 'Failed to fetch following',
      },
    });
  }
}
