import React from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface MoneyRecord {
	date: string;
	name: string;
	intra: string
	amount: number;
	paid?: boolean;
}

const Money = () => {
  const [moneyData, setMoneyData] = useState<MoneyRecord[]>([]);

const fetchMoneyData = async () => {
	try {
		// axios.get('/api/moneyDb').then(response => {
		// 	console.log(response.data);
		// });
		const response = await fetch('/api/moneyDb');
		if (!response.ok) {
			throw new Error('Network response was not ok');
	}
	const data = await response.json();
	setMoneyData(data);
	} catch (error) {
	console.error('Error fetching money data:', error);
	}
};



	useEffect(() => {
		fetchMoneyData();
	}, []);

	return (
		<div>
			<Navbar />
			<div className="container">
				<h1>Money Page</h1>
				<table className="money-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
					<thead style={{ backgroundColor: '#f3e5f5' }}>
						<tr>
							<th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
							<th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
							<th style={{ border: '1px solid #ddd', padding: '8px' }}>Amount</th>
							<th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
						</tr>
					</thead>
					<tbody>
						{moneyData.map((record, index) => (
						<tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#e8f5e9' : '#fffde7' }}>
							<td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(record.date).toLocaleDateString()}</td>
							<td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.name}</td>
							<td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.amount} Dhs</td>
							<td style={{ border: '1px solid #ddd', padding: '8px' }}>{record.paid ? 'Paid' : 'Pending'}</td>
						</tr>
					))}
				</tbody>
			</table>
			</div>
		</div>
	);
}

export default Money;
// const Money = () => {
// 	return (
// 		<div>
// 			<Navbar />
// 			<div className="container">
// 				<h1>Money Page</h1>
// 				<ul className="money-list">
// 					<li style={{color:"#6000ff"}}>04/01/2024	Haben	15 Dhs	Paid</li>
// 					<li>08/01/2024	Tukka	5 Dhs</li>
// 					<li>08/01/2024	Hussain	15 Dhs</li>
// 					<li>08/01/2024	Mekkey	15 Dhs</li>
// 					<li>11/01/2024	Tukka	15 Dhs</li>
// 					<li>11/01/2024	Hassan haetahi		15 Dhs</li>
// 					<li>11/01/2024	Mutasem Mmajid-M	30 Dhs</li>
// 				</ul>

// 			</div>
			
// 		</div>
// 	);
// }

// export default Money;
