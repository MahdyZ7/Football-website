import React from 'react';
import Navbar from './Navbar';

const Money = () => {
	return (
		<div>
			<Navbar />
			<div className="container">
				<h1>Money Page</h1>
				<ul className="money-list">
					<li style={{color:"#6000ff"}}>04/01/2024	H***	15 Dhs  Paid</li>
					<li>08/01/2024	T***	15 Dhs</li>
					<li>08/01/2024	H***	15 Dhs</li>
					<li>08/01/2024	M***	15 Dhs</li>
				</ul>

			</div>
			
		</div>
	);
}

export default Money;
