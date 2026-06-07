//import RankingTable from '../components/RankingTable';

function WelcomePage() {
  return (
    <div>
      {/* Section Présentation */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#2c3e50', fontWeight: 'bold' }}>Welcome to Last Race! 👋</h2>
        <p style={{ fontSize: '18px', color: '#7f8c8d', maxWidth: '600px', margin: '15px auto 0' }}>
          Un jeu de stratégie en solitaire inspiré de <em>"Race the Rails"</em>. 
          Connectez-vous pour planifier votre itinéraire dans le métro et affronter le chronomètre !
        </p>
      </div>
    </div>
  );
}

export default WelcomePage;