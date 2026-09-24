# 42 Football Club - build conventions

These are the real components of the 42 Football Club site (Next.js + Tailwind v4). Every design must follow the rules below.

## 1. Always wrap in `DesignSandbox`
Every tree must sit inside `<DesignSandbox>`. It supplies what the app's root layout provides: React Query, the NextAuth session, site config, the light/dark theme, the toast host, and demo data for every `/api/*` call. Without it, data-driven components (PlayerList, AdminDashboard, HomePage...) throw or sit in loading skeletons, and the `var(--*)` theme tokens are unset.

```jsx
const { DesignSandbox, Card, CardHeader, CardContent, Button, Icons } = window.FootballDS;
<DesignSandbox session="player" theme="light">
  <main className="max-w-6xl mx-auto px-4 pt-8">
    <Card padding="none">
      <CardHeader actions={<Button size="sm" icon={<Icons.Plus size={14} />}>Register</Button>}>This week</CardHeader>
      <CardContent><p style={{ color: 'var(--text-secondary)' }}>21 guaranteed spots - Monday 9 PM</p></CardContent>
    </Card>
  </main>
</DesignSandbox>
```

Props: `session`: `"player"` (default) | `"admin"` | `"guest"` | `"banned"`; `theme`: `"light"` | `"dark"`; `pathname` (Navbar highlight); `search` (e.g. `"tab=feedback"` for AdminDashboard); `registrationOpen`; `config` (e.g. `{ guaranteedSpots: 14, announcement: {...} }`).

## 2. Styling idiom: Tailwind utilities for layout, CSS variables for color
- **Color always comes from theme variables**, set inline: `style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}`. Tokens: `--bg-primary` (page), `--bg-secondary` (table heads, nav), `--bg-card` (cards, cream in light mode), `--text-primary`, `--text-secondary`, `--border-color`, `--input-bg`, `--paid-bg` / `--registered-txt` (confirmed players), `--unpaid-bg` / `--waitlist-txt` (waitlist). Dark mode just swaps these values, so never hardcode `#fff`-style colors for surfaces or text.
- **Brand utilities**: `bg-ft-primary` (teal #00babc, primary actions), `hover:bg-ft-secondary`, `text-ft-primary`, `text-ft-accent` / `bg-ft-accent` (orange #ff6b35), `border-ft-primary`. Status colors: `bg-green-600` success/verified, `bg-red-600` danger. Team colors: blue (team 1), green (team 2), orange (team 3).
- **Layout utilities available**: flex/grid (`grid-cols-1..6` with `sm:`/`md:`/`lg:`), `gap-*`, `p*`/`m*` spacing 0-24, `text-xs..5xl`, `font-medium|semibold|bold`, `rounded-lg`, `shadow-md`, `max-w-*`, `mx-auto`, `min-h-screen`. Only compiled classes work: if a class isn't in this list or already used by a component, use an inline style instead.
- **Fonts**: body text is DM Sans. `h1`/`h2` automatically use Rajdhani (the display face) and are centered. For display type on other elements, set `style={{ fontFamily: 'var(--font-display)' }}`.
- **Page shell**: `<div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}><Navbar /><main className="flex-1 pt-24 pb-8 px-4 md:px-8"><div className="max-w-6xl mx-auto">...</div></main><Footer /></div>`. `pt-24` clears the fixed Navbar.

## 3. Component choices
- Actions: `Button` (`variant` primary|secondary|success|danger|outline|ghost, `size` sm|md|lg, `icon`, `loading`, `fullWidth`), `IconButton`. Icons: `window.FootballDS.Icons.<Name>` (lucide set, e.g. `Icons.Trash2`, `Icons.Trophy`, `Icons.Users`).
- Surfaces: `Card` + `CardHeader`/`CardContent`/`CardFooter` (use `padding="none"` on the Card when composing the parts).
- Forms: `Input`, `Textarea`, `Select` (all take `label`, `error`, `helperText`, `fullWidth`), `StarRating`.
- Loading states: use the `*Skeleton` components (`TableRowSkeleton` inside a `<tbody>`, `PlayerListSkeleton`, `TeamCardSkeleton`...), not spinners.
- Dialogs: `ConfirmDialog` (`type` danger|warning|info) is a fixed full-screen overlay, controlled by `isOpen`.
- Domain pieces (`PlayerCard`, `PlayerList`, `TeamPlayerCard`, `TeamRoster`, `RegistrationForm`) take plain data props; see each `.d.ts`. Full pages (`HomePage`, `TeamsPage`, `AdminDashboard`...) take no props and fetch through the sandbox.

## 4. Where the truth lives
Read `styles.css` (it imports `_ds_bundle.css`, the compiled Tailwind + theme variables, and `fonts/fonts.css`) before inventing styles. Each `components/<group>/<Name>/<Name>.prompt.md` has working examples, and `<Name>.d.ts` is the prop contract.
