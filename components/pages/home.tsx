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
import { Trophy, Star, Award, Zap, Scale, Vote, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Vote Popup Component - defined outside Home to prevent re-creation on each render
const VotePopup = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        />
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(145deg, rgba(20,20,30,0.98), rgba(10,10,15,0.98))",
              border: "1px solid rgba(255,215,0,0.3)",
              boxShadow: "0 0 60px rgba(255,215,0,0.2)",
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #ffd70080, #ffd70040)",
              }}
            >
              <div className="flex items-center gap-3">
                <Vote className="w-6 h-6 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Tournament Fan Awards</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="inline-block mb-4"
                >
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Cast Your Vote!
                </h3>
                <p className="text-gray-400">
                  Help decide who deserves the Fans' favorite <span className="text-yellow-400 font-semibold">Player</span> and{" "}
                  <span className="text-yellow-400 font-semibold">Goalkeeper</span> awards for this tournament.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/tournament/vote"
                  className="block w-full py-3 px-6 rounded-xl font-bold text-center transition-all duration-200 transform hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #ffd700, #ffaa00)",
                    color: "#000",
                    boxShadow: "0 0 30px rgba(255,215,0,0.3)",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Award className="w-5 h-5" />
                    Vote Now
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="block w-full py-3 px-6 rounded-xl font-medium text-center text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

/**
 * Home Component (Refactored)
 * Single Responsibility: Orchestrate registration page layout and data flow
 *
 * Before: 982 lines, 27 state variables
 * After: ~150 lines, clean separation of concerns
 */
const Home: React.FC = () => {

  const [showPopup, setShowPopup] = useState(false);
  const [showVotePopup, setShowVotePopup] = useState(false);
  

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

  // Show vote popup after a short delay if user hasn't dismissed it before
  useEffect(() => {
    const hasSeenPopup = sessionStorage.getItem('tournament-vote-popup-seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setShowVotePopup(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseVotePopup = () => {
    setShowVotePopup(false);
    sessionStorage.setItem('tournament-vote-popup-seen', 'true');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
	  {/* Vote Popup */}
      <VotePopup isOpen={showVotePopup} onClose={handleCloseVotePopup} />
	  {/* Floating Vote Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Link
          href="/tournament/vote"
          className="flex items-center gap-2 px-5 py-3 rounded-full font-bold shadow-lg transition-all duration-200 transform hover:scale-110"
          style={{
            background: "linear-gradient(135deg, #ffd700, #ffaa00)",
            color: "#000",
            boxShadow: "0 0 30px rgba(255,215,0,0.4)",
          }}
        >
          <Vote className="w-5 h-5" />
          <span className="hidden sm:inline">Vote for Awards</span>
          <span className="sm:hidden">Vote</span>
        </Link>
      </motion.div>

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
          className="fixed top-[5%] left-[5%] z-[1000] p-6 rounded-lg shadow-2xl text-center"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-popup-title"
          aria-live="polite"
        >
          <h1 id="alert-popup-title" className="text-2xl font-bold mb-4">Back to Al Maryah Alert</h1>
          <p className="mb-6">Game @ Active Al Maryah. Check The location from the nav bar</p>
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

