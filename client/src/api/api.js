import { User, Station, Line, Event, Game } from "../models/file.js";

/**
 * Récupère le classement personnel (Meilleurs scores) de l'utilisateur connecté.
 * Nécessite d'être authentifié (Session active).
 * @returns {Promise<Array>} Un tableau contenant les scores des parties [{gameId, bestScore}]
 */
export async function getRanking() {
  try {
    // 🌟 AJOUT : { credentials: 'include' } est obligatoire pour envoyer les cookies de session au serveur
    const response = await fetch(`http://localhost:3001/api/ranking`, { credentials: 'include' });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    
    const rankingData = await response.json();
    return rankingData;
  } catch (error) {
    console.error("Impossible de récupérer le classement personnel :", error);
    throw error;
  }
}


