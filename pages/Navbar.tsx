import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


export default function Navbar() {

	const currentRoute = usePathname();
	return (
	<div>
	<nav>
		<Link
			href="/"
			className={currentRoute === "/" ? "active" : "non-active"}>
			Home
		</Link>
		{/* <Link
			href="/Blog"
			className={currentRoute === "/Blog" ? "active" : "non-active"}>
			Blog
		</Link> */}
		<Link
			href="/Money"
			className={currentRoute === "/Money" ? "active" : "non-active"}>
			Money
		</Link>
		<Link href="https://maps.app.goo.gl/gZJy46yzZej3HCH4A">Location</Link>
		<Link href="https://www.google.com/maps/dir/42+Abu+Dhabi,+57+Al+Mutawakileen+St+-+Zayed+Port+-+Al+Mina+-+Abu+Dhabi/Al+Maryah+Sports+Center,+Nahil+-+13460+-+Al+Maryah+Island+-+Abu+Dhabi/">Directions</Link>
	</nav>
		<div style={{ height: '0rem' }} />
	</div>
)
};
