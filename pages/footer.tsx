import React from "react";
import Image from "next/image";
import { useEffect } from "react";

function footerText() {
	useEffect(() => {
		if (typeof window !== "undefined") {
			let footer = document.getElementById("footer");
			if (footer != null) {
				if (window.location.href.includes("vercel")) {
					footer.innerHTML =
						"Running on &nbsp <span class='logo'><img src='/Vercel.svg' alt='Vercel Logo' width='60' /></span>";
				} else {
					footer.innerHTML =
						"Built on <span class='logo'><img src='/replit.svg' alt='Replit Logo' width='20' height='18' /></span>Replit";
				}
			}
		}
	}, []);
	{
		return <div className="footer1" id="footer"></div>;
	}
}

export default function footer() {
	return footerText();
}
