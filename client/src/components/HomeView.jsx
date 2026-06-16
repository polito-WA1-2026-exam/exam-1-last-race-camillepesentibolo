import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router';

import Trophy from '../assets/trophy.png';
import Game from '../assets/game.png';

function HomeView({ user }) {
  const navigate = useNavigate();

  return (
    <Container>
              <h1 className="mb-4">Welcome {user ? user.name : 'Conducteur'} </h1>
              <p className="text-muted mb-5">
                Ready to take on the challenge of the metropolitan network ? Plan your route and achieve the highest score possible !
              </p>

              <Row className="g-4">
                <Col sm={6}>
                  <Button 
                    variant="success" 
                    size="lg" 
                    className="w-100 py-4 h-100 shadow-sm"
                    style={{ 
                    backgroundColor: '#e77164', /* Ta couleur de fond personnalisée */
                    borderColor: '#d95a4c',
                    borderWidth: '4px',          /* 🌟 ICI : Épaisseur de la bordure (ex: 4px) */
                    borderStyle: 'solid',        /* 🌟 ICI : Type de bordure (continue) */
                    color: 'Black'              /* La couleur de l'icône à l'intérieur */
                  }}
                    onClick={() => navigate('/game')} // Route vers la phase de Setup/Planning
                  >
                    <div className="fs-2 mb-2"><img 
                              src={Game} 
                              alt="Logo Last Race" 
                              style={{ height: '70px', width: 'auto', objectFit: 'contain' }} /></div>
                    <strong>New Game</strong>
                  </Button>
                </Col>

                <Col sm={6}>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-100 py-4 h-100 shadow-sm"
                    style={{ 
                    backgroundColor: '#f1de63', /* Ta couleur de fond personnalisée */
                    borderColor: '#d9bf4c',
                    borderWidth: '4px',          /* 🌟 ICI : Épaisseur de la bordure (ex: 4px) */
                    borderStyle: 'solid',        /* 🌟 ICI : Type de bordure (continue) */
                    color: 'Black'              /* La couleur de l'icône à l'intérieur */
                  }}
                    onClick={() => navigate('/ranking')} // Route vers la page du classement général
                  >
                    <div className="fs-2 mb-2"><img 
                              src={Trophy} 
                              alt="Logo Last Race" 
                              style={{ height: '90px', width: 'auto', objectFit: 'contain' }} /> </div>
                    <strong>General Ranking</strong>
                    <div className="fs-6 text-dark mt-1">View your top scores</div>
                  </Button>
                </Col>
              </Row>
    </Container>
  ) ;
}

export default HomeView;