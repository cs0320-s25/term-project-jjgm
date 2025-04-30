import { useState } from "react";
import SongsGame from "./SongsGame";
import Mapbox from "./Mapbox";
import "../styles/MapStyles.css";

enum Section {
  SONGS_GAME = "SONGS_GAME",
  MAP_DEMO = "MAP_DEMO",
}

export default function MapsGearup() {
  const [section, setSection] = useState<Section>(Section.SONGS_GAME);

  return (
    <div className="beatmap-container">
      <h1 className="beatmap-title" aria-label="Gearup Title">BeatMap</h1>
      <div className="beatmap-nav">
        <button 
          className={section === Section.SONGS_GAME ? "active" : ""} 
          onClick={() => setSection(Section.SONGS_GAME)}
        >
          GUESS SONGS
        </button>
        <button 
          className={section === Section.MAP_DEMO ? "active" : ""} 
          onClick={() => setSection(Section.MAP_DEMO)}
        >
          BEATMAP
        </button>
      </div>
      {section === Section.SONGS_GAME ? <SongsGame /> : null}
      {section === Section.MAP_DEMO ? <Mapbox /> : null}
    </div>
  );
}