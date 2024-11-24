"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AccessibilityIcons } from "@/components/ui/AccessibilityIcons";
import { getAccessibilityInfo } from "@/utils/nebius";
import { Loader2 } from "lucide-react";
import WeatherSummary from "./WeatherSummary";

interface AccessibilityInfo {
  "Physical Accessibility": boolean;
  "Sensory Accessibility": boolean;
  "Cognitive Accessibility": boolean;
  "Inclusive Amenities": boolean;
}

interface ItineraryItem {
  time: string;
  location: {
    name: string;
    description: string;
    image: string;
    accessibility?: AccessibilityInfo;
  };
  transportation: {
    method: string;
    duration: string;
    details: string;
  } | null;
}

const DUMMY_ITINERARY: ItineraryItem[] = [
  {
    time: "10:00 AM",
    location: {
      name: "Pearson Airport",
      description: "Canada's most recognized airport.",
      image:
        "https://www.gatlinburg-attractions.com/content/uploads/smokies-aquarium-img02.jpg",
    },
    transportation: null, // First stop
  },
  {
    time: "11:30 AM",
    location: {
      name: "Ripley's Aquarium of Canada",
      description:
        "A large aquarium featuring marine life from around the world.",
      image:
        "https://www.gatlinburg-attractions.com/content/uploads/smokies-aquarium-img02.jpg",
    },
    transportation: {
      method: "Walking",
      duration: "5 mins",
      details: "From CN Tower to Ripley's Aquarium",
    },
  },
  {
    time: "1:00 PM",
    location: {
      name: "Distillery District",
      description:
        "A historic pedestrian-only district with galleries, restaurants, and shops.",
      image:
        "https://www.gatlinburg-attractions.com/content/uploads/smokies-aquarium-img02.jpg",
    },
    transportation: {
      method: "Public Transit",
      duration: "15 mins",
      details: "Take the 504 Streetcar to Distillery District",
    },
  },
  {
    time: "3:00 PM",
    location: {
      name: "Royal Ontario Museum",
      description:
        "A world-renowned museum showcasing art, culture, and natural history.",
      image:
        "https://www.gatlinburg-attractions.com/content/uploads/smokies-aquarium-img02.jpg",
    },
    transportation: {
      method: "Uber",
      duration: "10 mins",
      details: "From Distillery District to Royal Ontario Museum",
    },
  },
];

export default function ItineraryPage() {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(DUMMY_ITINERARY);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const fetchAccessibilityInfo = async () => {
      setIsLoading(true);
      try {
        const updatedItinerary = await Promise.all(
          itinerary.map(async (item) => {
            const accessibilityInfo = await getAccessibilityInfo(
              item.location.name
            );
            return {
              ...item,
              location: {
                ...item.location,
                accessibility: accessibilityInfo || undefined,
              },
            };
          })
        );
        setItinerary(updatedItinerary);
      } catch (error) {
        console.error("Error fetching accessibility info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessibilityInfo();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const handleRegenerate = async () => {
    console.log("Regenerating itinerary with prompt:", prompt);

    // Simulate a regenerated itinerary
    setTimeout(() => {
      alert("Itinerary regenerated! (Simulated)");
      setPrompt("");
    }, 1000);
  };

  return (
    <main className="min-h-screen w-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto pb-32 md:pb-24 lg:pb-32">
        <h1 className="text-center text-2xl font-bold mt-4">Your Itinerary</h1>
        <h2 className="text-center text-lg text-gray-500 mt-2">
          {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long", 
              day: "numeric",
            }
          )}
        </h2>
        <WeatherSummary
          lat={43.6426} // CN Tower coordinates
          lng={-79.3871}
          date={
            new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow’s date
              .toISOString()
              .split("T")[0]
          }
        />
        {/* CN Tower Coordinates */}
        <section className="w-full max-w-4xl mx-auto mt-8 px-4">
          {itinerary.map((item, index) => (
            <div
              key={index}
              className="mb-6 flex flex-col md:flex-row items-start gap-4"
            >
              {/* Timestamp */}
              <div className="w-full md:w-24 text-lg font-semibold text-gray-600">
                <span className="mt-2">{item.time}</span>
              </div>

              {/* Itinerary Content */}
              <div className="flex-1 w-full">
                {item.transportation && (
                  <div className="mb-2 p-2 bg-gray-50 text-gray-700 text-sm rounded">
                    <p>
                      <strong>Method:</strong> {item.transportation.method}
                    </p>
                    <p>
                      <strong>Duration:</strong> {item.transportation.duration}
                    </p>
                    <p>
                      <strong>Details:</strong> {item.transportation.details}
                    </p>
                  </div>
                )}

                {/* Location Card */}
                <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col md:flex-row">
                  <div className="relative w-full md:w-1/3 aspect-[16/9] md:aspect-[4/3]">
                    <Image
                      src={item.location.image}
                      alt={item.location.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      priority={index === 0}
                    />
                  </div>

                  <div className="w-full md:w-2/3 p-4 flex flex-col">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold">
                          {item.location.name}
                        </h3>
                        {item.location.accessibility && (
                          <AccessibilityIcons
                            accessibility={item.location.accessibility}
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {item.location.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Fixed Prompt Section */}
      <section className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-10">
        <div className="w-full max-w-3xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <input
              type="text"
              placeholder="Describe changes to the itinerary..."
              className="flex-1 p-3 border rounded-lg focus:ring focus:ring-black-500"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleRegenerate}
              disabled={!prompt.trim()}
              className="bg-black text-white px-4 py-3 rounded-lg hover:bg-black-600 disabled:opacity-50 whitespace-nowrap"
            >
              Send
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
