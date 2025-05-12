# Project Details
BEATMAP -- CSCI0320 Final Project

CS Logins: gmusk, jforlemu04, jukegbu1, msarias

Link to github repo: https://github.com/cs0320-s25/term-project-jjgm.git


# Design Choices

Frontend Game: 
--> Instead of allowing immediate guesses, the game requires users to press “Play” before submitting on their first attempt. This ensures users engage with the audio and discourages blind guessing.

--> Song audio is capped at 30 seconds, and snippet duration increases with each failed guess (5s, 10s, etc.). This encourages repeated listening and gradual clue-revealing.

--> Tracks already played in a game session are filtered out to prevent repetition. This maintains variety and smooth gameplay across all 5 rounds.

--> The “Switch Genre” button only appears between rounds, allowing users to change categories without disrupting gameplay. This also minimizes clutter during active guessing.

--> Preloaded genre-specific songs by importing JSON files from Deezer, which ensures reliable access without runtime dependency on their API. This catalog doesn't auto-update with Deezer, but guarantees consistent gameplay and prevents unexpected failure during development.

# Errors/Bugs


# Tests
Frontend Game: 


# How to
Start both servers:

Backend ==> In terminal: cd server --> mvn package --> ./run

Frontend ==> In terminal (cd client --> npm install --> npm start)

Open link for localhost 8000 

Tests ==> 

# Collaboration
