# Project Details
BEATMAP -- CSCI0320 Final Project

CS Logins: gmusk, jforlemu04, jukegbu1, msarias

Link to github repo: https://github.com/cs0320-s25/term-project-jjgm.git


# Design Choices

##Frontend Game Logic: 
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


### Leaderboard Feature  _(martin)_
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
  - **`FirebaseUtilities.getDormLeaderboard`** — now sorts by `contribution` (Martin’s change)

# Errors/Bugs

- **Dorm Board**
    - UI persistence tests occasionally fail unpredictably. I'm unable to consistently replicate the issue, and my attempted fix produces inconsistent results. The situation is particularly confusing because the fix sometimes makes the failing test pass, but also causes the test to fail. I'm uncertain how to proceed given this contradictory behavior.


# Tests
Frontend Game: 

### Leaderboard Suite  _(martin)_
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
