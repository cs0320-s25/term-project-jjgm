# Sprint 5.1: Front-End Map

## Project Details

Web app made in React that uses Mapbox for the frontend and Firebase for authentication


### Team Members
-cs login: **nbabayan**

-cs login: **gmusk**


### GitHub Repository
-**URL:** https://github.com/cs0320-s25/maps-griffin-narek.git

## Design Choices

Pin data is currently mocked for simplicity-- however it is able to successfully persist between page reloads. Even though it's not a real database, our PinDataStore uses localStorage so that pins stay visible even after you reload the page. This means every user’s pin is saved and reloaded. We also refresh the pins every few seconds to simulate a live updates.

## Errors/Bugs

None

## Tests

Test for login, test for pin placement, test for clearing pins, test for pin persistence through page reload

## How to

Run the client with "npm start" in client/, run the server with "./run" in server/. The page will spin up on localhost:8000

## Collaboration

None

