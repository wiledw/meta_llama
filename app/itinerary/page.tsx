"use client";

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Calendar, 
  ChevronRight,
  Train,
  Bus,
  Plane,
  Car,
  PersonStanding,
  MapPin,
  Menu,
  Trash2,
  TrainFront,
  TramFront,
  Ship,
  CarTaxiFront
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import WeatherSummary from "./WeatherSummary";

interface ItineraryItem {
  Description: string;
  Timestamp: string;
  transit: string;
}

interface Place {
  name: string;
  latitude: number;
  longitude: number;
  // ... other place properties
}

interface Itinerary {
  id: string;
  created_at: string;
  places: Place[];
  itinerary: ItineraryItem[];
}

// Helper function to determine the transport icon
const TransportIcon = ({ description }: { description: string }) => {
  const desc = description.toLowerCase();
  
  // Walking
  if (desc.includes('walk') || desc.includes('walking') || desc.includes('on foot')) {
    return <PersonStanding className="w-4 h-4 text-blue-500" />;
  }

  // Train/Rail
  if (desc.includes('train') || desc.includes('rail')) {
    return <Train className="w-4 h-4 text-orange-500" />;
  }

  // Subway/Metro
  if (desc.includes('subway') || desc.includes('metro') || desc.includes('transit')) {
    return <TrainFront className="w-4 h-4 text-orange-500" />;
  }

  // Tram/Streetcar
  if (desc.includes('tram') || desc.includes('streetcar') || desc.includes('take')) {
    return <TramFront className="w-4 h-4 text-orange-500" />;
  }

  // Bus
  if (desc.includes('bus') || desc.includes('shuttle')) {
    return <Bus className="w-4 h-4 text-orange-500" />;
  }

  // Taxi/Uber/Lyft
  if (desc.includes('taxi') || desc.includes('uber') || desc.includes('lyft') || desc.includes('cab')) {
    return <CarTaxiFront className="w-4 h-4 text-yellow-500" />;
  }

  // Car/Drive
  if (desc.includes('drive') || desc.includes('car')) {
    return <Car className="w-4 h-4 text-green-500" />;
  }

  // Ferry/Boat
  if (desc.includes('ferry') || desc.includes('boat') || desc.includes('ship')) {
    return <Ship className="w-4 h-4 text-blue-500" />;
  }

  // Plane/Flight
  if (desc.includes('plane') || desc.includes('flight') || desc.includes('airport')) {
    return <Plane className="w-4 h-4 text-sky-500" />;
  }

  // Default location icon
  if (desc.includes('Arrived') || desc.includes('arrived')) {
    return <MapPin className="w-4 h-4 text-red-500" />;
  }

  return <MapPin className="w-4 h-4 text-red-500" />;
};

// Add this helper function to format the description
const formatDescription = (description: string, places: Place[]) => {
  const placeNames = places.map(place => place.name);
  
  // Create a regex pattern from place names, escaping special characters
  const pattern = placeNames
    .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  
  if (!pattern) return description;
  
  const regex = new RegExp(`(${pattern})`, 'g');
  const parts = description.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        if (placeNames.includes(part)) {
          return (
            <strong 
              key={index}
              className="font-semibold text-blue-700"
            >
              {part}
            </strong>
          );
        }
        return part;
      })}
    </span>
  );
};

export default function ItineraryPage() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError('Please log in to view your itineraries');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('itineraries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setItineraries(data || []);
        if (data && data.length > 0) {
          setSelectedItinerary(data[0]); // Select the most recent itinerary by default
        }

      } catch (err) {
        console.error('Error fetching itineraries:', err);
        setError('Failed to load itineraries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraries();
  }, [supabase]);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      const { error } = await supabase
        .from('itineraries')
        .delete()
        .eq('id', deletingId);

      if (error) throw error;

      // Update local state
      setItineraries(itineraries.filter(item => item.id !== deletingId));
      
      // If we're deleting the selected itinerary, select the next available one
      if (selectedItinerary?.id === deletingId) {
        const nextItinerary = itineraries.find(item => item.id !== deletingId);
        setSelectedItinerary(nextItinerary || null);
      }

      toast({
        title: "Itinerary deleted",
        description: "The itinerary has been successfully deleted.",
      });

    } catch (error) {
      console.error('Error deleting itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to delete itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setDeletingId(null);
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

  if (itineraries.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No itineraries generated yet</p>
      </div>
    );
  }

  // Helper function to get formatted date for weather
  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns "YYYY-MM-DD" format
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-white sticky top-0 z-20">
        <h1 className="text-lg font-semibold">Your Itineraries</h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar - Mobile Overlay */}
      <div className={`
        fixed inset-0 bg-black/50 z-30 transition-opacity duration-200
        md:hidden
        ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `} onClick={() => setIsSidebarOpen(false)} />

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 w-80 bg-gray-50 z-40
        transform transition-transform duration-200 ease-in-out
        md:transform-none overflow-y-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b bg-white sticky top-0">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Itineraries
          </h2>
        </div>
        <div className="divide-y max-h-[calc(100vh-4rem)] overflow-y-auto">
          {itineraries.map((itinerary) => (
            <div
              key={itinerary.id}
              className={`flex items-center justify-between p-4 hover:bg-gray-100 transition-colors ${
                selectedItinerary?.id === itinerary.id ? 'bg-blue-50' : ''
              }`}
            >
              <button
                onClick={() => {
                  setSelectedItinerary(itinerary);
                  setIsSidebarOpen(false);
                }}
                className="flex-1 text-left"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {itinerary.places.length} Places
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(itinerary.created_at).toLocaleDateString()}
                    </p>
                    
                  </div>
                  <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                    selectedItinerary?.id === itinerary.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(itinerary.id);
                }}
                className="p-2 hover:bg-red-100 rounded-full ml-2 group"
                title="Delete itinerary"
              >
                <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {selectedItinerary && (
          <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">Your Itinerary</h1>
                  <p className="text-sm text-gray-500">
                    Generated on {new Date(selectedItinerary.created_at).toLocaleDateString()}
                  </p>
                </div>
                {/* Add Weather Summary in header */}
                {selectedItinerary.places.length > 0 && (
                  <div className="mt-1">
                    <WeatherSummary
                      lat={selectedItinerary.places[0].latitude}
                      lng={selectedItinerary.places[0].longitude}
                      date={getFormattedDate(selectedItinerary.created_at)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Places included */}
            <Card className="p-3 md:p-4">
              <h2 className="font-semibold mb-2 text-sm md:text-base">Places Included:</h2>
              <div className="flex flex-wrap gap-2">
                {selectedItinerary.places.map((place, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm"
                  >
                    {place.name}
                  </span>
                ))}
              </div>
            </Card>

            {/* Timeline */}
            <div className="space-y-3 md:space-y-4">
              {selectedItinerary.itinerary.map((item, index) => (
                <div key={index} className="flex gap-2 md:gap-4">
                  {/* Time */}
                  <div className="w-16 md:w-20 text-right">
                    <span className="text-xs md:text-sm font-medium text-gray-500">
                      {item.Timestamp}
                    </span>
                  </div>

                  {/* Icon and Connection Line */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${
                      item.transit === "True" 
                        ? 'bg-orange-100' 
                        : 'bg-blue-100'
                    } flex items-center justify-center`}>
                      <TransportIcon description={item.Description} />
                    </div>
                    {index < selectedItinerary.itinerary.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 absolute top-6 md:top-8" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4 md:pb-6">
                    <Card className={`p-3 md:p-4 text-sm md:text-base ${
                      item.transit === "True" 
                        ? 'bg-orange-50 border-orange-100' 
                        : 'bg-blue-50 border-blue-100'
                    }`}>
                      <p>
                        {formatDescription(item.Description, selectedItinerary.places)}
                      </p>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Itinerary</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this itinerary? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
