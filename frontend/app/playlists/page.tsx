'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  createdAt: string;
  movieCount: number;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export default function PlaylistsPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  async function fetchPlaylists() {
    try {
      const response = await api.get('/api/playlists');
      setPlaylists(response.playlists);
    } catch (error) {
      console.error('Failed to fetch playlists:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/736x/61/cb/d0/61cbd004d2425452d3c1eff65a905562.jpg)',
        }}
      />
      <div className="fixed inset-0 bg-black/70 -z-10" />
      <div className="mx-auto max-w-7xl px-4 py-8 relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Movie Playlists</h1>
            <p className="mt-2 text-gray-200">
              Curated collections from the community
            </p>
          </div>
          {user && (
            <Link href="/playlists/new">
              <Button size="lg">Create Playlist</Button>
            </Link>
          )}
        </div>

        {playlists.length === 0 ? (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>No playlists yet</CardTitle>
              <CardDescription>
                Be the first to create a movie playlist!
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
                <Card className="h-full transition-all hover:shadow-lg cursor-pointer overflow-hidden bg-white">
                  {playlist.coverImageUrl && (
                    <div className="relative h-48 w-full">
                      <img
                        src={playlist.coverImageUrl}
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{playlist.name}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {playlist.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={playlist.user.avatarUrl} />
                          <AvatarFallback>
                            {playlist.user.displayName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium">{playlist.user.displayName}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{playlist.movieCount} movies</Badge>
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
