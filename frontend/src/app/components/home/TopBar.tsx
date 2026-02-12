import { Bell, Compass, Moon, Search, Sun } from "lucide-react";

interface TopBarProps {
  isDark: boolean;
  toggleTheme: () => void;
  userName?: string;
  profilePicture?: string;
}

export function TopBar({ isDark, toggleTheme, userName = "S", profilePicture }: TopBarProps) {
  return (
    <div className="lg:ml-64 fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <Compass className="size-6 text-teal-500" />
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            Trip Mate
          </span>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:block flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search users or destinations..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDark ? (
              <Sun className="size-5 text-slate-600 dark:text-slate-400" />
            ) : (
              <Moon className="size-5 text-slate-600 dark:text-slate-400" />
            )}
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
            <Bell className="size-5 text-slate-600 dark:text-slate-400" />
            <span className="absolute top-1 right-1 size-2 bg-teal-500 rounded-full" />
          </button>
          <div 
            className="size-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-teal-500 transition-all overflow-hidden"
            style={profilePicture ? {
              backgroundImage: `url(${profilePicture})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            {!profilePicture && (
              <span className="text-slate-600 dark:text-slate-300 font-medium text-sm">
                {userName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
