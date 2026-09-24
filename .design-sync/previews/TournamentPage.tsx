import { TournamentPage, DesignSandbox } from 'football-ds';

// Full page (Navbar is position:fixed; the transformed frame keeps it inside the card).
export const Default = () => (
  <DesignSandbox session="player" pathname="/tournament" search="">
    <div className="relative w-[1200px] h-[1400px] overflow-hidden" style={{ transform: 'translateZ(0)' }}>
      <TournamentPage />
    </div>
  </DesignSandbox>
);
