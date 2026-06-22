import { User, Station, Line, Event, Game } from "../models/models.js";


export async function getRanking() {
  try {
    const response = await fetch(`http://localhost:3001/api/ranking`, { credentials: 'include' });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status}`);
    }
    
    const rankingData = await response.json();
    return rankingData;   // Return [{gameId, bestScore, StartTime}]
  } catch (err) {
    throw err;
  }
}


