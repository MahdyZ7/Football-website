'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ThemeToggle";
import { Menu, X } from "lucide-react";

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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="relative">
      {/* Desktop Navigation - Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 py-3 px-4 md:px-8 shadow-md"
           style={{ backgroundColor: 'var(--nav-bg)' }}>
        <nav className="hidden md:flex gap-2 max-w-6xl">

        <NavLink href="/" isActive={currentRoute === "/"}>
          Home
        </NavLink>
        <NavLink href="/banned-players" isActive={currentRoute === "/banned-players"}>
          Banned Players
        </NavLink>
        <NavLink href="/teams" isActive={currentRoute === "/teams"}>
          Teams
        </NavLink>
        <NavLink href="/admin" isActive={currentRoute === "/admin"}>
          Admin
        </NavLink>
        <NavLink href="/admin-logs" isActive={currentRoute === "/admin-logs"}>
          Admin Logs
        </NavLink>
        <NavLink href="https://maps.app.goo.gl/Xem3GbnvzNjhheD37" isActive={false} external>
          Location
        </NavLink>
        <NavLink href="https://maps.app.goo.gl/iEZR2Fia2xf4cdQ87" isActive={false} external>
          Directions
        </NavLink>
        </nav>
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
        <NavLink href="/" isActive={currentRoute === "/"} onClick={closeMenu}>
          Home
        </NavLink>
        <NavLink href="/banned-players" isActive={currentRoute === "/banned-players"} onClick={closeMenu}>
          Banned Players
        </NavLink>
        <NavLink href="/teams" isActive={currentRoute === "/teams"} onClick={closeMenu}>
          Teams
        </NavLink>
        <NavLink href="/admin" isActive={currentRoute === "/admin"} onClick={closeMenu}>
          Admin
        </NavLink>
        <NavLink href="/admin-logs" isActive={currentRoute === "/admin-logs"} onClick={closeMenu}>
          Admin Logs
        </NavLink>
        <NavLink href="https://maps.app.goo.gl/Xem3GbnvzNjhheD37" isActive={false} external onClick={closeMenu}>
          Location
        </NavLink>
        <NavLink href="https://maps.app.goo.gl/iEZR2Fia2xf4cdQ87" isActive={false} external onClick={closeMenu}>
          Directions
        </NavLink>
      </nav>

      <ThemeToggle />
    </div>
  );
}