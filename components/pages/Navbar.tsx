'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "../ThemeToggle";
import { Menu, X, LogOut, User } from "lucide-react";

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  external?: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, isActive, children, external = false, onClick }) => {
  const baseClasses = "px-4 py-3 rounded-xl transition-all duration-200 font-medium text-center";
  const activeClasses = isActive
    ? "bg-ft-primary text-white"
    : "hover:bg-ft-secondary";

  const combinedClasses = `${baseClasses} ${activeClasses}`;

  if (external) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={combinedClasses}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} className={combinedClasses} onClick={onClick}>
      {children}
    </Link>
  );
};

export default function Navbar() {
  const currentRoute = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="relative">
      {/* Desktop Navigation - Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 py-3 px-4 md:px-8 shadow-md"
           style={{ backgroundColor: 'var(--nav-bg)' }}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <nav className="hidden md:flex gap-2">
            <NavLink href="/" isActive={currentRoute === "/"}>
              Home
            </NavLink>
            <NavLink href="/banned-players" isActive={currentRoute === "/banned-players"}>
              Banned Players
            </NavLink>
            <NavLink href="/teams" isActive={currentRoute === "/teams"}>
              Teams
            </NavLink>
            <NavLink href="/admin-logs" isActive={currentRoute === "/admin-logs"}>
              Admin Logs
            </NavLink>
            <NavLink href="/feedback" isActive={currentRoute === "/feedback"}>
              Feedback
            </NavLink>
            {session?.user?.isAdmin && (
              <>
                <NavLink href="/admin" isActive={currentRoute === "/admin"}>
                  Admin
                </NavLink>
                <NavLink href="/admin/feedback" isActive={currentRoute === "/admin/feedback"}>
                  Manage Feedback
                </NavLink>
              </>
            )}
            <NavLink href="https://maps.app.goo.gl/Xem3GbnvzNjhheD37" isActive={false} external>
              Location
            </NavLink>
            <NavLink href="https://maps.app.goo.gl/iEZR2Fia2xf4cdQ87" isActive={false} external>
              Directions
            </NavLink>
          </nav>

          {/* User Session Display - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
            ) : session ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || 'User'} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User size={20} style={{ color: 'var(--text-primary)' }} />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {session.user.name}
                    </span>
                    {session.user.isAdmin && (
                      <span className="text-xs text-ft-primary font-semibold">Admin</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700
                             text-white rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-ft-primary hover:bg-ft-secondary text-white
                           rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-5 left-5 z-[1001] p-2 rounded-lg bg-ft-primary text-white
                   shadow-md hover:bg-ft-secondary transition-colors duration-200"
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[999]"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <nav
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-[1000]
                    transform transition-transform duration-300 ease-in-out
                    shadow-2xl flex flex-col gap-2 p-6 pt-20
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'var(--nav-bg)' }}
      >
        {/* User Session Display - Mobile */}
        {session && (
          <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              {session.user.image ? (
                <img src={session.user.image} alt={session.user.name || 'User'} className="w-10 h-10 rounded-full" />
              ) : (
                <User size={24} style={{ color: 'var(--text-primary)' }} />
              )}
              <div className="flex flex-col flex-1">
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {session.user.name}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {session.user.email}
                </span>
                {session.user.isAdmin && (
                  <span className="text-xs text-ft-primary font-semibold mt-1">Admin</span>
                )}
              </div>
            </div>
          </div>
        )}

        <NavLink href="/" isActive={currentRoute === "/"} onClick={closeMenu}>
          Home
        </NavLink>
        <NavLink href="/banned-players" isActive={currentRoute === "/banned-players"} onClick={closeMenu}>
          Banned Players
        </NavLink>
        <NavLink href="/teams" isActive={currentRoute === "/teams"} onClick={closeMenu}>
          Teams
        </NavLink>
        <NavLink href="/admin-logs" isActive={currentRoute === "/admin-logs"} onClick={closeMenu}>
          Admin Logs
        </NavLink>
        <NavLink href="/feedback" isActive={currentRoute === "/feedback"} onClick={closeMenu}>
          Feedback
        </NavLink>
        {session?.user?.isAdmin && (
          <>
            <NavLink href="/admin" isActive={currentRoute === "/admin"} onClick={closeMenu}>
              Admin
            </NavLink>
            <NavLink href="/admin/feedback" isActive={currentRoute === "/admin/feedback"} onClick={closeMenu}>
              Manage Feedback
            </NavLink>
          </>
        )}
        <NavLink href="https://maps.app.goo.gl/Xem3GbnvzNjhheD37" isActive={false} external onClick={closeMenu}>
          Location
        </NavLink>
        <NavLink href="https://maps.app.goo.gl/iEZR2Fia2xf4cdQ87" isActive={false} external onClick={closeMenu}>
          Directions
        </NavLink>

        {/* Sign In/Out - Mobile */}
        <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          {session ? (
            <button
              onClick={() => {
                handleSignOut();
                closeMenu();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600
                         hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth/signin"
              onClick={closeMenu}
              className="block w-full text-center px-4 py-3 bg-ft-primary hover:bg-ft-secondary
                         text-white rounded-lg transition-all duration-200 font-medium"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <ThemeToggle />
    </div>
  );
}