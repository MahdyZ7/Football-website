
import React, { useState, useEffect, FormEvent, useRef, KeyboardEvent } from "react";
import Link from "next/link";
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

  // Refs for form navigation
  const nameInputRef = useRef<HTMLInputElement>(null);
  const intraInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // React Query hooks
  const { data: registeredUsers = [], isLoading: loading, error: usersError } = useUsers();
  const { data: allowedData } = useAllowedStatus();
  const registerUserMutation = useRegisterUser();

  const isSubmissionAllowed = allowedData?.isAllowed ?? false;

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

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
            const response = (error as { response: { status: number } }).response;
            const { status } = response;
            if (status === 403) {
              showToast("Players limit reached. Better luck next time!", 'error');
            } else if (status === 409) {
              showToast(`A user with the Intra-login ${intra} already exists.`, 'error');
            } else if (status === 404) {
              showToast(`User with Intra-login ${intra} not found. Please enter name also`, 'error');
            } else {
              showToast("Registration failed. Please try again.", 'error');
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

          {/* Registration Status Banner */}
          <div className={`max-w-2xl mx-auto mb-6 rounded-xl shadow-lg overflow-hidden transition-all duration-300
                          ${isSubmissionAllowed ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-orange-500 to-red-600'}`}>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{isSubmissionAllowed ? '✅' : '🔒'}</div>
                  <div>
                    <h3 className="text-white font-bold text-lg md:text-xl">
                      {isSubmissionAllowed ? 'Registration Open!' : 'Registration Closed'}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {isSubmissionAllowed
                        ? 'Sign up now before spots fill up'
                        : `Opens in: ${timeUntilNext}`}
                    </p>
                  </div>
                </div>
                {isSubmissionAllowed && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
                    <div className="text-2xl font-bold">{registeredUsers.length}/21</div>
                    <div className="text-xs">Spots Filled</div>
                  </div>
                )}
              </div>
            </div>
            {isSubmissionAllowed && (
              <div className="bg-black/20 h-2">
                <div
                  className="bg-white h-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((registeredUsers.length / 21) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>

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
                    Not ready when booking time starts
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                    Half a week
                  </td>
                </tr>
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    Cancel reservation
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                    One week
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
                <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    Cancel reservation on game day after 5 PM
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                    Two weeks
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
        </div>

        {/* Player List */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
            Player List
          </h2>
          <p className="text-center mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Max Spots: {GuaranteedSpot} |
            Playing: {Math.min(registeredUsers.length, GuaranteedSpot)} |
            Open: {Math.max(GuaranteedSpot - registeredUsers.length, 0)} |
            Waitlist: {Math.max(registeredUsers.length - GuaranteedSpot, 0)}
          </p>
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
              registeredUsers.map((user, index) => (
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
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg min-w-[2rem]">
                      {index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.name}</span>
                      <span className="text-sm opacity-80">{user.intra}</span>
                    </div>
                  </div>
                  <div className="text-xl">
                    {user.verified ? (
                      "✅"
                    ) : (
                      <span className="text-red-600 text-sm font-medium">Invalid Intra</span>
                    )}
                  </div>
                </div>
              ))
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
    </div>
  );
};

export default Home;
