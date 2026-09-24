import { DesignSandbox, Card, CardHeader, CardContent, Button, BanNotificationBanner } from 'football-ds';

// Every design built with this system should be wrapped in <DesignSandbox>. These cells show
// what its props change; each nests its own sandbox inside the card's default one.
const Users = () => (
  <Card padding="none" className="w-[420px]">
    <CardHeader actions={<Button size="sm">Register</Button>}>This week</CardHeader>
    <CardContent padding="sm"><p style={{ color: 'var(--text-secondary)' }}>21 guaranteed spots - Monday 9 PM</p></CardContent>
  </Card>
);

export const Light = () => (<DesignSandbox theme="light"><div className="p-4"><Users /></div></DesignSandbox>);
export const Dark = () => (<DesignSandbox theme="dark"><div className="p-4"><Users /></div></DesignSandbox>);
export const BannedSession = () => (
  <DesignSandbox session="banned"><div className="w-[560px] p-4"><BanNotificationBanner /></div></DesignSandbox>
);
