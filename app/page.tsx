'use client';

import { useState, useEffect } from 'react';
import Home from '../components/pages/home';
import FootballApp from '../components/pages/althome';

export default function Index() {
	return <Home />;
	// const [showHome, setShowHome] = useState(true); // Default to Home for SSR
	// const [isClient, setIsClient] = useState(false);

	// useEffect(() => {
	// 	setIsClient(true);
	// 	// Only run random selection on client side
	// 	setShowHome(Math.random() < 0.9);
	// }, []);

	// // During SSR and before client hydration, always show Home
	// if (!isClient) {
	// 	return <Home />;
	// }

	// // After hydration, show the randomly selected component
	// return (
	// 	<>
	// 		{showHome ? <Home /> : <FootballApp />}
	// 	</>
	// );
}