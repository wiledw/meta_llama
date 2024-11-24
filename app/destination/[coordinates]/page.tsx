'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import StarRating from "@/components/ui/StarRating";
import { SaveButton } from "@/components/ui/SaveButton";
import { usePlaces } from '@/contexts/PlacesContext';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function DestinationPage() {
  const params = useParams();
  const router = useRouter();
  const { places } = usePlaces();
  
  const coordinates = decodeURIComponent(params?.coordinates as string);
  const place = places?.find(p => 
    `${p.coordinates.lat},${p.coordinates.lng}` === coordinates
  );

  if (!place) {
    return <div>Place not found</div>;
  }

  return (
    <main className="min-h-screen w-full p-4 pb-20 md:p-8 md:pb-24 lg:pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:bg-gray-100 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
          <div className="absolute top-4 right-4 z-10">
            <SaveButton place={place} />
          </div>
          <Image
            src={place.image}
            alt={place.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold">{place.name}</h1>
            <div className="flex flex-col items-end">
              <StarRating rating={place.rating} size={20} />
              <span className="text-gray-500">
                {place.reviews} reviews
              </span>
            </div>
          </div>
          
          <p className="text-gray-600">{place.shortDescription}</p>
          <p className="text-xl font-semibold">About</p>
          <p className="text-gray-700">{place.longDescription}</p>
          
          <div className="border-t pt-4">
            <p className="text-gray-500">{place.address}</p>
            <p className="text-sm text-gray-400">
              Coordinates: {place.coordinates.lat}, {place.coordinates.lng}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 