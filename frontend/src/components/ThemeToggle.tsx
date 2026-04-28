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
      className="relative flex h-7 w-14 items-center rounded-full bg-slate-200 px-1 shadow-inner transition-colors dark:bg-slate-700"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800"
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
