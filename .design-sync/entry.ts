// Design-sync bundle entry: every component the app ships, re-exported under a
// unique name onto window.FootballDS. The repo has no library build, so this file
// is the export list (it replaces a dist/index.js). Default exports get their
// component name; the two PlayerCards are disambiguated (teams -> TeamPlayerCard).

// --- sandbox (the app's provider stack + demo data) ---
export { DesignSandbox } from './sandbox/DesignSandbox';
export type { DesignSandboxProps, SandboxSession } from './sandbox/DesignSandbox';

// --- icons (lucide-react set used by the app) ---
export * as Icons from './icons';

// --- ui primitives ---
export { Button, IconButton } from '../components/ui/Button';
export { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
export { Input, Textarea, Select } from '../components/ui/Input';
export { StarRating, StarRatingCompact } from '../components/ui/StarRating';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from '../components/ui/dropdown-menu';

// --- feedback & loading ---
export {
  Skeleton,
  UserListSkeleton,
  TableRowSkeleton,
  FeedbackCardSkeleton,
  TeamCardSkeleton,
  StatsCardSkeleton,
  FormSkeleton,
  PageSkeleton,
  PlayerListSkeleton,
} from '../components/Skeleton';
export { default as LoadingSpinner } from '../components/LoadingSpinner';
export { default as ConfirmDialog } from '../components/ConfirmDialog';
export { default as ErrorBoundary } from '../components/ErrorBoundary';
export { default as SpecialEventToast } from '../components/SpecialEventToast';
export { AnnouncementPopup } from '../components/AnnouncementPopup';
export { default as ThemeToggle } from '../components/ThemeToggle';

// --- layout ---
export { default as Navbar } from '../components/pages/Navbar';
export { default as Footer } from '../components/pages/footer';

// --- registration ---
export { RegistrationForm } from '../components/registration/RegistrationForm';
export { PlayerList } from '../components/registration/PlayerList';
export { PlayerCard } from '../components/registration/PlayerCard';
export { BanRulesTable } from '../components/registration/BanRulesTable';
export { BannedPlayersCard } from '../components/registration/BannedPlayersCard';
export { BanNotificationBanner } from '../components/registration/BanNotificationBanner';
export { RemovalDialog } from '../components/registration/dialogs/RemovalDialog';
export { EditNameDialog } from '../components/registration/dialogs/EditNameDialog';
export { MyPlayerHistory } from '../components/player/MyPlayerHistory';

// --- teams ---
export { PlayerCard as TeamPlayerCard } from '../components/teams/PlayerCard';
export { TeamRoster } from '../components/teams/TeamRoster';
export { default as TeamExporter } from '../components/TeamExporter';

// --- admin ---
export { default as AdminDashboard } from '../components/admin/AdminDashboard';
export { default as AdminUserManagement } from '../components/admin/AdminUserManagement';
export { default as AdminBannedUsers } from '../components/admin/AdminBannedUsers';
export { default as AdminFeedback } from '../components/admin/AdminFeedback';
export { default as AdminLogsTab } from '../components/admin/AdminLogs';
export { default as AdminSettings } from '../components/admin/AdminSettings';
export { default as AdminTournamentVotes } from '../components/admin/AdminTournamentVotes';
export { default as BanDialog } from '../components/admin/BanDialog';

// --- pages ---
export { default as HomePage } from '../components/pages/home';
export { default as TeamsPage } from '../components/pages/teams';
export { default as RosterPage } from '../components/pages/roster';
export { default as TournamentPage } from '../components/pages/TournamentPage';
export { default as AdminLogsPage } from '../components/pages/admin-logs';
export { default as BannedPlayersPage } from '../components/pages/banned-players';
