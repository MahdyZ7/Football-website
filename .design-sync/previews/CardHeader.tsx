import { Card, CardHeader, CardContent, Button, Icons } from 'football-ds';

export const WithActions = () => (
  <Card padding="none" className="max-w-md">
    <CardHeader actions={<Button size="sm" variant="outline" icon={<Icons.RefreshCw size={14} />}>Refresh</Button>}>
      Banned Players
    </CardHeader>
    <CardContent padding="sm">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>3 players are currently banned from registering.</p>
    </CardContent>
  </Card>
);

export const TitleOnly = () => (
  <Card padding="none" className="max-w-md">
    <CardHeader>Game Rules</CardHeader>
    <CardContent padding="sm">
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Games are 10 minutes long or until a team scores 2 goals.</p>
    </CardContent>
  </Card>
);
