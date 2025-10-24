'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { FollowButton } from '@/components/follow/follow-button';

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  followerCount: number;
  followingCount: number;
  blogCount: number;
  playlistCount: number;
  isFollowing: boolean;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = (params.username || params.id) as string;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  async function fetchProfile() {
    try {
      const response = await api.get(`/api/users/${userId}`);
      setProfile(response.user);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>User Not Found</CardTitle>
            <CardDescription>The user you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage: 'url(https://i.pinimg.com/736x/d0/88/35/d088355defde7fe5c17e30dfe614264d.jpg)',
        }}
      />
      <div className="fixed inset-0 bg-black/70 -z-10" />
      <div className="mx-auto max-w-6xl px-4 py-8 relative z-10">
        {/* Profile Header */}
        <Card className="mb-6 bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
                <AvatarFallback className="text-2xl">
                  {profile.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold">{profile.displayName}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
                {profile.bio && <p className="mt-2 text-foreground">{profile.bio}</p>}

                <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.blogCount}</div>
                    <div className="text-sm text-muted-foreground">Blogs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.playlistCount}</div>
                    <div className="text-sm text-muted-foreground">Playlists</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.followerCount}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{profile.followingCount}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  {isOwnProfile ? (
                    <EditProfileDialog
                      user={{
                        id: profile.id,
                        displayName: profile.displayName,
                        bio: profile.bio,
                        avatarUrl: profile.avatarUrl,
                      }}
                      onUpdate={fetchProfile}
                    />
                  ) : (
                    <FollowButton
                      userId={profile.id}
                      initialIsFollowing={profile.isFollowing}
                      onFollowChange={fetchProfile}
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="blogs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="blogs">Blogs</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>

          <TabsContent value="blogs" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Blog cards will go here */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>No blogs yet</CardTitle>
                  <CardDescription>
                    {isOwnProfile
                      ? 'Start writing your first blog!'
                      : "This user hasn't published any blogs yet."}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="playlists" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Playlist cards will go here */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>No playlists yet</CardTitle>
                  <CardDescription>
                    {isOwnProfile
                      ? 'Create your first playlist!'
                      : "This user hasn't created any playlists yet."}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
