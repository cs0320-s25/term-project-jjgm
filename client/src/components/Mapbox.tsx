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


// mock pin data store to simulate firebase
// obviously replace with real firebase implementation in 5.2
class PinDataStore {
  private static instance: PinDataStore;
  private pins: PinData[] = [];

  private constructor() {
    // attempt to load pins from localStorage for persistence between page reloads
    const savedPins = localStorage.getItem("mapPins");
    if (savedPins) {
      try {
        this.pins = JSON.parse(savedPins);
      } catch (e) {
        console.error("(!) failed to parse saved pins", e);
        this.pins = [];
      }
    }
  }

  public static getInstance(): PinDataStore {
    if (!PinDataStore.instance) {
      PinDataStore.instance = new PinDataStore();
    }
    return PinDataStore.instance;
  }

  public getAllPins(): PinData[] {
    return [...this.pins];
  }

  public addPin(pin: PinData): void {
    this.pins.push(pin);
    this.savePins();
  }

  public clearUserPins(userId: string): void {
    this.pins = this.pins.filter((pin) => pin.userId !== userId);
    this.savePins();
  }

  private savePins(): void {
    // save pins to localStorage for persistence
    localStorage.setItem("mapPins", JSON.stringify(this.pins));
  }
}



// TODO: MAPS PART 1:
// - fill out starting map state and add to viewState
//
// const ProvidenceLatLong: LatLong = {
//   ...
// };
// const initialZoom = ...
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

  // TODO: MAPS PART 5:
  // - add the overlay useState
  // - implement the useEffect to fetch the overlay data
 const [overlay, setOverlay] = useState<GeoJSON.FeatureCollection | undefined>(
   undefined
 );

 const [pins, setPins] = useState<PinData[]>([]);
  const { user } = useUser();
  const pinStore = PinDataStore.getInstance();

  useEffect(() => {
    setOverlay(overlayData());
    
    refreshPins();
    
    // periodically refresh pins for future
    const interval = setInterval(refreshPins, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshPins = () => {
    setPins(pinStore.getAllPins());
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
    
    pinStore.addPin(newPin);
    refreshPins();
  };

  const handleClearMyPins = () => {
    if (!user) return;
    
    pinStore.clearUserPins(user.id);
    refreshPins();
  };



  useEffect(() => {
    setOverlay(overlayData());
  }, []);

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