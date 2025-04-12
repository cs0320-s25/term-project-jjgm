import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import Map, {
  Marker,
  Layer,
  MapLayerMouseEvent,
  Source,
  ViewStateChangeEvent,
} from "react-map-gl";
import { geoLayer } from "../utils/overlay";
import { useUser } from "@clerk/clerk-react";
import { addPin, listPins, clearUserPins, searchAreas } from "../utils/api";

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

// Providence coordinates and zoom level
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
  
  const [pins, setPins] = useState<PinData[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [matchingAreaIds, setMatchingAreaIds] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [minLat, setMinLat] = useState<string>("");
  const [maxLat, setMaxLat] = useState<string>("");
  const [minLon, setMinLon] = useState<string>("");
  const [maxLon, setMaxLon] = useState<string>("");
  
  const { user } = useUser();

  useEffect(() => {
    refreshPins();
    
    // periodically refresh pins
    const interval = setInterval(refreshPins, 5000);
    
    return () => clearInterval(interval);
  }, []);

const fetchOverlay = async () => {

  if (!minLat || !maxLat || !minLon || !maxLon) {
    setOverlay(undefined);
    return;
  }

  const params = new URLSearchParams({
    minLat: minLat,
    maxLat: maxLat,
    minLon: minLon,
    maxLon: maxLon,
  });
  try {
    const response = await fetch(
      `http://localhost:3232/redlining?${params.toString()}`
    );
    if (!response.ok) {
      console.error("Error fetching redlining overlay:", response.statusText);
      return;
    }
    const data = await response.json();
    console.log("Fetched redlining overlay:", data);
    setOverlay(data);
  } catch (error) {
    console.error("Error in fetchOverlay:", error);
  }
};


  const refreshPins = () => {
    listPins()
      .then((data) => {
        console.log("API response:", data);
        
        if (data && data.response_type === "success" && Array.isArray(data.pins)) {
          // Convert the pins from the API to the PinData format
          const convertedPins: PinData[] = data.pins.map((pin: any) => {
            return {
              id: pin.id || `pin-${Date.now()}`,
              location: {
                lat: Number(pin.lat),
                long: Number(pin.lng)
              },
              userId: pin.userId || "unknown",
              timestamp: Number(pin.timestamp) || Date.now()
            };
          });
          
          console.log("Converted pins for display:", convertedPins);
          setPins(convertedPins);
        } else {
          console.log("No pins found or invalid response format:", data);
          setPins([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching pins:", error);
        setPins([]);
      });
  };

  const handleMapClick = (e: MapLayerMouseEvent) => {
    if (!user) return;
    
    const newPin: PinData = {
      id: `pin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      location: {
        lat: e.lngLat.lat,
        long: e.lngLat.lng,
      },
      userId: user.id,
      timestamp: Date.now(),
    };
    
    // Add the pin to the API
    addPin(
      user.id,
      newPin.id,
      newPin.location.lat,
      newPin.location.long,
      newPin.timestamp
    )
      .then(() => {
        // Add a small delay to ensure Firebase has time to commit the data
        setTimeout(refreshPins, 500);
      })
      .catch((error) => {
        console.error("Error adding pin:", error);
      });
  };

  const handleClearMyPins = () => {
    if (!user) return;
    
    clearUserPins(user.id)
      .then(() => {
        refreshPins();
      })
      .catch((error) => {
        console.error("Error clearing pins:", error);
      });
  };
  
  const handleSearch = () => {
    console.log("searching keywords......")
    if (!searchKeyword) {
      setMatchingAreaIds([]);
      return;
    }
    
    setIsSearching(true);
    
    searchAreas(searchKeyword)
      .then((data) => {
        if (data && data.response_type === "success" && data.matching_ids) {
          // debug logging
          console.log("Backend returned matching IDs:", data.matching_ids);
          
          const ids = Array.isArray(data.matching_ids) ? data.matching_ids : [];
          console.log("Setting matched IDs:", ids);
          
          setMatchingAreaIds(ids);
        } else {
          console.log("No matching areas found:", data);
          setMatchingAreaIds([]);
        }
      })
      .catch((error) => {
        console.error("Error searching areas:", error);
        setMatchingAreaIds([]);
      })
      .finally(() => {
        setIsSearching(false);
      });
  };
  
  const handleClearSearch = () => {
    setSearchKeyword("");
    setMatchingAreaIds([]);
  };

  /**
  const highlightedLayer: any = {
    id: "highlighted-areas",
    type: "fill",
    paint: {
      "fill-color": "#FF9900",
      "fill-opacity": 0.7,
    },
    filter: ["in", ["get", "holc_id"], ...matchingAreaIds]
  };*/
  
  const highlightedLayer: any = {
    id: "highlighted-areas",
    type: "fill",
    paint: {
      "fill-color": "#FF9900",
      "fill-opacity": 0.7,
    },
    filter: ["in", ["get", "area_id"], ["literal", matchingAreaIds]]
  };

  return (
    <div className="map-container">
      <div className = "latlong">
        <input
          type="text"
          value={minLat}
          onChange={(e) => setMinLat(e.target.value)}
          placeholder="Min Latitude"
          style={{ marginRight: "5px" }}
        />
        <input
          type="text"
          value={maxLat}
          onChange={(e) => setMaxLat(e.target.value)}
          placeholder="Max Latitude"
          style={{ marginRight: "5px" }}
        />
        <input
          type="text"
          value={minLon}
          onChange={(e) => setMinLon(e.target.value)}
          placeholder="Min Longitude"
          style={{ marginRight: "5px" }}
        />
        <input
          type="text"
          value={maxLon}
          onChange={(e) => setMaxLon(e.target.value)}
          placeholder="Max Longitude"
          style={{ marginRight: "5px" }}
        />
        <button onClick={fetchOverlay}>Update Overlay</button>
      </div>
      <div className="map-controls">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search for areas by keyword..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            disabled={isSearching}
            aria-label="area-search"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchKeyword}
            aria-label="search-button"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
          {matchingAreaIds.length > 0 && (
            <button
              onClick={handleClearSearch}
              aria-label="clear-search-button"
            >
              Clear Search
            </button>
          )}
          <span className="search-results">
            {matchingAreaIds.length > 0 &&
              `Found ${matchingAreaIds.length} matching areas`}
          </span>
        </div>

        <button
          onClick={handleClearMyPins}
          aria-label="clear-pins-button"
          className="clear-pins-button"
        >
          Clear My Pins
        </button>
      </div>

      <Map
        mapboxAccessToken={MAPBOX_API_KEY}
        {...viewState}
        style={{ width: "100%", height: "600px" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={(ev: ViewStateChangeEvent) => setViewState(ev.viewState)}
        onClick={handleMapClick}
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

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            longitude={pin.location.long}
            latitude={pin.location.lat}
            anchor="bottom"
            aria-label={`map-pin-${pin.id}`}
          >
            <div
              className={`map-pin ${
                pin.userId === user?.id ? "my-pin" : "other-pin"
              }`}
              title={`Pin added by ${
                pin.userId === user?.id ? "you" : "another user"
              }`}
            >
              📍
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}