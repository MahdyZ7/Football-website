import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./footer";
import { useUsers, useAllowedStatus } from "../../hooks/useQueries";
import { useToastNotifications } from "../../hooks/useToastNotifications";
import { useCountdown } from "../../hooks/useCountdown";
import { useRegistrationForm } from "../../hooks/useRegistrationForm";
import { usePlayerManagement } from "../../hooks/usePlayerManagement";
import { RegistrationForm } from "../registration/RegistrationForm";
import { PlayerList } from "../registration/PlayerList";
import { BanRulesTable } from "../registration/BanRulesTable";
import { BannedPlayersCard } from "../registration/BannedPlayersCard";
import { RemovalDialog } from "../registration/dialogs/RemovalDialog";
import { EditNameDialog } from "../registration/dialogs/EditNameDialog";
import { ToastContainer } from "../registration/ToastContainer";
import { Button } from "../ui/Button";

const Home: React.FC = () => {

  const [showPopup, setShowPopup] = useState(true);
  

  // Data fetching
  const { data: registeredUsers = [], isLoading: loading, error: usersError } = useUsers();
  const { data: allowedData } = useAllowedStatus();
  const isSubmissionAllowed = allowedData?.isAllowed ?? false;

  // Custom hooks for business logic
  const { toasts, showToast, removeToast } = useToastNotifications();
  const timeUntilNext = useCountdown();

  const registrationForm = useRegistrationForm(showToast);

  const playerManagement = usePlayerManagement(showToast);

  // Popup timer
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
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

      {/* Alert Popup */}
      {showPopup && (
        <div
          className="fixed top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-[1000] p-6 rounded-lg shadow-2xl text-center"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-popup-title"
          aria-live="polite"
        >
          <h1 id="alert-popup-title" className="text-2xl font-bold mb-4">Game Time Change</h1>
          <p className="mb-6">Game at 8 PM - Indoor Pitch 2 - Active Al Maria</p>
          <Button
            onClick={() => setShowPopup(false)}
            variant="primary"
            size="lg"
            aria-label="Close location alert popup"
          >
            Close
          </Button>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

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

