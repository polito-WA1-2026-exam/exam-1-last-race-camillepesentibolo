

function WelcomePage() {
  return (
    <div className="container my-5" style={{ maxWidth: '800px', color: '#333' }}>
    {/* Titre Principal */}
    <div className="text-center mb-5">
      <h1 className="display-4 fw-bold" style={{ fontFamily: '"Impact", "Arial Black", sans-serif', color: '#4048d4', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Welcome to Last Race
      </h1>
      <p className="lead fs-5 text-muted">
        Inspired by "Race the Rails"
      </p>
    </div>

    {/* Section Instructions */}
    <div className="card shadow-sm border-0 p-4 bg-light rounded-3 mb-5">
      <h2 className="h3 mb-4 fw-bold text-dark border-bottom pb-2">
        Game Instructions
      </h2>

      {/* Défi */}
      <div className="mb-4">
        <h3 className="h5 fw-bold text-primary">The Challenge</h3>
        <p className="text-secondary" style={{ textAlign: 'justify' }}>
          In this game you take the role of a train dispatcher. For every new game, you are randomly assigned a Start Station 
           and a Destination Station within a fictional underground network. Your mission is to plan and complete a 
          continuous route connecting both stations before time runs out
        </p>
      </div>

      {/* Phase 1 */}
      <div className="mb-4">
        <h3 className="h5 fw-bold text-primary">Phase 1: The Planning Phase (90 Seconds)</h3>
        <ul className="text-secondary ps-3">
          <li className="mb-2">Once the countdown starts, you have exactly 90 seconds to mentally reconstruct the lines and select your route</li>
          <li className="mb-2">You will build your path by sequentially choosing adjacent station pairs (segments) from a list</li>
          <li className="mb-2">Your route must start and end at your assigned stations. Every segment can only be used once
            You can cross the same station multiple times, but line changes are only allowed at designated interchange stations</li>
          <li className="mb-2">If the timer hits zero your route is automatically submitted as it stands</li>
        </ul>
      </div>

      {/* Phase 2 */}
      <div className="mb-4">
        <h3 className="h5 fw-bold text-primary">Phase 2: The Journey & Random Events</h3>
        <ul className="text-secondary ps-3">
          <li className="mb-2">You start the race with a capital of 20 coins</li>
          <li className="mb-2">As you travel along your submitted route, each segment triggers a random unexpected event handled by the system</li>
          <li className="mb-2">Some events are lucky and give you extra coins, while others cause delays and make you lose coins.</li>
          <li className="mb-2"><strong className="text-danger">Warning:</strong> If your submitted route is incomplete or breaks any transit rules, it is declared invalid, and you instantly lose all your coins (Score = 0).</li>
        </ul>
      </div>

      {/* Condition de Victoire */}
      <div className="mb-2">
        <h3 className="h5 fw-bold text-primary">Win Condition</h3>
        <p className="text-secondary mb-0">
          Your final score corresponds to the number of coins you hold when safely reaching the destination. Try to get the highest score !
        </p>
      </div>

    </div>
  </div>
  );
}

export default WelcomePage;