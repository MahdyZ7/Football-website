import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/** Inline light/dark switch, sized to sit in the navbar. */
const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'light' ? 'dark' : 'light';

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-[1.5px]
                  border-[var(--border-color)] hover:border-[var(--text-primary)] transition-colors ${className}`}
      style={{ color: 'var(--text-primary)' }}
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label="Dark mode"
      title={`Switch to ${next} mode`}
    >
      {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
