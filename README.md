# Project Details
BEATMAP -- CSCI0320 Final Project

CS Logins: gmusk, jforlemu04, jukegbu1, msarias

Link to github repo: https://github.com/cs0320-s25/term-project-jjgm.git


# Design Choices
-Used canva to create front cover of the app design
-FireAnimation.tsx and app.css was used to animate fire going behind the game screens after sign up

### User Profile Featurs
- Created two handlers, SaveProfileHandler and GetProfileHandler. These two handlers work together to manage user profile data. A 
user is able to save a nickname and a dorm to the backend which is later retrieved using the users id. Used aoi endpoints to fetch
this information from the backend to use in the front end. 
- Created a profilepage.tsx so that when the user logs in through clerk and it is verified they are a brown student they can
create their nickname and select their dorm which is then saved through saveUserProfile and calls on complete when finished allowinf them to
move on to the game.
- Before the user is able to make a profile they have to accept the terms and conditions that is layed out in TermsPage.tsx
- When all of this is complete, in App.tsx it is checked to make sure that the user accepts the conditions, before they are allowed to go
into the beatmaps game.
-If the user has already crerated a profile, getUserProfile sends a reuquest to the backend to retrieve the user data so that the user
can continue playing with this profile
-Users are also able to go back and view the terms and conditions page or change their nickname and dorm in case they switch dorms in the 
future

### Frontend Game Logic: 
- **“Play before Guess”**  
  Users must click ▶️ Play before their first Submit, ensuring they engage with the audio.  
- **Adaptive Snippets**  
  Each wrong guess increases snippet length (5 s → 10 s → … up to 30 s), giving incremental clues.  
- **Round & Attempt Limits**  
  5 rounds per game, 5 attempts per round, prevents abuse and keeps sessions brisk.  
- **Genre Overlay**  
  A modal prompts for genre at entry; users can switch genres only between rounds to avoid UI clutter.  
- **Preloaded Catalog**  
  JSON files from Deezer are bundled at build time—no runtime API dependency, for reliability.


### Leaderboard Feature  
- **API Endpoints**  
  - `GET /leaderboard/global` → top 10 users by **total** heats earned across all genres  
  - `GET /leaderboard/dorm/:dormId` → top 10 residents by **contribution** in their dorm’s strongest genre  
- **Sorting & Capping**  
  Both boards are sorted descending (highest first) and capped at 10 entries.  
- **Global vs. Dorm Toggle**  
  In the UI, two buttons switch between the global board and the dorm-filtered view.  
- **Persistence**  
  The chosen view (Global or Dorm) and the order of entries persist across navigation (Guess Songs ↔ Beatmap) and full page reloads.  
- **Component Structure**  
  - **`Leaderboard.tsx`** — renders the table and handles button toggle  
  - **`api.ts`** — exposes `getGlobalLeaderboard()` and `getDormLeaderboard(dormId)`  
  - **`FirebaseUtilities.getDormLeaderboard`** — now sorts by `contribution` 

# Errors/Bugs

- **Dorm Board**
    - UI persistence tests occasionally fail unpredictably. I'm unable to consistently replicate the issue, and my attempted fix produces inconsistent results. The situation is particularly confusing because the fix sometimes makes the failing test pass, but also causes the test to fail. I'm uncertain how to proceed given this contradictory behavior. (New) recent design changes broke tests for leaderboards. There was not enough time to get it back up and running before demo. One can see commit where all tests were working before design change, if need be. Should note, leaderboards are not broken themselves, but the structure of the tests no longer aligns with the design of the web app, thus majority can no longer pass.
- **Terms and Conditions**
   - After editing the design of the app for some reason, when creating a new user the terms and conditions page did not pop up. So on sign out the terms being accepted is deleted from local storage. This makes the term page show up after every sign in but the user can still keep their username and dorm info they originally put in by just clicking exit. 


# Tests
Frontend Game: 

### Leaderboard Suite  
#### API handler tests (`tests/e2e/leaderboard.spec.ts`)
- **Global**  
  - returns `response_type: "success"` + non-empty `entries` array  
  - idempotent: two calls yield identical JSON  
  - capped at 10 entries & sorted by `score` descending  
- **Dorm**  
  - returns `response_type: "success"` + `entries` filtered to the requested dorm  
  - idempotent: two calls yield identical JSON  
  - capped at 10 entries, each entry has numeric `contribution`, sorted descending by `contribution`  
- **Error Handling**  
  - unknown endpoints (`/leaderboard/foobar`) return 404

#### UI persistence tests (`tests/e2e/leaderboard.spec.ts`)
- **Global board**  
  - initial load shows ≤ 10 rows, sorted by score  
  - values persist after toggling between Guess Songs ↔ Beatmap  
  - values persist after full page reload  
- **Dorm board**  
  - same persistence checks, after selecting “Dorm” (Issue with this noted above.) 
- **Auth integration**  
  - Clerk login stub via `@clerk/testing/playwright`  
  - uses test account `test@test.com` / `superdupertest123`  

**To run the full suite:**
```bash
npm run test:e2e
```

# How to
Start both servers:

Backend ==> In terminal: cd server --> mvn package --> ./run

Frontend ==> In terminal (cd client --> npm install --> npm start)

Open link for localhost 8000 

# Collaboration
“how to make fire float around” prompt. ChatGPT, 15 May. version, OpenAI, 15 May 2025, chat.openai.com/chat.
- Used OpenAI to figure out how to create design of fire floating in the background and fix other designs on app

“Why is my playwright test showing a .beforeEach() and .describe() error?” prompt. ChatGPT, 13 May. version, OpenAI, 13 May 2025, chat.openai.com/chat.
- OpenAI was used to debug the SongsGame testing file testing file
