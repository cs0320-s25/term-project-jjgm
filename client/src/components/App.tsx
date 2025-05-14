import { initializeApp } from "firebase/app";
import "../styles/App.css";
import MapsGearup from "./BeatmapSections";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import TermsAndProfile from "./TermsAndProfile";
import { getUserPoints, getUserProfile } from "../utils/api";
import Leaderboard from "./Leaderboard";

// Firebase config
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

initializeApp(firebaseConfig);

function App() {
  const { user } = useUser();
  const [hasProfile, setHasProfile] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [userPointsInfo, setUserPointsInfo] = useState<any>(null);
  const [userDorm, setUserDorm] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const profile = await getUserProfile(user.id);
        console.log("Fetched profile:", profile);

        // Check both existence and non-empty values
        if (
          profile &&
          typeof profile.nickname === "string" &&
          profile.nickname.trim() !== "" &&
          typeof profile.dorm === "string" &&
          profile.dorm.trim() !== ""
        ) {
          setHasProfile(true);
          setNickname(profile.nickname);
          setUserDorm(profile.dorm);
          
          // Store profile in localStorage for easy access in other components
          localStorage.setItem(`userProfile_${user.id}`, JSON.stringify(profile));
        } else {
          setHasProfile(false);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setHasProfile(false);
      } finally {
        setProfileLoaded(true);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // Fetch user points info (including games played today)
  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user || !hasProfile) return;
      
      try {
        const pointsInfo = await getUserPoints(user.id);
        if (pointsInfo && pointsInfo.response_type === "success") {
          setUserPointsInfo(pointsInfo);
        }
      } catch (error) {
        console.error("Failed to fetch user points:", error);
      }
    };
    
    fetchUserPoints();
  }, [user, hasProfile]);

  return (
    <div className="App">
      {/* Show background landing page with sign in button before anything else */}
      <SignedOut>
        <div className="landing-page">
          <div className="sign-in-wrapper">
            <SignInButton mode="modal" />
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {!profileLoaded ? (
          // Wait for profile check
          <div className="landing-page" />
        ) : !hasProfile ? (
          // Show terms and profile creation if not yet completed
          <TermsAndProfile onComplete={() => setHasProfile(true)} />
        ) : (
          // Show main app
          <div className="main-page">
            <div className="nickname-banner">
              {nickname ? (
                <div>
                  <span>Welcome, {nickname}!</span>
                  {userPointsInfo && userPointsInfo.games_remaining_today !== undefined && (
                    <span className="games-remaining">
                      Games remaining today: {userPointsInfo.games_remaining_today}
                    </span>
                  )}
                </div>
              ) : ""}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignContent: "center",
                padding: "10px",
                gap: "10px",
              }}
            >
              <SignOutButton />
              <UserButton />
            </div>
            <MapsGearup />
            {/**leaderboard below map */}
            {userDorm && <Leaderboard dormId={userDorm} />}
          </div>
        )}
        <SignOutButton />
      </SignedIn>
    </div>
  );
}

export default App;