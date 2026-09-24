import { IconButton, Icons } from 'football-ds';

export const Variants = () => (
  <div className="flex items-center gap-3">
    <IconButton icon={<Icons.X size={18} />} label="Remove player" />
    <IconButton variant="primary" icon={<Icons.Plus size={18} />} label="Add player" />
    <IconButton variant="danger" icon={<Icons.Trash2 size={18} />} label="Delete" />
    <IconButton variant="success" icon={<Icons.Check size={18} />} label="Approve" />
    <IconButton variant="outline" icon={<Icons.Share2 size={18} />} label="Share" />
  </div>
);

export const Sizes = () => (
  <div className="flex items-center gap-3">
    <IconButton size="sm" variant="primary" icon={<Icons.Star size={14} />} label="Rate" />
    <IconButton size="md" variant="primary" icon={<Icons.Star size={18} />} label="Rate" />
    <IconButton size="lg" variant="primary" icon={<Icons.Star size={22} />} label="Rate" />
  </div>
);
