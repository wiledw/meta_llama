'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  place: {
    image: string;
    name: string;
    shortDescription: string;
    longDescription: string;
    rating: number;
    reviews: number;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
}

export function SaveButton({ place }: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuth = async () => {
        //eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data: { user }, error } = await supabase.auth.getUser();
            setIsAuthenticated(!!user);
            setIsLoading(false);
    };

        checkAuth();
        }, [supabase.auth]);

  // Check if place is already saved when component mounts
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkIfSaved = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) return;

        // First check if table has any entries for this user
        const { count, error: countError } = await supabase
          .from('savedplaces')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) throw countError;
        
        // If no saved places exist, return early
        if (count === 0) {
          setIsSaved(false);
          setIsLoading(false);
          return;
        }

        // If table has entries, check for this specific place
        const { data, error } = await supabase
          .from('savedplaces')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', place.name)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error checking saved status:', error);
          return;
        }

        setIsSaved(!!data);
      } catch (error) {
        console.error('Error checking saved status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkIfSaved();
  }, [place.name, supabase, isAuthenticated]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Check if already saved to prevent duplicates
      const { data: existingData } = await supabase
        .from('savedplaces')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', place.name)
        .single();

      if (existingData) {
        toast({
          title: "Already saved",
          description: `${place.name} is already in your bookmarks.`
        });
        setIsSaved(true);
        return;
      }

      // Create a URL-safe filename
      const safeFileName = place.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const fileName = `saved-places/${user.id}/${safeFileName}-${Date.now()}.jpg`;

      // Fetch and process image
      const imageResponse = await fetch(place.image);
      if (!imageResponse.ok) throw new Error('Failed to fetch image');
      const imageBlob = await imageResponse.blob();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('Meta-Llama')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
          upsert: false,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('Meta-Llama')
        .getPublicUrl(fileName);

      // Save to database
      const { error: saveError } = await supabase
        .from('savedplaces')
        .insert({
          user_id: user.id,
          name: place.name,
          image_url: publicUrl,
          short_description: place.shortDescription,
          long_description: place.longDescription,
          rating: place.rating,
          reviews: place.reviews,
          address: place.address,
          latitude: place.coordinates.lat,
          longitude: place.coordinates.lng
        });

      if (saveError) throw saveError;

      setIsSaved(true);
      toast({
        title: "Place saved!",
        description: `${place.name} has been saved to your bookmarks.`
      });

    } catch (error) {
      console.error('Error saving place:', error);
      toast({
        title: "Error",
        description: "Failed to save place. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // If not authenticated or still loading, don't render anything
  if (!isAuthenticated || isLoading) {
    return null;
 }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleSave}
      disabled={isSaving || isSaved || isLoading}
      className={cn(
        "rounded-full p-2 h-auto transition-all duration-200",
        "bg-white/90 hover:bg-white shadow-md",
        "hover:scale-105",
        isSaved && "bg-green-50 hover:bg-green-50",
        isSaving && "opacity-70",
        isLoading && "opacity-50"
      )}
      title={isSaved ? "Saved to bookmarks" : "Save to bookmarks"}
    >
      {isLoading ? (
        <span className="animate-pulse">...</span>
      ) : isSaving ? (
        <span className="animate-pulse">...</span>
      ) : isSaved ? (
        <BookmarkCheck className="h-5 w-5 text-green-400" />
      ) : (
        <Bookmark className="h-5 w-5 text-gray-700" />
      )}
    </Button>
  );
} 