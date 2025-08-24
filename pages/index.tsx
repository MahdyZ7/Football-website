import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
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

	return (
		<>
			<SignedOut>
				<div className="container">
				<div style={{ 
					display: 'flex', 
					flexDirection: 'column', 
					alignItems: 'center', 
					justifyContent: 'center', 
					minHeight: '100vh', 
					padding: '20px',
					textAlign: 'center'
				}}>
					<h1>
						42 Football Registration
					</h1>
					<p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>
						Please sign in to access the registration system
					</p>
					<SignInButton mode="modal">
						<button style={{
							padding: '12px 24px',
							fontSize: '1rem',
							border: 'none',
							borderRadius: '12px',
							cursor: 'pointer',
							transition: 'background-color 0.3s',
							width: '200px',
						}}>
							Sign In
						</button>
					</SignInButton>
				</div>
				</div>
			</SignedOut>
			<SignedIn>
				<div style={{ position: 'absolute', top: '10px', right: '10px' }}>
					<UserButton />
				</div>
				{showHome ? <Home /> : <FootballApp />}
			</SignedIn>
		</>
	);
}