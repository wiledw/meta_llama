"use client";

import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { useState } from "react";
import StarRating from "../../components/ui/StarRating";

type Location = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
};

const mapContainerStyle = {
  width: "100%",
  height: "700px",
};

const center = {
  lat: 40.7128,
  lng: -74.006,
};

const locations: Location[] = [
  {
    id: 1,
    name: "Cafe Delight",
    latitude: 40.7128,
    longitude: -74.006,
    rating: 2.5,
  },
  {
    id: 2,
    name: "Central Park",
    latitude: 40.7851,
    longitude: -73.9683,
    rating: 4.9,
  },
  {
    id: 3,
    name: "Brooklyn Bridge",
    latitude: 40.7061,
    longitude: -73.9969,
    rating: 4.7,
  },
];

// Simplified teardrop shape
const customPinPath = "M0,-48 C12,-48 12,-24 0,0 C-12,-24 -12,-48 0,-48 Z";

export default function MapsPage() {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);

  const generateIcon = (rating: number) => {
    if (!googleMapsLoaded) return null; // Return null until the library is loaded
    const size = 0.15 + rating * 0.24; // Scale size based on rating
    const color = rating >= 4.8 ? "green" : rating >= 4.5 ? "blue" : "red"; // Dynamic color
    return {
      path: customPinPath, // Use simplified teardrop path
      scale: size, // Scale dynamically
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: "black",
      strokeWeight: 1,
      anchor: new google.maps.Point(0, -24), // Anchor at the bottom of the pin
    };
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
      onLoad={() => setGoogleMapsLoaded(true)} // Set state when library is loaded
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
      >
        {googleMapsLoaded &&
          locations.map((location) => (
            <Marker
              key={location.id}
              position={{ lat: location.latitude, lng: location.longitude }}
              icon={generateIcon(location.rating)} // Apply only the teardrop icon
              onMouseOver={() => setHoveredLocation(location)} // Hover starts here
              onMouseOut={() => setHoveredLocation(null)} // Hover ends here
            />
          ))}

        {hoveredLocation && (
          <InfoWindow
            position={{
              lat: hoveredLocation.latitude,
              lng: hoveredLocation.longitude,
            }}
            options={{
              pixelOffset: new google.maps.Size(0, -48), // Align box above teardrop
              disableAutoPan: true, // Prevent automatic map panning
            }}
          >
            <div style={{ padding: "5px", textAlign: "center" }}>
              <h4 style={{ margin: 0, fontSize: "medium" }}>
                {hoveredLocation.name}
              </h4>
              <StarRating rating={hoveredLocation.rating} size={16} />
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
