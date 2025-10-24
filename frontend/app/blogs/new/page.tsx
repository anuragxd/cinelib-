'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { GifPicker } from '@/components/giphy/gif-picker';

function NewBlogPageContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImageUrl: '',
  });

  async function handleSubmit(status: 'draft' | 'published') {
    if (!formData.title || !formData.excerpt || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/api/blogs', {
        ...formData,
        status,
      });
      toast.success(status === 'published' ? 'Blog published!' : 'Draft saved!');
      router.push(`/blogs/${response.blog.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
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
            <CardTitle className="text-3xl">Write a New Blog</CardTitle>
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content *</Label>
                <GifPicker 
                  onSelect={(gifUrl) => {
                    const gifMarkdown = `\n\n![GIF](${gifUrl})\n\n`;
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
                disabled={loading}
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
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                onClick={() => handleSubmit('published')}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Publishing...' : 'Publish Blog'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewBlogPage() {
  return (
    <ProtectedRoute>
      <NewBlogPageContent />
    </ProtectedRoute>
  );
}
