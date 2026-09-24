import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, Button, Icons,
} from 'football-ds';

// The shadcn tokens this menu uses (bg-popover, bg-accent) are not defined in the
// app theme, so the content is given theme variables explicitly.
const contentStyle = { backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' };

export const Open = () => (
  <div className="h-64">
    <DropdownMenu defaultOpen modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" icon={<Icons.User size={16} />}>John Doe</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={contentStyle} className="w-48">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator style={{ backgroundColor: 'var(--border-color)' }} />
        <DropdownMenuItem><Icons.Clock /> My history</DropdownMenuItem>
        <DropdownMenuItem><Icons.Users /> Teams</DropdownMenuItem>
        <DropdownMenuItem><Icons.LogOut /> Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
