"use client";

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import StarRating from "@/components/ui/StarRating";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

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

  const handleGenerateClick = () => {
    setShowConfirmDialog(true);
  };

  const handleGenerateItinerary = async () => {
    try {
      setIsGenerating(true);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Extract place names for the itinerary
      const placeNames = savedPlaces.map(place => place.name);
      
      // Call the itinerary API
      const response = await fetch('/api/getItinerary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ places: placeNames }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const itineraryData = await response.json();
      
      // Store itinerary in Supabase
      const { error: itineraryError } = await supabase
        .from('itineraries')
        .insert({
          user_id: user.id,
          places: savedPlaces,
          itinerary: itineraryData.itinerary,
          created_at: new Date().toISOString(),
        });

      if (itineraryError) throw itineraryError;

      const { error: deleteError } = await supabase
      .from('savedplaces')  
      .delete()
      .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Clear local state
      setSavedPlaces([]);

      // Show success message
      toast({
        title: "Itinerary Generated!",
        description: "Your custom travel itinerary has been created. Redirecting to itinerary page...",
      });

      // Redirect to itinerary page
      router.push('/itinerary');

    } catch (error) {
      console.error('Error during itinerary generation:', error);
      toast({
        title: "Error",
        description: "Failed to generate itinerary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setShowConfirmDialog(false);
    }
  };

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
    <>
      <main className="min-h-screen w-full p-4 md:p-8">
        <div className="max-w-6xl mx-auto pb-14">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Saved Places</h1>
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerateClick}
              disabled={isGenerating || savedPlaces.length === 0}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4" />
                  Generate Itinerary
                </>
              )}
            </Button>
          </div>
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Itinerary</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate your itinerary and remove all saved places. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false);
                handleGenerateItinerary();
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
