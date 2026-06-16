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

// 3. Configuration des SESSIONS (Doit être AVANT Passport et AVANT tes logs de routes)
app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));

// 4. Ton middleware de Log personnalisé (Maintenant il verra les sessions !)
app.use((req, res, next) => {
  console.log(`📡 [LOG-ROUTE] Requête reçue : ${req.method} ${req.url}`);
  console.log(`👤 Utilisateur connecté :`, req.user ? req.user.username : "Aucun");
  next();
});


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
  //console.log(req.user)
  console.log("❌ [AUTH_FAIL] Tentative d'accès refusée. req.user vaut :", req.user);
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

    if (!stations || stations.length === 0) {
      return res.status(400).json({ error: "Aucune station disponible." });
    }

    // 1. Choix aléatoire de la station de départ
    const randomIndex1 = Math.floor(Math.random() * stations.length);
    const startStation = stations[randomIndex1];

    // 2. Construction du graphe pour le calcul de distance
    const graph = {};
    for (const station of stations) {
      graph[station.name] = [];
    }

    for (const segment of segments) {
      // 🌟 CORRECTION : Ton DAO renvoie { station1, station2 } !
      if (graph[segment.station1] && graph[segment.station2]) {
        graph[segment.station1].push(segment.station2);
        graph[segment.station2].push(segment.station1);
      }
    }

    // 3. Calcul des distances à partir de la station de départ
    const distances = computeDistances(graph, startStation.name);

    // 4. Filtrage des stations à une distance minimale de 3
    const validStations = stations.filter(
      station => distances[station.name] !== undefined && distances[station.name] >= 4
    );

    // Sécurité au cas où le réseau serait fragmenté ou trop petit durant les tests
    if (validStations.length === 0) {
      console.warn("⚠️ Aucune station à distance >= 4. Sélection d'une station par défaut.");
      const fallbackStations = stations.filter(s => s.id !== startStation.id);
      validStations.push(...fallbackStations);
    }

    // 5. Sélection aléatoire de la destination parmi les stations valides
    const randomIndex2 = Math.floor(Math.random() * validStations.length);
    const destinationStation = validStations[randomIndex2];

    const startTime = Date.now();

    // 6. Enregistrement de la partie en BDD
    // 🌟 Rappel : Ton createGame prend les IDs numériques des stations
    const gameId = await createGame(req.user.id, startStation.id, destinationStation.id, startTime);

    // Envoi des infos nécessaires au client pour la Phase 2
    res.status(201).json({
      gameId: gameId,
      startStation: startStation.name,
      destinationStation: destinationStation.name,
      stations: stations.map(s => s.name),
      segments: segments
    });
  } catch (e) {
    console.error("====== CRASH SERVEUR START ======");
    console.error(e.stack || e);
    console.error("=================================");
    res.status(500).json({ error: "Could not start a new game." });
  }
});


app.post("/api/games/:id/validate", isLoggedIn, [
  check("route").isArray({ min: 1 }).withMessage("Route must be an array of at least 1 segment.")
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
      return res.status(404).json({ error: "Game session invalid or already completed." });
    }

    const currentTime = Date.now();
    const timeElapsed = (currentTime - game.startTime) / 1000;

    if (timeElapsed > 90) {
      await updateGameResult(gameId, 0, 'completed');
      return res.status(200).json({
        isValid: false,
        reason: "Temps écoulé ! Les 90 secondes sont dépassées.",
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

    // --- 1. CONSTRUCTION DU GRAPHE DES CONNEXIONS ---
    // On crée une carte où chaque station liste ses voisines directes choisies par le joueur
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

    // --- 2. TRAVERSÉE DU GRAPHE (DE DÉPART À ARRIVÉE) ---
    let isRouteValid = true;
    const routeStations = [];
    
    // On commence à la station de départ
    let currentStation = startName;
    routeStations.push(currentStation);

    // On va marcher de station en station tant qu'on n'a pas atteint la destination
    while (currentStation !== destName) {
      const neighbors = graph[currentStation] || [];
      
      // On cherche un voisin qui n'a pas encore été visité pour éviter de tourner en rond
      const nextStation = neighbors.find(neighbor => !routeStations.includes(neighbor));
      
      if (!nextStation) {
        // Impasse ! Soit le chemin est coupé, soit il ne mène pas à l'arrivée, soit il y a un doublon
        isRouteValid = false;
        break;
      }
      
      routeStations.push(nextStation);
      currentStation = nextStation;

      // Anti-boucle infinie de sécurité (si le joueur a mis trop de segments)
      if (routeStations.length > playerRoute.length + 1) {
        isRouteValid = false;
        break;
      }
    }

    // --- 3. VÉRIFICATION FINALE DES SEGMENTS UTILISÉS ---
    // Le chemin doit être valide ET le joueur doit avoir utilisé exactement le bon nombre de segments 
    // (pour éviter qu'il triche en envoyant des segments en trop qui polluent le réseau)
    if (isRouteValid && routeStations.length !== playerRoute.length + 1) {
      isRouteValid = false;
    }

    console.log("Route reconstruite par cheminement :", routeStations);
    // --- 3. TRAITEMENT DU RÉSULTAT ---
    if (!isRouteValid || playerRoute.length === 0) {
      await updateGameResult(gameId, 0, 'completed');
      return res.status(200).json({ 
        isValid: false, 
        reason: "Itinéraire invalide ou interrompu (les stations ne se suivent pas ou n'atteignent pas l'objectif).", 
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
