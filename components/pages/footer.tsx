
'use client';

import Link from "next/link";
import { MapPin, Mail } from "lucide-react";

const GithubIcon = ({ size = 14, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-1.95c-3.2.69-3.87-1.54-3.87-1.54-.52-1.32-1.28-1.67-1.28-1.67-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.8.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
  </svg>
);

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
                  <GithubIcon size={14} className="flex-shrink-0" />
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
