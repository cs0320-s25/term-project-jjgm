import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import Map, {
  Marker,
  Layer,
  MapLayerMouseEvent,
  Source,
  ViewStateChangeEvent,
} from "react-map-gl";
import { geoLayer, overlayData } from "../utils/overlay";
import { useUser } from "@clerk/clerk-react";
import { getUserPoints } from "../utils/api";
import "../styles/MapStyles.css";

const MAPBOX_API_KEY = process.env.MAPBOX_TOKEN;
if (!MAPBOX_API_KEY) {
  console.error("Mapbox API key not found. Please add it to your .env file.");
}

export interface LatLong {
  lat: number;
  long: number;
}

export interface PinData {
  id: string;
  location: LatLong;
  userId: string;
  timestamp: number;
}

// Define interface for top categories
interface TopCategory {
  genre: string;
  points: number;
}

const ProvidenceLatLong: LatLong = {
  lat: 41.82,
  long: -71.41,
};
const initialZoom = 11;

export default function Mapbox() {
  const [viewState, setViewState] = useState({
    longitude: ProvidenceLatLong.long,
    latitude: ProvidenceLatLong.lat,
    zoom: initialZoom,
  });

  const [overlay, setOverlay] = useState<GeoJSON.FeatureCollection | undefined>(
    undefined
  );
  
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [matchingAreaIds, setMatchingAreaIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [minLat, setMinLat] = useState<string>("");
  const [maxLat, setMaxLat] = useState<string>("");
  const [minLon, setMinLon] = useState<string>("");
  const [maxLon, setMaxLon] = useState<string>("");
  
  // State for top categories
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useUser();

  useEffect(() => {
    setOverlay(overlayData());
    
    // Fetch user's top categories if user exists
    const fetchTopCategories = async () => {
      if (user) {
        setLoading(true);
        try {
          const result = await getUserPoints(user.id);
          if (result && result.response_type === "success" && result.points) {
            // Convert points object to array, sort by points, and take top 3
            const categories = Object.entries(result.points)
              .map(([genre, points]) => ({
                genre,
                points: points as number
              }))
              .filter(category => category.points > 0) // Only include non-zero scores
              .sort((a, b) => b.points - a.points)
              .slice(0, 3); // Get top 3

            setTopCategories(categories);
          }
        } catch (error) {
          console.error("Error fetching user points:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    fetchTopCategories();
  }, [user]);

  const getCategoryLabel = (value: string): string => {
    const genreMap: Record<string, string> = {
      "pop": "Pop",
      "rnb": "90s RnB",
      "hiphop": "Hip-Hop/Rap",
      "afrobeats": "Afrobeats",
      "country": "Country"
    };
    
    return genreMap[value] || value;
  };

  return (
    <div className="map-container">
      {/* Top Categories Display */}
      {!loading && (
        <div className="top-categories-mapbox">
          <h3>Your Top {topCategories.length === 1 ? "Category" : "Categories"}</h3>
          {topCategories.length > 0 ? (
            <div className="categories-list-mapbox">
              {topCategories.map((category, index) => (
                <div 
                  key={category.genre} 
                  className={`category-item-mapbox rank-${index + 1}`}
                  data-category={category.genre}
                >
                  <div className="category-rank">{index + 1}</div>
                  <div className="category-info">
                    <div className="category-name">{getCategoryLabel(category.genre)}</div>
                    <div className="category-points">{category.points}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-categories">
              Play some music games to earn points!
            </div>
          )}
        </div>
      )}
  
      <Map
        mapboxAccessToken={MAPBOX_API_KEY}
        {...viewState}
        style={{ width: "100%", height: "600px" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={(ev: ViewStateChangeEvent) => setViewState(ev.viewState)}
      >
        {overlay && (
          <Source id="geo_data" type="geojson" data={overlay}>
            <Layer {...geoLayer} />
            {matchingAreaIds.length > 0 && (
              <Layer
                id="highlighted-areas"
                type="fill"
                paint={{
                  "fill-color": "#FF0000",
                  "fill-opacity": 0.7,
                }}
                filter={[
                  "match",
                  ["to-string", ["get", "area_id"]],
                  matchingAreaIds,
                  true,
                  false,
                ]}
              />
            )}
          </Source>
        )}
      </Map>
    </div>
  );
}