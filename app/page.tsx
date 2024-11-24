'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Paperclip, X, MapIcon, LayoutGridIcon, Loader2 } from "lucide-react";
import { WelcomeSection } from "@/components/WelcomeSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { useState } from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import StarRating from "@/components/ui/StarRating";
import { GoogleMapView, type LocationData } from "@/components/ui/GoogleMapView";
import { usePlaces } from '@/contexts/PlacesContext';
import { SaveButton } from "@/components/ui/SaveButton";
import Link from 'next/link';


export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const { places, setPlaces } = usePlaces();
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');
  const [isLoading, setIsLoading] = useState(false);

  const clearForm = () => {
    setSelectedImage(null);
    setImageFile(null);
    setPrompt('');
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4.5 * 1024 * 1024) {
        alert('Image size must be less than 4.5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile && !prompt.trim()) {
      alert('Please provide either an image or a prompt');
      return;
    }
  
    setIsLoading(true);
        
    try {
      const formData = new FormData();
      if (imageFile) formData.append('image', imageFile);
      if (prompt.trim()) formData.append('prompt', prompt.trim());
  
      // Debug FormData contents
      for (const pair of formData.entries()) {
        console.log('Sending:', pair[0], pair[1]);
      }
  
      const response = await fetch('/api/getIdeas', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('API Response:', data);

      if (data.place_details) {
        const formattedPlaces = Object.values(data.place_details).map((place: any) => ({
          image: place.googleMapPhotoUri,
          name: place.name,
          shortDescription: place.short_description,
          longDescription: place.reviews[0] || place.short_description,
          rating: place.globalRating,
          reviews: place.reviews.length,
          address: place.address,
          coordinates: {
            lat: place.location.latitude,
            lng: place.location.longitude
          },
          websiteUri: place.websiteUri,
          translated_description: place.translated_description,
          translated_review_summary: place.translated_review_summary
        }));

        setPlaces(formattedPlaces);
        console.log('Places set:', formattedPlaces);
      } else {
        console.error('Unexpected response format:', data);
        alert('Received invalid data format from server');
      }

      clearForm();

    } catch (error) {
      console.error('Fetch Error:', error);
      alert('Failed to process request. Please try again. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const locationsData: LocationData[] = places?.map(place => ({
    name: place.name,
    latitude: place.coordinates.lat,
    longitude: place.coordinates.lng,
    rating: place.rating
  })) || [];

  const toggleView = () => {
    setViewMode(prev => prev === 'cards' ? 'map' : 'cards');
  };

  return (
    <main className="min-h-screen w-full flex flex-col relative">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Finding places...</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-44">
        {places ? (
          <>
            <div className="w-full max-w-6xl mx-auto px-4 flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleView}
                className="flex items-center gap-2"
              >
                {viewMode === 'cards' ? (
                  <>
                    <MapIcon className="h-4 w-4" />
                    Show Map
                  </>
                ) : (
                  <>
                    <LayoutGridIcon className="h-4 w-4" />
                    Show Cards
                  </>
                )}
              </Button>
            </div>

            {viewMode === 'cards' ? (
              <section className="w-full max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 md:pt-8">
                {places.map((place, index) => {
                  const coordinatesParam = `${place.coordinates.lat},${place.coordinates.lng}`;
                  
                  return (
                    <Card 
                      key={index} 
                      className="overflow-hidden relative group transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <Link 
                        href={`/destination/${encodeURIComponent(coordinatesParam)}`}
                        className="block cursor-pointer"
                      >
                        <div className="relative h-48 w-full">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <Image
                            src={place.image}
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
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{place.shortDescription}</p>
                          <p className="text-sm text-gray-500">{place.address}</p>
                        </div>
                      </Link>
                      <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                        <SaveButton place={place} />
                      </div>
                    </Card>
                  );
                })}
              </section>
            ) : (
              <section className="w-full max-w-6xl mx-auto px-4 mt-4">
                <GoogleMapView
                  locations={locationsData}
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                  className="w-full h-[700px] rounded-lg"
                />
              </section>
            )}
          </>
        ) : (
          <>
            <WelcomeSection />
            <FeaturesSection />
          </>
        )}
      </div>

      {/* Fixed Prompt Section */}
      <section className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
        <div className="w-full max-w-3xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 bg-gray-100 p-4 rounded-lg">
              {selectedImage && (
                <div className="flex items-center gap-2">
                  <div className="relative h-20 w-20">
                    <Image 
                      src={selectedImage}
                      alt="Selected"
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>
                  <button 
                    onClick={clearForm}
                    className="p-1.5 hover:bg-gray-400 rounded-full bg-gray-300"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-4">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                
                <input
                  type="file"
                  id="camera-upload"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                />
                
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer p-2 hover:bg-gray-400 rounded-md md:block"
                  title="Upload Photo"
                >
                  <Paperclip className="h-5 w-5" />
                </label>

                <Input 
                  placeholder="Where would you like to go?" 
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />

                <Button 
                  variant="ghost" 
                  onClick={handleSubmit}
                  disabled={(!imageFile && !prompt.trim()) || isLoading}
                  className="relative"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}