import { Star } from "lucide-react";
import { useRef } from "react";

interface ReviewCardProps {
  avatar: string;
  name: string;
  destination: string;
  rating: number;
  review: string;
}

function ReviewCard({ avatar, name, destination, rating, review }: ReviewCardProps) {
  return (
    <div className="flex-shrink-0 w-96 bg-slate-50 dark:bg-slate-950 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <img
          src={avatar}
          alt={name}
          className="size-14 rounded-full object-cover"
        />
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white">
            {name}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {destination}
          </p>
        </div>
      </div>
      <div className="flex gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`size-4 ${
              i < rating
                ? "fill-teal-500 text-teal-500"
                : "text-slate-300 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        {review}
      </p>
    </div>
  );
}

export function Reviews() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const reviews = [
    {
      avatar: "https://images.unsplash.com/photo-1768933294181-82778103e501?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHRyYXZlbGVyJTIwcG9ydHJhaXQlMjBoYXBweXxlbnwxfHx8fDE3NzAzNTYwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      name: "Jessica Chen",
      destination: "Maldives Paradise",
      rating: 5,
      review:
        "Trip Mate made planning so easy! The organizer was professional, and the experience exceeded all expectations. Can't wait to book my next trip!",
    },
    {
      avatar: "https://images.unsplash.com/photo-1758524572099-8896a418be12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjB0cmF2ZWxlciUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NzAzNTYwMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      name: "David Martinez",
      destination: "Swiss Alps Trek",
      rating: 5,
      review:
        "Amazing platform! I met incredible people and the trek was perfectly organized. The attention to detail and safety was outstanding.",
    },
    {
      avatar: "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHdvbWFuJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMzE1Nzg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      name: "Sophie Anderson",
      destination: "European Heritage",
      rating: 5,
      review:
        "I discovered Trip Mate and it changed how I travel. The community is welcoming and the organizers truly care about your experience.",
    },
    {
      avatar: "https://images.unsplash.com/photo-1768933294181-82778103e501?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHRyYXZlbGVyJTIwcG9ydHJhaXQlMjBoYXBweXxlbnwxfHx8fDE3NzAzNTYwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      name: "Rachel Kim",
      destination: "Japan Temple Journey",
      rating: 5,
      review:
        "Best travel decision ever! The cultural insights and local connections made this trip unforgettable. Highly recommend Trip Mate!",
    },
  ];

  return (
    <section id="reviews" className="py-24 px-6 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            What Travelers Say
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Real experiences from our community
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
          {reviews.map((review, index) => (
            <ReviewCard key={index} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
}
