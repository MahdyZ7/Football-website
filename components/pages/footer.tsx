
import React, { useEffect, useState } from "react";

export default function Footer() {
  const [isVercel, setIsVercel] = useState(false);

  useEffect(() => {
    setIsVercel(window.location.href.includes("vercel"));
  }, []);

  return (
    <div className="flex flex-1 py-4 border-t border-gray-200 dark:border-gray-700
                    justify-center items-center text-gray-600 dark:text-gray-400">
      {isVercel ? (
        <div className="flex justify-center items-center gap-2">
          Running on
          <span className="inline-flex items-center">
            <img src="/Vercel.svg" alt="Vercel Logo" width="60" />
          </span>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-2">
          Built on
          <span className="inline-flex items-center">
            <img src="/replit.svg" alt="Replit Logo" width="20" height="18" />
          </span>
          Replit
        </div>
      )}
    </div>
  );
}
