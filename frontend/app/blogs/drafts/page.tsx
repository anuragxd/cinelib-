'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface Draft {
  id: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

function DraftsPageContent() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  async function fetchDrafts() {
    try {
      const response = await api.get('/api/blogs/drafts');
      setDrafts(response.drafts);
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading drafts...</p>
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
          <h1 className="text-4xl font-bold">My Drafts</h1>
          <p className="mt-2 text-muted-foreground">
            Your unpublished blog posts
          </p>
        </div>

        {drafts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No drafts</CardTitle>
              <CardDescription>
                You don't have any draft blogs yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/blogs/new">
                <Button className="bg-white text-black hover:bg-gray-200">Write a Blog</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {drafts.map((draft) => (
              <Link key={draft.id} href={`/blogs/${draft.id}/edit`}>
                <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
                  {draft.coverImageUrl && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img
                        src={draft.coverImageUrl}
                        alt={draft.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{draft.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {draft.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Last edited: {new Date(draft.updatedAt).toLocaleDateString()}
                    </p>
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

export default function DraftsPage() {
  return (
    <ProtectedRoute>
      <DraftsPageContent />
    </ProtectedRoute>
  );
}
