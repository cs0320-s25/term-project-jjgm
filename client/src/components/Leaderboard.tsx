import { useEffect, useState } from "react";
import { getDormLeaderboard, getGlobalLeaderboard } from "../utils/api";

interface Entry {
    rank: number;
    nickname: string;
    dorm: string;
    score: number;
    contribution?: number;
}

interface Props {
    /** curr user dorm or undefined if none */
    dormId?: string;
}

const Leaderboard: React.FC<Props> = ({dormId}) => {
    const [view, setView] = useState<'global' | 'dorm'>('global')
    const [entries, setEntries] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
      setLoading(true);
      setError(null);

      // when trying to view dorm but no dormId, bail out
      if (view === "dorm" && !dormId) {
        setEntries([]);
        setError("No dorm selected.");
        setLoading(false);
        return;
      }
      const fetcher =
        view == "dorm" && dormId
          ? getDormLeaderboard(dormId)
          : getGlobalLeaderboard();

      fetcher
        .then((data) => {
          //if data entries missing, default to empty array
          setEntries(Array.isArray(data.entries) ? data.entries : []);
        })
        .catch(() => {
          setError("Could not load leaderboard.");
          setEntries([]);
        })
        .finally(() => setLoading(false));
    }, [view, dormId]);
    

    return (
      <div className="leaderboard-container">
        <h2 className="leaderboard-title">
          {view === "global"
            ? "🌎 Global Leaderboard"
            : `🏠 ${dormId} Dorm Leaderboard`}
        </h2>

        <div className="leaderboard-buttons">
          <button
            className={`leaderboard-btn ${view === "global" ? "active" : ""}`}
            onClick={() => setView("global")}
            disabled={view === "global"}
          >
            Global
          </button>
          <button
            className={`leaderboard-btn ${view === "dorm" ? "active" : ""}`}
            onClick={() => setView("dorm")}
            disabled={view === "dorm" || !dormId}
          >
            Dorm
          </button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Nickname</th>
                <th>Dorm</th>
                <th>Score</th>
                {view === "dorm" && <th>Contribution</th>}
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.rank}>
                  <td>{e.rank}</td>
                  <td>{e.nickname}</td>
                  <td>{e.dorm}</td>
                  <td>{e.score}</td>
                  {view === "dorm" && <td>{e.contribution ?? 0}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );


};
export default Leaderboard