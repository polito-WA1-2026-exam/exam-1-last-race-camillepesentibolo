import React, { useState, useEffect } from 'react';
import { Container, Table, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import dayjs from 'dayjs';
import 'bootstrap-icons/font/bootstrap-icons.css';
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
      
          <div className="mb-4 text-center">
            <h1 style={{ 
              color: '#212529',          /* Un noir adouci, moins agressif */
              margin: '10px 0', 
              fontSize: '2.5rem',        /* Un poil plus petit */
              fontWeight: '600',         /* Un gras élégant mais pas étouffant */
              fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif' /* Une police moderne et épurée */
            }}>
              Top Scores
            </h1>
          </div>

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
                  <th style={{ width: '15%' }}>Rankings</th>
                  <th style={{ width: '25%' }}>Score Achieved (Coins)</th>
                  <th style={{ width: '25%' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {ranking.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-muted py-4">
                      You haven't recorded any completed games yet
                    </td>
                  </tr>
                ) : (
                  ranking.map((row, index) => (
                    <tr key={index}>
                      <td>
                        {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                      </td>
                      <td>
                        <span className="fw-bold fs-6 bg-warning bg-opacity-50 p-2 rounded d-inline-block">
                          {row.bestScore} <i className="bi bi-coin" style={{ color: 'black' }}></i>
                        </span>
                      </td>
                      <td>
                      {/* 🌟 On vérifie que la date existe et qu'elle n'est pas égale à 0 */}
                      {row.startTime && row.startTime > 0 
                        ? dayjs(row.startTime).format('DD/MM/YYYY [-] HH:mm') 
                        : '—'}
                    </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        
    </Container>
  );
}

export default RankingView;
