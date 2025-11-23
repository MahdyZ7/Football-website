
import React, { useState, useEffect, FormEvent, useRef, KeyboardEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "./Navbar";
import Footer from "./footer";
import { GuaranteedSpot, Toast } from "../../types/user";
import { getNextRegistration } from "../../lib/utils/allowed_times";
import { useUsers, useAllowedStatus, useRegisterUser } from "../../hooks/useQueries";


const Home: React.FC = () => {
  // State management
  const [showPopup, setShowPopup] = useState(false);
  const [name, setName] = useState("");
  const [intra, setIntra] = useState("");
  const [timeUntilNext, setTimeUntilNext] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nameError, setNameError] = useState("");
  const [intraError, setIntraError] = useState("");
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [removeReason, setRemoveReason] = useState("");

  // Refs for form navigation
  const nameInputRef = useRef<HTMLInputElement>(null);
  const intraInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // React Query hooks
  const { data: registeredUsers = [], isLoading: loading, error: usersError } = useUsers();
  const { data: allowedData } = useAllowedStatus();
  const registerUserMutation = useRegisterUser();
  const { data: session } = useSession();

  const isSubmissionAllowed = allowedData?.isAllowed ?? false;

  // Check if current user is registered
  const userRegistration = registeredUsers.find(
    (user) => user.intra === intra || (session?.user?.id && user.user_id === session.user.id)
  );

  // Timer effects
  useEffect(() => {
	const next = getNextRegistration();
    const updateCountdown = () => {
      const now = new Date();
      const diff = next.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeUntilNext(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`);
        }
      } else {
        setTimeUntilNext("Registration should be open now");
      }
    };

    // Update countdown every second for accurate display
    const countdownTimer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => {
      clearInterval(countdownTimer);
    };
  }, []);

  // Popup timer
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: Toast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Form validation
  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (value.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const validateIntra = (value: string): boolean => {
    if (!value.trim()) {
      setIntraError("Intra login is required");
      return false;
    }
    if (value.trim().length < 3) {
      setIntraError("Intra login must be at least 3 characters");
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) {
      setIntraError("Intra login can only contain letters, numbers, - and _");
      return false;
    }
    setIntraError("");
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim()) {
      validateName(value);
    } else {
      setNameError("");
    }
  };

  const handleIntraChange = (value: string) => {
    setIntra(value);
    if (value.trim()) {
      validateIntra(value);
    } else {
      setIntraError("");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, currentField: 'name' | 'intra') => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      if (currentField === 'name' && intraInputRef.current) {
        intraInputRef.current.focus();
      } else if (currentField === 'intra' && submitButtonRef.current) {
        submitButtonRef.current.click();
      }
    }
  };

  const handleSelfRemove = async (intra: string, isAdminRemoval: boolean = false) => {
    try {
      const axios = (await import('axios')).default;

      if (isAdminRemoval && session?.user?.isAdmin) {
        // Admin removing another player - use admin endpoint
        // Admin must select a reason
        if (!removeReason) {
          showToast("Please select a reason for removal", 'error');
          return;
        }

        const response = await axios.post("/api/admin/remove-player", {
          intra,
          reason: removeReason
        });
        showToast(response.data.message || "Player removed successfully", 'success');
      } else {
        // Self-removal - reason is optional if within 15-minute grace period
        const response = await axios.post("/api/self-remove", {
          intra,
          reason: removeReason || undefined
        });
        showToast(response.data.message, 'success');
      }

      setShowRemoveDialog(false);
      setRemoveReason("");
    } catch (error: any) {
      showToast(error.response?.data?.error || "Failed to remove registration", 'error');
    }
  };

  const initiateRemoval = (intra: string) => {
    const player = registeredUsers.find(u => u.intra === intra);

    // Store the intra for the dialog
    setIntra(intra);

    // Always show TIG dialog for both admin and self-removal
    setShowRemoveDialog(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Check authentication
    if (!session) {
      showToast("Please sign in to register", 'error');
      return;
    }

    // Handle admin reset
    if (name.toLowerCase().endsWith("mangoose")) {
      const loadingToastId = Date.now();
      showToast("Resetting user list...", 'info');
      try {
        const axios = (await import('axios')).default;
        await axios.delete("/api/register", {
          data: { name, intra },
          headers: { "X-Secret-Header": name },
        });
        removeToast(loadingToastId);
        showToast("User list has been reset.", 'success');
        return;
      } catch {
        removeToast(loadingToastId);
        showToast("Error resetting user list.", 'error');
        return;
      }
    }

    // Validate submission
    if (!isSubmissionAllowed) {
      showToast("Registration is only allowed on Sunday and Wednesday after 12 PM (noon) till 8 PM the next day.", 'error');
      return;
    }

    // Validate form fields
    const isNameValid = validateName(name);
    const isIntraValid = validateIntra(intra);

    if (!isNameValid || !isIntraValid) {
      showToast("Please fix the errors in the form", 'error');
      return;
    }

    // Submit registration using React Query mutation
    registerUserMutation.mutate(
      { name, intra },
      {
        onSuccess: () => {
          showToast('Registration successful!', 'success');
          setName("");
          setIntra("");
          setNameError("");
          setIntraError("");
          // Focus back to name field for next registration
          nameInputRef.current?.focus();
        },
        onError: (error: unknown) => {
          if (typeof error === 'object' && error !== null && 'response' in error) {
            const response = (error as { response: { status: number, data?: any } }).response;
            const { status, data } = response;
            if (status === 401) {
              showToast(data?.error || "Please sign in to register", 'error');
            } else if (status === 403) {
              showToast(data?.error || "Players limit reached. Better luck next time!", 'error');
            } else if (status === 409) {
              showToast(`A user with the Intra-login ${intra} already exists.`, 'error');
            } else if (status === 404) {
              showToast(`User with Intra-login ${intra} not found. Please enter name also`, 'error');
            } else {
              showToast(data?.error || "Registration failed. Please try again.", 'error');
            }
          } else {
            showToast("Registration failed. Please try again.", 'error');
          }
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
            Football Registration
          </h1>
			<p className=" text-center text-m"> Game time: 9 PM - Mondays and Thursdays</p>
			<p className=" text-center text-m"> Registration opens: 12 noon - Sundays and Wednesdays</p>
			<p className=" text-center text-m mb-6"> Location: Outdoor Pitch 2 - Active Al Maria</p>


        {/* Authentication Notice */}
        {!session && (
          <div className="max-w-md mx-auto mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-center text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              🔐 Please <Link href="/auth/signin" className="underline font-bold hover:text-ft-primary transition-colors">sign in</Link> to register for matches
            </p>
            <p className="text-center text-xs" style={{ color: 'var(--text-secondary)' }}>
              New here? An account will be created automatically when you sign in
            </p>
          </div>
        )}

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto p-8 rounded-lg shadow-md mb-12"
          style={{ backgroundColor: 'var(--bg-secondary)' }}
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block mb-2 font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Name:
            </label>
            <input
              ref={nameInputRef}
              type="text"
              id="name"
              value={name}
              autoComplete="name"
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'name')}
              className={`w-full px-4 py-3 rounded border-2 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:border-transparent
                         ${nameError ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-ft-primary'}`}
              style={{
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)'
              }}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : undefined}
            />
            {nameError && (
              <p id="name-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {nameError}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="intra"
              className="block mb-2 font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Intra login:
            </label>
            <input
              ref={intraInputRef}
              type="text"
              id="intra"
              value={intra}
              autoComplete="intra"
              onChange={(e) => handleIntraChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, 'intra')}
              className={`w-full px-4 py-3 rounded border-2 transition-all duration-200
                         focus:outline-none focus:ring-2 focus:border-transparent
                         ${intraError ? 'border-red-500 focus:ring-red-500' : 'border-transparent focus:ring-ft-primary'}`}
              style={{
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)'
              }}
              aria-invalid={!!intraError}
              aria-describedby={intraError ? "intra-error" : undefined}
            />
            {intraError && (
              <p id="intra-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span>⚠</span> {intraError}
              </p>
            )}
          </div>

          {!loading && (
            <>
              <button
                ref={submitButtonRef}
                type="submit"
                className={`relative w-full text-white font-semibold py-4 px-6 rounded-lg
                           shadow-md transition-all duration-200 overflow-hidden
                           focus:outline-none focus:ring-2 focus:ring-ft-primary focus:ring-offset-2
                           ${registerUserMutation.isPending || !isSubmissionAllowed
                             ? 'bg-gray-400 cursor-not-allowed'
                             : 'bg-ft-primary hover:bg-ft-secondary hover:shadow-lg active:scale-[0.98] hover:scale-[1.02]'
                           }`}
                disabled={registerUserMutation.isPending || !isSubmissionAllowed}
              >
                {registerUserMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Register Now'
                )}
              </button>
              {!isSubmissionAllowed && (
                <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                  <p className="text-center text-sm font-medium text-orange-700 dark:text-orange-300">
                    📅 Next registration: {timeUntilNext}
                  </p>
                </div>
              )}
            </>
          )}
        </form>

        {/* Ban Rules Table */}
        <div className="max-w-4xl mx-auto mb-12 rounded-lg shadow-md overflow-hidden"
             style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-xl font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
              Late TIG
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Action
                  </th>
                  <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Ban Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    Cancel reservation
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                    One week (or Two weeks if on game day after 5 PM)
                  </td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    Not ready when booking time starts
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                    Half a week
                  </td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    Late {">"} 15 minutes
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                    One week
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    No Show without notice
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                    Four weeks
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              <strong>Note:</strong> You can remove your registration without a ban within 15 minutes of registering.
            </p>
          </div>
        </div>

        {/* Player List */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
            Player List
          </h2>
		  <div className={`max-w-2xl mx-auto mb-6 rounded-xl shadow-lg overflow-hidden transition-all duration-300 
			bg-gradient-to-b from-stone-700 to-zinc-700`}>
		  <div className="bg-white/20 backdrop-blur-sm text-center rounded-lg px-4 py-2 text-white">
                <div className="text-2xl font-bold">{registeredUsers.length}/21</div>
                <div className="text-xs">Spots Filled</div>
            </div>
		  <div className="bg-black/50 h-2 mb-6">
                <div
                  className="bg-white/50 h-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((registeredUsers.length / GuaranteedSpot) * 100, 100)}%` }}
                />
              </div>
			</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {loading ? (
              <div className="col-span-full text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                Loading players...
              </div>
            ) : usersError ? (
              <div className="col-span-full text-center py-8 text-red-600 font-medium">
                Error loading players. Please refresh the page.
              </div>
            ) : registeredUsers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-red-600 font-bold text-xl">
                Dare to be First
              </div>
            ) : (
              registeredUsers.map((user, index) => {
                // User can remove their own registration OR admin can remove anyone
                const isOwnRegistration = session && user.user_id && user.user_id === session.user.id;
                const isAdmin = session?.user?.isAdmin;
                const canRemove = isOwnRegistration || isAdmin;

                return (
                  <div
                    key={user.intra}
                    className={`p-4 rounded-lg border-l-4 flex items-center justify-between transition-all duration-200 ${
                      index < GuaranteedSpot ? 'hover:scale-[1.02]' : ''
                    }`}
                    style={{
                      backgroundColor: index < GuaranteedSpot ? 'var(--paid-bg)' : 'var(--unpaid-bg)',
                      borderLeftColor: index < GuaranteedSpot ? '#16a34a' : 'var(--ft-accent)',
                      color: index < GuaranteedSpot ? 'var(--registered-txt)' : 'var(--waitlist-txt)'
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-bold text-lg min-w-[2rem]">
                        {index + 1}
                      </span>
                      <div className="flex flex-col flex-1">
                        <span className="font-semibold">{user.name}</span>
                        <span className="text-sm opacity-80">{user.intra}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xl">
                        {user.verified ? (
                          "✅"
                        ) : (
                          <span className="text-red-600 text-sm font-medium">Invalid Intra</span>
                        )}
                      </div>
                      {canRemove && (
                        <button
                          onClick={() => initiateRemoval(user.intra)}
                          className="ml-2 w-8 h-8 flex items-center justify-center rounded-full
                                     bg-red-600 hover:bg-red-700 text-white transition-all duration-200
                                     hover:scale-110 active:scale-95"
                          title={isAdmin && !isOwnRegistration
                            ? "Remove player and apply TIG ban (Admin)"
                            : "Remove my registration"}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Banned Players Card */}
        <div className="max-w-4xl mx-auto mb-12 rounded-lg shadow-md overflow-hidden"
             style={{ backgroundColor: 'var(--bg-card)' }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="text-xl font-semibold text-center" style={{ color: 'var(--text-primary)' }}>
              Banned Players
            </h3>
          </div>
          <div className="px-6 py-8">
            <p className="text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
              Players currently banned from registering
            </p>
            <div className="text-center">
              <Link
                href="/banned-players"
                className="inline-block px-6 py-3 bg-ft-primary hover:bg-ft-secondary text-white
                           font-semibold rounded transition-all duration-200 transform hover:scale-105"
              >
                View Banned Players List
              </Link>
            </div>
          </div>
        </div>
        </div>
      </main>

      <Footer />

      {/* Alert Popup */}
      {showPopup && (
        <div
          className="fixed top-[5%] left-[5%] z-[1000] p-6 rounded-lg shadow-2xl text-center"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
        >
          <h1 className="text-2xl font-bold mb-4">Back to Al Maryah Alert</h1>
          <p className="mb-6">Game @ Active Al Maryah. Check The location from the nav bar</p>
          <button
            onClick={() => setShowPopup(false)}
            className="px-6 py-2 bg-ft-primary hover:bg-ft-secondary text-white font-semibold
                       rounded transition-colors duration-200"
          >
            Close
          </button>
        </div>
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              ×
            </button>
          </div>
        ))}
      </div>

      {/* TIG Removal Dialog */}
      {showRemoveDialog && (() => {
        const targetIntra = intra || userRegistration?.intra || '';
        const targetUser = registeredUsers.find(u => u.intra === targetIntra);
        const isAdminAction = session?.user?.isAdmin && targetUser?.user_id !== session.user.id;

        // Check if within 15-minute grace period for self-removal
        const registrationTime = targetUser?.created_at ? new Date(targetUser.created_at) : null;
        const now = new Date();
        const minutesSinceRegistration = registrationTime
          ? (now.getTime() - registrationTime.getTime()) / (1000 * 60)
          : Infinity;
        const withinGracePeriod = !isAdminAction && minutesSinceRegistration <= 15;

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
            <div className="rounded-lg shadow-2xl p-8 max-w-md w-full" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                {isAdminAction ? "Remove Player (Admin)" : "Remove Registration"}
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                {isAdminAction
                  ? "Select the reason for removing this player:"
                  : withinGracePeriod
                  ? "You can remove your registration without a ban (within 15-minute grace period) or select a cancellation reason:"
                  : "Select the reason for cancelling your registration:"}
              </p>

              <div className="space-y-3 mb-6">
                {/* Grace period option for users within 15 minutes */}
                {!isAdminAction && withinGracePeriod && (
                  <label className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-green-500"
                         style={{ borderColor: 'var(--border-color)', borderWidth: '2px' }}>
                    <input
                      type="radio"
                      name="removeReason"
                      value=""
                      checked={removeReason === ""}
                      onChange={() => setRemoveReason("")}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-green-600">
                        Remove without ban (Grace Period)
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        No ban - Within 15 minutes of registration
                      </div>
                    </div>
                  </label>
                )}

                {/* Cancel reservation - for users only */}
                {!isAdminAction && (
                  <label className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                         style={{ borderColor: 'var(--border-color)' }}>
                    <input
                      type="radio"
                      name="removeReason"
                      value="CANCEL"
                      checked={removeReason === "CANCEL"}
                      onChange={(e) => setRemoveReason(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        Cancel reservation
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Ban: 1 week (or 2 weeks if game day after 5 PM)
                      </div>
                    </div>
                  </label>
                )}

                {/* Admin-only options */}
                {isAdminAction && (
                  <>
                    <label className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                           style={{ borderColor: 'var(--border-color)' }}>
                      <input
                        type="radio"
                        name="removeReason"
                        value="NO_BAN"
                        checked={removeReason === "NO_BAN"}
                        onChange={(e) => setRemoveReason(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Remove without ban
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          No ban applied
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                           style={{ borderColor: 'var(--border-color)' }}>
                      <input
                        type="radio"
                        name="removeReason"
                        value="CANCEL"
                        checked={removeReason === "CANCEL"}
                        onChange={(e) => setRemoveReason(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Cancel reservation
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Ban: One week (7 days)
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                           style={{ borderColor: 'var(--border-color)' }}>
                      <input
                        type="radio"
                        name="removeReason"
                        value="CANCEL_GAME_DAY"
                        checked={removeReason === "CANCEL_GAME_DAY"}
                        onChange={(e) => setRemoveReason(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Cancel on game day after 5 PM
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Ban: Two weeks (14 days)
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                           style={{ borderColor: 'var(--border-color)' }}>
                      <input
                        type="radio"
                        name="removeReason"
                        value="NOT_READY"
                        checked={removeReason === "NOT_READY"}
                        onChange={(e) => setRemoveReason(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Not ready when booking time starts
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Ban: Half a week (3.5 days)
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                           style={{ borderColor: 'var(--border-color)' }}>
                      <input
                        type="radio"
                        name="removeReason"
                        value="LATE"
                        checked={removeReason === "LATE"}
                        onChange={(e) => setRemoveReason(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Late &gt; 15 minutes
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Ban: One week (7 days)
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                           style={{ borderColor: 'var(--border-color)' }}>
                      <input
                        type="radio"
                        name="removeReason"
                        value="NO_SHOW"
                        checked={removeReason === "NO_SHOW"}
                        onChange={(e) => setRemoveReason(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          No Show without notice
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Ban: Four weeks (28 days)
                        </div>
                      </div>
                    </label>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRemoveDialog(false);
                    setRemoveReason("");
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white
                             font-medium rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleSelfRemove(targetIntra, isAdminAction);
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white
                             font-medium rounded-lg transition-all duration-200"
                >
                  {isAdminAction ? "Remove Player" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Home;
