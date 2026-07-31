import { Moon, Sun } from 'lucide-react';
import type React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#FF5C5C]/50 cursor-pointer shadow-xs"
      title={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
      aria-label="Alternar tema"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-slate-700 hover:text-[#FF5C5C] transition-colors" />
      ) : (
        <Sun className="w-5 h-5 text-amber-400 hover:text-[#FF5C5C] transition-colors" />
      )}
    </button>
  );
};
