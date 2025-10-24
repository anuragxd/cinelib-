'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface SavedBlog {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  viewCount: number;
  publishedAt: string;
  savedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

function SavedBlogsPageContent() {
  const [blogs, setBlogs] = useState<SavedBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedBlogs();
  }, []);

  async function fetchSavedBlogs() {
    try {
      const response = await api.get('/api/blogs/saved');
      setBlogs(response.blogs);
    } catch (error) {
      console.error('Failed to fetch saved blogs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading saved blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-sm -z-10"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/3d/31/ef/3d31ef975700b3d9c15bbc30f46be45a.jpg)',
        }}
      />
      <div className="fixed inset-0 bg-black/60 -z-10" />
      <div className="min-h-screen relative z-10">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Saved Blogs</h1>
          <p className="mt-2 text-muted-foreground">
            Blogs you've bookmarked for later
          </p>
        </div>

        {blogs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No saved blogs</CardTitle>
              <CardDescription>
                You haven't saved any blogs yet. Browse blogs and click "Save" to bookmark them.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
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
                            Saved {new Date(blog.savedAt).toLocaleDateString()}
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

export default function SavedBlogsPage() {
  return (
    <ProtectedRoute>
      <SavedBlogsPageContent />
    </ProtectedRoute>
  );
}
