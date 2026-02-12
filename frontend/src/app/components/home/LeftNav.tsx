import {
  Compass,
  Home,
  Map,
  MessageCircle,
  MoreHorizontal,
  PlusSquare,
  User,
} from "lucide-react";

interface LeftNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function LeftNav({ activePage, onNavigate }: LeftNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "trips", icon: Compass, label: "Trips" },
    { id: "maps", icon: Map, label: "Maps" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "create", icon: PlusSquare, label: "Create" },
    { id: "more", icon: MoreHorizontal, label: "More" },
  ];

  return (
    <div className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 px-3">
        <Compass className="size-8 text-teal-500" />
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          Trip Mate
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-teal-50 dark:bg-teal-950 text-teal-500"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Icon
                className={`size-6 ${isActive ? "stroke-[2.5]" : "stroke-2"}`}
              />
              <span className={isActive ? "font-semibold" : "font-medium"}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
