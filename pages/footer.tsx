import React from "react";
import Image from "next/image";

export default function footer() {
  return (
    <div className="footer1">
      {/* <a
		  href="/__repl"
		  target="_blank"
		  rel="noopener noreferrer"
		> */}
      Built on
      <span className="logo">
        <Image src="/replit.svg" alt="Replit Logo" width={20} height={18} />
      </span>
      Replit
      <div style={{ height: "0rem" }} />
    </div>
  );
}
