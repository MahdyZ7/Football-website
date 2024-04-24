import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
	const currentRoute = usePathname();
	return (
		<div>
			<nav>
				<Link
					href="/"
					className={currentRoute === "/" ? "active" : "non-active"}
				>
					Home
				</Link>
				{/* <Link
			href="/Blog"
			className={currentRoute === "/Blog" ? "active" : "non-active"}>
			Blog
		</Link> */}
				<Link
					href="/Money"
					className={
						currentRoute === "/Money" ? "active" : "non-active"
					}
				>
					Money
				</Link>
				<Link href="https://maps.app.goo.gl/9cq7FqV6YzBPEbgy9">
					Location
				</Link>
				<Link href="https://www.google.com/maps/dir/42+Abu+Dhabi+-+Al+Mutawakileen+Street+-+Abu+Dhabi/Sport+Support+Club,+Emirates+Palace+Mandarin+Oriental+-+Al+Ras+Al+Akhdar+-+Abu+Dhabi/@24.4632825,54.3260082,2456m/data=!3m1!1e3!4m14!4m13!1m5!1m1!1s0x3e5e675027012867:0x38c9eca8bc449d32!2m2!1d54.3679766!2d24.5199202!1m5!1m1!1s0x3e5e6583173dd75f:0x6c376e695173977f!2m2!1d54.3142463!2d24.4583537!3e">
					Directions
				</Link>
			</nav>
			{/* <div style={{ height: '1rem' }} /> */}
		</div>
	);
}
