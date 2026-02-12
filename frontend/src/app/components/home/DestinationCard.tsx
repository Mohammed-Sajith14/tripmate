import { TrendingUp } from "lucide-react";

interface DestinationCardProps {
  name: string;
  country: string;
  image: string;
  trending?: boolean;
}

export function DestinationCard({
  name,
  country,
  image,
  trending = false,
}: DestinationCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Trending Badge */}
        {trending && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-teal-500 text-white rounded-full flex items-center gap-1">
            <TrendingUp className="size-3" />
            <span className="text-xs font-medium">Trending</span>
          </div>
        )}

        {/* Destination Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white text-xl font-semibold mb-1">{name}</h3>
          <p className="text-white/80 text-sm">{country}</p>
        </div>
      </div>
    </div>
  );
}
