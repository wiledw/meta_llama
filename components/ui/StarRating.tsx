import React from "react";

type StarRatingProps = {
  rating: number; // The numeric rating (e.g., 4.7)
  maxStars?: number; // Total number of stars (default is 5)
  size?: number; // Size of each star in pixels (default is 20)
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 20,
}) => {
  const starStyle = {
    width: size,
    height: size,
    display: "inline-block",
    position: "relative",
    marginRight: "2px",
  };

  const fullStar = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="gold"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );

  const emptyStar = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="lightgray"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {/* Render each star dynamically */}
      {Array.from({ length: maxStars }, (_, index) => {
        const starRating = index + 1; // Current star rating
        if (rating >= starRating) {
          // Full star
          return (
            <div key={index} style={starStyle}>
              {fullStar}
            </div>
          );
        } else if (rating > starRating - 1) {
          // Partial star
          const partialWidth = (rating - (starRating - 1)) * 100; // Percent fill
          return (
            <div key={index} style={starStyle}>
              <div style={{ position: "absolute", width: "100%", zIndex: 1 }}>
                {emptyStar}
              </div>
              <div
                style={{
                  position: "absolute",
                  width: `${partialWidth}%`,
                  overflow: "hidden",
                  zIndex: 2,
                }}
              >
                {fullStar}
              </div>
            </div>
          );
        } else {
          // Empty star
          return (
            <div key={index} style={starStyle}>
              {emptyStar}
            </div>
          );
        }
      })}
    </div>
  );
};

export default StarRating;
