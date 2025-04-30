import { useEffect, useState } from "react";
import { guessSong, clearUser, getSong } from "../utils/api";
import { useUser } from "@clerk/clerk-react";

export default function SongsGame() {
  const [words, setWords] = useState<string[]>([]);
  const { user } = useUser();

  if (!user) {
    return <div>Loading...</div>;
  }

  const USER_ID = user.id;

  useEffect(() => {
  }, [USER_ID]);

  return (
    <div className="songs-game">
      <h2>Guess Songs</h2>
      <label htmlFor="new-word">Enter Song Name:</label>
      <input aria-label="song-name-input" id="new-word" type="text" placeholder="Type a song title here..." />
      <div>
        <button
          aria-label="submit-guess-button"
          onClick={() => {
            // do shit here
          }}
        >
          Submit
        </button>
        <button
          onClick={async () => {
            await clearUser(USER_ID);
          }}
        >
          Skip
        </button>
      </div>

      <p>
        <i aria-label="user-header">Category: (Placeholder)</i>
      </p>
    </div>
  );
}