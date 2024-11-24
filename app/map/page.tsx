"use client";

import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { useState, useRef } from "react";
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
  {
    id: 4,
    name: "Empire State Building",
    latitude: 40.748817,
    longitude: -73.985428,
    rating: 4.8,
  },
  {
    id: 5,
    name: "Brooklyn Botanic Garden",
    latitude: 40.6694,
    longitude: -73.9624,
    rating: 4.7,
  },
];

// Simplified teardrop shape
const customPinPath = "M0,-48 C12,-48 12,-24 0,0 C-12,-24 -12,-48 0,-48 Z";

export default function MapsPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);

  const onMapLoad = (map: google.maps.Map) => {
    mapRef.current = map; // Store the map instance

    const bounds = new google.maps.LatLngBounds();

    // Extend bounds to include all locations
    locations.forEach((location) => {
      bounds.extend(
        new google.maps.LatLng(location.latitude, location.longitude)
      );
    });

    map.fitBounds(bounds); // Adjust map to fit all locations

    // Optional: Update center and zoom state
    const newCenter = bounds.getCenter();
    setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });

    const currentZoom = map.getZoom();
    if (currentZoom) setZoom(currentZoom);
  };

  const generateIcon = (rating: number): google.maps.Symbol | null => {
    if (!isLoaded) return null;
    const size = 0.15 + rating * 0.24; // Scale size based on rating
    const color = rating >= 4 ? "green" : rating >= 3.5 ? "blue" : "red"; // Dynamic color
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
    <>
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={zoom}
          onLoad={onMapLoad}
        >
          {locations.map((location) => (
            <Marker
              key={location.id}
              position={{ lat: location.latitude, lng: location.longitude }}
              icon={generateIcon(location.rating) as google.maps.Symbol}
              onMouseOver={() => setHoveredLocation(location)}
              onMouseOut={() => setHoveredLocation(null)}
            />
          ))}

          {hoveredLocation && (
            <InfoWindow
              position={{
                lat: hoveredLocation.latitude,
                lng: hoveredLocation.longitude,
              }}
              options={{
                pixelOffset: new google.maps.Size(0, -48),
                disableAutoPan: true,
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
      )}
    </>
  );
}
