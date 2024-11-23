'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Paperclip, X } from "lucide-react";
import { WelcomeSection } from "@/components/WelcomeSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { useState } from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import StarRating from "@/components/ui/StarRating";

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

  // Add this dummy data near the top of the file
  const [places, setPlaces] = useState<Place[] | null>(null);
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
      image: "https://images.unsplash.com/photo-1555921015-5532091f6026",
      name: "Colosseum",
      shortDescription: "Ancient amphitheater in the heart of Rome",
      longDescription: "The Colosseum is an oval amphitheatre in the centre of the city of Rome, Italy. It is the largest ancient amphitheatre ever built, and is still the largest standing amphitheatre in the world today.",
      rating: 4.8,
      reviews: 128456,
      address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
      coordinates: { lat: 41.8902, lng: 12.4922 }
    },
    {
      image: "https://images.unsplash.com/photo-1555921015-5532091f6026",
      name: "Taj Mahal",
      shortDescription: "Magnificent marble mausoleum in Agra",
      longDescription: "The Taj Mahal is an ivory-white marble mausoleum on the right bank of the river Yamuna in Agra, India. It was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favorite wife, Mumtaz Mahal.",
      rating: 4.9,
      reviews: 98765,
      address: "Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001, India",
      coordinates: { lat: 27.1751, lng: 78.0421 }
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

  return (
    <main className="min-h-screen w-full flex flex-col relative">
      {/* Scrollable Cards Section */}
      <div className="flex-1 overflow-y-auto pb-32">
        {places ? (
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
          <>
            <WelcomeSection />
            <FeaturesSection />
          </>
        )}
      </div>

      {/* Fixed Prompt Section */}
      <section className="fixed bottom-0 left-0 right-0 bg-white border-t">
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