import { AdminLogsPage, DesignSandbox } from 'football-ds';

// Full page (Navbar is position:fixed; the transformed frame keeps it inside the card).
export const Default = () => (
  <DesignSandbox session="admin" pathname="/admin-logs" search="">
    <div className="relative w-[1200px] h-[1000px] overflow-hidden" style={{ transform: 'translateZ(0)' }}>
      <AdminLogsPage />
    </div>
  </DesignSandbox>
);
