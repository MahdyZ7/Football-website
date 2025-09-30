import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../ThemeToggle";

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  external?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ href, isActive, children, external = false }) => {
  if (external) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} className={isActive ? "active" : "non-active"}>
      {children}
    </Link>
  );
};

export default function Navbar() {
        const currentRoute = usePathname();

        return (
                <div>
                        <nav>
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
                        <ThemeToggle />
                        {/* <div style={{ height: '1rem' }} /> */}
                </div>
        );
}