'use client';

import { useState } from 'react';
import { movieApi } from '@/lib/movie-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

export function GifPicker({ onSelect }: GifPickerProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [trendingGifs, setTrendingGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await movieApi.searchGiphy(searchQuery);
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
  }

  async function loadTrending() {
    setLoading(true);
    try {
      const results = await movieApi.getTrendingGiphy();
      setTrendingGifs(results);
    } finally {
      setLoading(false);
    }
  }

  function handleGifSelect(gif: any) {
    onSelect(gif.images.original.url);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" onClick={loadTrending}>
          Add GIF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Add a GIF</DialogTitle>
          <DialogDescription>
            Search for movie GIFs or browse trending
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for movie GIFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                Search
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {searchResults.map((gif) => (
                <img
                  key={gif.id}
                  src={gif.images.fixed_height.url}
                  alt={gif.title}
                  className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition"
                  onClick={() => handleGifSelect(gif)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {trendingGifs.map((gif) => (
                <img
                  key={gif.id}
                  src={gif.images.fixed_height.url}
                  alt={gif.title}
                  className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition"
                  onClick={() => handleGifSelect(gif)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center">
          Powered by GIPHY
        </p>
      </DialogContent>
    </Dialog>
  );
}
