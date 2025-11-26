
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="fixed top-5 right-5 w-12 h-12 rounded-full bg-ft-primary hover:bg-ft-secondary
                 border-none text-2xl cursor-pointer z-[1000] transition-all duration-300
                 flex items-center justify-center hover:scale-110 shadow-md"
      onClick={toggleTheme}
      role="switch"
      aria-checked={theme === 'dark'}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Currently ${theme} mode. Click to switch to ${theme === 'light' ? 'dark' : 'light'} mode.`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
