import React from "react";
import Navbar from "./Navbar";
import Footer from "./footer";
import { useUsers, useAllowedStatus } from "../../hooks/useQueries";
import { useCountdown } from "../../hooks/useCountdown";
import { useRegistrationForm } from "../../hooks/useRegistrationForm";
import { usePlayerManagement } from "../../hooks/usePlayerManagement";
import { RegistrationForm } from "../registration/RegistrationForm";
import { PlayerList } from "../registration/PlayerList";
import { BanRulesTable } from "../registration/BanRulesTable";
import { BannedPlayersCard } from "../registration/BannedPlayersCard";
import { BanNotificationBanner } from "../registration/BanNotificationBanner";
import { RemovalDialog } from "../registration/dialogs/RemovalDialog";
import { EditNameDialog } from "../registration/dialogs/EditNameDialog";
import { AnnouncementPopup } from "../AnnouncementPopup";

const Home: React.FC = () => {
  // Data fetching
  const { data: registeredUsers = [], isLoading: loading, error: usersError } = useUsers();
  const { data: allowedData } = useAllowedStatus();
  const isSubmissionAllowed = allowedData?.isAllowed ?? false;

  // Custom hooks for business logic
  const timeUntilNext = useCountdown();

  const registrationForm = useRegistrationForm();

  const playerManagement = usePlayerManagement();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Ban Notification */}
          <BanNotificationBanner />

          {/* Registration Form */}
          <RegistrationForm
            name={registrationForm.name}
            intra={registrationForm.intra}
            errors={registrationForm.errors}
            nameInputRef={registrationForm.nameInputRef as React.RefObject<HTMLInputElement>}
            intraInputRef={registrationForm.intraInputRef as React.RefObject<HTMLInputElement>}
            submitButtonRef={registrationForm.submitButtonRef as React.RefObject<HTMLButtonElement>}
            isSubmitting={registrationForm.isSubmitting}
            isAllowed={isSubmissionAllowed}
            timeUntilNext={timeUntilNext}
            loading={loading}
            onNameChange={registrationForm.handleNameChange}
            onIntraChange={registrationForm.handleIntraChange}
            onKeyDown={registrationForm.handleKeyDown}
            onSubmit={(e) => registrationForm.handleSubmit(e, isSubmissionAllowed)}
          />

          {/* Ban Rules Table */}
          <BanRulesTable />

          {/* Player List */}
          <PlayerList
            users={registeredUsers}
            loading={loading}
            error={usersError}
            onRemove={playerManagement.initiateRemoval}
            onEditName={playerManagement.initiateEditName}
          />

          {/* Banned Players Card */}
          <BannedPlayersCard />
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

