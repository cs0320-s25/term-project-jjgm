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

  // Combined Keeny and New Pem. Also using "slang" terms and not full names
  const dormOptions = [
    "Off-Campus",
    "Andrews",
    "Barbour",
    "Buxton",
    "Caswell",
    "Chapman",
    "Chen",
    "Danoff",
    "Dinman",
    "Em-Wool",
    "Goddard",
    "Grad",
    "Harambee",
    "Harkness",
    "Hegeman",
    "Hope",
    "Keeney",
    "King",
    "Littlefield",
    "Machado",
    "Marcy",
    "Metcalf",
    "Miller",
    "Minden",
    "Mo-Champ",
    "New Pem",
    "Olney",
    "Perkins",
    "Sears",
    "Slater",
    "Wayland",
    "Wellness",
    "West",
    "Young O",
    "111 Brown St",
    "219 Bowen St",
  ];

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
      <select value={dorm} onChange={(e) => setDorm(e.target.value)}>
        <option value="">Select your dorm</option>
        {dormOptions.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <button
        onClick={handleProfileSave}
        disabled={!nickname || !dorm || !acceptedTerms || saving}
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
