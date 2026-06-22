// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import {getAllStations, getNetworkSetupData, getAllSegments, getAllEvents, createGame, getGame, updateGameResult, getGlobalRanking, getUser } from "./dao.js";
import { check, validationResult } from "express-validator";

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

import {computeDistances} from "./distance_station.js";

// init
const app = new express();
const port = 3001;

// middlewares
app.use(express.json());
app.use(morgan("dev"));

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true
};
app.use(cors(corsOptions))

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.authenticate("session"));


passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  
  if(!user)
    //null -> no error, invalid credetials, message
    return cb(null, false, "Incorrect username or password."); 
    
  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: "Not authorized"});
}



/* ROUTES */

// POST /api/sessions
app.post("/api/sessions", passport.authenticate("local"), function(req, res) {
  return res.status(201).json(req.user);
});

// GET /api/sessions/current
app.get("/api/sessions/current", (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: "Not authenticated"});
});

// DELETE /api/session/current
app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});


// ROUTE PUBLIC (without connection)

// GET /api/ranking  (get ranking)
app.get("/api/ranking", isLoggedIn, (req, res) => {
  getGlobalRanking(req.user.id)
    .then(ranking => res.json(ranking))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database error while fetching personal ranking" });
    });
});


/* ROUTES FOR GAMES (protect by isLoggedIn) */

// GET /api/network/setup (get all network map)
app.get("/api/network/setup", isLoggedIn, async (req, res) => {
  try {
    const networkData = await getNetworkSetupData(); 
    
    res.json(networkData);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load network setup." });
  }
});


// POST /api/games/start (Start new game with start and end station)
app.post("/api/games/start", isLoggedIn, async (req, res) => {
  try {
    const stations = await getAllStations();
    const segments = await getAllSegments();

    if (!stations || stations.length === 0) {
      return res.status(400).json({ error: "Aucune station disponible." });
    }

    // Random choice of the starting station
    const randomIndex1 = Math.floor(Math.random() * stations.length);
    const startStation = stations[randomIndex1];

    // Build the graph of all stations
    const graph = {};
    for (const station of stations) {
      graph[station.name] = [];
    }

    for (const segment of segments) {
      if (graph[segment.station1] && graph[segment.station2]) {
        graph[segment.station1].push(segment.station2);
        graph[segment.station2].push(segment.station1);
      }
    }

    // Calcul distances
    const distances = computeDistances(graph, startStation.name);

    // Distance min = 3
    const validStations = stations.filter(
      station => distances[station.name] !== undefined && distances[station.name] >= 4
    );

    /*
    // Sécurité au cas où le réseau serait fragmenté ou trop petit durant les tests
    if (validStations.length === 0) {
      console.warn("⚠️ Aucune station à distance >= 4. Sélection d'une station par défaut.");
      const fallbackStations = stations.filter(s => s.id !== startStation.id);
      validStations.push(...fallbackStations);
    }
    */

    // Choice of the end station
    const randomIndex2 = Math.floor(Math.random() * validStations.length);
    const destinationStation = validStations[randomIndex2];

    const startTime = Date.now();

    // Saving the game to the database
    const gameId = await createGame(req.user.id, startStation.id, destinationStation.id, startTime);

    // Send info for phase2
    res.status(201).json({
      gameId: gameId,
      startStation: startStation.name,
      destinationStation: destinationStation.name,
      stations: stations.map(s => s.name),
      segments: segments
    });
  } catch (e) {
    console.error("crash phase1");
    res.status(500).json({ error: "Could not start a new game" });
  }
});

// Validate the route
app.post("/api/games/:id/validate", isLoggedIn, [
  check("route").isArray({ min: 1 }).withMessage("Route must be an array of at least 1 segment")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const gameId = req.params.id;
  const playerRoute = req.body.route; 

  try {
    const game = await getGame(gameId);

    if (!game || game.error || game.userId !== req.user.id || game.status !== 'in_progress') {
      return res.status(404).json({ error: "Game session invalid or already completed" });
    }

    const currentTime = Date.now();
    const timeElapsed = (currentTime - game.startTime) / 1000;

    if (timeElapsed > 90) {
      await updateGameResult(gameId, 0, 'completed');
      return res.status(200).json({
        isValid: false,
        reason: "Time's up. The 90 seconds are over.",
        finalScore: 0,
        steps: []
      });
    }

    const stations = await getAllStations();
    
    const startStationObj = stations.find(s => s.id === game.startStationId);
    const destStationObj = stations.find(s => s.id === game.destStationId);
    
    if (!startStationObj || !destStationObj) {
      return res.status(500).json({ error: "Stations de référence introuvables." });
    }

    // Build the graph with the segments/stations that the player choose
    const graph = {};
    
    for (const seg of playerRoute) {
      if (!seg.station1 || !seg.station2) continue;
      
      if (!graph[seg.station1]) graph[seg.station1] = [];
      if (!graph[seg.station2]) graph[seg.station2] = [];
      
      graph[seg.station1].push(seg.station2);
      graph[seg.station2].push(seg.station1);
    }

    const startName = startStationObj.name;
    const destName = destStationObj.name;

    // Verification if route = valid
    let isRouteValid = true;
    const routeStations = [];
    
    let currentStation = startName; // start with the start station
    routeStations.push(currentStation);

    while (currentStation !== destName) {    // we go station to station until the destination
      const neighbors = graph[currentStation] || [];
      const nextStation = neighbors.find(neighbor => !routeStations.includes(neighbor)); // find neighbors station note visited
      
      if (!nextStation) {
        isRouteValid = false;
        break;
      }
      
      routeStations.push(nextStation);
      currentStation = nextStation;

      if (routeStations.length > playerRoute.length + 1) {   // anti infinity loop
        isRouteValid = false;
        break;
      }
    }

    if (isRouteValid && routeStations.length !== playerRoute.length + 1) { //we don't want the player to send more segments
      isRouteValid = false;
    }

    if (!isRouteValid || playerRoute.length === 0) {
      await updateGameResult(gameId, 0, 'completed');
      return res.status(200).json({ 
        isValid: false, 
        reason: "Invalid or interrupted route (stations do not follow each other or do not reach the destination)", 
        finalScore: 0, 
        steps: [] 
      });
    }

    let currentCoins = 20;
    const steps = [];
    const allEvents = await getAllEvents();

    for (let i = 0; i < playerRoute.length; i++) {
      const seg = playerRoute[i];
      const randomEvent = allEvents[Math.floor(Math.random() * allEvents.length)];
      
      currentCoins += randomEvent.effect;
      if (currentCoins < 0) currentCoins = 0; 

      steps.push({
        segment: `${seg.station1} ⇄ ${seg.station2}`,
        eventDescription: randomEvent.description,
        effect: randomEvent.effect,
        currentCoins: currentCoins
      });
    }

    await updateGameResult(gameId, currentCoins, 'completed');

    res.status(200).json({
      isValid: true,
      finalScore: currentCoins,
      steps: steps
    });

  } catch (e) {
    console.error(e);
    res.status(503).json({ error: "Server error during route validation." });
  }
});


// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
