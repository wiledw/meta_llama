"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AccessibilityIcons } from "@/components/ui/AccessibilityIcons";
import { getAccessibilityInfo } from "@/utils/nebius";
import { Loader2 } from "lucide-react";
import WeatherSummary from "./WeatherSummary";
import { FaWalking, FaBusAlt, FaCar } from "react-icons/fa";

interface AccessibilityInfo {
  "Physical Accessibility": boolean;
  "Sensory Accessibility": boolean;
  "Cognitive Accessibility": boolean;
  "Inclusive Amenities": boolean;
}

interface TransportationStep {
  type: string; // E.g., "Walking", "Public Transit", "Uber"
  description: string;
  timestamp: string;
}

interface ItineraryItem {
  time: string;
  location: {
    name: string;
    description: string;
    image: string;
    accessibility?: AccessibilityInfo;
  };
  transportation: TransportationStep[];
}

const TRANSPORTATION_ICONS: { [key: string]: JSX.Element } = {
  Walking: <FaWalking />,
  "Public Transit": <FaBusAlt />,
  Uber: <FaCar />,
};

const DUMMY_ITINERARY: ItineraryItem[] = [
  {
    time: "10:00 AM",
    location: {
      name: "Pearson Airport",
      description: "Canada's most recognized airport.",
      image:
        "https://www.gatlinburg-attractions.com/content/uploads/smokies-aquarium-img02.jpg",
    },
    transportation: [],
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
    transportation: [
      {
        type: "Walking",
        description: "Walk from CN Tower to Ripley's Aquarium",
        timestamp: "11:20 AM",
      },
    ],
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
    transportation: [
      {
        type: "Public Transit",
        description: "Take the 504 Streetcar to Distillery District",
        timestamp: "12:45 PM",
      },
      {
        type: "Walking",
        description: "Walk from stop to Distillery District",
        timestamp: "12:55 PM",
      },
    ],
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
    transportation: [
      {
        type: "Uber",
        description: "Uber ride from Distillery District to ROM",
        timestamp: "2:45 PM",
      },
    ],
  },
];

export default function ItineraryPage() {
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(DUMMY_ITINERARY);
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState<string>("");

  useEffect(() => {
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

  const TransportationDisplay = ({
    steps,
  }: {
    steps: TransportationStep[];
  }) => (
    <div className="transportation-steps">
      {steps.map((step, index) => (
        <div key={index} className="transportation-step mb-2 flex items-start">
          <div className="icon mr-2 text-lg">
            {TRANSPORTATION_ICONS[step.type]}
          </div>
          <div>
            <p className="text-sm text-gray-700 font-semibold">{step.type}</p>
            <p className="text-sm text-gray-600">{step.description}</p>
            <p className="text-xs text-gray-500">{step.timestamp}</p>
          </div>
        </div>
      ))}
      <hr className="border-gray-300 my-2" />
    </div>
  );

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

  return (
    <main className="min-h-screen w-full flex flex-col relative">
      <div className="flex-1 overflow-y-auto pb-32 md:pb-24 lg:pb-32">
        <h1 className="text-center text-2xl font-bold mt-4">Your Itinerary</h1>
        <WeatherSummary
          lat={43.6426}
          lng={-79.3871}
          date={
            new Date(Date.now() + 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0]
          }
        />
        <section className="w-full max-w-4xl mx-auto mt-8 px-4">
          {itinerary.map((item, index) => (
            <div
              key={index}
              className="mb-6 flex flex-col md:flex-row items-start gap-4"
            >
              <div className="w-full md:w-24 text-lg font-semibold text-gray-600">
                <span className="mt-2">{item.time}</span>
              </div>
              <div className="flex-1 w-full">
                {item.transportation.length > 0 && (
                  <div className="mb-2 p-4 bg-gray-50 text-gray-700 text-sm rounded">
                    <h4 className="font-bold text-lg mb-2">Transportation</h4>
                    <TransportationDisplay steps={item.transportation} />
                  </div>
                )}
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
    </main>
  );
}
