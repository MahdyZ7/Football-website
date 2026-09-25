'use client';

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "../ThemeToggle";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  external?: boolean;
  onClick?: () => void;
  /** "bar": desktop header link; "drawer": full-width row in the mobile menu. */
  variant?: 'bar' | 'drawer';
}

const barLink = (isActive: boolean) =>
  `px-3 py-2 font-medium transition-colors duration-150 ${
    isActive
      ? "text-[var(--text-primary)] shadow-[inset_0_-3px_0_var(--ft-accent)]"
      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
  }`;

const drawerLink = (isActive: boolean) =>
  `block px-4 py-3 rounded-md font-medium transition-colors duration-150 text-[var(--text-primary)] ${
    isActive ? "bg-[var(--nav-hover)] shadow-[inset_3px_0_0_var(--ft-accent)]" : "hover:bg-[var(--nav-hover)]"
  }`;

const NavLink: React.FC<NavLinkProps> = ({ href, isActive, children, external = false, onClick, variant = 'bar' }) => {
  const combinedClasses = variant === 'bar' ? barLink(isActive) : drawerLink(isActive);

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
    <Link href={href} className={combinedClasses} onClick={onClick} aria-current={isActive ? 'page' : undefined}>
      {children}
    </Link>
  );
};

interface DropdownProps {
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ label, isActive, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuId = `dropdown-${label.toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      setIsOpen(true);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`${barLink(isActive)} flex items-center gap-1`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        aria-label={`${label} menu`}
      >
        {label}
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-label={`${label} navigation menu`}
          className="absolute top-full left-0 mt-2 rounded-lg border py-1.5 min-w-[200px] z-50 shadow-[0_12px_32px_var(--shadow)]"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  external?: boolean;
  onClick?: () => void;
}

const DropdownLink: React.FC<DropdownLinkProps> = ({ href, isActive, children, external = false, onClick }) => {
  const combinedClasses = `block px-4 py-2 font-medium transition-colors duration-150 ${
    isActive ? "shadow-[inset_3px_0_0_var(--ft-accent)] bg-[var(--nav-hover)]" : "hover:bg-[var(--nav-hover)]"
  }`;

  if (external) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={combinedClasses}
        onClick={onClick}
        style={{ color: 'var(--text-primary)' }}
        role="menuitem"
        tabIndex={0}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={combinedClasses}
      onClick={onClick}
      style={{ color: 'var(--text-primary)' }}
      role="menuitem"
      tabIndex={0}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const currentRoute = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const mobileMenuRef = useRef<HTMLElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Keyboard navigation for mobile menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Check if any admin route is active
  const isAdminRouteActive = currentRoute === "/admin";

  // Check if any info route is active
  const isInfoRouteActive = currentRoute === "/banned-players" || currentRoute === "/feedback" || currentRoute === "/admin-logs" || currentRoute === "/rules";

  // Check if any Tournament route is active
  const isTournamentRouteActive = currentRoute === "/tournament" || currentRoute === "/tournament-voting";
  return (
    <div className="relative">
      {/* Desktop Navigation - Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 px-4 md:px-8 border-b"
           style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-color)' }}>
        <div className="flex justify-between items-center gap-6 max-w-7xl mx-auto h-full">
          <Link
            href="/"
            className="font-extrabold text-[1.625rem] leading-none tracking-tight whitespace-nowrap md:mr-2"
            style={{ fontFamily: 'var(--font-bigshoulders), "Arial Narrow", sans-serif', color: 'var(--text-primary)' }}
          >
            42 Football Club
          </Link>
          <nav className="hidden md:flex gap-1 items-center self-stretch mr-auto" aria-label="Main">
            <NavLink href="/" isActive={currentRoute === "/"}>
              Home
            </NavLink>
            <NavLink href="/teams" isActive={currentRoute === "/teams"}>
              Teams
            </NavLink>

            {/* Info Dropdown */}
            <Dropdown label="Info" isActive={isInfoRouteActive}>
              <DropdownLink href="/rules" isActive={currentRoute === "/rules"}>
                Game Rules
              </DropdownLink>
              <DropdownLink href="/banned-players" isActive={currentRoute === "/banned-players"}>
                Banned Players
              </DropdownLink>
              <DropdownLink href="/feedback" isActive={currentRoute === "/feedback"}>
                Feedback
              </DropdownLink>
              <DropdownLink href="/admin-logs" isActive={currentRoute === "/admin-logs"}>
                Admin Logs
              </DropdownLink>
            </Dropdown>

            {/* Location Dropdown */}
            <Dropdown label="Location" isActive={false}>
              <DropdownLink href="https://maps.app.goo.gl/Xem3GbnvzNjhheD37" isActive={false} external>
                View Map
              </DropdownLink>
              <DropdownLink href="https://maps.app.goo.gl/iEZR2Fia2xf4cdQ87" isActive={false} external>
                Get Directions
              </DropdownLink>
            </Dropdown>

            {/* Admin Dropdown */}
            {session?.user?.isAdmin && (
              <NavLink href="/admin?tab=users" isActive={isAdminRouteActive}>
				Admin
			  </NavLink>
            )}
			{/* Tournament Dropdown */}
            <Dropdown label="Tournament" isActive={isTournamentRouteActive}>
			  <DropdownLink href="/tournament" isActive={currentRoute === "/tournament"}>
			  2026 Tournament
			  </DropdownLink>
              <DropdownLink href="/tournament/vote" isActive={currentRoute === "/tournament/vote"}>
                Tournament Voting
              </DropdownLink>
            </Dropdown>
          </nav>

          {/* User Session Display - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
            ) : session ? (
              <>
                <div className="flex items-center gap-2">
                  {session.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <User size={18} aria-hidden="true" style={{ color: 'var(--text-secondary)' }} />
                  )}
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {session.user.name}
                    </span>
                    {session.user.isAdmin && (
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Admin</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                             text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--nav-hover)]"
                >
                  <LogOut size={16} aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-ft-primary hover:bg-ft-secondary text-white rounded-md transition-colors text-sm font-semibold"
              >
                Sign in
              </Link>
            )}
            <ThemeToggle />
          </div>

          {/* Mobile: theme + menu button in the bar */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-ft-primary text-white hover:bg-ft-secondary transition-colors"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>


      {/* Mobile Navigation Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 bg-[var(--overlay)] z-[999]"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <nav
        id="mobile-nav"
        ref={mobileMenuRef}
        className={`md:hidden fixed top-16 right-0 bottom-0 w-72 max-w-[85vw] z-[1000] overflow-y-auto
                    transform transition-transform duration-300 ease-in-out border-l
                    flex flex-col gap-1 p-4
                    ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: 'var(--nav-bg)', borderColor: 'var(--border-color)' }}
        aria-label="Mobile navigation"
        inert={!isMenuOpen}
        aria-hidden={!isMenuOpen}
      >
        {/* User Session Display - Mobile */}
        {session && (
          <div className="mb-4 pb-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-3 px-2 py-1">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="w-10 h-10 rounded-full" />
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
                  <span className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Admin</span>
                )}
              </div>
            </div>
          </div>
        )}

        <NavLink href="/" isActive={currentRoute === "/"} onClick={closeMenu} variant="drawer">
          Home
        </NavLink>
        <NavLink href="/teams" isActive={currentRoute === "/teams"} onClick={closeMenu} variant="drawer">
          Teams
        </NavLink>

        {/* Info Section */}
        <p className="text-sm mt-4 mb-1 px-4" style={{ color: 'var(--text-secondary)' }}>Info</p>
        <NavLink href="/rules" isActive={currentRoute === "/rules"} onClick={closeMenu} variant="drawer">
          Game Rules
        </NavLink>
        <NavLink href="/banned-players" isActive={currentRoute === "/banned-players"} onClick={closeMenu} variant="drawer">
          Banned Players
        </NavLink>
        <NavLink href="/feedback" isActive={currentRoute === "/feedback"} onClick={closeMenu} variant="drawer">
          Feedback
        </NavLink>
        <NavLink href="/admin-logs" isActive={currentRoute === "/admin-logs"} onClick={closeMenu} variant="drawer">
          Admin Logs
        </NavLink>

        {/* Location Section */}
        <p className="text-sm mt-4 mb-1 px-4" style={{ color: 'var(--text-secondary)' }}>Location</p>
        <NavLink href="https://maps.app.goo.gl/Xem3GbnvzNjhheD37" isActive={false} external onClick={closeMenu} variant="drawer">
          View Map
        </NavLink>
        <NavLink href="https://maps.app.goo.gl/iEZR2Fia2xf4cdQ87" isActive={false} external onClick={closeMenu} variant="drawer">
          Get Directions
        </NavLink>

        {/* Admin Section */}
        {session?.user?.isAdmin && (
          <>
            <p className="text-sm mt-4 mb-1 px-4" style={{ color: 'var(--text-secondary)' }}>Admin</p>
            <NavLink href="/admin?tab=users" isActive={currentRoute === "/admin"} onClick={closeMenu} variant="drawer">
              User Management
            </NavLink>
            <NavLink href="/admin?tab=banned" isActive={false} onClick={closeMenu} variant="drawer">
              Banned Users
            </NavLink>
            <NavLink href="/admin?tab=feedback" isActive={false} onClick={closeMenu} variant="drawer">
              Manage Feedback
            </NavLink>
            <NavLink href="/admin?tab=votes" isActive={false} onClick={closeMenu} variant="drawer">
              Tournament Votes
            </NavLink>
            <NavLink href="/admin?tab=logs" isActive={false} onClick={closeMenu} variant="drawer">
              Admin Logs
            </NavLink>
          </>
        )}

        {/* Sign In/Out - Mobile */}
        <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          {session ? (
            <button
              onClick={() => {
                handleSignOut();
                closeMenu();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors
                         border-[1.5px] border-[var(--border-color)] hover:border-[var(--text-primary)] text-[var(--text-primary)]"
            >
              <LogOut size={18} aria-hidden="true" />
              Sign out
            </button>
          ) : (
            <Link
              href="/auth/signin"
              onClick={closeMenu}
              className="block w-full text-center px-4 py-3 bg-ft-primary hover:bg-ft-secondary
                         text-white rounded-md transition-colors font-semibold"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>

    </div>
  );
}
