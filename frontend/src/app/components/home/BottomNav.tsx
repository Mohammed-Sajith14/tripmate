import { Compass, Home, Map, MessageCircle, User, PlusCircle } from "lucide-react";

interface BottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function BottomNav({ activePage, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "trips", icon: Compass, label: "Trips" },
    { id: "create", icon: PlusCircle, label: "Create" },
    { id: "messages", icon: MessageCircle, label: "Messages" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <Icon
                className={`size-6 ${
                  isActive
                    ? "text-teal-500 stroke-[2.5]"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}