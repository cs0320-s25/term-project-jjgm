import { useEffect, useState } from "react";
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
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null); // audio element
  
  const maxAttempts = 5;
  const snippetLength = 5; // seconds
  const scoreByAttempt = [100, 80, 60, 40, 20];
  

  useEffect(() => {
    import(`../catalog/${genre}.json`).then((mod) => {
      const allTracks = mod.default;
      setTracks(allTracks);
      const random = allTracks[Math.floor(Math.random() * allTracks.length)];
      setCurrentTrack(random);
      const audioInstance = new Audio(random.preview_url);
      setAudio(audioInstance);
      setAttempts(0);
      setInput("");
      setFeedback("");
    });
  }, [genre]);

  //  will be useful later for user tracking
  // if (!user) {
  //   return <div>Loading...</div>;
  // }

  // const USER_ID = user.id;

  // useEffect(() => {
  // }, [USER_ID]);

  return (
    <div className="songs-game">
      <h2>Guess Songs</h2>
      <label htmlFor="new-word">Enter Song Name:</label>
      <input aria-label="song-name-input" id="new-word" type="text" placeholder="Type a song title here..." />
      <div>
        <button
          aria-label="submit-guess-button"
          onClick={() => {
            if (!currentTrack) return;

            const correct = currentTrack.title.toLowerCase().includes(input.toLowerCase());
          
            if (correct) {
              const earned = scoreByAttempt[attempts];
              setScore(score + earned);
              setFeedback(`🔥 Correct! You earned ${earned} heats`);
              audio?.pause();
            } else {
              const newAttempts = attempts + 1;
              setAttempts(newAttempts);
          
              if (newAttempts >= maxAttempts) {
                setFeedback(`Out of tries! The answer was "${currentTrack.title}"`);
              } else {
                setFeedback(`Try again... (${maxAttempts - newAttempts} attempts left)`);
                audio?.pause();
                const newAudio = new Audio(currentTrack.preview_url);
                newAudio.currentTime = 0;
                newAudio.play();
                setAudio(newAudio);
              }
            }         
          }}
        >
          Submit
        </button>
        <button
          // onClick={async () => {
          //   await clearUser(USER_ID);
          // }}
        >
          Skip
        </button>
      </div>

      <p><strong>Score:</strong> {score}</p>
      <p><strong>Response:</strong> {feedback}</p>
      <p><strong>Attempts:</strong> {attempts} / {maxAttempts}</p>
      <p><strong>Now playing:</strong> {currentTrack?.title} by {currentTrack?.artist}</p>
      <p>
        <i aria-label="user-header"><strong>Category: {genre}</strong></i>
      </p>
    </div>
  );
}