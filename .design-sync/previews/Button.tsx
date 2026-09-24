import { Button, Icons } from 'football-ds';

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button variant="primary">Register Now</Button>
    <Button variant="secondary">Back</Button>
    <Button variant="success">Verify</Button>
    <Button variant="danger">Delete</Button>
    <Button variant="outline">Cancel</Button>
    <Button variant="ghost">Skip</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="sm">Small</Button>
    <Button size="md">Medium</Button>
    <Button size="lg">Large</Button>
  </div>
);

export const WithIcon = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button icon={<Icons.Save size={16} />}>Save Changes</Button>
    <Button variant="danger" size="sm" icon={<Icons.Trash2 size={14} />}>Remove</Button>
    <Button variant="outline" icon={<Icons.Share2 size={16} />}>Share Teams</Button>
  </div>
);

export const States = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button loading>Registering</Button>
    <Button disabled>Registration Closed</Button>
  </div>
);

export const FullWidth = () => (
  <div className="w-80">
    <Button fullWidth size="lg">Register for Monday&apos;s Game</Button>
  </div>
);
