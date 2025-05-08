import { useEffect, useState, useRef } from "react";
// import { guessSong, clearUser, getSong } from "../utils/api";
import { useUser } from "@clerk/clerk-react";

export default function SongsGame({ genre }: { genre: string }) {
  console.log("🎮 SongsGame loaded");
  const [tracks, setTracks] = useState<any[]>([]); // tracks loaded
  const [currentTrack, setCurrentTrack] = useState<any | null>(null); // current track playing
  const [input, setInput] = useState(""); // user input
  const [attempts, setAttempts] = useState(0); // how many attemps player has left
  const [feedback, setFeedback] = useState(""); // right or wrong feedback
  const [score, setScore] = useState(0); // user score
  const [round, setRound] = useState(1); // Starts at Round 1
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [roundComplete, setRoundComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const maxAttempts = 5;
  const maxRounds = 5;
  const snippetLength = 5; // seconds
  const scoreByAttempt = [100, 80, 60, 40, 20];

  const fetchPreviewUrl = async (trackID: number): Promise<string | null> => {
    try {
      const res = await fetch(`http://localhost:3232/api/track/${trackID}`);
      const data = await res.json();
      return data.preview || null;
    } catch (err) {
      console.error("Error fetching preview URL:", err);
      return null;
    }
  };

  // load genre catalog and pick a random track=
  useEffect(() => {
    import(`../catalog/${genre}.json`).then((mod) => {
      const allTracks = mod.default;
      setTracks(allTracks);
      const random = allTracks[Math.floor(Math.random() * allTracks.length)];
      setCurrentTrack(random);
      setAttempts(0);
      setInput("");
      setFeedback("");
    });
  }, [genre]);

  // Guess submission logic
  const handleSubmit = async () => {
    // Stop any audio that might be playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!currentTrack) return;

    const correct = currentTrack.title
      .toLowerCase()
      .includes(input.toLowerCase());

    if (correct) {
      const earned = scoreByAttempt[attempts];
      setScore(score + earned);
      setFeedback(`🔥 Correct! You earned ${earned} heats`);
      setRoundComplete(true);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= maxAttempts) {
        const message = `Out of tries! The answer was "${currentTrack.title}".`;
        if (round < maxRounds) {
          setFeedback(`${message} Click 'Play Next Song' to continue.`);
          setRoundComplete(true);
        } else {
          setFeedback(`${message} Game Over!`);
          setRoundComplete(true); // YES OR NO???
        }
      } else {
        setFeedback(
          `Try again... (${maxAttempts - newAttempts} attempts left)`
        );
        const duration = Math.min((attempts + 1) * 5, 30);
        playPreviewWithLimit(currentTrack.trackID, duration);
      }
    }
  };

  const nextRound = () => {
    if (round >= maxRounds) {
      setGameOver(true);
      return;
    }

    const next = tracks[Math.floor(Math.random() * tracks.length)];
    setCurrentTrack(next);
    setInput("");
    setAttempts(0);
    setFeedback("");
    setRound(round + 1);
    setRoundComplete(false);
  };

  const playPreviewWithLimit = async (trackID: number, seconds: number) => {
    const previewUrl = await fetchPreviewUrl(trackID);
    if (!previewUrl) {
      setFeedback("⚠️ Preview not available.");
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(previewUrl);
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.error("Playback error:", err);
    });

    // Stop playback after `seconds`
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, seconds * 1000);
  };

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
          <strong>
            (player name), you earned {score} {genre} points for (dorm name)
            today. Make sure to come back tomorrow!
          </strong>
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
        <button
          onClick={async () => {
            if (!currentTrack) return;
            const duration = Math.min((attempts + 1) * 5, 30); // 5s, 10s, 15s, ... max 30s
            playPreviewWithLimit(currentTrack.trackID, duration);
          }}
        >
          ▶️ Play
        </button>

        <button onClick={handleSubmit}>Submit</button>
        {roundComplete && round < maxRounds && (
          <button onClick={nextRound}>▶️ Play Next Song</button>
        )}
      </div>

      <p><strong>Score:</strong> {score}</p>
      <p><strong>Response:</strong> {feedback}</p>
      <p><strong>Round:</strong> {round} / {maxRounds}</p>
      <p><strong>Attempts:</strong> {attempts} / {maxAttempts}</p>
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
