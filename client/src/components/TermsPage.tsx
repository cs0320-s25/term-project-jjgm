import { useState } from "react";

export default function TermsPage({onAccepted,readOnly = false,}: {onAccepted: () => void;readOnly?: boolean;}) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="terms-page">
      <div className="terms-card">
        <h2>📜 Terms and Conditions</h2>
        <p>
          Please read and accept the terms and conditions below to continue
          using BeatMaps.
        </p>

        <ul className="terms-list">
          <li>
            We collect your dorm, nickname, and scores to generate community
            stats.
          </li>
          <li>
            Your Brown email is used only for login and is never shown to
            others.
          </li>
          <li>
            All data is used solely within BeatMaps for leaderboards and
            community stats.
          </li>
        </ul>

        {!readOnly && (
          <>
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              I accept the terms and conditions
            </label>
            <button
              className="terms-button"
              onClick={() => {
                localStorage.setItem("TermsAccepted", "true");
                onAccepted();
              }}
              disabled={!accepted}
            >
              Continue
            </button>
          </>
        )}

        {readOnly && (
          <button className="terms-button" onClick={onAccepted}>
            Back to App
          </button>
        )}
      </div>
    </div>
  );
}