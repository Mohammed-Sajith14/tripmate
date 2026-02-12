import { Sparkles, TrendingUp, Users } from "lucide-react";

export function DiscoverySnapshot() {
  const snapshots = [
    {
      icon: Sparkles,
      text: "Based on your recent activity",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950",
    },
    {
      icon: TrendingUp,
      text: "Trending destinations this week",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      icon: Users,
      text: "Popular among travelers like you",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {snapshots.map((snapshot, index) => {
        const Icon = snapshot.icon;
        return (
          <div
            key={index}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${snapshot.bgColor} transition-all hover:shadow-md cursor-pointer`}
          >
            <Icon className={`size-4 ${snapshot.color}`} />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {snapshot.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
