import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { updatePoints, getUserPoints } from "../../utils/api";
import pop from "../../catalog/pop.json";
import rnb from "../../catalog/rnb.json";
import afrobeats from "../../catalog/afrobeats.json";
import hiphop from "../../catalog/hiphop.json";
import country from "../../catalog/country.json";

const genreMap: Record<string, any[]> = {
  pop,
  rnb,
  afrobeats,
  hiphop,
  country,
};

export function useSongGameLogic(genre: string) {
  // states
  const [tracks, setTracks] = useState<any[]>([]);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const [input, setInput] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [roundComplete, setRoundComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playedTrackIds, setPlayedTrackIds] = useState<number[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [gamesPlayedToday, setGamesPlayedToday] = useState<number | null>(null);
  const [pointSaved, setPointSaved] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useUser();

  const maxAttempts = 5;
  const maxRounds = 5;
  const scoreByAttempt = [100, 80, 60, 40, 20];

  // find the trackID of the current track
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

  // Guess submission logic
  const nextRound = () => {
    if (round >= maxRounds) {
      setGameOver(true);
      return;
    }

    const availableTracks = tracks.filter(
      (track) => !playedTrackIds.includes(track.trackID)
    );

    if (availableTracks.length === 0) {
      // hopefully never triggered
      setFeedback("All songs used!");
      setGameOver(true);
      return;
    }

    const next =
      availableTracks[Math.floor(Math.random() * availableTracks.length)];
    setPlayedTrackIds((prev) => [...prev, next.trackID]);
    setCurrentTrack(next);
    setInput("");
    setAttempts(0);
    setFeedback("");
    setRound(round + 1);
    setRoundComplete(false);
    setHasPlayed(false);
  };

  // Play the preview with a time limit
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

    setHasPlayed(true);
  };

  // Guess submission logic
  const handleSubmit = async () => {
    // Stop any audio that might be playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!currentTrack) return;

    const userGuess = input.trim().toLowerCase();
    const songTitle = currentTrack.title.trim().toLowerCase();

    const correct = userGuess.length > 0 && songTitle === userGuess;

    if (correct) {
      const earned = scoreByAttempt[attempts];
      setScore(score + earned);
      setFeedback(`🔥 Correct! You earned ${earned} heats`);
      setRoundComplete(true);
      if (round >= maxRounds) {
        setGameOver(true);
      }
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
          setRoundComplete(true);
          setGameOver(true);
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

  // -- SAVE GAINED POINTS TO FIREBASE, UPDATE GAMES PLAYED
  useEffect(() => {
    const savePoints = async () => {
      if (roundComplete && !pointSaved && user && score > 0) {
        try {
          console.log(`Saving ${score} points for user ${user.id} in genre ${genre}`);
          const result = await updatePoints(user.id, genre, score);
          console.log("Points saved:", result);
          setPointSaved(true);
          
          if (result && result.games_played_today) {
            setGamesPlayedToday(result.games_played_today);
          }
        } catch (error) {
          console.error("Error saving points:", error);
        }
      }
    };
    
    savePoints();
  }, [pointSaved, user, score, genre]);

  // -- FETCH # GAMES PLAYED TODAY
  useEffect(() => {
    const fetchGamesPlayedToday = async () => {
      if (user) {
        try {
          const result = await getUserPoints(user.id);
          if (result && result.response_type === "success") {
            setGamesPlayedToday(result.games_played_today || 0);
          }
        } catch (error) {
          console.error("Error fetching games played:", error);
        }
      }
    };
    
    fetchGamesPlayedToday();
  }, [user]);

  useEffect(() => {
    const allTracks = genreMap[genre];
    if (!allTracks) {
      console.error(`Genre "${genre}" not found in genreMap`);
      return;
    }
  
    setTracks(allTracks);
    const first = allTracks[Math.floor(Math.random() * allTracks.length)];
    setPlayedTrackIds([first.trackID]);
    setCurrentTrack(first);
    setAttempts(0);
    setInput("");
    setFeedback("");
    setHasPlayed(false);
    setPointSaved(false);
  }, [genre]);
  
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);
  

  return {
    // state
    tracks,
    currentTrack,
    input,
    attempts,
    feedback,
    score,
    round,
    roundComplete,
    gameOver,
    hasPlayed,
    gamesPlayedToday,
    // setters if needed
    setInput,
    // logic
    handleSubmit,
    nextRound,
    playPreviewWithLimit,
    audioRef,
  };
}