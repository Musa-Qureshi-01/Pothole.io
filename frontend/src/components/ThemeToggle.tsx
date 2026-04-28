import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      aria-label="Toggle theme"
      onClick={() => {
        const newTheme = isDark ? 'light' : 'dark';
        setTheme(newTheme);
      }}
      className="relative w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors shadow-inner flex items-center px-1"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center"
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={12} className="text-slate-200" />
        ) : (
          <Sun size={12} className="text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
}
