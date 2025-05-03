import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { saveUserProfile } from "../utils/api";

export default function TermsAndProfile({onComplete }: {onComplete: () => void}) {
    const { user } = useUser();
    const [nickname, setNickname] = useState("");
    const [dorm, setDorm] = useState("");
    const[accpetedTerms, setAcceptedTerms] = useState(false);

    const handleProfileSave = async () => {
        if(!user || !nickname|| !dorm|| !accpetedTerms ) return;

        try{
            await saveUserProfile(user.id, { nickname, dorm });
            onComplete(); // Call the onComplete function to indicate that the profile has been saved
        } catch (error) {
            console.error("Error saving profile:", error);
        }
    };

    return (
        <div className="terms-and-profile">
            <h2>Terms and Conditions</h2>
            <p>Please accept the terms and conditions to proceed.</p>
            <input
                type="checkbox"
                checked={accpetedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label>I accept the terms and conditions</label>

            <h2>User Profile</h2>
            <input
                type="text"
                placeholder=" Enter your Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />
            <input
                type="text"
                placeholder="Dorm"
                value={dorm}
                onChange={(e) => setDorm(e.target.value)}
            />
            <button onClick={handleProfileSave}>Save Profile</button>
        </div>
    );
}