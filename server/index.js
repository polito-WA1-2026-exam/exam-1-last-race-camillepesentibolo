// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import {getAllStations, getNetworkLines, getNetworkSetupData, getAllSegments, getAllEvents, createGame, getGame, updateGameResult, getGlobalRanking, getUser } from "./dao.js";
import { check, validationResult } from "express-validator";

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

import {computeDistances} from "./distance_station.js";

// init express
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


passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  
  if(!user)
    //null -> no error, invalid credetials, message
    return cb(null, false, "Incorrect username or password."); // error message in the WWW-Authenticated header of the response
    
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
  console.log(req.user)
  return res.status(401).json({error: "Not authorized"});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));


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


/* ROUTE PUBLIQUE (Accessible sans être connecté) */

// GET /api/ranking -> Récupérer le classement général
app.get("/api/ranking", isLoggedIn, (req, res) => { // 🌟 Ajout de isLoggedIn ici
  getGlobalRanking(req.user.id) // 🌟 On passe l'ID de l'utilisateur connecté au DAO
    .then(ranking => res.json(ranking))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: "Database error while fetching personal ranking." });
    });
});


/* ROUTES DE JEU (Protégées par isLoggedIn) */

// GET /api/network/setup -> Phase 1 : Récupérer la carte du réseau complet
app.get("/api/network/setup", isLoggedIn, async (req, res) => {
  try {
    // 🌟 Appel de la fonction du DAO (pense à vérifier l'import de ton dao tout en haut si besoin)
    const networkData = await getNetworkSetupData(); 
    
    // On renvoie directement le résultat au format JSON
    res.json(networkData);
  } catch (err) {
    console.error("CRASH DANS /api/network/setup :", err);
    res.status(500).json({ error: "Failed to load network setup." });
  }
});


// POST /api/games/start -> Phase 2 : Démarrer une nouvelle partie (génère le départ et l'arrivée)
app.post("/api/games/start", isLoggedIn, async (req, res) => {
  try {
    const stations = await getAllStations();
    const segments = await getAllSegments();

    // LOGIQUE SERVEUR : Choisir deux stations de manière aléatoire
    // (Conseil : implémentez un algorithme simple pour vérifier qu'elles ont bien 3 stations de distance au moins)
    const randomIndex1 = Math.floor(Math.random() * 12); // Choisi nombre de 0 à 12
    const startStation = stations[randomIndex1]; // Choisi une des 12 stations

    const graph = {};
    for (const station of stations) {
      graph[station.name] = [];
    }

    for (const segment of segments) {
      graph[segment.station1].push(segment.station2);
      graph[segment.station2].push(segment.station1);
    }

    const distances = computeDistances(graph, startStation.name);

    const validStations = stations.filter(
      station => distances[station.name] >= 3
    );

    const randomIndex2 = Math.floor(Math.random() * validStations.length);
    const randomStation = validStations[randomIndex];

    const destinationStation = validStations[randomIndex];


    const startTime = Date.now(); // Timestamp actuel côté serveur pour le chrono de 90s

    // Enregistrement de la partie en BDD (score par défaut : 20)
    const gameId = await createGame(req.user.id, startStation.id, destinationStation.id, startTime);

    // Envoi des infos nécessaires au client pour la Phase 2
    res.status(201).json({
      gameId: gameId,
      startStation: startStation.name,
      destinationStation: destinationStation.name,
      stations: stations.map(s => s.name), // Juste la liste simple des noms
      segments: segments // Liste des paires connectées
    });
  } catch (e) {
    res.status(500).json({ error: "Could not start a new game." });
  }
});


// POST /api/games/:id/validate -> Phase 3 & 4 : Soumission et Exécution pas à pas
app.post("/api/games/:id/validate", isLoggedIn, [
  check("route").isArray({ min:1 }).withMessage("Route must be an array of at least 1 pair of stations.")
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const gameId = req.params.id;
  const playerRoute = req.body.route; // Exemple : [3(id_segment),5,9]

  try {

    const game = await getGame(gameId);
    if (game.error || game.userId !== req.user.id || game.status !== 'in_progress') {
      return res.status(404).json({ error: "Game session invalid or already completed." });
    }

    // CONSIGNE DU SUJET : Vérification stricte du compte à rebours de 90 secondes sur le serveur
    const currentTime = Date.now();
    const timeElapsed = (currentTime - game.startTime) / 1000; // En secondes

    if (timeElapsed > 90) {
      // Si le temps est dépassé, score automatique à 0 et échec
      await updateGameResult(gameId, 0, 'completed');
      return res.status(200).json({
        isValid: false,
        reason: "Time limit exceeded! 90 seconds are over.",
        finalScore: 0,
        steps: []
      });
    }

    // LOGIQUE DU JEU : Validation de l'itinéraire et calcul des événements
    // 1. Vérifier si playerRoute[0] correspond à la station de départ du jeu
    // 2. Vérifier si playerRoute[dernier] correspond à la destination
    // 3. Vérifier la validité des segments et des correspondances (interchanges)

    const stations = await getAllStations();
    const segments = await getAllSegments();

    let isRouteValid = true; 

    const RouteStations = playerRoute.map(segmentId => {
      const segment = segments.find(s => s.id === segmentId);
      return segment ? [segment.station1, segment.station2] : [];
    }).flat();  // return ["A", "B", "B", "C"];


    // Remplacez par votre algorithme de vérification
    if (RouteStations[0] !== game.startStationId || RouteStations[RouteStations.length - 1] !== game.destStationId) {
      isRouteValid = false;
      }

    if (RouteStations.length < 2) {
      isRouteValid = false;
    } 
    else {
      for (let i = 1; i < RouteStations.length - 2; i += 2) {
        if (RouteStations[i] !== RouteStations[i + 1]) {
          isRouteValid = false;
        break;
        }
      }
    }

    let currentCoins = 20;
    const steps = [];

    if (!isRouteValid) {
      await dao.updateGameResult(gameId, 0, 'completed');
      return res.status(200).json({ 
        isValid: false, 
        reason: "Invalid metro route layout.", 
        finalScore: 0, 
        steps: [] });
    }

    // Pioche des événements aléatoires pour chaque segment de la route
    const allEvents = await getAllEvents(); // Récupère vos 8+ événements depuis la BDD

    for (let i = 0; i < playerRoute.length - 1; i++) {
      const segmentName = `${playerRoute[i]} -> ${playerRoute[i+1]}`;
      
      // Sélection aléatoire d'un événement
      const randomEvent = allEvents[Math.floor(Math.random() * allEvents.length)];
      
      currentCoins += randomEvent.effect;
      if (currentCoins < 0) currentCoins = 0; // Le score ne peut pas être négatif

      steps.push({
        segment: segmentName,
        eventDescription: randomEvent.description,
        effect: randomEvent.effect,
        currentCoins: currentCoins
      });
    }

    // Sauvegarde du score final dans la base de données
    await updateGameResult(gameId, currentCoins, 'completed');

    // Réponse structurée pour permettre à React de faire l'affichage "étape par étape" requis
    res.status(200).json({
      isValid: true,
      finalScore: currentCoins,
      steps: steps
    });

  } catch (e) {
    res.status(503).json({ error: "Server error during route validation." });
  }
});





// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
