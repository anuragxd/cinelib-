'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BlogGridSkeleton } from '@/components/skeletons/blog-card-skeleton';
import { useAuth } from '@/lib/auth-context';

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  viewCount: number;
  publishedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export default function BlogsPage() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      const response = await api.get('/api/blogs');
      setBlogs(response.blogs);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: 'url(https://i.pinimg.com/1200x/d3/ed/d4/d3edd44ff23fbfa6fecef28fc17ebf34.jpg)',
          }}
        />
        <div className="fixed inset-0 bg-black/70 -z-10" />
        <div className="mx-auto max-w-7xl px-4 py-8 relative z-10">
          <div className="mb-8 flex items-center justify-between animate-fade-in">
            <div>
              <div className="h-10 w-48 bg-white/20 rounded mb-2 animate-pulse" />
              <div className="h-6 w-96 bg-white/20 rounded animate-pulse" />
            </div>
          </div>
          <BlogGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/d3/ed/d4/d3edd44ff23fbfa6fecef28fc17ebf34.jpg)',
        }}
      />
      <div className="fixed inset-0 bg-black/70 -z-10" />
      <div className="mx-auto max-w-7xl px-4 py-8 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Movie Blogs</h1>
            <p className="mt-2 text-gray-200">
              Discover insights and reviews from the community
            </p>
          </div>
          {user && (
            <Link href="/blogs/new">
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">Write a Blog</Button>
            </Link>
          )}
        </div>

        {blogs.length === 0 ? (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>No blogs yet</CardTitle>
              <CardDescription>
                Be the first to write about movies!
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <Link key={blog.id} href={`/blogs/${blog.id}`}>
                <Card className="h-full transition-all hover:shadow-lg cursor-pointer bg-white overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  {blog.coverImageUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={blog.coverImageUrl}
                        alt={blog.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {blog.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={blog.author.avatarUrl} />
                          <AvatarFallback>
                            {blog.author.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium">{blog.author.displayName}</p>
                          <p className="text-muted-foreground">
                            {new Date(blog.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{blog.viewCount} views</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
