import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Spinner, Row, Col, Badge, Table, ListGroup, Alert } from 'react-bootstrap';

function GameLayout() {
  const [gamePhase, setGamePhase] = useState(1); // 1 = Setup, 2 = En cours
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour la partie en cours (Phase 2)
  const [currentGame, setCurrentGame] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);

  // 1. Charger la carte du réseau (Phase 1)
  useEffect(() => {
    async function loadNetwork() {
      try {
        const response = await fetch('http://localhost:3001/api/network/setup', { credentials: 'include' });
        const data = await response.json();
        setNetworkData(data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement réseau:", error);
        setError("Impossible de charger la carte du réseau.");
        setLoading(false);
      }
    }
    loadNetwork();
  }, []);

  // 2. Compte à rebours de 90 secondes (Phase 2)
  useEffect(() => {
    if (gamePhase !== 2 || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Optionnel : Déclencher une soumission automatique ou un échec temps dépassé ici
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, timeLeft]);

  // 3. Fonction pour appeler l'API de démarrage du jeu (Transition Phase 1 ➔ Phase 2)
  const handleStartGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/games/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la partie.");
      }

      const gameData = await response.json(); // Reçoit gameId, startStation, destinationStation...
      setCurrentGame(gameData);
      setTimeLeft(90); // Réinitialise le chrono à 90s
      setGamePhase(2); // Bascule sur l'écran de jeu
    } catch (err) {
      console.error(err);
      setError("Impossible de démarrer la partie. Vérifiez vos données de stations.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && gamePhase === 1) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Chargement de la carte du réseau...</p>
      </div>
    );
  }

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {/* PHASE 1 : Étude du plan du réseau */}
        {gamePhase === 1 && (
        <Card className="shadow-sm p-3">
            <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                <h2 className="fw-bold text-primary">🚇 Phase 1 : Plan du Réseau</h2>
                <p className="text-muted mb-0">
                    Prenez connaissance des lignes, des stations disponibles et de leurs connexions avant de lancer la course.
                </p>
                </div>
                <Button 
                variant="success" 
                size="lg" 
                className="fw-bold px-4 shadow-sm"
                onClick={handleStartGame}
                >
                🏁 Prêt à jouer !
                </Button>
            </div>

            <hr />

            <Row className="g-4">
                {/* Lignes à gauche */}
                <Col lg={6}>
                <Card className="h-100 border-0 bg-light p-3">
                    <h4 className="mb-3">🗺️ Liste des Lignes</h4>
                    <ListGroup variant="flush" className="rounded shadow-sm">
                    {networkData?.lines?.map((line, index) => {
                        // On récupère les stations associées à cette ligne via line_id
                        const lineStations = networkData.stations?.filter(s => s.line_id === line.id) || [];

                        return (
                        <ListGroup.Item key={index} className="py-3">
                            <Badge bg="dark" className="me-2 fs-6 px-3" style={{ backgroundColor: line.id === 1 ? '#e74c3c' : line.id === 2 ? '#3498db' : line.id === 3 ? '#2ecc71' : '#f39c12' }}>
                            {line.name}
                            </Badge>
                            <p className="mb-0 text-secondary small mt-2">
                            <strong>Stations dans l'ordre :</strong><br />
                            {lineStations.length > 0 
                                ? lineStations.map(s => `${s.name} (#${s.id})`).join(' ➔ ')
                                : <span className="text-danger">Aucune station trouvée</span>
                            }
                            </p>
                        </ListGroup.Item>
                        );
                    })}
                    </ListGroup>
                </Card>
                </Col>

                {/* Segments à droite */}
                <Col lg={6}>
                <Card className="h-100 border-0 bg-light p-3">
                    <h4 className="mb-3">🔗 Connexions directes (Segments)</h4>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="border rounded bg-white shadow-sm">
                    <Table striped hover responsive className="mb-0 text-center align-middle">
                        <thead className="table-dark sticky-top">
                        <tr>
                            <th>ID Segment</th>
                            <th>Station A</th>
                            <th>⇄</th>
                            <th>Station B</th>
                        </tr>
                        </thead>
                        <tbody>
                        {networkData?.segments?.length > 0 ? (
                            networkData.segments.map((seg) => (
                            <tr key={seg.id}>
                                <td className="fw-bold text-primary">#{seg.id}</td>
                                {/* 🌟 On utilise les vrais noms de colonnes : station1_name et station2_name */}
                                <td>{seg.station1_name}</td>
                                <td className="text-muted">⇄</td>
                                <td>{seg.station2_name}</td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                            <td colSpan="4" className="text-danger py-3">Aucun segment reçu du serveur.</td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                    </div>
                </Card>
                </Col>
            </Row>
            </Card.Body>
        </Card>
        )}

      {/* PHASE 2 : Partie en cours (Sélection de l'itinéraire) */}
      {gamePhase === 2 && currentGame && (
        <Card className="shadow-sm p-4 border-primary">
          <Card.Body>
            {/* Header de la partie : Objectif et Chrono */}
            <Row className="align-items-center mb-4 bg-light p-3 rounded shadow-sm mx-1">
              <Col md={8}>
                <h3 className="fw-bold mb-1 text-dark">🚀 Mission de conduite</h3>
                <h4 className="text-secondary mb-0">
                  Reliez <Badge bg="primary" className="fs-5">{currentGame.startStation}</Badge> à{' '}
                  <Badge bg="danger" className="fs-5">{currentGame.destinationStation}</Badge>
                </h4>
              </Col>
              <Col md={4} className="text-md-end text-center mt-3 mt-md-0">
                <div className={`fs-3 fw-bold p-2 rounded border inline-block ${timeLeft <= 20 ? 'text-danger bg-danger-subtle border-danger animate-pulse' : 'text-success bg-success-subtle border-success'}`}>
                  ⏱️ {timeLeft}s
                </div>
              </Col>
            </Row>

            {/* Zone de planification pour la Phase 3 */}
            <div className="p-4 border rounded text-center my-4 bg-white">
              <h5>🛠️ [ Zone de saisie du trajet - Phase 3 & 4 ]</h5>
              <p className="text-muted">
                Ici, nous allons créer les champs pour que le joueur saisisse la liste des IDs de segments pour former sa route !
              </p>
              <Button variant="outline-danger" className="mt-3" onClick={() => setGamePhase(1)}>
                🏳️ Abandonner la partie
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default GameLayout;
