import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router';

function HomeView({ user }) {
  const navigate = useNavigate();

  return (
    <Container className="mt-5 text-center">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="shadow-sm p-4">
            <Card.Body>
              {/* Message de bienvenue personnalisé */}
              <h1 className="mb-4">Bienvenue, {user ? user.name : 'Conducteur'} ! 🚇</h1>
              <p className="text-muted mb-5">
                Prêt à relever le défi du réseau métropolitain ? Planifie ton itinéraire, 
                affronte les imprévus et décroche le meilleur score possible !
              </p>

              <Row className="g-4">
                {/* Option 1 : Commencer une nouvelle partie */}
                <Col sm={6}>
                  <Button 
                    variant="success" 
                    size="lg" 
                    className="w-100 py-4 h-100 shadow-sm"
                    onClick={() => navigate('/game')} // Route vers la phase de Setup/Planning
                  >
                    <div className="fs-2 mb-2">🎮</div>
                    <strong>Nouvelle Partie</strong>
                    <div className="fs-6 text-light opacity-75 mt-1">Lancer un nouveau défi</div>
                  </Button>
                </Col>

                {/* Option 2 : Voir le classement général */}
                <Col sm={6}>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="w-100 py-4 h-100 shadow-sm"
                    onClick={() => navigate('/ranking')} // Route vers la page du classement général
                  >
                    <div className="fs-2 mb-2">🏆</div>
                    <strong>Classement Général</strong>
                    <div className="fs-6 text-light opacity-75 mt-1">Voir les meilleurs scores</div>
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default HomeView;