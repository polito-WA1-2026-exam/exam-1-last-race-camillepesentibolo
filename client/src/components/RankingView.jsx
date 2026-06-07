import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import { getRanking } from '../api/api.js'; 

function RankingView() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Charger le classement au montage du composant
  useEffect(() => {
    async function fetchRankingData() {
      try {
        const data = await getRanking();
        setRanking(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur dans RankingView :", err);
        setError("Impossible de charger vos scores pour le moment.");
        setLoading(false);
      }
    }

    fetchRankingData();
  }, []);

  return (
    <Container className="mt-5">
      <Card className="shadow-sm p-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            {/* 🌟 MODIFICATION : Titre personnalisé */}
            <h1 className="mb-0">🏆 Mes 5 Meilleurs Scores</h1>
            <Button variant="secondary" onClick={() => navigate('/home')}>
              🏠 Retour Accueil
            </Button>
          </div>

          {/* 🌟 MODIFICATION : Texte explicatif personnalisé */}
          <p className="text-muted mb-4">
            Retrouvez l'historique de vos meilleures performances sur le réseau métropolitain, classées du plus haut au plus bas score.
          </p>

          {/* Indicateur de chargement */}
          {loading && (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Chargement de vos scores...</p>
            </div>
          )}

          {/* Message d'erreur si l'API échoue */}
          {error && (
            <Alert variant="danger" className="my-3">
              {error} — Vérifie que ton serveur Node.js tourne bien sur le port 3001 et que tu es connecté.
            </Alert>
          )}

          {/* Affichage du tableau une fois les données reçues */}
          {!loading && !error && (
            <Table striped bordered hover responsive className="align-middle text-center">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '15%' }}>Performance</th>
                  {/* 🌟 MODIFICATION : "Username" devient "ID Partie" */}
                  <th>Identifiant Partie</th>
                  <th style={{ width: '25%' }}>Score Obtenu (Coins)</th>
                </tr>
              </thead>
              <tbody>
                {ranking.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-muted py-4">
                      Vous n'avez pas encore enregistré de partie terminée.
                    </td>
                  </tr>
                ) : (
                  ranking.map((row, index) => (
                    <tr key={index}>
                      <td>
                        {index === 0 ? '🥇 Meilleure' : index === 1 ? '🥈 2e' : index === 2 ? '🥉 3e' : `${index + 1}e`}
                      </td>
                      {/* 🌟 MODIFICATION : On affiche row.gameId à la place de row.username */}
                      <td className="text-secondary fw-semibold">Partie #{row.gameId}</td>
                      <td>
                        <span className="badge bg-success fs-6 px-3 py-2">
                          {row.bestScore} 🪙
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RankingView;
