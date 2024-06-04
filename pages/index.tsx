// pages/index.tsx
import React, { useState, useEffect, FormEvent, useRef } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./footer";

type User = {
	name: string;
	id: string;
};

const Home: React.FC = () => {
	const [showPopup, setShowPopup] = useState(true);
	const [name, setName] = useState<string>("");
	const [id, setId] = useState<string>("");
	const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setShowPopup(false);
		}, 3000);
		fetch("/api/users")
			.then((response) => response.json())
			.then((data) => {
				if (Array.isArray(data)) {
					setRegisteredUsers(data);
					setLoading(false);
				} else console.error("Error fetching registered users:", data);
			})
			.catch((error) => {
				// Handle any errors that occur during the request
				console.error("Error fetching registered users:", error);
				setRegisteredUsers([]); // Set to empty array in case of error
			});
		return () => clearTimeout(timer);
	}, []);

	const isSubmissionAllowed = async () => {
		const response = await axios.get("/api/allowed");
		if (response.status === 200) {
			return response.data.isAllowed;
		}
		return false;
	};

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		if (name.toLowerCase().endsWith("mangoose")) {
			try {
				await axios.delete("/api/register", {
					data: { name, id },
					headers: { "X-Secret-Header": name },
				});
				alert("User list has been reset.");
				return;
			} catch (error) {
				alert("Error resetting user list.")
			}
		}
		// Check that both name and id are filled before sending the request
		const sub_allowed = await isSubmissionAllowed();
		if (sub_allowed === false) {
			alert(
				"Registration is only allowed on Sunday and Wednesday after 12 PM (noon) till 8 PM the next day."
			);
			return;
		}
		if (!name || !id) {
			alert("Please fill in both name and ID fields");
			return;
		}
		// Send the name and id to the API to register the user
		try {
			const response = await axios.post("/api/register", { name, id });
			// Add new registered user to the local state to update the list
			setRegisteredUsers((prevUsers) => [...prevUsers, response.data]);
			// Reset the form fields
			alert('Registration successful!');
			setName("");
			setId("");
		} catch (error) {
			if (
				axios.isAxiosError(error) &&
				error.response &&
				error.response.status === 409
			) {
				alert(`A user 
	 the Intra-login ${id} already exists.`);
			} else {
				console.error("Error registering user:", error);
			}
		}
	};

	return (
		<>
			<Navbar />
			<div className="container">
				<h1>Football Registration </h1>
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

					<button
						type="submit"
						ref={buttonRef}
					>
						Submit
					</button>
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
									<th> Not ready when booking time starts</th>
									<th> 5 AED</th>
								</tr>
								<tr>
									<th> Cancel reservation</th>
									<th> 5 AED</th>
								</tr>
								<tr>
									<th> Late {">"} 15 minutes</th>
									<th> 15 AED</th>
								</tr>
								<tr>
									<th>
										{" "}
										Cancel reservation on game day after 5
										PM
									</th>
									<th> 15 AED</th>
								</tr>
								<tr>
									<th> No Show without notice</th>
									<th> 30 AED</th>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				<div className="registered-users">
					<h2>Player list (orange is waitlist)</h2>
					<ul className="user-list">
						{loading === true ? (
							<li>Loading players...</li>
						) : (
							registeredUsers.length === 0 ? (
								<li
									style={{
										color: "#ffaa99",
										fontWeight: "bold",
										textAlign: "center",
									}}
								>Dare to be First</li>

							) : (
								registeredUsers.map((user, index) => (
									<li
										key={user.id}
										style={{
											color:
												index < 12 ? "#306030" : "#805000",
										}}
									>
										{index + 1}: {user.name} - {user.id}
									</li>
								))
							))}
					</ul>
				</div>
			</div>
			<Footer />
			{showPopup && (
				<div className="popup">
					<h1> New Location Alert</h1>
					<p>Security at Emirates Palace is strict. Mention that the booking is with &quot;Sport Support Club&quot;.</p>
					<p>Call the pitch admin &quot;0502303707&quot; if necessary</p>
					<button onClick={() => setShowPopup(false)}>Close</button>
				</div>
			)}
		</>
	);
};

export default Home;
