import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, Building2, Loader2 } from 'lucide-react';

interface SearchUser {
  _id: string;
  userId: string;
  fullName: string;
  profilePicture?: string;
  role: string;
  organizationName?: string;
  bio?: string;
}

interface SearchBarProps {
  onUserSelect: (userId: string) => void;
}

export function SearchBar({ onUserSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users with debounce
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:5000/api/users/search?query=${encodeURIComponent(query)}&limit=10`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.data.users);
          setIsOpen(true);
        } else {
          console.error('Search failed:', await response.text());
          setResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleUserClick = (userId: string) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onUserSelect(userId);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search users..."
          className="w-full pl-12 pr-12 py-2.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {(query || isLoading) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isLoading ? (
              <Loader2 className="size-4 text-slate-400 animate-spin" />
            ) : (
              <X className="size-4 text-slate-400" />
            )}
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            {results.map((user) => (
              <button
                key={user._id}
                onClick={() => handleUserClick(user.userId)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-left"
              >
                {/* Profile Picture */}
                <div
                  className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={user.profilePicture ? {
                    backgroundImage: `url(${user.profilePicture})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  {!user.profilePicture && (
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user.fullName}
                    </p>
                    {user.role === 'organizer' && (
                      <Building2 className="size-3.5 text-teal-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    @{user.userId}
                  </p>
                  {user.role === 'organizer' && user.organizationName && (
                    <p className="text-xs text-teal-600 dark:text-teal-400 truncate mt-0.5">
                      {user.organizationName}
                    </p>
                  )}
                </div>

                {/* Role Badge */}
                <div className="flex-shrink-0">
                  {user.role === 'organizer' ? (
                    <span className="text-xs px-2 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-md font-medium">
                      Organizer
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md font-medium">
                      Traveler
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center z-50">
          <User className="size-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No users found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
