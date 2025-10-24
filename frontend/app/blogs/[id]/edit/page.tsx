'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { GifPicker } from '@/components/giphy/gif-picker';

function EditBlogPageContent() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImageUrl: '',
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    fetchBlog();
  }, [params.id]);

  async function fetchBlog() {
    try {
      const response = await api.get(`/api/blogs/${params.id}`);
      const blog = response.blog;
      setFormData({
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImageUrl: blog.coverImageUrl || '',
        status: blog.status,
      });
    } catch (error: any) {
      toast.error('Failed to load blog');
      router.push('/blogs');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(status: 'draft' | 'published') {
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/blogs/${params.id}`, {
        ...formData,
        status,
      });
      toast.success(status === 'published' ? 'Blog published!' : 'Changes saved!');
      router.push(`/blogs/${params.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update blog');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      await api.delete(`/api/blogs/${params.id}`);
      toast.success('Blog deleted successfully');
      router.push('/blogs');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete blog');
      setSaving(false);
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

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-sm -z-10"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/1200x/3d/31/ef/3d31ef975700b3d9c15bbc30f46be45a.jpg)',
        }}
      />
      <div className="fixed inset-0 bg-black/60 -z-10" />
      <div className="mx-auto max-w-4xl px-4 py-8 relative z-10">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-3xl">Edit Blog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter blog title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt *</Label>
              <Textarea
                id="excerpt"
                placeholder="Brief description of your blog"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                maxLength={500}
                rows={3}
                disabled={saving}
              />
              <p className="text-xs text-muted-foreground">
                {formData.excerpt.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImageUrl">Cover Image URL (optional)</Label>
              <Input
                id="coverImageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content *</Label>
                <GifPicker 
                  onSelect={(gifUrl) => {
                    const gifMarkdown = `\n\n<img src="${gifUrl}" alt="GIF" style="max-width: 100%; height: auto;" />\n\n`;
                    setFormData({ ...formData, content: formData.content + gifMarkdown });
                    toast.success('GIF added to content');
                  }}
                />
              </div>
              <Textarea
                id="content"
                placeholder="Write your blog content here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                disabled={saving}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                You can use HTML for formatting
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => handleSubmit('draft')}
                variant="outline"
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                onClick={() => handleSubmit('published')}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Publishing...' : formData.status === 'published' ? 'Update' : 'Publish'}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleDelete}
                variant="destructive"
                disabled={saving}
                className="w-full"
              >
                {saving ? 'Deleting...' : 'Delete Blog'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function EditBlogPage() {
  return (
    <ProtectedRoute>
      <EditBlogPageContent />
    </ProtectedRoute>
  );
}
