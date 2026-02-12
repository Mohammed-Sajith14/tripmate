import { Calendar, DollarSign, User } from "lucide-react";
import { useRef } from "react";

interface TripCardProps {
  image: string;
  category: string;
  title: string;
  duration: string;
  budget: string;
  organizer: string;
}

function TripCard({ image, category, title, duration, budget, organizer }: TripCardProps) {
  return (
    <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <span className="absolute top-4 left-4 px-3 py-1 bg-teal-500 text-white text-sm rounded-full">
          {category}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
          {title}
        </h3>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Calendar className="size-4" />
            <span className="text-sm">{duration}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <DollarSign className="size-4" />
            <span className="text-sm">{budget}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <User className="size-4" />
            <span className="text-sm">{organizer}</span>
          </div>
        </div>
        <button className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-full transition-colors font-medium">
          View Details
        </button>
      </div>
    </div>
  );
}

export function Trips() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const trips = [
    {
      image: "https://images.unsplash.com/photo-1660207768602-f6327ae51d82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2UlMjB0cmF2ZWwlMjBkZXN0aW5hdGlvbnxlbnwxfHx8fDE3NzAyOTE4OTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Beach",
      title: "Maldives Paradise Escape",
      duration: "7 Days",
      budget: "$2,500 - $3,500",
      organizer: "Sarah Johnson",
    },
    {
      image: "https://images.unsplash.com/photo-1767909599777-f73144edcfc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMGFkdmVudHVyZSUyMHNjZW5pY3xlbnwxfHx8fDE3NzAzNTYwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Adventure",
      title: "Swiss Alps Hiking Trek",
      duration: "10 Days",
      budget: "$3,200 - $4,200",
      organizer: "Mike Anderson",
    },
    {
      image: "https://images.unsplash.com/photo-1690942566395-f80f79320f20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBzYW5kJTIwZHVuZXMlMjB0cmF2ZWx8ZW58MXx8fHwxNzcwMzA2NDcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Adventure",
      title: "Sahara Desert Safari",
      duration: "5 Days",
      budget: "$1,800 - $2,400",
      organizer: "Ahmed Hassan",
    },
    {
      image: "https://images.unsplash.com/photo-1566382161144-66fe8f840f34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldXJvcGVhbiUyMGNpdHklMjBhcmNoaXRlY3R1cmUlMjB0cmF2ZWx8ZW58MXx8fHwxNzcwMjU4Nzc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Cultural",
      title: "European Heritage Tour",
      duration: "14 Days",
      budget: "$4,500 - $6,000",
      organizer: "Emma Williams",
    },
    {
      image: "https://images.unsplash.com/photo-1758782964262-0ec1970fb945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMHRlbXBsZSUyMGN1bHR1cmFsJTIwdHJhdmVsfGVufDF8fHx8MTc3MDM1NjAwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      category: "Cultural",
      title: "Japan Temple Journey",
      duration: "12 Days",
      budget: "$3,800 - $4,800",
      organizer: "Yuki Tanaka",
    },
  ];

  return (
    <section id="trips" className="py-24 px-6 bg-white dark:bg-slate-900">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Upcoming Trips
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Explore curated adventures from expert organizers
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {trips.map((trip, index) => (
            <TripCard key={index} {...trip} />
          ))}
        </div>
      </div>
    </section>
  );
}
