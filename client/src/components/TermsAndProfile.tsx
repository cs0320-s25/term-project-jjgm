import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { saveUserProfile } from "../utils/api";

export default function TermsAndProfile({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const { user } = useUser();
  const [nickname, setNickname] = useState("");
  const [dorm, setDorm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async () => {
    if (!user || !nickname || !dorm || !acceptedTerms) return;

    try {
      setSaving(true);
      await saveUserProfile(user.id, { nickname, dorm });
      console.log("Profile saved successfully");
      onComplete(); // Notify parent component that profile is saved
     
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="terms-and-profile">
      <h2>Terms and Conditions</h2>
      <p>Please accept the terms and conditions to proceed.</p>
      <label>
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
        />
        I accept the terms and conditions
      </label>

      <h2>User Profile</h2>
      <input
        type="text"
        placeholder="Enter your Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
      />
      <input
        type="text"
        placeholder="Dorm"
        value={dorm}
        onChange={(e) => setDorm(e.target.value)}
      />
      <button
        onClick={handleProfileSave}
        disabled={!nickname || !dorm || !acceptedTerms || saving}
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
