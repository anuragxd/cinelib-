import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      username: 'johndoe',
      displayName: 'John Doe',
      passwordHash: hashedPassword,
      bio: 'Movie enthusiast and film critic',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      username: 'janesmith',
      displayName: 'Jane Smith',
      passwordHash: hashedPassword,
      bio: 'Cinephile and playlist curator',
    },
  });

  console.log('✅ Created demo users');

  // Create demo blogs
  const blog1 = await prisma.blog.create({
    data: {
      title: 'The Evolution of Sci-Fi Cinema',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Science fiction has evolved dramatically over the decades...',
              },
            ],
          },
        ],
      }),
      excerpt: 'A deep dive into how sci-fi movies have changed over time',
      status: 'published',
      publishedAt: new Date(),
      authorId: user1.id,
      viewCount: 42,
    },
  });

  const blog2 = await prisma.blog.create({
    data: {
      title: 'Top 10 Underrated Films of 2023',
      content: JSON.stringify({
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Here are some hidden gems you might have missed...',
              },
            ],
          },
        ],
      }),
      excerpt: 'Discover these overlooked masterpieces',
      status: 'published',
      publishedAt: new Date(),
      authorId: user2.id,
      viewCount: 28,
    },
  });

  console.log('✅ Created demo blogs');

  // Create demo playlists
  const playlist1 = await prisma.playlist.create({
    data: {
      name: 'Classic Noir Collection',
      description: 'Essential film noir movies from the golden age',
      userId: user1.id,
      movies: {
        create: [
          {
            movieId: 'tt0037382',
            movieTitle: 'Double Indemnity',
            movieYear: 1944,
            position: 0,
          },
          {
            movieId: 'tt0033870',
            movieTitle: 'The Maltese Falcon',
            movieYear: 1941,
            position: 1,
          },
        ],
      },
    },
  });

  const playlist2 = await prisma.playlist.create({
    data: {
      name: 'Modern Masterpieces',
      description: 'Contemporary films that will stand the test of time',
      userId: user2.id,
      movies: {
        create: [
          {
            movieId: 'tt1375666',
            movieTitle: 'Inception',
            movieYear: 2010,
            position: 0,
          },
          {
            movieId: 'tt0468569',
            movieTitle: 'The Dark Knight',
            movieYear: 2008,
            position: 1,
          },
        ],
      },
    },
  });

  console.log('✅ Created demo playlists');

  // Create follow relationship
  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followeeId: user2.id,
    },
  });

  console.log('✅ Created follow relationships');

  // Create saved blog
  await prisma.savedBlog.create({
    data: {
      userId: user1.id,
      blogId: blog2.id,
    },
  });

  console.log('✅ Created saved blogs');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
