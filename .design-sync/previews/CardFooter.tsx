import { Card, CardHeader, CardContent, CardFooter, Button } from 'football-ds';

export const WithActions = () => (
  <Card padding="none" className="max-w-md">
    <CardHeader>Remove Registration</CardHeader>
    <CardContent>
      <p style={{ color: 'var(--text-primary)' }}>Removing yourself within 15 minutes of registering carries no ban.</p>
    </CardContent>
    <CardFooter>
      <div className="flex justify-end gap-3">
        <Button variant="secondary">Keep my spot</Button>
        <Button variant="danger">Remove</Button>
      </div>
    </CardFooter>
  </Card>
);

export const Note = () => (
  <Card padding="none" className="max-w-md">
    <CardContent>
      <p style={{ color: 'var(--text-primary)' }}>Registration opens Sunday and Wednesday at 12 PM.</p>
    </CardContent>
    <CardFooter>
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Last updated 5 days ago by Admin User</span>
    </CardFooter>
  </Card>
);
