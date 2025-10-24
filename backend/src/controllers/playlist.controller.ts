import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { z } from 'zod';

const playlistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  coverImageUrl: z.string().url().optional(),
  isPublic: z.boolean().default(true),
});

const movieSchema = z.object({
  movieId: z.string(),
  movieTitle: z.string(),
  moviePosterUrl: z.string().url().optional(),
  movieYear: z.number().int().optional(),
});

export async function createPlaylist(req: Request, res: Response) {
  try {
    const data = playlistSchema.parse(req.body);
    const userId = req.user!.userId;

    const playlist = await prisma.playlist.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    logger.info(`Playlist created: ${playlist.id} by ${userId}`);
    res.status(201).json({ playlist });
  } catch (error: any) {
    logger.error('Create playlist error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.errors },
      });
    }
    res.status(500).json({ error: { code: 'CREATE_PLAYLIST_FAILED', message: 'Failed to create playlist' } });
  }
}

export async function getPlaylists(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          name: true,
          description: true,
          coverImageUrl: true,
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
          _count: { select: { movies: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.playlist.count({ where: { isPublic: true } }),
    ]);

    res.json({
      playlists: playlists.map((p) => ({ ...p, movieCount: p._count.movies })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('Get playlists error:', error);
    res.status(500).json({ error: { code: 'FETCH_PLAYLISTS_FAILED', message: 'Failed to fetch playlists' } });
  }
}

export async function getPlaylist(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        movies: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: { code: 'PLAYLIST_NOT_FOUND', message: 'Playlist not found' } });
    }

    res.json({ playlist });
  } catch (error) {
    logger.error('Get playlist error:', error);
    res.status(500).json({ error: { code: 'FETCH_PLAYLIST_FAILED', message: 'Failed to fetch playlist' } });
  }
}

export async function updatePlaylist(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const data = playlistSchema.partial().parse(req.body);

    const existing = await prisma.playlist.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: { code: 'PLAYLIST_NOT_FOUND', message: 'Playlist not found' } });
    }
    if (existing.userId !== req.user!.userId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only update your own playlists' } });
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    logger.info(`Playlist updated: ${id}`);
    res.json({ playlist });
  } catch (error: any) {
    logger.error('Update playlist error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.errors },
      });
    }
    res.status(500).json({ error: { code: 'UPDATE_PLAYLIST_FAILED', message: 'Failed to update playlist' } });
  }
}

export async function deletePlaylist(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const playlist = await prisma.playlist.findUnique({ where: { id } });
    if (!playlist) {
      return res.status(404).json({ error: { code: 'PLAYLIST_NOT_FOUND', message: 'Playlist not found' } });
    }
    if (playlist.userId !== req.user!.userId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only delete your own playlists' } });
    }

    await prisma.playlist.delete({ where: { id } });
    logger.info(`Playlist deleted: ${id}`);
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    logger.error('Delete playlist error:', error);
    res.status(500).json({ error: { code: 'DELETE_PLAYLIST_FAILED', message: 'Failed to delete playlist' } });
  }
}

export async function addMovieToPlaylist(req: Request, res: Response) {
  try {
    const { id: playlistId } = req.params;
    const movieData = movieSchema.parse(req.body);

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
      return res.status(404).json({ error: { code: 'PLAYLIST_NOT_FOUND', message: 'Playlist not found' } });
    }
    if (playlist.userId !== req.user!.userId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only modify your own playlists' } });
    }

    const existing = await prisma.playlistMovie.findFirst({
      where: { playlistId, movieId: movieData.movieId },
    });
    if (existing) {
      return res.status(409).json({ error: { code: 'MOVIE_ALREADY_IN_PLAYLIST', message: 'Movie already in playlist' } });
    }

    const maxPosition = await prisma.playlistMovie.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const movie = await prisma.playlistMovie.create({
      data: {
        playlistId,
        ...movieData,
        position: (maxPosition?.position ?? -1) + 1,
      },
    });

    await prisma.userInteraction.create({
      data: {
        userId: req.user!.userId,
        interactionType: 'movie_add',
        targetId: movieData.movieId,
        targetType: 'movie',
      },
    });

    logger.info(`Movie added to playlist: ${movieData.movieId} -> ${playlistId}`);
    res.status(201).json({ movie });
  } catch (error: any) {
    logger.error('Add movie error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.errors },
      });
    }
    res.status(500).json({ error: { code: 'ADD_MOVIE_FAILED', message: 'Failed to add movie' } });
  }
}

export async function removeMovieFromPlaylist(req: Request, res: Response) {
  try {
    const { id: playlistId, movieId } = req.params;

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
      return res.status(404).json({ error: { code: 'PLAYLIST_NOT_FOUND', message: 'Playlist not found' } });
    }
    if (playlist.userId !== req.user!.userId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only modify your own playlists' } });
    }

    const movie = await prisma.playlistMovie.findFirst({
      where: { playlistId, movieId },
    });
    if (!movie) {
      return res.status(404).json({ error: { code: 'MOVIE_NOT_IN_PLAYLIST', message: 'Movie not in playlist' } });
    }

    await prisma.playlistMovie.delete({ where: { id: movie.id } });
    logger.info(`Movie removed from playlist: ${movieId} <- ${playlistId}`);
    res.json({ message: 'Movie removed successfully' });
  } catch (error) {
    logger.error('Remove movie error:', error);
    res.status(500).json({ error: { code: 'REMOVE_MOVIE_FAILED', message: 'Failed to remove movie' } });
  }
}

export async function reorderPlaylistMovies(req: Request, res: Response) {
  try {
    const { id: playlistId } = req.params;
    const { movieIds } = z.object({ movieIds: z.array(z.string()) }).parse(req.body);

    const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) {
      return res.status(404).json({ error: { code: 'PLAYLIST_NOT_FOUND', message: 'Playlist not found' } });
    }
    if (playlist.userId !== req.user!.userId) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You can only modify your own playlists' } });
    }

    await Promise.all(
      movieIds.map((movieId, index) =>
        prisma.playlistMovie.updateMany({
          where: { playlistId, movieId },
          data: { position: index },
        })
      )
    );

    logger.info(`Playlist movies reordered: ${playlistId}`);
    res.json({ message: 'Movies reordered successfully' });
  } catch (error: any) {
    logger.error('Reorder movies error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input data', details: error.errors },
      });
    }
    res.status(500).json({ error: { code: 'REORDER_FAILED', message: 'Failed to reorder movies' } });
  }
}
