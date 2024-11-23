"use client";

import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { useState, useRef } from "react";
import StarRating from "../ui/StarRating";

export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  rating: number;
}

interface GoogleMapViewProps {
  locations: LocationData[];
  apiKey: string;
  className?: string;
}

const defaultPinPath = "M0,-48 C12,-48 12,-24 0,0 C-12,-24 -12,-48 0,-48 Z";

export function GoogleMapView({
  locations,
  apiKey,
  className
}: GoogleMapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const [center, setCenter] = useState({ lat: 0, lng: 0 });
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<LocationData | null>(null);

  const mapContainerStyle = {
    width: "100%",
    height: "700px",
  };

  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;

    const bounds = new google.maps.LatLngBounds();
    locations.forEach((location) => {
      bounds.extend(new google.maps.LatLng(location.latitude, location.longitude));
    });

    map.fitBounds(bounds);

    const newCenter = bounds.getCenter();
    setCenter({ lat: newCenter.lat(), lng: newCenter.lng() });

    const currentZoom = map.getZoom();
    if (currentZoom) setZoom(currentZoom);
  };

  const generateIcon = (rating: number): google.maps.Symbol | null => {
    if (!isLoaded) return null;
    const size = 0.15 + rating * 0.24;
    const color = rating >= 4.8 ? "green" : rating >= 4.5 ? "blue" : "red";
    
    return {
      path: defaultPinPath,
      scale: size,
      fillColor: color,
      fillOpacity: 0.8,
      strokeColor: "black",
      strokeWeight: 1,
      anchor: new google.maps.Point(0, -24),
    };
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onLoad={handleMapLoad}
      >
        {locations.map((location, index) => (
          <Marker
            key={index}
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
    </div>
  );
} 