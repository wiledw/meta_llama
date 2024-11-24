import React from "react";
import TransportDetails from "../components/TransportDetails";

interface Stop {
  name: string;
  arrival: string;
  departure: string;
  lat: number;
  lng: number;
}

interface TimelineProps {
  itinerary: Stop[];
}

const Timeline: React.FC<TimelineProps> = ({ itinerary }) => {
  return (
    <div className="timeline">
      {itinerary.map((stop, index) => (
        <div key={index} className="timeline-item">
          <div className="stop-details">
            <h3>{stop.name}</h3>
            <p>Arrival: {stop.arrival}</p>
            <p>Departure: {stop.departure}</p>
          </div>
          {index < itinerary.length - 1 && (
            <TransportDetails
              origin={stop}
              destination={itinerary[index + 1]}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Timeline;
