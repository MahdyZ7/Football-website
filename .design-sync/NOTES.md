# design-sync notes (42 Football Club -> claude.ai/design)

Project: https://claude.ai/design/p/82174d6d-e5cd-43d9-b04b-55ffc2b0a5b0 (pinned in config.json)

## How this repo is synced (it is a Next.js app, not a component library)
- No dist/: `.design-sync/entry.ts` is the export list (re-exports components/**; default exports get
  names; teams/PlayerCard -> `TeamPlayerCard`; pages get a `Page` suffix: HomePage, TeamsPage, RosterPage,
  AdminLogsPage, BannedPlayersPage). `Icons` = curated lucide-react set (`.design-sync/icons.ts`).
- `.design-sync/package.json` exists ONLY so the converter's PKG_DIR is `.design-sync/` and its `types`
  points at `.cache/types/index.d.ts` (tsc declarations of entry.ts). All cfg paths are relative to
  `.design-sync/` (srcDir `../components`, componentSrcMap `../components/...`).
- Build: `node .design-sync/prepare.mjs` (cfg.buildCmd: Tailwind CSS -> .cache/ds.css, tsc -> .cache/types),
  then `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules
  --entry ./.design-sync/entry.ts --out ./ds-bundle`. Re-run prepare whenever previews add Tailwind classes
  (the CSS is JIT-scanned from components/, hooks/, contexts/, .design-sync/{sandbox,previews}).
- Next.js/NextAuth runtime modules are swapped via `.design-sync/tsconfig.json` `paths` (the converter's
  tsconfig-paths esbuild plugin): next/link, next/navigation, next/image, next-auth/react -> `.design-sync/shims/`.
  The three roster kit PNG imports (4.3 MB) are aliased the same way to downscaled webp modules
  (`node .design-sync/build-assets.mjs` regenerates them + team logos via the app's sharp).
- `DesignSandbox` (`.design-sync/sandbox/`) = the app's layout.tsx provider stack + in-memory router +
  demo session + a window.fetch mock for /api/* (fixtures.ts, shapes mirror app/api/* handlers, names from
  scripts/seed-dev-data.ts). It is cfg.provider, so every preview cell is wrapped in it by default; nest
  another `<DesignSandbox session="admin">` etc. inside a cell to change session/theme/route.
- Fonts: DM Sans + Rajdhani latin woff2 downloaded from Google Fonts into `.design-sync/fonts/` (OFL),
  mirroring app/layout.tsx next/font setup; `--font-display`/`--font-body` defined in styles.src.css.
- guidelinesGlob is [] on purpose: docs/*.md are DB/auth/service-account ops docs, not design guidance.

## Gotchas hit
- The converter's tsconfig reader strips `/* ... */` naively: glob strings like `"@/*"` + `"**/*"` in the
  same file get eaten as a block comment and the paths plugin silently returns null (then real next/* gets
  bundled, 9 MB). Keep `.design-sync/tsconfig.json` free of `/*` and `//` sequences; no `"//"` keys.
- Without the `.design-sync/package.json` types entry every `<Name>.d.ts` is `[key: string]: unknown`.
- Types referencing app-local types (User, Team, BanTarget, RemovalReason, Session, SiteConfig) are
  hand-inlined in cfg.dtsPropsFor - update them if those prop interfaces change.
- Doc `category` only regroups components whose folder group is generic (components/ root, components/ui).
  admin/, pages/, registration/, dialogs/, player/, teams/ keep their folder names as groups.
- [data-theme] vars: ThemeProvider sets data-theme on <html> after mount; styles.src.css has a
  `:root:not([data-theme])` light fallback. `DesignSandbox theme="dark"` scopes dark vars to a wrapper div.
- Validate needs playwright 1.58.2 (matches cached chromium-1208) installed into .ds-sync/.

## App-side issues surfaced by the sync (faithfully rendered, not preview bugs)
- IconButton: fixed w-8/w-10/w-12 plus Button's px-3/px-4 padding leaves ~8px for the icon (TeamRoster X,
  AdminFeedback Eye render tiny in the app too).
- ui/dropdown-menu (shadcn) uses bg-popover / bg-accent / text-popover-foreground tokens the app never
  defines -> transparent menu. Unused in the app; previews pass theme vars via style.
- tailwind.config.js is NOT loaded by Tailwind v4 (no @config in globals.css): its custom colors/spacing
  (status-*, theme-*, spacing xs..3xl, shadow-card...) generate nothing. LoadingSpinner's
  `border-t-status-registered` arc is therefore uncoloured in the app too.
- Modal overlays using `bg-black bg-opacity-50` (RemovalDialog, EditNameDialog, ...) render SOLID black:
  bg-opacity-* was removed in Tailwind v4 (use bg-black/50). ConfirmDialog/AnnouncementPopup use bg-black/50 and are fine.
- RemovalDialog (admin) has no max-height; it overflows viewports under ~900px tall.
- React DOM props are filtered from .d.ts extraction and next's @vercel/og types inject a fake `tw` prop;
  Button/IconButton/Input/Textarea/Select/Card contracts are hand-written in cfg.dtsPropsFor for that reason.
- ThemeToggle is fixed top-5 right-5 and overlaps the Navbar's Sign Out button on every page.
- AdminTournamentVotes uses plain <img src="/teams/*.png">: aliased '../../lib/constants/tournament' to
  shims/tournament-constants.ts (logos -> bundled data URLs). The shim imports the real module with a '.ts'
  suffix on purpose to dodge the exact-match alias.

## Previews
- One `.design-sync/previews/<Name>.tsx` per component (56). Shared demo data: previews/_fixtures.ts.
- Fixed/overlay components (dialogs, Navbar, pages, toasts) render inside a `transform: translateZ(0)` frame
  so position:fixed stays inside the cell; validate still flags them [GRID_OVERFLOW] escape, so they use
  cardMode "single" + primaryStory (other stories stay in the .tsx / prompt examples).
- ConfirmDialog/BanDialog frames start with an sr-only caption: validate treats a cell whose text starts
  with the ⚠ emoji as a caught-error card (false positive on the dialogs' ⚠️ titles).
- styles.src.css safelists common layout/spacing/type utilities (@source inline) so designs can use them;
  conventions.md tells the agent to use inline styles for anything else.

## Re-sync
- Adding a component to components/: export it in entry.ts, add it to cfg.componentSrcMap, write its preview.
- Commands: re-copy the skill scripts into .ds-sync/ (+ `npm i esbuild ts-morph @types/react playwright@1.58.2`
  there), fetch the project's `_ds_sync.json` to `.design-sync/.cache/remote-sync.json`, run
  `node .design-sync/prepare.mjs`, then `node .ds-sync/resync.mjs --config .design-sync/config.json
  --node-modules ./node_modules --entry ./.design-sync/entry.ts --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json`.
- Grading aids used on the first sync (montage.mjs, liveshot.mjs) lived in the gitignored .cache/; recreate
  if needed (sharp tiles of _screenshots/review/raw; a playwright shot without the fixed clock).

## Known render warns / harness artifacts
- RosterPage, TournamentPage: package-capture review shots are near-black because the harness pins the clock
  (page.clock.setFixedTime), freezing framer-motion entrance animations at opacity 0. Verified with a
  live-clock screenshot (.design-sync/.cache/liveshot.mjs, local aid) - the live cards render fully.
- Dates in captures read May 2024 for the same reason (fixed clock); fixtures are relative to Date.now().

## Re-sync risks
- fixtures.ts / dtsPropsFor duplicate API response shapes and prop types by hand - they rot silently if
  app/api/* responses or component prop interfaces change.
- shims/ stand in for Next.js APIs; a component using a new next/* API (e.g. useParams values, redirect)
  needs the shim extended.
- conventions.md names real classes/tokens/components; re-validate it against the build on every re-sync.
- Fonts were fetched from fonts.gstatic.com at sync time (v17 files); refresh only if the app changes fonts.
