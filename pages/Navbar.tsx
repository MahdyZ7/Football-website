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
				<Link href="https://maps.app.goo.gl/4WGjdGhPTvWdqiYE6">
					Location
				</Link>
				<Link href="https://maps.app.goo.gl/JbC1ERsQFyeLDkxk9">
					Directions
				</Link>
			</nav>
			{/* <div style={{ height: '1rem' }} /> */}
		</div>
	);
}
