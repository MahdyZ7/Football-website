import React from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import Footer from "./footer";

const Blog = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            Blog Page
          </h1>

          {/* Back Link */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-ft-primary hover:bg-ft-secondary
                         text-white font-medium rounded transition-all duration-200 transform hover:scale-105"
            >
              ← Back to Registration
            </Link>
          </div>

          <div className="rounded-lg shadow-md p-8 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Blog content coming soon...
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
