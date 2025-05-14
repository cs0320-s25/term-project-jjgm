import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState, useMemo } from "react";
import Map, {
  Marker,
  Layer,
  MapLayerMouseEvent,
  Source,
  ViewStateChangeEvent,
  Popup,
  CircleLayer
} from "react-map-gl";
import { geoLayer, overlayData } from "../utils/overlay";
import { useUser } from "@clerk/clerk-react";
import { getUserPoints, getDormStats } from "../utils/api";
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

interface DormStat {
  name: string;
  totalPoints: number;
  topGenre: string;
  topGenrePoints: number;
  latitude: number;
  longitude: number;
  radius: number;
}

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
  
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // -- DORM DATA
  const [dormStats, setDormStats] = useState<DormStat[]>([]);
  const [hoveredDorm, setHoveredDorm] = useState<DormStat | null>(null);
  
  const { user } = useUser();

  // -- GENRE TO COLOR MAPPINGS
  const getGenreColor = (genre: string): string => {
    const genreColorMap: Record<string, string> = {
      "pop": "#2196f3", // blue
      "rnb": "#9c27b0", // purple
      "hiphop": "#ffc107", // amber
      "afrobeats": "#4caf50", // green
      "country": "#ff9800", // orange
      // default for any unknown genre
      "default": "#2196f3" // blue
    };
    
    return genre ? (genreColorMap[genre] || genreColorMap.default) : genreColorMap.default;
  };


  // -- OPACITY BASED ON TOTAL POINTS
  const calculateOpacity = (totalPoints: number): number => {
    // -- base opacity is 0.3, max is 0.8
    const baseOpacity = 0.3;
    const maxOpacity = 0.8;
    
    // -- 100 points would get you to ~10 opacity
    const scaleFactor = 0.04; 
    
    return Math.min(baseOpacity + (totalPoints * scaleFactor), maxOpacity);
  };


  // -- generate GeoJSON for dorm circles
  const dormGeoJson = useMemo(() => {
    if (!dormStats.length) return null;
    
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
          opacity: calculateOpacity(dorm.totalPoints)
        },
        geometry: {
          type: "Point",
          coordinates: [dorm.longitude, dorm.latitude]
        }
      }))
    };
  }, [dormStats]);

  // -- circle layer for dorms
  const dormCircleLayer: CircleLayer = {
    id: 'dorm-circles',
    type: 'circle',
    paint: {
      'circle-radius': ['get', 'radius'],
      'circle-color': ['get', 'color'],
      'circle-opacity': ['get', 'opacity'],
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  };

  useEffect(() => {
    setOverlay(overlayData());
    
    // -- fetch dorm stats
    const fetchDormStats = async () => {
      try {
        const result = await getDormStats();
        if (result && result.response_type === "success" && result.dormStats) {
          setDormStats(result.dormStats as DormStat[]);
        }
      } catch (error) {
        console.error("Error fetching dorm stats:", error);
      }
    };

    const fetchTopCategories = async () => {
      if (user) {
        setLoading(true);
        try {
          const result = await getUserPoints(user.id);
          if (result && result.response_type === "success" && result.points) {
            const categories = Object.entries(result.points)
              .map(([genre, points]) => ({
                genre,
                points: points as number
              }))
              .filter(category => category.points > 0) // -- only include nonzero scores
              .sort((a, b) => b.points - a.points)
              .slice(0, 3); // -- top 3

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
    
    fetchDormStats();
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

  // -- HOVER DORM CIRCLE
  const onHover = (event: MapLayerMouseEvent) => {
    if (event.features && event.features.length > 0) {
      const feature = event.features[0];
      const props = feature.properties;
      
      if (props && props.dormName) {
        setHoveredDorm({
          name: props.dormName,
          totalPoints: props.totalPoints,
          topGenre: props.topGenre,
          topGenrePoints: props.topGenrePoints,
          latitude: event.lngLat.lat,
          longitude: event.lngLat.lng,
          radius: props.radius || 100 // default radius
        });
      }
    } else {
      setHoveredDorm(null);
    }
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
      
      {/* Legend for genre colors */}
      <div className="map-legend">
        <h4>Genre Colors</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: getGenreColor('pop') }}></div>
            <div className="legend-label">Pop</div>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: getGenreColor('rnb') }}></div>
            <div className="legend-label">90s RnB</div>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: getGenreColor('hiphop') }}></div>
            <div className="legend-label">Hip-Hop/Rap</div>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: getGenreColor('afrobeats') }}></div>
            <div className="legend-label">Afrobeats</div>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: getGenreColor('country') }}></div>
            <div className="legend-label">Country</div>
          </div>
        </div>
        <div className="legend-opacity">
          <p><strong>Circle Opacity:</strong> Based on total dorm points</p>
          <div className="opacity-scale">
            <div className="opacity-item" style={{ opacity: 0.3 }}>Low</div>
            <div className="opacity-item" style={{ opacity: 0.5 }}>Medium</div>
            <div className="opacity-item" style={{ opacity: 0.8 }}>High</div>
          </div>
        </div>
      </div>
  
      <Map
        mapboxAccessToken={MAPBOX_API_KEY}
        {...viewState}
        style={{ width: "100%", height: "600px" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={(ev: ViewStateChangeEvent) => setViewState(ev.viewState)}
        interactiveLayerIds={['dorm-circles']}
        onMouseMove={onHover}
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
        
        {/* Dorm circle overlays */}
        {dormGeoJson && (
          <Source id="dorms-data" type="geojson" data={dormGeoJson as GeoJSON.FeatureCollection}>
            <Layer {...dormCircleLayer} />
          </Source>
        )}
        
        {/* Popup for hovered dorm */}
        {hoveredDorm && (
          <Popup
            longitude={hoveredDorm.longitude}
            latitude={hoveredDorm.latitude}
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
          >
            <div className="dorm-popup">
              <h4>{hoveredDorm.name}</h4>
              <p><strong>Total Points:</strong> {hoveredDorm.totalPoints}</p>
              {hoveredDorm.topGenre && (
                <p>
                  <strong>Top Genre:</strong> {getCategoryLabel(hoveredDorm.topGenre)} 
                  ({hoveredDorm.topGenrePoints} points)
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}