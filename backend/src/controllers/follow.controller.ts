import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';

/**
 * Follow a user
 * POST /api/users/:id/follow
 */
export async function followUser(req: Request, res: Response) {
  try {
    const { id: followeeId } = req.params;
    const followerId = req.user!.userId;

    // Prevent following yourself
    if (followerId === followeeId) {
      return res.status(400).json({
        error: {
          code: 'CANNOT_FOLLOW_SELF',
          message: 'You cannot follow yourself',
        },
      });
    }

    // Check if followee exists
    const followee = await prisma.user.findUnique({
      where: { id: followeeId },
    });

    if (!followee) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });

    if (existingFollow) {
      return res.status(409).json({
        error: {
          code: 'ALREADY_FOLLOWING',
          message: 'You are already following this user',
        },
      });
    }

    // Create follow relationship
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followeeId,
      },
    });

    // Track interaction for ML
    await prisma.userInteraction.create({
      data: {
        userId: followerId,
        interactionType: 'follow',
        targetId: followeeId,
        targetType: 'user',
      },
    });

    logger.info(`User ${followerId} followed ${followeeId}`);

    res.status(201).json({
      message: 'Successfully followed user',
      follow: {
        id: follow.id,
        followerId: follow.followerId,
        followeeId: follow.followeeId,
        createdAt: follow.createdAt,
      },
    });
  } catch (error) {
    logger.error('Follow user error:', error);
    res.status(500).json({
      error: {
        code: 'FOLLOW_FAILED',
        message: 'Failed to follow user',
      },
    });
  }
}

/**
 * Unfollow a user
 * DELETE /api/users/:id/follow
 */
export async function unfollowUser(req: Request, res: Response) {
  try {
    const { id: followeeId } = req.params;
    const followerId = req.user!.userId;

    // Check if follow relationship exists
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });

    if (!follow) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOLLOWING',
          message: 'You are not following this user',
        },
      });
    }

    // Delete follow relationship
    await prisma.follow.delete({
      where: {
        followerId_followeeId: {
          followerId,
          followeeId,
        },
      },
    });

    logger.info(`User ${followerId} unfollowed ${followeeId}`);

    res.json({
      message: 'Successfully unfollowed user',
    });
  } catch (error) {
    logger.error('Unfollow user error:', error);
    res.status(500).json({
      error: {
        code: 'UNFOLLOW_FAILED',
        message: 'Failed to unfollow user',
      },
    });
  }
}
