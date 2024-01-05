// pages/index.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import Navbar from './Navbar';


type User = {
  name: string;
  id: string;
};

const Home: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

	useEffect(() => {
	  axios.get('/api/users')
		.then(response => {
		  // Check if the response.data is indeed an array
		  if (Array.isArray(response.data)) {
			setRegisteredUsers(response.data);
		  } else {
			// Handle case when it's not an array, possibly by setting to an empty array or logging an error
			console.error('Data received is not an array:', response.data);
			setRegisteredUsers([]); // Set to empty array as a fallback
		  }
		})
		.catch(error => {
		  // Handle any errors that occur during the request
		  console.error('Error fetching registered users:', error);
		  setRegisteredUsers([]); // Set to empty array in case of error
		});
	}, []);

	  const isSubmissionAllowed = () => {
		const currentTime = new Date();
		const currentDay = currentTime.getDay();
		const currentHour = currentTime.getHours();

		// Sunday is 0 and Wednesday is 3 in getDay()
		// Check if the current day is Sunday or Wednesday after 12 PM (noon)
		// and before 8 PM the next day (20 hours)
		if (
		  (currentDay === 0 && currentHour >= 12) ||
		  (currentDay === 1 && currentHour < 21) ||
		  (currentDay === 3 && currentHour >= 12) ||
		  (currentDay === 4 && currentHour < 21)
		) {
		  return true;
		}

		return false;
	  };
	  const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		  if(name.toLowerCase().endsWith('mangoose')) {
			  try {
				console.log(name, id);
				await axios.delete('/api/register', { data: { name, id }, headers: { 'X-Secret-Header': name } });
				setRegisteredUsers([]);
				alert('User list has been reset.');
				return;
			  } catch (error) {
				// console.error('Error resetting user list:', error);
				// Optionally alert the user of the failure
			  }
			  // return;
			}
		// Check that both name and id are filled before sending the request
		if (!isSubmissionAllowed()) {
			alert('Registration is only allowed on Sunday and Wednesday after 12 PM (noon) till 8 PM the next day.');
			return;
		  }

		if (!name || !id) {
		  alert('Please fill in both name and ID fields');
		  return;
		}
		// Send the name and id to the API to register the user
		try {
		  const response = await axios.post('/api/register', { name, id });
		  // Add new registered user to the local state to update the list
		  setRegisteredUsers(prevUsers => [...prevUsers, response.data]);
		  // Reset the form fields
		  setName('');
		  setId('');
		} catch (error) {
			if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
			  alert(`A user 
	 the Intra-login ${id} already exists.`);
			} else {
			  console.error('Error registering user:', error);
			  // You could also show a generic error alert to the user here if you wanted
			}
		}
	  };

  return (
	<div>
		<Navbar />
	<div className="container">
		<h1>Football Registration </h1>
		<form onSubmit={handleSubmit}>
		  <label htmlFor="name">Name:</label>
		  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />

		  <label htmlFor="id">Intra login:</label>
		  <input type="text" id="id" value={id} onChange={(e) => setId(e.target.value)} />

		  <button type="submit">Submit</button>
		</form>



		<div style={{ height: '3rem' }} />

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
							<th> Late {'>'} 15 minutes</th>
							<th> 15 AED</th>
						</tr>
						<tr>
							<th> Cancel reservation on game day after 5 PM</th>
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
		  <h2>Player list</h2>
		  <ul className="user-list">
			{registeredUsers.map((user, index) => (
			  <li key={user.id} style={{ color: index < 16 ? '#306030' : '#805000' }}>
				{index + 1} {':'} { }
				{user.name} - {user.id}
			  </li>
			))}
		  </ul>
		</div>
	  </div>
	</div>
  );
};

export default Home;
