import { RosterPage, DesignSandbox } from 'football-ds';

// Full page (Navbar is position:fixed; the transformed frame keeps it inside the card).
export const Default = () => (
  <DesignSandbox session="player" pathname="/roster" search="">
    <div className="relative w-[1200px] h-[1200px] overflow-hidden" style={{ transform: 'translateZ(0)' }}>
      <RosterPage />
    </div>
  </DesignSandbox>
);
