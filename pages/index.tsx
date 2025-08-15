import { useState, useEffect } from 'react';
import Home from './home';
import FootballApp from './althome'; 

export default function Index() {
	const [showHome, setShowHome] = useState(true); // Default to Home for SSR
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
		// Only run random selection on client side
		setShowHome(Math.random() < 0.9);
	}, []);

	// During SSR and before client hydration, always show Home
	if (!isClient) {
		return <Home />;
	}

	// After hydration, show the randomly selected component
	return showHome ? <Home /> : <FootballApp />;
}