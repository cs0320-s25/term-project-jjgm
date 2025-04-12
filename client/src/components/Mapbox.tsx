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
import { addPin, listPins, clearUserPins } from "../utils/api";

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

// providence coordinates and zoom level
const ProvidenceLatLong: LatLong = {
  lat: 41.825,
  long: -71.418,
};
const initialZoom = 11;

function onMapClick(e: MapLayerMouseEvent) {
  console.log(e.lngLat.lat);
  console.log(e.lngLat.lng);
}

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
  const { user } = useUser();

  useEffect(() => {
    setOverlay(overlayData());
    
    refreshPins();
    
    // periodically refresh pins for future
    const interval = setInterval(refreshPins, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshPins = () => {
    listPins()
      .then((data) => {
        console.log("API response:", data);
        
        if (data && data.response_type === "success" && Array.isArray(data.pins)) {
          // convert the pins from the API to the PinData format
          const convertedPins: PinData[] = data.pins.map((pin: any) => {
            console.log("Processing pin:", pin);
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
    
    // add the pin to the API
    addPin(
      user.id,
      newPin.id,
      newPin.location.lat,
      newPin.location.long,
      newPin.timestamp
    )
      .then(() => {
        refreshPins();
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

  return (
    <div className="map-container">
      <div className="map-controls">
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
              className={`map-pin ${pin.userId === user?.id ? 'my-pin' : 'other-pin'}`}
              title={`Pin added by ${pin.userId === user?.id ? 'you' : 'another user'}`}
            >
              📍
            </div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}