import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Spinner, Row, Col, Badge, Table, ListGroup, Alert } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

function GameLayout() {

  const [gamePhase, setGamePhase] = useState(1); // 1 = Setup, 2 = Planning, 3 = Result
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State phase 2
  const [currentGame, setCurrentGame] = useState(null);
  const [timeLeft, setTimeLeft] = useState(90);
  const [selectedSegments, setSelectedSegments] = useState([]);

  // State phase 3 
  const [validationResult, setValidationResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // To add segment to the route
  const handleSelectSegment = (segment) => {
    setSelectedSegments((prev) => [...prev, segment]);
  };

  // remove last segment
  const handleRemoveLastSegment = () => {
    setSelectedSegments((prev) => prev.slice(0, -1));
  };

  // Load the network map (Phase 1)
  useEffect(() => {
    async function loadNetwork() {
      try {
        const response = await fetch('http://localhost:3001/api/network/setup', { credentials: 'include' });
        const data = await response.json();
        setNetworkData(data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load the network map.");
        setLoading(false);
      }
    }
    loadNetwork();
  }, []);

  // Submitting the route to the server (End of Phase 2 -> Phase 3)
  const handleSubmitRoute = async (forcedRoute = null) => {
    setLoading(true);
    setError(null);
    const routeToSend = forcedRoute || selectedSegments;

    try {
      const response = await fetch(`http://localhost:3001/api/games/${currentGame.gameId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ route: routeToSend })
      });

      if (!response.ok) {
        throw new Error("Route validation error");
      }

      const result = await response.json();
      setValidationResult(result);
      setCurrentStepIndex(0);
      setGamePhase(3);
    } catch (err) {
      setError("Server communication error while validating the route.");
    } finally {
      setLoading(false);
    }
  };

  // 90-second countdown
  useEffect(() => {
    if (gamePhase !== 2 || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitRoute();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gamePhase, timeLeft, selectedSegments]);

  // Start new game
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
        throw new Error("Failed to create the new game");
      }

      const gameData = await response.json();
      setCurrentGame(gameData);
      setSelectedSegments([]); 
      setValidationResult(null);
      setTimeLeft(90); 
      setGamePhase(2); 
    } catch (err) {
      setError("Impossible to start the game");
    } finally {
      setLoading(false);
    }
  };

  if (loading && gamePhase === 1) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading the network...</p>
      </div>
    );
  }

  return (
    <Container className="mt-4">
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {/* PHASE 1 */}
      {gamePhase === 1 && (      
          <div className="track-layout-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div >
                <h2 className="fw-bold" style={{ color: '#4048d4' }}>Phase 1: Track Layout</h2>
                <p className="text-muted mb-0">
                  Check the track layout before starting the race
                </p>
              </div>
              <Button variant="success" size="lg" className="fw-bold px-4" onClick={handleStartGame}>
                <i className="bi bi-flag"></i> Play
              </Button>
            </div>

            <hr />
            
            <Row className="g-4">
              <Col lg={8}>                
                  <h4 className="mb-3">Network map</h4>
                  <div className="metro-container" > 
                    <svg 
                      width="600" 
                      height="600" 
                      viewBox="0 0 650 650" 
                      style={{ backgroundColor: 'white' }}>
                      
                      <style>{`
                        text { font-family: 'Segoe UI', Roboto, sans-serif; font-weight: bold; dominant-baseline: central; }
                        .station-name { font-size: 14px; fill: #212529; }
                        .line-label { font-size: 18px; font-style: italic; text-anchor: middle; }
                        circle { stroke-width: 2.5; fill: white; }
                        line { stroke-width: 4; stroke-linecap: round; }
                      `}</style>

                      {/* Line 1 */}
                      <line x1="270" y1="130"  x2="400" y2="130" stroke="#B83A26" />
                      <line x1="400" y1="130" x2="400" y2="250" stroke="#B83A26" />
                      <line x1="400" y1="250" x2="400" y2="370" stroke="#B83A26" />

                      {/* Line 2 */}
                      <line x1="150" y1="250" x2="270" y2="250" stroke="#3A78E3" />
                      <line x1="270" y1="250" x2="400" y2="250" stroke="#3A78E3" />
                      <line x1="400" y1="250" x2="520" y2="250" stroke="#3A78E3" />

                      {/* Line 3 */}
                      <line x1="150" y1="250" x2="270" y2="370" stroke="#7CB656" />
                      <line x1="270" y1="370" x2="270" y2="470" stroke="#7CB656" />
                      <line x1="270" y1="470" x2="270" y2="570" stroke="#7CB656" />

                      {/* Line 4 */}
                      <line x1="270" y1="470" x2="400" y2="470" stroke="#E69C45" />
                      <line x1="400" y1="470" x2="520" y2="470" stroke="#E69C45" />


                      {/* Stations line 1 */}
                      <circle cx="270" cy="130"  r="8" stroke="#B83A26" />
                      <circle cx="400" cy="130" r="8" stroke="#B83A26" />
                      <circle cx="400" cy="370" r="8" stroke="#B83A26" />

                      {/* Stations line 2 */}
                      <circle cx="270" cy="250" r="8" stroke="#3A78E3" />
                      <circle cx="520" cy="250" r="8" stroke="#3A78E3" />

                      {/* Stations line 3 */}
                      <circle cx="270" cy="370" r="8" stroke="#7CB656" />
                      <circle cx="270" cy="570" r="8" stroke="#7CB656" />

                      {/* Stations line 4 */}
                      <circle cx="400" cy="470" r="8" stroke="#E69C45" />
                      <circle cx="520" cy="470" r="8" stroke="#E69C45" />

                      {/* interchange stations */}
                      <circle cx="400" cy="250" r="12" stroke="#3A78E3" />
                      <circle cx="400" cy="250" r="7" stroke="#B83A26" />

                      <circle cx="150" cy="250" r="12" stroke="#7CB656" />
                      <circle cx="150" cy="250" r="7" stroke="#3A78E3" />

                      <circle cx="270" cy="470" r="12" stroke="#E69C45" />
                      <circle cx="270" cy="470" r="7" stroke="#7CB656" />

                      <text x="225" y="105"  className="station-name" textAnchor="start">Porta Genova</text>
                      <text x="370" y="105" className="station-name" textAnchor="start">Famagosta</text>
                      <text x="418" y="225" className="station-name" textAnchor="start">Pagano</text>
                      <text x="415" y="370" className="station-name" textAnchor="start">Portello</text>
                      <text x="150" y="225" className="station-name" textAnchor="middle">Isola</text>
                      <text x="285" y="225" className="station-name" textAnchor="end">Susa</text>
                      <text x="535" y="250" className="station-name" textAnchor="start">Vimodrone</text>
                      <text x="200" y="370" className="station-name" textAnchor="start">Pasteur</text>
                      <text x="155" y="470" className="station-name" textAnchor="start">Porta Romana</text>
                      <text x="210" y="570" className="station-name" textAnchor="start">Rivoli</text>
                      <text x="400" y="490" className="station-name" textAnchor="middle">Tre Torri</text>
                      <text x="520" y="490" className="station-name" textAnchor="middle">Turati</text>

                      <text x="220" y="130"  className="line-label" fill="#B83A26">line 1</text>
                      <text x="95"  y="250" className="line-label" fill="#3A78E3">line 2</text>
                      <text x="270" y="605" className="line-label" fill="#7CB656">line 3</text>
                      <text x="570" y="470" className="line-label" fill="#E69C45">line 4</text>

                    </svg>
                  </div>               
              </Col>
              <Col lg={4}>
                  <h4 className="mb-3">Direct Connections (Segments)</h4>
                  <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="border rounded bg-white">
                    <Table striped hover className="mb-0 text-center">
                      <thead>
                        <tr><th>Station A</th><th>⇄</th><th>Station B</th></tr>
                      </thead>
                      <tbody>
                        {networkData?.segments?.map((seg) => (
                          <tr key={seg.id}>
                            <td>{seg.station1_name}</td><td>⇄</td><td>{seg.station2_name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>      
              </Col>
            </Row>
          </div>
        
      )}

      {/* PHASE 2 */}
      {gamePhase === 2 && currentGame && (
        <Container>
            <Row>
              <Col md={8}>
                <h3 className="fw-bold" style={{ color: '#4048d4' }}>Phase 2 : Planning</h3>
                <h5>
                  Connect <Badge bg="success">{currentGame.startStation}</Badge> to <Badge bg="danger">{currentGame.destinationStation}</Badge>
                </h5>
              </Col>
              <Col md={4} className="text-md-end text-center">
                <div className={`fs-3 fw-bold p-2 rounded border d-inline-block ${timeLeft <= 20 ? 'text-danger bg-danger-subtle' : 'text-primary bg-primary-subtle'}`}>
                  <i className="bi bi-stopwatch"></i> {timeLeft}s
                </div>
              </Col>
            </Row>

            <hr />

            <Row className="g-4">
              <Col lg={6}>             
                  <h5 >Network map</h5>
                  <div className="metro-container" > 
                    <svg 
                      width="400" 
                      height="400" 
                      viewBox="50 60 600 600" 
                      style={{ backgroundColor: 'white' }}>
                      
                      <style>{`
                        text { font-family: 'Segoe UI', Roboto, sans-serif; font-weight: bold; dominant-baseline: central; }
                        .station-name { font-size: 14px; fill: #212529; }
                        .line-label { font-size: 18px; font-style: italic; text-anchor: middle; }
                        circle { stroke-width: 2.5; fill: white; }
                        line { stroke-width: 4; stroke-linecap: round; }
                      `}</style>

                      <circle cx="270" cy="130"  r="8" stroke="#000000" />
                      <circle cx="400" cy="130" r="8" stroke="#000000" />
                      <circle cx="400" cy="370" r="8" stroke="#000000" />
                      <circle cx="270" cy="250" r="8" stroke="#000000" />
                      <circle cx="520" cy="250" r="8" stroke="#000000" />
                      <circle cx="270" cy="370" r="8" stroke="#000000" />
                      <circle cx="270" cy="570" r="8" stroke="#000000" />
                      <circle cx="400" cy="470" r="8" stroke="#000000" />
                      <circle cx="520" cy="470" r="8" stroke="#000000" />
                      <circle cx="400" cy="250" r="8" stroke="#000000" />
                      <circle cx="150" cy="250" r="8" stroke="#000000" />
                      <circle cx="270" cy="470" r="8" stroke="#000000" />

                      <text x="225" y="105"  className="station-name" textAnchor="start">Porta Genova</text>
                      <text x="370" y="105" className="station-name" textAnchor="start">Famagosta</text>
                      <text x="418" y="225" className="station-name" textAnchor="start">Pagano</text>
                      <text x="415" y="370" className="station-name" textAnchor="start">Portello</text>
                      <text x="150" y="225" className="station-name" textAnchor="middle">Isola</text>
                      <text x="285" y="225" className="station-name" textAnchor="end">Susa</text>
                      <text x="535" y="250" className="station-name" textAnchor="start">Vimodrone</text>
                      <text x="200" y="370" className="station-name" textAnchor="start">Pasteur</text>
                      <text x="155" y="470" className="station-name" textAnchor="start">Porta Romana</text>
                      <text x="210" y="570" className="station-name" textAnchor="start">Rivoli</text>
                      <text x="400" y="490" className="station-name" textAnchor="middle">Tre Torri</text>
                      <text x="520" y="490" className="station-name" textAnchor="middle">Turati</text>

                    </svg>
                  </div> 
              </Col>

              <Col lg={6}>
                  <h5>Segments</h5>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="border rounded bg-white">
                    <ListGroup variant="flush">
                      {currentGame.segments?.map((seg, idx) => {
                        const isSelected = selectedSegments.some(s => 
                          (s.station1 === seg.station1 && s.station2 === seg.station2) ||
                          (s.station1 === seg.station2 && s.station2 === seg.station1)
                        );
                        return (
                          <ListGroup.Item 
                            key={idx} 
                            disabled={isSelected || timeLeft <= 0} 
                            onClick={() => !isSelected && timeLeft > 0 && handleSelectSegment(seg)} 
                            className={`d-flex justify-content-between align-items-center py-2 ${isSelected ? 'bg-secondary-subtle text-muted text-decoration-line-through' : ''}`}
                            style={{ cursor: isSelected ? 'default' : 'pointer' }}
                          >
                            <span className="small fw-semibold">{seg.station1} ⇄ {seg.station2}</span>
                            <Badge bg={isSelected ? "secondary" : "outline-primary"} className={`px-2 py-1 ${!isSelected ? 'text-primary border border-primary bg-transparent' : ''}`}>
                              {isSelected ? " " : " + Add"}
                            </Badge>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </div>
                
              </Col>
            </Row>

            <hr />

            <Row>
              <Col lg={12}>
                  <h5 className="fw-bold" style={{ color: '#4048d4' }}>Your Route Sheet</h5>
                  <div style={{ minHeight: '200px', maxHeight: '250px', overflowY: 'auto' }} className="border rounded bg-light p-2 mb-3">
                    {selectedSegments.length === 0 ? (
                      <div className="text-center text-muted pt-5 small">No segment selected</div>
                    ) : (
                      <ListGroup variant="flush">
                        {selectedSegments.map((seg, idx) => (
                          <ListGroup.Item key={idx} className="py-2 small d-flex justify-content-between align-items-center border-start border-primary border-3 my-1 shadow-sm">
                            <span><strong>{seg.station1} ⇄ {seg.station2}</strong></span>
                            <Button variant="link" className="text-danger p-0 fw-bold text-decoration-none" onClick={handleRemoveLastSegment} disabled={idx !== selectedSegments.length - 1}>✕</Button>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </div>
                  <div className="mt-auto d-grid gap-2">
                    <Button variant="primary" size="lg" className="fw-bold" style={{ backgroundColor: '#4048d4', borderColor: '#4048d4' }} disabled={selectedSegments.length === 0 || timeLeft <= 0} onClick={() => handleSubmitRoute()}>
                      Validate Route
                    </Button>
                  </div>
              </Col>
            </Row>

        </Container>
      )}

      {/* PHASE 3 (random events */}
      {gamePhase === 3 && validationResult && (
        <Container className="p-4 text-center border-dark">

            {/* If invalided */}
            {!validationResult.isValid ? (
              <div>
                <h1 className="text-danger fw-bold" style={{ color: 'red' }}>
                  <span className="fw-bold fs-3 bg-danger bg-opacity-25 p-3 d-block text-center">Route incomplete or invalid</span>
                </h1>

                <p className="my-3 text-secondary fs-5">
                  The stations do not follow each other or do not reach the objective
                </p>
                <div className="fs-1 my-3">0 <i className="bi bi-coin" style={{ color: 'black' }}></i></div>
                <Button variant="primary" style={{ backgroundColor: '#4048d4', borderColor: '#4048d4' }} className="mt-3 fw-bold btn-lg" onClick={() => setGamePhase(1)}>
                      Start a new game
                </Button>
              </div>
            ) : (
              /* if valided */
              <div>
                <h1 className="text-success fw-bold">
                  <span className="fw-bold fs-3 bg-success bg-opacity-25 p-3 d-block text-center">
                    Route Validated !
                  </span>
                </h1>

                {validationResult.steps.length > 0 && currentStepIndex < validationResult.steps.length ? (
                  <Container className="my-4 border-primary">
                      <div className="text-muted small text-uppercase fw-bold mb-2">
                        Step {currentStepIndex + 1} of {validationResult.steps.length}
                      </div>
                      <h3 className="fw-bold mb-3" style={{color: 'black'}}>
                        Segment : {validationResult.steps[currentStepIndex].segment}
                      </h3>
                      <div className="fw-bold fs-4 bg-warning border border-warning p-4 d-inline-block" 
                        style={{ '--bs-bg-opacity': 0.4 }}>
                        <h5 className="fw-bold text-warning-emphasis">Random Event :</h5>
                        <p className="fs-5 mb-0">"{validationResult.steps[currentStepIndex].eventDescription}"</p>
                      </div>
                      <h4 className="my-3">
                        <Badge 
                        bg={validationResult.steps[currentStepIndex].effect > 0 ? "success" : validationResult.steps[currentStepIndex].effect < 0 ? "danger" : "secondary"} 
                        className="fs-3">
                        {validationResult.steps[currentStepIndex].effect > 0 ? `+${validationResult.steps[currentStepIndex].effect}` : validationResult.steps[currentStepIndex].effect} <i className="bi bi-coin" style={{ color: 'black' }}></i>
                      </Badge>
                      </h4>
                      <div className="fs-3 fw-bold text-dark mt-4">
                        Current Coins : {validationResult.steps[currentStepIndex].currentCoins} <i className="bi bi-coin" style={{ color: 'black' }}></i>
                      </div>

                      <Button 
                        variant="success" 
                        size="lg" 
                        className="mt-4 px-5 fw-bold" 
                        style={{ backgroundColor: '#4048d4', borderColor: '#4048d4' }}
                        onClick={() => setCurrentStepIndex(prev => prev + 1)}>
                        {currentStepIndex === validationResult.steps.length - 1 ? "View final results" : "Move to next station"}
                      </Button>
                  </Container>
                ) : (
                  <div>
                    <div className="bg-white p-4 my-3 border d-inline-block">
                      <span className="fs-2">Final Score</span>
                      <div className="fs-1 fw-bold "> {validationResult.finalScore} <i className="bi bi-coin" style={{ color: 'black' }}></i></div>
                    </div>
                    <br />
                    <Button variant="primary" style={{ backgroundColor: '#4048d4', borderColor: '#4048d4' }} className="mt-3 fw-bold btn-lg" onClick={() => setGamePhase(1)}>
                      Start a new game
                    </Button>
                  </div>
                )}
              </div>
            )}
        </Container>
      )}
    </Container>
  );
}

export default GameLayout;
