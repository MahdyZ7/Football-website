
'use client';

import React from "react";
import Link from "next/link";
import { MapPin, Github, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t mt-auto"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Branding */}
          <div>
            <h3
              className="font-display text-lg font-bold mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              42 Football Club
            </h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              Weekly football matches organized by the 42 community. Register, play, compete.
            </p>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <MapPin size={14} className="text-ft-primary flex-shrink-0" />
              <span>42 Abu Dhabi</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-display text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Registration' },
                { href: '/teams', label: 'Teams' },
                { href: '/tournament', label: 'Tournament' },
                { href: '/feedback', label: 'Feedback' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-ft-primary"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4
              className="font-display text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Resources
            </h4>
            <ul className="space-y-2">
              {[
                { href: '/rules', label: 'Game Rules' },
                { href: '/admin-logs', label: 'Admin Logs' },
                { href: '/banned-players', label: 'Banned Players' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:text-ft-primary"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4
              className="font-display text-sm font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-primary)' }}
            >
              Connect
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/MahdyZ7/Football-website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-ft-primary"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Github size={14} className="flex-shrink-0" />
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:ayassin@student.42abudhabi.ae"
                  className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-ft-primary"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <Mail size={14} className="flex-shrink-0" />
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t px-4 md:px-8 py-4"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            &copy; {currentYear} 42 Football Club. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Built with Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
