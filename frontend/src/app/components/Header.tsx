import { Compass, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export function Header({ isDark, toggleTheme }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="size-8 text-teal-500" />
          <span className="text-xl font-semibold text-slate-900 dark:text-white">
            Trip Mate
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#about"
            className="text-slate-700 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          >
            About
          </a>
          <a
            href="#trips"
            className="text-slate-700 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          >
            Trips
          </a>
          <a
            href="#reviews"
            className="text-slate-700 dark:text-slate-300 hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          >
            Reviews
          </a>
        </nav>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="size-5 text-slate-700 dark:text-slate-300" />
          ) : (
            <Moon className="size-5 text-slate-700 dark:text-slate-300" />
          )}
        </button>
      </div>
    </header>
  );
}
