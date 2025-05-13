// src/components/Leaderboard/Leaderboard.tsx
import React, { useEffect, useState } from "react";
import { getGlobalLeaderboard, getDormLeaderboard } from "../utils/api";

interface Entry {
  rank: number;
  nickname: string;
  dorm: string;
  score: number;
}

interface LeaderboardProps {
  /**
   * Optional dorm ID for filtering by dorm. If omitted, dorm view is disabled.
   */
  dormId?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ dormId }) => {
  const [view, setView] = useState<"global" | "dorm">("global");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setLoading(true);

    // Decide which fetcher to call based on view and dormId availability
    let fetcher: Promise<any>;
    if (view === "dorm") {
      if (!dormId) {
        // No dorm ID provided, bail out
        setEntries([]);
        setError("Dorm leaderboard unavailable (no dorm ID).");
        setLoading(false);
        return;
      }
      fetcher = getDormLeaderboard(dormId);
    } else {
      fetcher = getGlobalLeaderboard();
    }

    fetcher
      .then((data) => {
        if (!data.entries) {
          throw new Error("Invalid response from server");
        }
        setEntries(data.entries);
      })
      .catch((err) => {
        console.error(err);
        setEntries([]);
        setError("Failed to load leaderboard.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [view, dormId]);

  return (
    <div>
      <h1>
        {view === "global"
          ? "Global Leaderboard"
          : `${dormId} Dorm Leaderboard`}
      </h1>

      {/* Toggle buttons to switch between global and dorm */}
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setView("global")} disabled={view === "global"}>
          Global
        </button>
        <button
          onClick={() => setView("dorm")}
          disabled={view === "dorm" || !dormId}
          style={{ marginLeft: "0.5rem" }}
        >
          Dorm
        </button>
      </div>

      {/* Loading, error, and data table */}
      {loading ? (
        <div>Loading leaderboard...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Nickname</th>
              <th>Dorm</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.rank}>
                <td>{entry.rank}</td>
                <td>{entry.nickname}</td>
                <td>{entry.dorm}</td>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;
