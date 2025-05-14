import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { Section } from "../BeatmapSections"; // make sure you import the enum
import { useSongGameLogic } from "./SongsGameLogic";
import { getUserPoints, getDormPoints } from "../../utils/api";

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
    gamesPlayedToday,
    audioRef,
  } = useSongGameLogic(genre);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});
  const [dormPoints, setDormPoints] = useState<Record<string, number>>({});
  const { user } = useUser();

  const maxAttempts = 5;
  const maxRounds = 5;
  const maxGamesPerDay = 5;

  // Fetch user profile, points, and dorm points
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // Get user profile from localStorage (since we already have it from login)
        const profileJson = localStorage.getItem(`userProfile_${user.id}`);
        if (profileJson) {
          const profile = JSON.parse(profileJson);
          setUserProfile(profile);
          
          // Fetch user points
          const pointsResult = await getUserPoints(user.id);
          if (pointsResult && pointsResult.response_type === "success") {
            setUserPoints(pointsResult.points || {});
          }
          
          // Fetch dorm points if profile has a dorm
          if (profile && profile.dorm) {
            const dormResult = await getDormPoints(profile.dorm);
            if (dormResult && dormResult.response_type === "success") {
              setDormPoints(dormResult.points || {});
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchUserData();
  }, [user]);

  if (gameOver) {
    const userNickname = userProfile?.nickname || "Player";
    const userDorm = userProfile?.dorm || "your dorm";
    const totalGenrePoints = userPoints[genre] || 0;
    const dormGenrePoints = dormPoints[genre] || 0;
    
    return (
      <div className="game-over">
        <h2>🎉 Game Complete!</h2>
        <p>
          <strong>Your Score:</strong> {score} out of {maxRounds * 100}
        </p>
        <p>
          <strong>Congrats {userNickname}!</strong>
        </p>
        <p>
          <strong>
            You earned {score} {genre} points for {userDorm} today.
          </strong>
        </p>
        <p>
          <strong>Your total {genre} points: {totalGenrePoints}</strong>
        </p>
        <p>
          <strong>{userDorm}'s total {genre} points: {dormGenrePoints}</strong>
        </p>
        
        {gamesPlayedToday !== null && (
          <p>
            <strong>
              Games played today: {gamesPlayedToday} / {maxGamesPerDay}
            </strong>
            {gamesPlayedToday >= maxGamesPerDay ? (
              <span> (Daily limit reached)</span>
            ) : (
              <span> (You can play {maxGamesPerDay - gamesPlayedToday} more games today)</span>
            )}
          </p>
        )}
        
        <div className="game-over-buttons">
          {gamesPlayedToday !== null && gamesPlayedToday < maxGamesPerDay && (
            <button onClick={() => setSection(Section.GENRE_SELECT)}>
              Play Again
            </button>
          )}
          <button onClick={() => setSection(Section.MAP_DEMO)}>
            Go to BeatMap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="songs-game">
      <h2>Guess Songs</h2>
      
      {gamesPlayedToday !== null && (
        <div className="games-played-info">
          <p>
            <strong>Games played today:</strong> {gamesPlayedToday} / {maxGamesPerDay}
          </p>
        </div>
      )}
      
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
        <strong>Category:</strong> {genre}
      </p>
      
      {/* Display user's total points for this genre */}
      {userPoints && userPoints[genre] !== undefined && (
        <p>
          <strong>Your total {genre} points:</strong> {userPoints[genre]}
        </p>
      )}
      
      {/* Display user's dorm's total points for this genre */}
      {userProfile && userProfile.dorm && dormPoints && dormPoints[genre] !== undefined && (
        <p>
          <strong>{userProfile.dorm}'s total {genre} points:</strong> {dormPoints[genre]}
        </p>
      )}
      
      {/* For debugging only, remove before deployment */}
      {/* <p>
        <strong>Now playing:</strong> {currentTrack?.title} by{" "}
        {currentTrack?.artist}
      </p> */}
    </div>
  );
}