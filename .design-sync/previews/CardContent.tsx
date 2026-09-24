import { Card, CardContent } from 'football-ds';

const Body = ({ label }: { label: string }) => (
  <p style={{ color: 'var(--text-primary)' }}>
    <strong>{label}</strong> - Winner stays on, loser rotates out.
  </p>
);

export const Padding = () => (
  <div className="flex flex-col gap-3 max-w-md">
    <Card padding="none"><CardContent padding="sm"><Body label="sm" /></CardContent></Card>
    <Card padding="none"><CardContent padding="md"><Body label="md" /></CardContent></Card>
    <Card padding="none"><CardContent padding="lg"><Body label="lg" /></CardContent></Card>
  </div>
);
