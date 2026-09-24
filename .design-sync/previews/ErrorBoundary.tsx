import { ErrorBoundary, Card } from 'football-ds';

function Broken(): JSX.Element {
  throw new Error('Failed to load team data');
}

export const DefaultFallback = () => (
  <div className="w-[640px] h-[480px] overflow-hidden">
    <ErrorBoundary><Broken /></ErrorBoundary>
  </div>
);

export const CustomFallback = () => (
  <ErrorBoundary fallback={<Card className="max-w-md"><p style={{ color: 'var(--text-primary)' }}>Couldn&apos;t load the roster. Try again in a moment.</p></Card>}>
    <Broken />
  </ErrorBoundary>
);

export const Healthy = () => (
  <ErrorBoundary>
    <Card className="max-w-md"><p style={{ color: 'var(--text-primary)' }}>Children render normally when nothing throws.</p></Card>
  </ErrorBoundary>
);
