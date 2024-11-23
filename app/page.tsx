'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Paperclip, X, MapIcon, LayoutGridIcon } from "lucide-react";
import { WelcomeSection } from "@/components/WelcomeSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { useState } from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import StarRating from "@/components/ui/StarRating";
import { GoogleMapView, type LocationData } from "@/components/ui/GoogleMapView";
import { usePlaces } from '@/contexts/PlacesContext';

interface Place {
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
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const { places, setPlaces } = usePlaces();
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');

  // Add this dummy data near the top of the file
  const DUMMY_PLACES: Place[] = [
    {
      image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a",
      name: "Eiffel Tower",
      shortDescription: "Iconic iron lattice tower on the Champ de Mars in Paris",
      longDescription: "The Eiffel Tower is a wrought-iron lattice tower located on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel, whose company designed and built the tower.",
      rating: 4.7,
      reviews: 145789,
      address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
      coordinates: { lat: 48.8584, lng: 2.2945 }
    },
    {
      image: "https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94",
      name: "Arc de Triomphe",
      shortDescription: "Historic monument at the center of Place Charles de Gaulle",
      longDescription: "The Arc de Triomphe honours those who fought and died for France in various wars. It stands at the western end of the Champs-Élysées at the center of Place Charles de Gaulle.",
      rating: 4.7,
      reviews: 89234,
      address: "Place Charles de Gaulle, 75008 Paris, France",
      coordinates: { lat: 48.8738, lng: 2.2950 }
    },
    {
      image: "https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94",
      name: "Trocadéro Gardens",
      shortDescription: "Beautiful gardens offering the best views of the Eiffel Tower",
      longDescription: "The Trocadéro Gardens are formal gardens with fountains and sculptures, offering stunning views of the Eiffel Tower across the Seine River.",
      rating: 4.5,
      reviews: 45678,
      address: "Place du Trocadéro et du 11 Novembre, 75016 Paris, France",
      coordinates: { lat: 48.8616, lng: 2.2893 }
    },
    {
      image: "https://images.unsplash.com/photo-1478391679764-b2d8b3cd1e94",
      name: "Champ de Mars",
      shortDescription: "Large public greenspace extending from the Eiffel Tower",
      longDescription: "The Champ de Mars is a large public greenspace in Paris, located between the Eiffel Tower and the École Militaire. It's perfect for picnics with Tower views.",
      rating: 4.6,
      reviews: 67890,
      address: "2 Allée Adrienne Lecouvreur, 75007 Paris, France",
      coordinates: { lat: 48.8548, lng: 2.2985 }
    },
    {
      image: "https://images.unsplash.com/photo-1581262208435-41726149a759",
      name: "Musée du Quai Branly",
      shortDescription: "Museum featuring indigenous art and cultures",
      longDescription: "The Musée du Quai Branly - Jacques Chirac features indigenous art, cultures and civilizations from Africa, Asia, Oceania, and the Americas.",
      rating: 4.4,
      reviews: 34567,
      address: "37 Quai Branly, 75007 Paris, France",
      coordinates: { lat: 48.8608, lng: 2.2973 }
    }
  ];


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
    // Check if either image or prompt is provided (not both required)
    if (!imageFile && !prompt.trim()) {
      alert('Please provide either an image or a prompt');
      return;
    }

    console.log({
      hasImage: !!imageFile,
      imageFile,
      hasPrompt: !!prompt.trim(),
      prompt
    });
    console.log("Sending to VLM...");

    // Create FormData only with the provided data
    const formData = new FormData();
    if (imageFile) formData.append('image', imageFile);
    if (prompt.trim()) formData.append('prompt', prompt);

    // After successful submission
    // Simulate API call
    console.log("Simulating API call...");
    setTimeout(() => {
      setPlaces(DUMMY_PLACES);
    }, 1000);
    clearForm();

    // try {
    //   const response = await fetch('/api/your-vlm-endpoint', {
    //     method: 'POST',
    //     body: formData,
    //   });

    //   if (!response.ok) {
    //     throw new Error('Failed to process request');
    //   }

    //   const result = await response.json();
    //   console.log('VLM Response:', result);

    // } catch (error) {
    //   console.error('Error:', error);
    //   alert('Failed to process request');
    // }
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
                {places.map((place, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative h-48 w-full">
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
                          <span className="text-sm text-gray-500">
                            {place.reviews} reviews
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{place.shortDescription}</p>
                      <p className="text-sm text-gray-500">{place.address}</p>
                    </div>
                  </Card>
                ))}
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
                  disabled={!imageFile && !prompt.trim()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}