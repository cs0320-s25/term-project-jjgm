import { useState } from "react";
import SongsGame from "./SongsGame";
import Mapbox from "./Mapbox";
import "../styles/MapStyles.css";

enum Section {
  SONGS_GAME = "SONGS_GAME",
  MAP_DEMO = "MAP_DEMO",
}

export default function BeatmapSelections() {
  const [section, setSection] = useState<Section | null>(null);
  const [genre, setGenre] = useState<string>("");

  const genreOptions = [
    { label: "Pop", value: "pop" },
    { label: "90s RnB", value: "rnb" },
    { label: "Hip-Hop/Rap", value: "hiphop" },
    { label: "Afrobeats", value: "afrobeats" },
    { label: "Country", value: "country" },
  ];

  const handleGenreChange = (g: string) => {
    setGenre(g);
    setSection(Section.SONGS_GAME);
  };

  return (
    <div className="beatmap-container">
      <h1 className="beatmap-title" aria-label="Gearup Title">
        BeatMap
      </h1>
      <div className="beatmap-nav">
        <button>GUESS SONGS</button>
        <button
          className={section === Section.MAP_DEMO ? "active" : ""}
          onClick={() => setSection(Section.MAP_DEMO)}
        >
          BEATMAP
        </button>
      </div>

      {/* Genre selection modal overlay */}
      {section === null && (
        <div className="genre-overlay">
          <div className="genre-modal">
            <h3>What genre would you like to play?</h3>
            {genreOptions.map((g) => (
              <button key={g.value} onClick={() => handleGenreChange(g.value)}>
                {g.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {section === Section.SONGS_GAME ? <SongsGame genre={genre} /> : null}
      {section === Section.MAP_DEMO ? <Mapbox /> : null}
    </div>
  );
}
