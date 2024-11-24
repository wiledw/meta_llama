"use client";

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import Image from 'next/image';
import StarRating from "@/components/ui/StarRating";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

interface SavedPlace {
  id: string;
  name: string;
  image_url: string;
  short_description: string;
  long_description: string;
  rating: number;
  reviews: number;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export default function Saved() {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchSavedPlaces = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError('Please log in to view saved places');
          return;
        }

        // Fetch saved places
        const { data, error: fetchError } = await supabase
          .from('savedplaces')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setSavedPlaces(data || []);

      } catch (err) {
        console.error('Error fetching saved places:', err);
        setError('Failed to load saved places');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPlaces();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (savedPlaces.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No saved places yet</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Saved Places</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlaces.map((place) => (
            <Card key={place.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <Image
                  src={place.image_url}
                  alt={place.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{place.name}</h3>
                  <div className="flex flex-col items-end">
                    <StarRating rating={place.rating} size={16} />
                    <span className="text-sm text-gray-500">
                      {place.reviews} reviews
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{place.short_description}</p>
                <p className="text-sm text-gray-500">{place.address}</p>
                <p className="text-xs text-gray-400">
                  Saved on {new Date(place.created_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
