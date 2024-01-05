import React from 'react';
import Navbar from './Navbar';

const Money = () => {
	return (
		<div>
			<Navbar />
			<div className="container">
				<h1>Money Page</h1>
				<ul className="money-list">
					<li>05/01/2024	****	15 Dhs</li>
				</ul>

			</div>
			
		</div>
	);
}

export default Money;
