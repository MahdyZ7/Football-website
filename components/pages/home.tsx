import React from "react";
import { useSession } from "next-auth/react";
import { MapPin } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./footer";
import { useUsers, useAllowedStatus } from "../../hooks/useQueries";
import { useCountdown } from "../../hooks/useCountdown";
import { useRegistrationForm } from "../../hooks/useRegistrationForm";
import { usePlayerManagement } from "../../hooks/usePlayerManagement";
import { useConfig } from "../../contexts/SiteConfigContext";
import { BanNotificationBanner } from "../registration/BanNotificationBanner";
import { RemovalDialog } from "../registration/dialogs/RemovalDialog";
import { EditNameDialog } from "../registration/dialogs/EditNameDialog";
import { AnnouncementPopup } from "../AnnouncementPopup";
import { MyPlayerHistory } from "../player/MyPlayerHistory";
import { KitRack } from "../home/KitRack";
import { SignUpPanel } from "../home/SignUpPanel";
import { SquadSheet } from "../home/SquadSheet";
import { HouseRules } from "../home/HouseRules";
import { getNextMatchday, getNextSignup, formatHour } from "../home/matchday";
import { useHydrated } from "../home/useHydrated";
import styles from "../home/home.module.css";

const Home: React.FC = () => {
  // Data fetching
  const { data: registeredUsers = [], isLoading: usersLoading, error: usersError } = useUsers();
  // Until hydration finishes, render the same "checking" state as the server: the
  // schedule depends on the local clock/time zone and the query state differs.
  const hydrated = useHydrated();
  const loading = usersLoading || !hydrated;
  const { data: allowedData } = useAllowedStatus();
  const isSubmissionAllowed = allowedData?.isAllowed ?? false;
  const { data: session } = useSession();
  const { config } = useConfig();

  // Custom hooks for business logic
  const timeUntilNext = useCountdown();
  const registrationForm = useRegistrationForm();
  const playerManagement = usePlayerManagement();

  // Banned players don't appear and don't count toward spots
  const visible = registeredUsers.filter((u) => !u.is_banned);
  const confirmed = visible.filter((u) => (u.registration_status ?? "confirmed") === "confirmed");
  const bench = visible.filter((u) => u.registration_status === "waitlisted");
  const spots = config.guaranteedSpots;
  const shirtsLeft = Math.max(0, spots - confirmed.length);

  const isOwn = (u: { owned_by_current_user?: boolean }) => !!session && !!u.owned_by_current_user;
  const ownShirt = confirmed.findIndex(isOwn);
  const ownBench = bench.findIndex(isOwn);
  const ownSpot =
    ownShirt >= 0 ? { kind: "shirt" as const, number: ownShirt + 1 }
      : ownBench >= 0 ? { kind: "bench" as const, number: ownBench + 1 }
        : null;

  const matchday = hydrated ? getNextMatchday(config) : null;
  const when = matchday ? `${matchday.isToday ? "Tonight" : matchday.game.dayName}, ${matchday.game.time}` : null;
  const nextSignup = hydrated ? getNextSignup(config) : null;
  const opensAt = nextSignup ? `${nextSignup.window.dayName} at ${formatHour(nextSignup.window.openHour)}` : null;

  let headline: string;
  let subline: string | null = null;
  if (loading) {
    headline = when ? `${when}.` : "Checking the squad…";
  } else if (isSubmissionAllowed) {
    headline = shirtsLeft > 0
      ? `${when ?? "Next game"}. ${shirtsLeft} ${shirtsLeft === 1 ? "shirt" : "shirts"} left.`
      : `${when ?? "Next game"}. Every shirt is taken.`;
    if (matchday?.window) {
      subline = `Sign-up closes ${matchday.isToday ? "today" : matchday.game.dayName} at ${formatHour(matchday.window.closeHour)}.`;
    }
  } else if (matchday?.isToday && confirmed.length > 0) {
    // Tonight's squad is set; point at the next window.
    headline = `${when}. Sign\u2011up is closed.`;
    if (opensAt) {
      subline = `Next sign-up opens ${opensAt}${nextSignup?.game ? `, for ${nextSignup.game.dayName}'s game` : ""}.`;
    }
  } else {
    const game = nextSignup?.game ?? matchday?.game;
    headline = game ? `Next game: ${game.dayName}, ${game.time}.` : "No games scheduled.";
    if (opensAt) subline = `Sign-up opens ${opensAt}.`;
  }

  const rackPlayers = (list: typeof confirmed) =>
    list.map((u) => ({ name: u.name, intra: u.intra, isOwn: isOwn(u) }));

  return (
    <div className={`${styles.scope} min-h-screen flex flex-col`}>
      <Navbar />

      <main className="flex-1 pt-24 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <BanNotificationBanner />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-8 pt-6 md:pt-10">
            <header className="lg:col-span-7">
              <h1 className={styles.headline}>{headline}</h1>
              {subline && <p className="mt-4 text-[1.3125rem] leading-snug m-0">{subline}</p>}
              <p className="mt-3 flex items-center gap-2 text-[0.9375rem]" style={{ color: "var(--hm-ink-soft)" }}>
                <MapPin size={16} aria-hidden="true" />
                {config.location}
              </p>
            </header>

            <div className="lg:col-span-5 lg:row-span-2">
              <div className="lg:sticky lg:top-28">
                <SignUpPanel
                  name={registrationForm.name}
                  intra={registrationForm.intra}
                  errors={registrationForm.errors}
                  nameInputRef={registrationForm.nameInputRef as React.RefObject<HTMLInputElement>}
                  intraInputRef={registrationForm.intraInputRef as React.RefObject<HTMLInputElement>}
                  submitButtonRef={registrationForm.submitButtonRef as React.RefObject<HTMLButtonElement>}
                  isSubmitting={registrationForm.isSubmitting}
                  isAllowed={isSubmissionAllowed}
                  loading={loading}
                  opensAt={opensAt}
                  timeUntilNext={timeUntilNext}
                  ownSpot={ownSpot}
                  benchMode={!loading && shirtsLeft === 0}
                  onNameChange={registrationForm.handleNameChange}
                  onIntraChange={registrationForm.handleIntraChange}
                  onKeyDown={registrationForm.handleKeyDown}
                  onSubmit={(e) => registrationForm.handleSubmit(e, isSubmissionAllowed)}
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <KitRack confirmed={rackPlayers(confirmed)} bench={rackPlayers(bench)} spots={spots} />
            </div>
          </div>

          <div className="mt-20">
            <SquadSheet
              confirmed={confirmed}
              bench={bench}
              loading={loading}
              error={usersError}
              isAdmin={session?.user?.isAdmin || false}
              isSignedIn={!!session}
              gracePeriodMinutes={config.gracePeriodMinutes}
              onRemove={playerManagement.initiateRemoval}
              onEditName={playerManagement.initiateEditName}
            />
          </div>

          <div className="mt-20">
            <HouseRules />
          </div>

          <div className="mt-20 [&>section]:mx-0 [&>section]:max-w-none">
            <MyPlayerHistory />
          </div>
        </div>
      </main>

      <Footer />

      <AnnouncementPopup />

      {/* Dialogs */}
      <RemovalDialog
        isOpen={playerManagement.showRemoveDialog}
        targetIntra={playerManagement.targetIntra}
        removeReason={playerManagement.removeReason}
        users={registeredUsers}
        onReasonChange={playerManagement.setRemoveReason}
        onConfirm={playerManagement.handleSelfRemove}
        onCancel={playerManagement.closeRemovalDialog}
      />

      <EditNameDialog
        isOpen={playerManagement.showEditNameDialog}
        nameValue={playerManagement.editNameValue}
        isPending={playerManagement.isEditingName}
        onNameChange={playerManagement.setEditNameValue}
        onConfirm={playerManagement.handleEditName}
        onCancel={playerManagement.closeEditNameDialog}
      />
    </div>
  );
};

export default Home;
