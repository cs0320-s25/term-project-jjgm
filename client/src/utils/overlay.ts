import { FeatureCollection } from "geojson";
import { FillLayer } from "react-map-gl";
import rl_data from "../geodata/fullDownload.json";

const propertyName = "holc_grade";
export const geoLayer: FillLayer = {
  id: "geo_data",
  type: "fill",
  paint: {
    "fill-color": [
      "match",
      ["get", propertyName],
      "A",
      "#5bcc04",
      "B",
      "#04b8cc",
      "C",
      "#e9ed0e",
      "D",
      "#d11d1d",
      "#ccc",
    ],
    "fill-opacity": 0.2,
  },
};

// TODO: MAPS PART 4:
// - Download and import the geojson file
// - Implement the two functions below.

// Import the raw JSON file
// import rl_data from "../geodata/fullDownload.json";
// you may need to rename the downloaded .geojson to .json

function isFeatureCollection(json: any): json is FeatureCollection {
  return json.type === "FeatureCollection";
}

export function overlayData(): GeoJSON.FeatureCollection | undefined {
   return isFeatureCollection(rl_data) ? rl_data : undefined;
}

export function generateDormGeoJson(dormStats: any[]) {
  if (!dormStats || !dormStats.length) return null;
  
  const getGenreColor = (genre: string): string => {
    const genreColorMap: Record<string, string> = {
      "pop": "#ff5252", // red
      "rnb": "#9c27b0", // purple
      "hiphop": "#ffc107", // amber
      "afrobeats": "#4caf50", // green
      "country": "#ff9800", // orange
      // Default for any unknown genre
      "default": "#2196f3" // blue
    };
    
    return genre ? (genreColorMap[genre] || genreColorMap.default) : genreColorMap.default;
  };
  
  const calculateOpacity = (totalPoints: number): number => {
    // Base opacity is 0.3, max is 0.8
    const baseOpacity = 0.3;
    const maxOpacity = 0.8;
    
    // Scale factor
    const scaleFactor = 0.002; 
    
    return Math.min(baseOpacity + (totalPoints * scaleFactor), maxOpacity);
  };
  
  return {
    type: "FeatureCollection",
    features: dormStats.map(dorm => ({
      type: "Feature",
      properties: {
        dormName: dorm.name,
        totalPoints: dorm.totalPoints,
        topGenre: dorm.topGenre,
        topGenrePoints: dorm.topGenrePoints,
        color: getGenreColor(dorm.topGenre),
        opacity: calculateOpacity(dorm.totalPoints),
        radius: dorm.radius || 100
      },
      geometry: {
        type: "Point",
        coordinates: [dorm.longitude, dorm.latitude]
      }
    }))
  };
}
