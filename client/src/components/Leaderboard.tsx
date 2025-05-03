import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { getUserProfile } from "../utils/api";

interface Entry {
  rank: number;
  nickname: string;
  dorm: string;
  score: number;
}

export default function Leaderboard() {
  const { user } = useUser();
  const [globalEntries, setGlobalEntries] = useState<Entry[]>([]);
  const [dormEntries, setDormEntries] = useState<Entry[]>([]);
  const [tab, setTab] = useState<"global" | "dorm">("global");
  const [error, setError] = useState<string>("");

  const fetchGlobal = async () => {
    try {
      const r = await fetch("http://localhost:3232/leaderboard/global");
      const d = await r.json();
      if (d.response_type === "success") setGlobalEntries(d.entries);
      else setError(d.error || "Failed to load global leaderboard");
    } catch {
      setError("Error loading global leaderboard");
    }
  };

  const fetchDorm = async (dormId: string) => {
    try {
      const r = await fetch(
        `http://localhost:3232/leaderboard/dorm/${encodeURIComponent(dormId)}`
      );
      const d = await r.json();
      if (d.response_type === "success") setDormEntries(d.entries);
      else setError(d.error || "Failed to load dorm leaderboard");
    } catch {
      setError("Error loading dorm leaderboard");
    }
  };

  useEffect(() => {
    fetchGlobal();
    if (user) {
      getUserProfile(user.id).then((profile) => {
        if (profile?.dorm) fetchDorm(profile.dorm);
      });
    }
    const iv = setInterval(() => {
      fetchGlobal();
      if (user) {
        getUserProfile(user.id).then((profile) => {
          if (profile?.dorm) fetchDorm(profile.dorm);
        });
      }
    }, 5000);
    return () => clearInterval(iv);
  }, [user]);

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  const list = tab === "global" ? globalEntries : dormEntries;

  return (
    <div>
      <h1>Leaderboard</h1>
      <div style={{ marginBottom: "1em" }}>
        <button onClick={() => setTab("global")} disabled={tab === "global"}>
          Global
        </button>
        <button onClick={() => setTab("dorm")} disabled={tab === "dorm"}>
          My Dorm
        </button>
      </div>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Nickname</th>
            <th>Dorm</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {list.map((e) => (
            <tr key={e.rank}>
              <td>{e.rank}</td>
              <td>{e.nickname}</td>
              <td>{e.dorm}</td>
              <td>{e.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
