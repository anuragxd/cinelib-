'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://i.pinimg.com/1200x/3d/31/ef/3d31ef975700b3d9c15bbc30f46be45a.jpg)',
          }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
            Welcome to{' '}
            <span className="text-primary">CineLib</span>
          </h1>
          
          <p className="mb-8 text-xl text-gray-200 sm:text-2xl">
            Create, share, and curate movie-related content and personal playlists.
            Join a community of film enthusiasts.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {!loading && !user ? (
              <>
                <Link href="/signup">
                  <Button size="lg" className="text-lg w-full sm:w-auto bg-white text-black hover:bg-gray-200">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg w-full sm:w-auto border-white text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/blogs">
                <Button size="lg" className="text-lg bg-white text-black hover:bg-gray-200">
                  Explore Blogs
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-4xl font-bold text-foreground">
            Platform Features
          </h2>
          <p className="mb-12 text-center text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to share your passion for cinema
          </p>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="group p-6 rounded-lg bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Write Blogs</h3>
              <p className="text-muted-foreground">
                Share your thoughts and insights about movies with rich-text editing
              </p>
            </div>

            <div className="group p-6 rounded-lg bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Create Playlists</h3>
              <p className="text-muted-foreground">
                Curate custom movie collections and share them with the community
              </p>
            </div>

            <div className="group p-6 rounded-lg bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Follow Users</h3>
              <p className="text-muted-foreground">
                Build your network and stay updated with content from your favorite creators
              </p>
            </div>

            <div className="group p-6 rounded-lg bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Save Content</h3>
              <p className="text-muted-foreground">
                Bookmark blogs and playlists for easy access later
              </p>
            </div>

            <div className="group p-6 rounded-lg bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Discover</h3>
              <p className="text-muted-foreground">
                Explore curated content on the homepage and find hidden gems
              </p>
            </div>

            <div className="group p-6 rounded-lg bg-white border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Recommendations</h3>
              <p className="text-muted-foreground">
                Get personalized movie and blog suggestions powered by ML
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Card className="border-primary/20 bg-muted/30">
            <CardHeader>
              <CardTitle className="text-3xl">Ready to Join?</CardTitle>
              <CardDescription className="text-lg">
                Start sharing your passion for cinema today
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!loading && !user ? (
                <Link href="/signup">
                  <Button size="lg" className="text-lg">
                    Create Account
                  </Button>
                </Link>
              ) : (
                <Link href="/blogs/new">
                  <Button size="lg" className="text-lg bg-white text-black hover:bg-gray-200">
                    Write a Blog
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
