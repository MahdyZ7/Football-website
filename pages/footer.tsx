
import React, { useEffect, useRef } from "react";

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (footerRef.current) {
      const isVercel = window.location.href.includes("vercel");
      
      if (isVercel) {
        footerRef.current.innerHTML = 
          "Running on &nbsp <span class='logo'><img src='/Vercel.svg' alt='Vercel Logo' width='60' /></span>";
      } else {
        footerRef.current.innerHTML = 
          "Built on <span class='logo'><img src='/replit.svg' alt='Replit Logo' width='20' height='18' /></span>Replit";
      }
    }
  }, []);

  return <div className="footer1" ref={footerRef}></div>;
}
</new_str>
