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
        className={`px-4 py-3 rounded-xl transition-all duration-200 font-medium text-center flex items-center gap-1 ${
          isActive ? 'bg-ft-primary text-white' : 'hover:bg-ft-secondary'
        }`}
        style={!isActive ? { color: 'var(--text-primary)' } : undefined}
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
          className="absolute top-full left-0 mt-1 rounded-lg shadow-lg py-2 min-w-[180px] z-50"
          style={{ backgroundColor: 'var(--nav-bg)' }}
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
  const baseClasses = "block px-4 py-2 transition-all duration-200 font-medium";
  const activeClasses = isActive
    ? "bg-ft-primary text-white"
    : "hover:bg-gray-100 dark:hover:bg-gray-700";

  const combinedClasses = `${baseClasses} ${activeClasses}`;

  if (external) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={combinedClasses}
        onClick={onClick}
        style={!isActive ? { color: 'var(--text-primary)' } : undefined}
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
      style={!isActive ? { color: 'var(--text-primary)' } : undefined}
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
  const isAdminRouteActive = currentRoute === "/admin" || currentRoute === "/admin/feedback";

  // Check if any info route is active
  const isInfoRouteActive = currentRoute === "/banned-players" || currentRoute === "/feedback" || currentRoute === "/admin-logs" || currentRoute === "/rules";

  return (
    <div className="relative">
      {/* Desktop Navigation - Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 py-3 px-4 md:px-8 shadow-md"
           style={{ backgroundColor: 'var(--nav-bg)' }}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <nav className="hidden md:flex gap-2 items-center">
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
              <Dropdown label="Admin" isActive={isAdminRouteActive}>
                <DropdownLink href="/admin" isActive={currentRoute === "/admin"}>
                  User Management
                </DropdownLink>
                <DropdownLink href="/admin/feedback" isActive={currentRoute === "/admin/feedback"}>
                  Manage Feedback
                </DropdownLink>
              </Dropdown>
            )}
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
                  aria-label="Sign out of your account"
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
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-nav"
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
        id="mobile-nav"
        ref={mobileMenuRef}
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-[1000]
                    transform transition-transform duration-300 ease-in-out
                    shadow-2xl flex flex-col gap-2 p-6 pt-20
                    ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: 'var(--nav-bg)' }}
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
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
        <NavLink href="/teams" isActive={currentRoute === "/teams"} onClick={closeMenu}>
          Teams
        </NavLink>

        {/* Info Section */}
        <div className="text-xs font-semibold mt-2 mb-1 px-4" style={{ color: 'var(--text-secondary)' }}>
          INFO
        </div>
        <NavLink href="/rules" isActive={currentRoute === "/rules"} onClick={closeMenu}>
          Game Rules
        </NavLink>
        <NavLink href="/banned-players" isActive={currentRoute === "/banned-players"} onClick={closeMenu}>
          Banned Players
        </NavLink>
        <NavLink href="/feedback" isActive={currentRoute === "/feedback"} onClick={closeMenu}>
          Feedback
        </NavLink>
        <NavLink href="/admin-logs" isActive={currentRoute === "/admin-logs"} onClick={closeMenu}>
          Admin Logs
        </NavLink>

        {/* Location Section */}
        <div className="text-xs font-semibold mt-2 mb-1 px-4" style={{ color: 'var(--text-secondary)' }}>
          LOCATION
        </div>
        <NavLink href="https://maps.app.goo.gl/Xem3GbnvzNjhheD37" isActive={false} external onClick={closeMenu}>
          View Map
        </NavLink>
        <NavLink href="https://maps.app.goo.gl/iEZR2Fia2xf4cdQ87" isActive={false} external onClick={closeMenu}>
          Get Directions
        </NavLink>

        {/* Admin Section */}
        {session?.user?.isAdmin && (
          <>
            <div className="text-xs font-semibold mt-2 mb-1 px-4" style={{ color: 'var(--text-secondary)' }}>
              ADMIN
            </div>
            <NavLink href="/admin" isActive={currentRoute === "/admin"} onClick={closeMenu}>
              User Management
            </NavLink>
            <NavLink href="/admin/feedback" isActive={currentRoute === "/admin/feedback"} onClick={closeMenu}>
              Manage Feedback
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600
                         hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium"
              aria-label="Sign out of your account"
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
