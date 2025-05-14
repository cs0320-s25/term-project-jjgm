import { useState } from "react";

export default function TermsPage({ onAccepted }: { onAccepted: () => void }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="terms-page">
      <h2>Terms and Conditions</h2>
      <p>
        Please accept the terms and conditions before continuing. You must agree
        in order to use BeatMaps.
      </p>

      <ul>
        <li>
          We collect your dorm, nickname, and scores to generate community
          stats.
        </li>
        <li>Your Brown email is never shown to others.</li>
        <li>
          All data is only used within BeatMaps for leaderboar, points, and community
          stats.
        </li>
      </ul>

      <label>
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        I accept the terms and conditions
      </label>

      <br />
      <button
        onClick={() => {
          localStorage.setItem("TermsAccepted", "true"); // Store  for later use
          onAccepted(); // Move to the next step (profile)
        }}
        disabled={!accepted}
      >
        Continue
      </button>
    </div>
  );
}
