
import React, { useState, useEffect, FormEvent, useCallback, useRef, KeyboardEvent } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./footer";
import { getNextRegistration } from "./utils/allowed_times";

type User = {
  name: string;
  id: string;
  verified: boolean;
  created_at: string;
};

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

const Home: React.FC = () => {
  // State management
  const [showPopup, setShowPopup] = useState(true);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState("");
  const [isSubmissionAllowed, setIsSubmissionAllowed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Refs for form navigation
  const nameInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  // Timer and submission check effects
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const next = getNextRegistration();
      const diff = next.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`);
      }
    };

    const checkAllowed = async () => {
      const allowed = await checkSubmissionAllowed();
      setIsSubmissionAllowed(allowed);
    };

    const timer = setInterval(() => {
      updateCountdown();
      checkAllowed();
    }, 60000);

    updateCountdown();
    checkAllowed();

    return () => clearInterval(timer);
  }, []);

  // Initial data fetch and popup timer
  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(false), 3000);

    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRegisteredUsers(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching registered users:", error);
        setRegisteredUsers([]);
      });

    return () => clearTimeout(timer);
  }, []);

  const checkSubmissionAllowed = useCallback(async () => {
    try {
      const response = await axios.get("/api/allowed");
      return response.status === 200 ? response.data.isAllowed : false;
    } catch (error) {
      console.error("Error checking submission allowed:", error);
      return false;
    }
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

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, currentField: 'name' | 'id') => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      if (currentField === 'name' && idInputRef.current) {
        idInputRef.current.focus();
      } else if (currentField === 'id' && submitButtonRef.current) {
        submitButtonRef.current.click();
      }
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // Handle admin reset
    if (name.toLowerCase().endsWith("mangoose")) {
      try {
        await axios.delete("/api/register", {
          data: { name, id },
          headers: { "X-Secret-Header": name },
        });
        showToast("User list has been reset.", 'success');
        return;
      } catch (error) {
        showToast("Error resetting user list.", 'error');
        return;
      }
    }

    // Validate submission
    const isAllowed = await checkSubmissionAllowed();
    if (!isAllowed) {
      showToast("Registration is only allowed on Sunday and Wednesday after 12 PM (noon) till 8 PM the next day.", 'error');
      return;
    }

    if (!id) {
      showToast("Please fill in both name and ID fields", 'error');
      return;
    }

    // Submit registration
    try {
      await axios.post("/api/register", { name, id });
      const updatedUsers = await fetch('/api/users').then(response => response.json());
      setRegisteredUsers(updatedUsers);
      showToast('Registration successful!', 'success');
      setName("");
      setId("");
      // Focus back to name field for next registration
      nameInputRef.current?.focus();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status } = error.response;
        if (status === 403) {
          showToast("Players limit reached. Better luck next time!", 'error');
        } else if (status === 409) {
          showToast(`A user with the Intra-login ${id} already exists.`, 'error');
        } else if (status === 404) {
          showToast(`User with Intra-login ${id} not found. Please enter name also`, 'error');
        }
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Football Registration</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            ref={nameInputRef}
            type="text"
            id="name"
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'name')}
          />

          <label htmlFor="id">Intra login:</label>
          <input
            ref={idInputRef}
            type="text"
            id="id"
            value={id}
            autoComplete="intra"
            onChange={(e) => setId(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, 'id')}
          />

          {!loading && (
            <>
              <button ref={submitButtonRef} type="submit">
                Submit
              </button>
              {!isSubmissionAllowed && (
                <p style={{ textAlign: 'center', marginTop: '10px', color: '#805b30' }}>
                  Next registration opens in: {timeUntilNext}
                </p>
              )}
            </>
          )}
        </form>

        <div style={{ height: "3rem" }} />

        <div className="card">
          <div className="card-header">
            <h3>Late Fees</h3>
          </div>
          <div className="card-body">
            <table className="table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Not ready when booking time starts</th>
                  <th>5 AED</th>
                </tr>
                <tr>
                  <th>Cancel reservation</th>
                  <th>5 AED</th>
                </tr>
                <tr>
                  <th>Late {">"} 15 minutes</th>
                  <th>15 AED</th>
                </tr>
                <tr>
                  <th>Cancel reservation on game day after 5 PM</th>
                  <th>15 AED</th>
                </tr>
                <tr>
                  <th>No Show without notice</th>
                  <th>30 AED</th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="registered-users">
          <h2>Player list (orange is waitlist)</h2>
          <ul className="user-list">
            {loading ? (
              <li>Loading players...</li>
            ) : registeredUsers.length === 0 ? (
              <li style={{ color: "#ffaa99", fontWeight: "bold", textAlign: "center" }}>
                Dare to be First
              </li>
            ) : (
              registeredUsers.map((user, index) => (
                <li
                  key={user.id}
                  style={{ color: index < 16 ? "#306030" : "#805000" }}
                >
                  {index + 1}: {user.name} - {user.id} -{" "}
                  {user.verified ? (
                    "✅"
                  ) : (
                    <span style={{ color: '#ff8080' }}>Invalid Intra</span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      <Footer />
      {showPopup && (
        <div className="popup">
          <h1>Back to Al Maryah Alert</h1>
          <p>Game @ Active Al Maryah. Check The location from the nav bar</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
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
    </>
  );
};

export default Home;
