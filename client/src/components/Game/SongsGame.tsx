import { useEffect, useState, useRef } from "react";
// import { guessSong, clearUser, getSong } from "../utils/api";
import { useUser } from "@clerk/clerk-react";
import { Section } from "../BeatmapSections"; // make sure you import the enum
import { useSongGameLogic } from "./SongsGameLogic";

export default function SongsGame({
  genre,
  setSection,
}: {
  genre: string;
  setSection: React.Dispatch<React.SetStateAction<Section | null>>;
}) {
  const {
    currentTrack,
    input,
    setInput,
    handleSubmit,
    playPreviewWithLimit,
    nextRound,
    round,
    roundComplete,
    gameOver,
    feedback,
    score,
    attempts,
    hasPlayed,
    audioRef,
  } = useSongGameLogic(genre);

  const maxAttempts = 5;
  const maxRounds = 5;
  const scoreByAttempt = [100, 80, 60, 40, 20];

  //  will be useful later for user tracking
  // if (!user) {
  //   return <div>Loading...</div>;
  // }

  // const USER_ID = user.id;

  // useEffect(() => {
  // }, [USER_ID]);

  if (gameOver) {
    return (
      <div className="game-over">
        <h2>🎉 Game Complete!</h2>
        <p>
          <strong>Your Final Score:</strong> {score} out of {maxRounds * 100}
        </p>
        <p>
          <strong>Congrats (player name)!</strong>
        </p>
        <p>
          <strong>
            You earned {score} {genre} points for (dorm name) today.
          </strong>
        </p>
        <p>
          <strong>Make sure to come back tomorrow!</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="songs-game">
      <h2>Guess Songs</h2>
      <label htmlFor="new-word">Enter Song Name:</label>
      <input
        aria-label="song-name-input"
        id="new-word"
        type="text"
        placeholder="Type a song title here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div>
        {!roundComplete && ( // conditionally show play & submit buttons!
          <>
            <button
              onClick={async () => {
                if (!currentTrack) return;
                const duration = Math.min((attempts + 1) * 5, 30);
                playPreviewWithLimit(currentTrack.trackID, duration);
              }}
            >
              ▶️ Play
            </button>

            <button
              onClick={handleSubmit}
              disabled={attempts === 0 && !hasPlayed && !roundComplete}
              style={{
                opacity:
                  attempts === 0 && !hasPlayed && !roundComplete ? 0.6 : 1,
                cursor:
                  attempts === 0 && !hasPlayed && !roundComplete
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              Submit
            </button>
          </>
        )}

        {roundComplete && round < maxRounds && (
          <button onClick={nextRound}>▶️ Play Next Song</button>
        )}
        {roundComplete && round < maxRounds && (
          <button
            onClick={() => setSection(Section.GENRE_SELECT)}
            style={{ marginLeft: "10px" }}
          >
            🔙 Change Genres
          </button>
        )}
      </div>

      <p>
        <strong>Score:</strong> {score}
      </p>
      <p>
        <strong>Response:</strong> {feedback}
      </p>
      <p>
        <strong>Round:</strong> {round} / {maxRounds}
      </p>
      <p>
        <strong>Attempts:</strong> {attempts} / {maxAttempts}
      </p>
      <p>
        <strong>Now playing:</strong> {currentTrack?.title} by{" "}
        {currentTrack?.artist}
      </p>
      <p>
        <i aria-label="user-header">
          <strong>Category: {genre}</strong>
        </i>
      </p>
    </div>
    // remove "Now Playing:" when all bugs are sorted
  );
}
