import { Card, CardHeader, CardContent, CardFooter, Button } from 'football-ds';

export const Basic = () => (
  <Card className="max-w-md">
    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Next Game</h3>
    <p style={{ color: 'var(--text-secondary)' }}>
      Monday, 9 PM at Outdoor Pitch 2 - Active Al Maria. 21 guaranteed spots.
    </p>
  </Card>
);

export const WithHeaderAndFooter = () => (
  <Card padding="none" className="max-w-md overflow-hidden">
    <CardHeader actions={<Button size="sm">View all</Button>}>Registered Players</CardHeader>
    <CardContent>
      <p style={{ color: 'var(--text-primary)' }}>19 of 21 spots filled, 3 players on the waitlist.</p>
    </CardContent>
    <CardFooter>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Registration closes Monday at 10 PM</span>
    </CardFooter>
  </Card>
);

export const Padding = () => (
  <div className="flex flex-wrap items-start gap-4">
    <Card padding="sm"><span style={{ color: 'var(--text-primary)' }}>padding=&quot;sm&quot;</span></Card>
    <Card padding="md"><span style={{ color: 'var(--text-primary)' }}>padding=&quot;md&quot;</span></Card>
    <Card padding="lg"><span style={{ color: 'var(--text-primary)' }}>padding=&quot;lg&quot;</span></Card>
  </div>
);

export const Hoverable = () => (
  <div className="flex gap-4">
    <Card hoverable className="w-56">
      <div className="text-3xl font-bold text-ft-primary">21</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Guaranteed spots</div>
    </Card>
    <Card noShadow className="w-56">
      <div className="text-3xl font-bold text-ft-accent">3</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>On the waitlist (noShadow)</div>
    </Card>
  </div>
);
