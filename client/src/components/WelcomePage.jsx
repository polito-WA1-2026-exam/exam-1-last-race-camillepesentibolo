function WelcomePage() {
  return (
    <div className="container my-5" style={{ maxWidth: '800px', color: '#333' }}>
    <div className="text-center mb-5">
      <h1 className="display-4 fw-bold" style={{ fontFamily: '"Impact", "Arial Black", sans-serif', color: '#4048d4', textTransform: 'uppercase', letterSpacing: '2px' }}>
        Welcome to Last Race
      </h1>
      <p className="lead fs-5 text-muted">Inspired by "Race the Rails"</p>
    </div>

    <div className="card border-0 p-4 mb-5">
      <h2 className="h3 mb-4 fw-bold text-dark border-bottom pb-2">
        Game Instructions
      </h2>

      <div className="mb-4">
        <h3 className="h5 fw-bold text-primary">The Challenge</h3>
        <p className="text-secondary" style={{ textAlign: 'justify' }}>
          In this game you take the role of a train dispatcher. For every new game, you are randomly assigned a Start Station 
           and a Destination Station within a fictional underground network. Your mission is to plan and complete a 
          continuous route connecting both stations before time runs out
        </p>
      </div>

      <div className="mb-4">
        <h3 className="h5 fw-bold text-primary">Phase 1 : Planning Phase (90s)</h3>
        <p className="text-secondary" style={{ textAlign: 'justify' }}>
          Once the countdown starts, you have exactly 90 seconds to mentally reconstruct the lines and select your route.
          You will build your path by sequentially choosing adjacent station pairs (segments) from a list. Your route must start 
          and end at your assigned stations. Every segment can only be used once you can cross the same station multiple times, 
          but line changes are only allowed at designated interchange stations. If the timer hits zero your route is automatically 
          submitted as it stands
        </p>
      </div>

      <div className="mb-4">
        <h3 className="h5 fw-bold text-primary">Phase 2 : Random Events</h3>
        <p className="text-secondary text-center">
          You start the race with a capital of 20 coins.
        </p>
        <p className="text-secondary" style={{ textAlign: 'justify' }}>
          As you travel along your submitted route, each segment triggers a random unexpected event handled by the system.
          Some events are lucky and give you extra coins, while others make you lose coins.
        </p>
        <p className="text-secondary" style={{ textAlign: 'justify' }}>
          <strong className="text-danger">Warning:</strong> If your submitted route is incomplete or breaks any transit rules, 
          it is declared invalid and you instantly lose all your coins (Score = 0).
        </p>
      </div>

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