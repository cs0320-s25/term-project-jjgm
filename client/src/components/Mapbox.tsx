import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import Map, {
  Layer,
  MapLayerMouseEvent,
  Source,
  ViewStateChangeEvent,
} from "react-map-gl";
import { geoLayer, overlayData } from "../utils/overlay";

const MAPBOX_API_KEY = process.env.MAPBOX_TOKEN;
if (!MAPBOX_API_KEY) {
  console.error("Mapbox API key not found. Please add it to your .env file.");
}

export interface LatLong {
  lat: number;
  long: number;
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

 useEffect(() => {
   setOverlay(overlayData());
 }, []);


  return (
    <div className="map">
      <Map
        mapboxAccessToken={MAPBOX_API_KEY}
        {...viewState}
        // TODO: MAPS PART 2:
        // - add the primary props to the Map (style, mapStyle, onMove).

        style={{ width: window.innerWidth, height: window.innerHeight }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onMove={(ev: ViewStateChangeEvent) => setViewState(ev.viewState)}
        // TODO: MAPS PART 3:
        // - add the onClick handler

        onClick={(ev: MapLayerMouseEvent) => onMapClick(ev)}
      >
        
        <Source id="geo_data" type="geojson" data={overlay}>
           <Layer {...geoLayer} />
        </Source>
      </Map>
    </div>
  );
}