'use client';

import { createContext, useContext, useState, useEffect } from 'react';

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
  websiteUri?: string;
  translated_description?: string;
  translated_review_summary?: string;
}

interface PlacesContextType {
  places: Place[] | null;
  setPlaces: (places: Place[] | null) => void;
  isLoading: boolean;
}

const PlacesContext = createContext<PlacesContextType | undefined>(undefined);

export function PlacesProvider({ children }: { children: React.ReactNode }) {
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load places from localStorage after mount
  useEffect(() => {
    try {
      const savedPlaces = localStorage.getItem('places');
      if (savedPlaces) {
        const parsedPlaces = JSON.parse(savedPlaces);
        const validatedPlaces = parsedPlaces.map((place: Place) => ({
          ...place,
          websiteUri: place.websiteUri || undefined,
          translated_description: place.translated_description || undefined,
          translated_review_summary: place.translated_review_summary || undefined
        }));
        setPlaces(validatedPlaces);
      }
    } catch (error) {
      console.error('Error loading places from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update localStorage whenever places changes
  useEffect(() => {
    try {
      if (places) {
        localStorage.setItem('places', JSON.stringify(places));
      } else {
        localStorage.removeItem('places');
      }
    } catch (error) {
      console.error('Error saving places to localStorage:', error);
    }
  }, [places]);

  return (
    <PlacesContext.Provider value={{ places, setPlaces, isLoading }}>
      {children}
    </PlacesContext.Provider>
  );
}

export function usePlaces() {
  const context = useContext(PlacesContext);
  if (context === undefined) {
    throw new Error('usePlaces must be used within a PlacesProvider');
  }
  return context;
} 