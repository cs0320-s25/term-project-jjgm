import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { saveUserProfile } from "../utils/api";

export default function ProfilePage({
  onComplete, onExit,
}: {
  onComplete: () => void; onExit?: () => void;
}) {
  const { user } = useUser();
  const [nickname, setNickname] = useState("");
  const [dorm, setDorm] = useState("");
  //   const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [saving, setSaving] = useState(false);

  // Combined Keeny and New Pem. Also using "slang" terms and not full names
  const dormOptions = [
    "Off-Campus",
    "Andrews",
    "Barbour",
    "Buxton",
    "Caswell",
    "Chen",
    "Danoff",
    "Em-Wool",
    "Goddard",
    "Grad",
    "Harambee",
    "Harkness",
    "Hegeman",
    "Keeney",
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
    "Young O",
    "111 Brown St",
    "219 Bowen St",
  ];

  const handleProfileSave = async () => {
    if (!user || !nickname || !dorm) return;

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
    <div className="profile-page-wrapper">
      <div className="profile-card">
        <h2>👤 Set Up Your Profile</h2>
        <h3> If you have already created your profile click Exit</h3>

        <label>Nickname</label>
        <input
          type="text"
          placeholder="Enter your Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        <label>Dorm</label>
        <select value={dorm} onChange={(e) => setDorm(e.target.value)}>
          <option value="">Select your dorm</option>
          {dormOptions.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="profile-buttons">
          <button
            className="primary-btn"
            onClick={handleProfileSave}
            disabled={!nickname || !dorm || saving}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {onExit && (
            <button className="secondary-btn" onClick={onExit}>
              Exit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}