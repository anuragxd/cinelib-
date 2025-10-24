'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImageUrl?: string;
  viewCount: number;
  publishedAt: string;
  status: string;
  isSaved: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
  };
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditCover, setShowEditCover] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');

  useEffect(() => {
    fetchBlog();
  }, [params.id]);

  async function fetchBlog() {
    try {
      const response = await api.get(`/api/blogs/${params.id}`);
      setBlog(response.blog);
      
      // Track view
      await api.post(`/api/blogs/${params.id}/view`, {});
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      toast.error('Blog not found');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) {
      toast.error('Please login to save blogs');
      return;
    }

    setSaving(true);
    try {
      if (blog?.isSaved) {
        await api.delete(`/api/blogs/${params.id}/save`);
        toast.success('Blog unsaved');
      } else {
        await api.post(`/api/blogs/${params.id}/save`, {});
        toast.success('Blog saved');
      }
      fetchBlog();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateCover() {
    if (!coverImageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    try {
      await api.put(`/api/blogs/${params.id}`, {
        coverImageUrl: coverImageUrl.trim(),
      });
      
      toast.success('Cover image updated');
      setShowEditCover(false);
      fetchBlog();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update cover image');
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/blogs/${params.id}`);
      toast.success('Blog deleted successfully');
      router.push('/blogs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete blog');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold">Blog not found</h2>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isAuthor = user?.id === blog.author.id;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <Card className="mb-4 overflow-hidden bg-white">
          {blog.coverImageUrl && (
            <div className="relative h-64 w-full">
              <img
                src={blog.coverImageUrl}
                alt={blog.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
          )}
          <CardContent className="pt-6">
            <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="mb-4 text-4xl font-bold">{blog.title}</h1>
            <div className="flex items-center gap-4">
              <Link href={`/profile/${blog.author.id}`}>
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={blog.author.avatarUrl} />
                    <AvatarFallback>
                      {blog.author.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{blog.author.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(blog.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </Link>
              <Badge variant="secondary">{blog.viewCount} views</Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {user && !isAuthor && (
              <Button
                variant={blog.isSaved ? 'outline' : 'default'}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : blog.isSaved ? 'Saved' : 'Save'}
              </Button>
            )}
            {isAuthor && (
              <>
                <Dialog open={showEditCover} onOpenChange={setShowEditCover}>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setCoverImageUrl(blog.coverImageUrl || '')}>
                      {blog.coverImageUrl ? 'Change Cover' : 'Add Cover'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle>Update Blog Cover</DialogTitle>
                      <DialogDescription>
                        Enter an image URL for your blog cover
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 bg-white">
                      <div>
                        <Label htmlFor="coverUrl">Image URL</Label>
                        <Input
                          id="coverUrl"
                          placeholder="https://example.com/image.jpg"
                          value={coverImageUrl}
                          onChange={(e) => setCoverImageUrl(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleUpdateCover} className="w-full">
                        Update Cover
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Link href={`/blogs/${blog.id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

            <div className="prose max-w-none mt-6">
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>
          </CardContent>
        </Card>

        {blog.author.bio && (
          <Card className="mt-4 bg-white">
            <CardHeader>
              <h3 className="text-xl font-semibold">About the Author</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{blog.author.bio}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
