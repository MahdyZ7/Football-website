
import React, { useState, useEffect, FormEvent, useRef } from "react";
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

const Home: React.FC = () => {
  // State management
  const [showPopup, setShowPopup] = useState(true);
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState("");
  const [isSubmissionAllowed, setIsSubmissionAllowed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  const checkSubmissionAllowed = async () => {
    const response = await axios.get("/api/allowed");
    return response.status === 200 ? response.data.isAllowed : false;
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
        alert("User list has been reset.");
        return;
      } catch (error) {
        alert("Error resetting user list.");
        return;
      }
    }

    // Validate submission
    const isAllowed = await checkSubmissionAllowed();
    if (!isAllowed) {
      alert("Registration is only allowed on Sunday and Wednesday after 12 PM (noon) till 8 PM the next day.");
      return;
    }

    if (!id) {
      alert("Please fill in both name and ID fields");
      return;
    }

    // Submit registration
    try {
      await axios.post("/api/register", { name, id });
      const updatedUsers = await fetch('/api/users').then(response => response.json());
      setRegisteredUsers(updatedUsers);
      alert('Registration successful!');
      setName("");
      setId("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status } = error.response;
        if (status === 403) {
          alert("Players limit reached. Better luck next time!");
        } else if (status === 409) {
          alert(`A user with the Intra-login ${id} already exists.`);
        } else if (status === 404) {
          alert(`User with Intra-login ${id} not found. Please enter name also`);
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
            type="text"
            id="name"
            value={name}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="id">Intra login:</label>
          <input
            type="text"
            id="id"
            value={id}
            autoComplete="intra"
            onChange={(e) => setId(e.target.value)}
          />

          {!loading && (
            <>
              <button type="submit" ref={buttonRef}>
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
                  style={{ color: index < 18 ? "#306030" : "#805000" }}
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
    </>
  );
};

export default Home;
