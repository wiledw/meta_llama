"use client";

import React, { useState } from "react";
import Image from 'next/image';

interface ItineraryItem {
  time: string;
  location: {
    name: string;
    description: string;
    image: string;
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
  const [prompt, setPrompt] = useState<string>("");
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(DUMMY_ITINERARY);

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
      <div className="flex-1 overflow-y-auto pb-24">
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
        <section className="w-full max-w-4xl mx-auto mt-8 px-4">
          {itinerary.map((item, index) => (
            <div key={index} className="mb-6 flex items-start gap-4">
              {/* Timestamp */}
              <div className="w-24 text-lg font-semibold text-gray-600 flex items-start">
                <span className="mt-2">{item.time}</span>
              </div>

              {/* Itinerary Content */}
              <div className="flex-1">
                {/* Transportation Details */}
                {item.transportation && (
                  <div className="mb-2 p-2 bg-black-50 text-black-700 text-sm rounded">
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
                <div className="bg-white shadow rounded-lg overflow-hidden flex">
                  {/* Image Section */}
                  <div className="w-1/3 relative aspect-[4/3]">
                    <Image
                      src={item.location.image}
                      alt={item.location.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 25vw"
                      priority={index === 0}
                    />
                  </div>

                  {/* Text Section */}
                  <div className="w-2/3 p-4 flex flex-col">
                    <h3 className="text-lg font-bold">{item.location.name}</h3>
                    <p className="text-sm text-gray-600">
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
          <div className="flex items-center gap-4">
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
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-black-600 disabled:opacity-50"
            >
              Re-plan-ify
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
